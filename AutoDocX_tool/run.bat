@echo off
cd /d %~dp0

echo Deleting docs content...
del /q docs\*
del /q generated_newdocs\*

set INPUT_PATH=%1

echo Received input: %INPUT_PATH%

echo Running: node generateLLMdocsnew.js %INPUT_PATH%
node generateLLMdocsnew.js "%INPUT_PATH%"

echo Running: node scripts\generateDocs.js
node scripts\generateDocs.js

echo Starting Docusaurus site...
npx docusaurus start --port 3001
