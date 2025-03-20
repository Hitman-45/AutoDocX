import os
import json
import re

def extract_methods(file_path, language):
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
    
    method_patterns = {
        "java": re.compile(r"(public|private|protected|static|\s)\s+[\w<>\[\]]+\s+(\w+)\s*\(.*?\)\s*\{", re.DOTALL),
        "cpp": re.compile(r"(\w+::\w+|[a-zA-Z_][a-zA-Z0-9_<>*&\s]+)\s+(\w+)\s*\(.*?\)\s*\{", re.DOTALL),
        "python": re.compile(r"def\s+(\w+)\s*\(.*?\)\s*:", re.DOTALL),
        "javascript": re.compile(r"function\s+(\w+)\s*\(.*?\)\s*{", re.DOTALL),
        "cobol": re.compile(r"(\w+)\s+PROCEDURE\s+DIVISION\.", re.IGNORECASE)
    }
    
    methods = []
    if language in method_patterns:
        pattern = method_patterns[language]
        for match in pattern.finditer(content):
            method_name = match.group(1)
            start_index = match.start()
            end_index = content.find("}", start_index) + 1 if language in ["java", "cpp", "javascript"] else start_index + 100
            method_body = content[start_index:end_index].strip()
            methods.append({"name": method_name, "body": method_body})
    
    return methods

def parse_folder(source_folder):
    structure = {}
    
    extensions = {
        "java": ".java",
        "cpp": [".cpp", ".h"],
        "python": ".py",
        "javascript": [".js", ".jsx"],
        "cobol": [".cob", ".cbl"]
    }
    
    for root, _, files in os.walk(source_folder):
        rel_path = os.path.relpath(root, source_folder)
        if rel_path == ".":
            rel_path = "root"
        
        structure[rel_path] = {}
        
        for file in files:
            for lang, ext in extensions.items():
                if isinstance(ext, list):
                    if any(file.endswith(e) for e in ext):
                        file_path = os.path.join(root, file)
                        methods = extract_methods(file_path, lang)
                        structure[rel_path][file] = methods
                elif file.endswith(ext):
                    file_path = os.path.join(root, file)
                    methods = extract_methods(file_path, lang)
                    structure[rel_path][file] = methods
    
    return structure

def save_structure(source_folder, output_file="output.json"):
    structure = parse_folder(source_folder)
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(structure, file, indent=4)
    print(f"Structure saved to {output_file}")

source_folder = "./src"
save_structure(source_folder)