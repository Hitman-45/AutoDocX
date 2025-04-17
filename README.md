Instructions to run:

1. Clone the git repo
2. Recommended: Use a virtual environment
3. Open the python file; Change the source path of the source code file
4. Run the file; python main.py
5. It will generate a json file
6. Copy the contents of this json into a json file present in autodoc-docusurus/data/functions.json
7. Then compile to generate docs: node scripts/generateDocs.js
8. It will generate docs, if you want to store as a version. Then go on to run: npm run docusaurus docs:version 1.1.0
9. To run as server: npm start
10. To deploy: Will automate in Phase2, manually you can automate to Github pages or any other
11. Can refer to: https://docusaurus.io/docs/deployment
