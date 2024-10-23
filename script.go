package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// Helper function to execute shell commands
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

// Function to run npm commands for frontend
func buildFrontend(frontendDir string) error {
	fmt.Println("Building frontend...")

	// Run 'npm install'
	if err := runCommand(frontendDir, "npm", "install"); err != nil {
		return fmt.Errorf("failed to install frontend dependencies: %w", err)
	}

	// Run 'npm run build'
	if err := runCommand(frontendDir, "npm", "run", "build"); err != nil {
		return fmt.Errorf("failed to build frontend: %w", err)
	}

	// Run 'npm run export'
	if err := runCommand(frontendDir, "npm", "run", "export"); err != nil {
		return fmt.Errorf("failed to export frontend: %w", err)
	}

	return nil
}

// Function to check if a file or directory exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

// Helper function to run npm install in a directory
func npmInstall(dir string) error {
	fmt.Printf("Running npm install in %s\n", dir)
	cmd := exec.Command("npm", "install")
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}

// Function to iterate over top-level subdirectories and run npm install if package.json exists
func installDependenciesInTopLevelDirs(root string) error {
	// Get all files and directories in the root directory
	files, err := ioutil.ReadDir(root)
	if err != nil {
		return fmt.Errorf("failed to read directory %s: %w", root, err)
	}

	// Loop over the entries
	for _, file := range files {
		// Check if the entry is a directory
		if file.IsDir() {
			dirPath := filepath.Join(root, file.Name())

			// Check if the directory contains a package.json file
			packageJSON := filepath.Join(dirPath, "package.json")
			if fileExists(packageJSON) {
				// Run npm install in this directory
				if err := npmInstall(dirPath); err != nil {
					return fmt.Errorf("failed to install dependencies in %s: %w", dirPath, err)
				}
			}
		}
	}

	return nil
}

// Function to install dependencies for lambdas
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

	fmt.Println("Dependencies installed successfully in all subdirectories.")

	return nil
}

// Function to determine if we're on Windows or Unix
func isWindows() bool {
	return runtime.GOOS == "windows"
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

func outputFrontendEnvs(envFilePath string) {
	envs := make(map[string]string)

	envs["API_BASE"] = getTerraformOutputValue("api_gateway_url")
	envs["LOGIN_URL"] = getTerraformOutputValue("cognito_hosted_ui_url")
	envs["LOGIN_CLIENT_ID"] = getTerraformOutputValue("login_client_id")
	envs["REDIRECT_URI"] = getTerraformOutputValue("website_url")
	envs["AUTH_URL"] = getTerraformOutputValue("cognito_auth_url")

	writeEnvFile(envFilePath, envs)

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

		outputFrontendEnvs(envFile)

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
