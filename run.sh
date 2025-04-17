#!/bin/bash

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Running Python script..."
python main.py

echo "Moving functions.json to static directory..."
mv functions.json ./static

rm -rf docs/*

echo "Generating Docusaurus docs..."
node scripts/generateDocs.js

echo "Starting Docusaurus site..."
npm start
