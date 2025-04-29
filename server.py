from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import subprocess
import tempfile
import os

app = FastAPI()

# === Config your paths ===
LLAMA_CLI_PATH = r"C:\Users\Manan\Desktop\AutoDocX\llama.cpp\build\bin\Release\llama-cli.exe"
MODEL_PATH = r"C:\Users\Manan\Desktop\AutoDocX\models\deepseek-coder-1.3b-instruct.Q4_K_M.gguf"
CONTEXT_SIZE = 2048
BATCH_SIZE = 16
# You must explain:
# - What each class or function does?
# - Its inputs and outputs
# - Any important edge cases or exceptions.
# === Prompt Template ===
BASE_PROMPT = """You are a professional documentation generator.
ONLY generate high-quality documentation for the given code. 
DO NOT REPEAT or INCLUDE THE ORIGINAL CODE OR PROMPT OR ANY OTHER THING NOT ASKED.
The layout of the documentation must be exactly like this:
**Class Name:** <name>  
**Function Name:** <name>  
**Description:** <description>  
**Parameters:**  
- <parameter1>: <description>  
- <parameter2>: <description>  
**Returns:** <what it returns>  
**Exceptions:** <any exceptions thrown>
The documentation must be in clean, readable Markdown format.
After reading the code, only generate the documentation, without repeating the code.
Now, here is the code:"""

# === Request Schema ===
class CodeRequest(BaseModel):
    filename: str
    code: str

@app.post("/generate")
def generate_docs(request: CodeRequest):
    prompt = BASE_PROMPT + f"\n\n```{request.filename.split('.')[-1]}\n{request.code}\n```"

    try:
        # Spawn llama-cli.exe with parameters
        result = subprocess.run(
            [
                LLAMA_CLI_PATH,
                "--device", "CUDA0",
                "-m", MODEL_PATH,
                "--batch-size", str(BATCH_SIZE),
                "-p", prompt,
                "--ctx-size", str(CONTEXT_SIZE),
                "--temp", "0.0",
                "--n-predict", "512",
            ],
            capture_output=True, text=True, timeout=300
        )

        output = result.stdout

        # Optional: Cut everything before "Generate only the documentation, without repeating the code."
        first_backtick = output.find("```")
        if first_backtick != -1:
            second_backtick = output.find("```", first_backtick + 3)
            if second_backtick != -1:
                output = output[second_backtick + 3:].strip()
                
        return {"documentation": output}

    except subprocess.TimeoutExpired:
        return {"error": "Model took too long to respond."}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
