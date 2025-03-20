import os
import json
import re

def extract_java_methods(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()
    
    method_pattern = re.compile(r"(public|private|protected|static|\s)\s+[\w<>\[\]]+\s+(\w+)\s*\(.*?\)\s*\{", re.DOTALL)
    
    methods = []
    for match in method_pattern.finditer(content):
        method_name = match.group(2)
        start_index = match.start()
        open_braces = 1
        end_index = start_index
        
        for i in range(start_index + 1, len(content)):
            if content[i] == '{':
                open_braces += 1
            elif content[i] == '}':
                open_braces -= 1
                if open_braces == 0:
                    end_index = i + 1
                    break
        
        method_body = content[start_index:end_index]
        methods.append({"name": method_name, "body": method_body})
    
    return methods

def parse_java_folder(source_folder):
    structure = {}
    
    for root, _, files in os.walk(source_folder):
        rel_path = os.path.relpath(root, source_folder)
        if rel_path == ".":
            rel_path = "root"
        
        structure[rel_path] = {}
        
        for file in files:
            if file.endswith(".java"):
                file_path = os.path.join(root, file)
                methods = extract_java_methods(file_path)
                structure[rel_path][file] = methods
    
    return structure

def save_structure(source_folder, output_file="output.json"):
    structure = parse_java_folder(source_folder)
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(structure, file, indent=4)
    print(f"Structure saved to {output_file}")

source_folder = "./code"  
save_structure(source_folder)
