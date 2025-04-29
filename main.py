import os
import sys
import json
import ast
import javalang
from clang.cindex import Index, CursorKind, Config, AccessSpecifier
from antlr4 import *
from AutoDocX_tool.JavaLexer import JavaLexer
from AutoDocX_tool.JavaParser import JavaParser
from AutoDocX_tool.JavaParserListener import JavaParserListener
import argparse
import subprocess





Config.set_library_file("/usr/lib/llvm-18/lib/libclang.so.1")



def get_python_functions(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            source = f.read()
    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
        source = None
    except UnicodeDecodeError:
        print(f"Error: Cannot decode '{filepath}' using UTF-8 encoding.")
        source = None
    except Exception as e:
        print(f"An unexpected error occurred while reading the file: {e}")
        source = None
    
    tree = ast.parse(source)
    results = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            class_name = None
            for parent in ast.walk(tree):
                if isinstance(parent, ast.ClassDef) and node in parent.body:
                    class_name = parent.name
                    break

            start_line = node.lineno
            end_line = node.end_lineno if hasattr(node, 'end_lineno') else start_line

            docstring = ast.get_docstring(node) or ""
            body = ast.get_source_segment(source, node)

            results.append({
                "function_name": node.name,
                "parameters": [arg.arg for arg in node.args.args],
                "return_type": None,
                "class_name": class_name,
                "belongs_to_class": class_name is not None,
                "docstring_or_comment": docstring,
                "body": body,
                "access_specifier": "public",  
                "start_line": start_line,
                "end_line": end_line,
                "language": "Python"
            })
    return results


class FunctionExtractor(JavaParserListener):
    def __init__(self, tokens):
        self.tokens = tokens
        self.functions = []

    def enterMethodDeclaration(self, ctx: JavaParser.MethodDeclarationContext):
        function_name = ctx.identifier().getText()
        return_type = ctx.typeTypeOrVoid().getText()
        params = ctx.formalParameters().getText()

        # Get body lines
        body_start = ctx.methodBody().start.line if ctx.methodBody() else ctx.start.line
        body_end = ctx.methodBody().stop.line if ctx.methodBody() else ctx.stop.line

        # Extract method body text using token range
        if ctx.methodBody():
            start_index = ctx.methodBody().start.tokenIndex
            end_index = ctx.methodBody().stop.tokenIndex
            method_body = ' '.join(token.text for token in self.tokens.tokens[start_index:end_index + 1])
        else:
            method_body = ""

        # Traverse up the context tree to find modifiers
        modifiers = []
        parent = ctx.parentCtx
        while parent:
            if hasattr(parent, "modifier"):
                modifiers = [m.getText() for m in parent.modifier()]
                break
            parent = parent.parentCtx

        self.functions.append({
            'function_name': function_name,
            'return_type': return_type,
            'parameters': params,
            'start_line': ctx.start.line,
            'end_line': ctx.stop.line,
            'body_start': body_start,
            'body_end': body_end,
            'method_body': method_body,
            'modifiers': modifiers if modifiers else ["package-private"]
        })


from antlr4 import InputStream, CommonTokenStream, ParseTreeWalker
from AutoDocX_tool.JavaLexer import JavaLexer
from AutoDocX_tool.JavaParser import JavaParser

def get_java_functions(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            code = f.read()
    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
        source = None
    except UnicodeDecodeError:
        print(f"Error: Cannot decode '{filepath}' using UTF-8 encoding.")
        source = None
    except Exception as e:
        print(f"An unexpected error occurred while reading the file: {e}")
        source = None

    input_stream = InputStream(code)
    lexer = JavaLexer(input_stream)
    token_stream = CommonTokenStream(lexer)
    parser = JavaParser(token_stream)
    tree = parser.compilationUnit()

    # Pass tokens to extractor for body reconstruction
    extractor = FunctionExtractor(token_stream)
    walker = ParseTreeWalker()
    walker.walk(extractor, tree)

    results = []
    for func in extractor.functions:
        results.append({
            "function_name": func['function_name'],
            "parameters": func['parameters'],
            "return_type": func['return_type'],
            "start_line": func['start_line'],
            "end_line": func['end_line'],
            "body_start": func['body_start'],
            "body_end": func['body_end'],
            "modifiers": func['modifiers'],
            "body": func['method_body'],
            "language": "Java"
        })

    return results


def get_cpp_functions(filepath):
    index = Index.create()
    try:
        tu = index.parse(filepath, args=['-std=c++17'])
    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
        source = None
    except UnicodeDecodeError:
        print(f"Error: Cannot decode '{filepath}' using UTF-8 encoding.")
        source = None
    except Exception as e:
        print(f"An unexpected error occurred while reading the file: {e}")
        source = None

    results = []

    def extract(cursor, class_name=None):
        if (cursor.kind in [CursorKind.FUNCTION_DECL, CursorKind.CXX_METHOD]
            and cursor.is_definition()
            and cursor.location.file
            and cursor.location.file.name == filepath):

            func_name = cursor.spelling
            params = [f"{arg.type.spelling} {arg.spelling}" for arg in cursor.get_arguments()]
            return_type = cursor.result_type.spelling if cursor.result_type else None

            access = str(cursor.access_specifier).split('.')[-1].lower() if cursor.access_specifier != AccessSpecifier.INVALID else "public"

            start_line = cursor.extent.start.line
            end_line = cursor.extent.end.line

            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    body = "".join(lines[start_line - 1:end_line])
            except:
                body = "<could not extract>"

            results.append({
                "function_name": func_name,
                "parameters": params,
                "return_type": return_type,
                "class_name": class_name,
                "belongs_to_class": class_name is not None,
                "docstring_or_comment": "",  
                "body": body,
                "access_specifier": access,
                "start_line": start_line,
                "end_line": end_line,
                "language": "C++"
            })

        elif cursor.kind in [CursorKind.CLASS_DECL, CursorKind.STRUCT_DECL]:
            class_name = cursor.spelling
            for child in cursor.get_children():
                extract(child, class_name)
        else:
            for child in cursor.get_children():
                extract(child, class_name)

    extract(tu.cursor)
    return results


def parse_repo(source_folder):
    print("HI")
    data = []
    print(f"Source folder: {source_folder}")

    if not os.path.exists(source_folder):
        print(f"[ERROR] Path does NOT exist: {source_folder}")
        return []

    if not os.path.isdir(source_folder):
        print(f"[ERROR] Path exists but is NOT a directory: {source_folder}")
        return []

    print("[OK] Path exists and is a directory.")
    
    for root, dirs, files in os.walk(source_folder):
        for file in files:
            full_path = os.path.join(root, file)
            rel_folder = os.path.relpath(root, source_folder)

            try:
                if file.endswith(".py"):
                    
                    funcs = get_python_functions(full_path)
                elif file.endswith(".java"):
                    funcs = get_java_functions(full_path)
                elif file.endswith((".cpp", ".cc", ".h", ".hpp")):
                    funcs = get_cpp_functions(full_path)
                else:
                    continue

                for func in funcs:
                    func.update({
                        "file_path": os.path.relpath(full_path, source_folder),
                        "folder": rel_folder
                    })
                    data.append(func)

            except Exception as e:
                print(f"[!] Error parsing {full_path}: {e}")
                continue
    return data

import time

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract functions from a code repository.")
    parser.add_argument("--source_folder", type=str, required=True, help="Path to the source code repository")
    args = parser.parse_args()
    # source_folder = input("Enter the source folder path: ").strip()
    # source_folder = r"C:\Users\havis\AutoDocX_tool\AutoDocX_tool\eANCI" 

    source_folder = args.source_folder
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(current_dir)
    output_file = rf"{current_dir}\AutoDocX_tool\static\functions.json"

    print(f"Outtput file: {output_file} ...")
    # output_file = args.output

    print(f"Scanning repository: {source_folder} ...")

    # time.sleep(3)

    result = parse_repo(source_folder)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Done! Extracted {len(result)} functions. Saved to {output_file}")

    command = ["node", f"{current_dir}\AutoDocX_tool\scripts\generateDocs.js"]
    result = subprocess.run(command, capture_output=True, text=True)
    print("Running command:", ' '.join(command))
    print("Output from JS:")
    print(result.stdout)

    command = ["node", f"{current_dir}\AutoDocX_tool\generateLLMdocsnew.js"]
    # C:\Users\Manan\Desktop\Object_Deection_DL\AutoDocX\AutoDocX_tool\generateLLMdocsnew.js
    result = subprocess.run(command)
    print("Running command:", ' '.join(command))
    print("Output from JS:")
    print(result.stdout)

    docusaurus_dir = os.path.join(current_dir, "AutoDocX_tool/")

# # Run `npx docusaurus start` from that directory
#     command = ["npx", "docusaurus", "start"]

#     print("Running command:", ' '.join(command), "in", docusaurus_dir)

#     result = subprocess.run(command, capture_output=True, text=True, cwd=docusaurus_dir)

#     print("Output from JS:")
#     print(result.stdout)
#     print("Errors:")
#     print(result.stderr)


    if result.stderr:
        print("Error from JS:")
        print(result.stderr)
