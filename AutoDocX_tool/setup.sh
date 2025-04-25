#!/bin/bash

echo "Running npm install..."
npm install

echo "Creating Python virtual environment..."
python3 -m venv venv

echo "Setup complete ✅"
