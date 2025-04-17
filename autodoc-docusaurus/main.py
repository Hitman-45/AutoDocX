import os
import sys
import json
import ast
import javalang
from clang.cindex import Index, CursorKind, Config, AccessSpecifier
from antlr4 import *
from JavaLexer import JavaLexer
from JavaParser import JavaParser
from JavaParserListener import JavaParserListener




Config.set_library_file("./libclang.so.1")


def get_python_functions(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        source = f.read()

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


def get_java_functions(filepath):
    input_stream = FileStream(filepath)
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
    except:
        return []

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
    data = []
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

if __name__ == "__main__":
    source_folder = "code/"  
    output_file = "functions.json"

    print(f"Scanning repository: {source_folder} ...")
    result = parse_repo(source_folder)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Done! Extracted {len(result)} functions. Saved to {output_file}")
