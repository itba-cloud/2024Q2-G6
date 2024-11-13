package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func asyncPingLambda(url string) {
	go func() {
		client := &http.Client{
			Timeout: 5 * time.Second, // Timeout after 2 seconds
		}
		fmt.Printf("Pinging %s\n", url)
		req, _ := http.NewRequest("GET", url, nil)
		_, err := client.Do(req)

		if err != nil {
			fmt.Errorf("failed to perform GET %s", err)
		}
	}()
}

func runCommand(dir string, name string, args ...string) error {
	cmd := exec.Command(name, args...)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if dir != "" {
		cmd.Dir = dir
	}
	return cmd.Run()
}

func buildFrontend(frontendDir string) error {
	fmt.Println("Building frontend...")

	if err := runCommand(frontendDir, "npm", "install"); err != nil {
		return fmt.Errorf("failed to install frontend dependencies: %w", err)
	}

	if err := runCommand(frontendDir, "npm", "run", "build"); err != nil {
		return fmt.Errorf("failed to build frontend: %w", err)
	}

	if err := runCommand(frontendDir, "npm", "run", "export"); err != nil {
		return fmt.Errorf("failed to export frontend: %w", err)
	}

	return nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func npmInstall(dir string) error {
	fmt.Printf("Running npm install in %s\n", dir)
	cmd := exec.Command("npm", "install")
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

func installDependenciesInTopLevelDirs(root string) error {
	files, err := ioutil.ReadDir(root)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", root, err)
	}

	for _, file := range files {
		if file.IsDir() {
			dirPath := filepath.Join(root, file.Name())

			packageJSON := filepath.Join(dirPath, "package.json")
			if fileExists(packageJSON) {
				if err := npmInstall(dirPath); err != nil {
					return fmt.Errorf("failed to install dependencies in %s: %w", dirPath, err)
				}
			}
		}
	}

	return nil
}

func installLambdaDependencies() error {
	fmt.Println("Installing Lambda dependencies...")
	lambdasDir := "./iac/lambda/api"

	if err := installDependenciesInTopLevelDirs(lambdasDir); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	lambdasDir = "./iac/lambda/schema"

	if err := installDependenciesInTopLevelDirs(lambdasDir); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	lambdasDir = "./iac/lambda/email"

	if err := installDependenciesInTopLevelDirs(lambdasDir); err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Dependencies installed successfully in all subdirectories.")

	return nil
}

// Function to run Terraform with pre-build tasks
func runTerraformCommand(terraformArgs []string) error {
	terraformArgs = append([]string{"-chdir=iac"}, terraformArgs...)

	// Run the terraform command
	if err := runCommand("", "terraform", terraformArgs...); err != nil {
		return fmt.Errorf("failed to run terraform command: %w", err)
	}

	return nil
}

func getTerraformOutputValue(key string) string {
	cmd := exec.Command("terraform", "-chdir=iac", "output", "-raw", key)
	output, err := cmd.Output()
	if err != nil {
		log.Fatalf("Failed to retrieve Terraform output: %v", err)
	}
	return string(output)
}

func writeEnvFile(envFilePath string, envs map[string]string) {
	file, err := os.Create(envFilePath)
	if err != nil {
		log.Fatalf("Failed to create %s file: %v", envFilePath, err)
	}
	defer file.Close()

	envContent := ""
	for key, value := range envs {
		envContent = envContent + fmt.Sprintf("%s=%s\n", key, value)
	}

	_, err = file.WriteString(envContent)
	if err != nil {
		log.Fatalf("Failed to write to %s file: %v", envFilePath, err)
	}

	fmt.Printf("%s file created\n", envFilePath)

}

func outputFrontendEnvs(envFilePath string) map[string]string {
	envs := make(map[string]string)

	envs["API_BASE"] = getTerraformOutputValue("api_gateway_url")
	envs["LOGIN_URL"] = getTerraformOutputValue("cognito_hosted_ui_url")
	envs["LOGIN_CLIENT_ID"] = getTerraformOutputValue("login_client_id")
	envs["REDIRECT_URI"] = getTerraformOutputValue("website_url")
	envs["AUTH_URL"] = getTerraformOutputValue("cognito_auth_url")

	writeEnvFile(envFilePath, envs)

	return envs

}

// Main function that acts as the entry point
func main() {
	if len(os.Args) < 2 || (os.Args[1] != "run" && os.Args[1] != "destroy") {
		log.Fatalf("Usage: %s [run | destroy]", os.Args[0])
	}

	arg := os.Args[1:]

	if arg[0] == "destroy" {
		if err := runTerraformCommand([]string{"destroy", "-auto-approve"}); err != nil {
			log.Fatalf("Error: %v", err)
		}
	} else if arg[0] == "run" {
		frontendDir := "./frontend"
		if err := buildFrontend(frontendDir); err != nil {
			log.Fatalf("Error: %v", err)
		}

		if err := installLambdaDependencies(); err != nil {
			log.Fatalf("Error: %v", err)
		}

		if err := runTerraformCommand([]string{"init"}); err != nil {
			log.Fatalf("Error: %v", err)
		}

		if err := runTerraformCommand([]string{"apply", "-auto-approve"}); err != nil {
			log.Fatalf("Error: %v", err)
		}

		envFile := fmt.Sprintf("%s/.env.local", frontendDir)

		envs := outputFrontendEnvs(envFile)

		go asyncPingLambda(fmt.Sprintf("%s/products", envs["API_BASE"]))

		if err := buildFrontend(frontendDir); err != nil {
			log.Fatalf("Error: %v", err)
		}

		if err := runTerraformCommand([]string{"apply", "-auto-approve"}); err != nil {
			log.Fatalf("Error: %v", err)
		}

		websiteUrl := getTerraformOutputValue("website_url")

		fmt.Printf("Architecture deployed! \nWebsite URL: %s\n", websiteUrl)

	}

}
