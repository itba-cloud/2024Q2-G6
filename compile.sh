#!/bin/bash

# The Go source file you want to compile
GOFILE="script.go"

echo "Building for Windows (amd64)..."
GOOS=windows GOARCH=amd64 go build -o script.exe $GOFILE

echo "Building for macOS (Apple Silicon)..."
GOOS=darwin GOARCH=arm64 go build -o script-mac $GOFILE

echo "Building for Linux (amd64)..."
GOOS=linux GOARCH=amd64 go build -o script-linux $GOFILE

echo "Build completed!"
