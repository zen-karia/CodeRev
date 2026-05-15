from fastapi import FastAPI
from pydantic import BaseModel
import ast, os, openai, chromadb
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.environ.get('OPENAI_API_KEY')
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(name="coderev")

class IndexRequest(BaseModel):
    files: list[str]

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/index")
def index(request: IndexRequest):
    chunks = []
    for file in request.files:
        try:
            contents = open(file, encoding='utf-8', errors='ignore').read()
            lines = contents.split('\n')
            if file.endswith('.py'):
                tree = ast.parse(contents)
                for node in ast.walk(tree):
                    if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                        text = '\n'.join(lines[node.lineno - 1 : node.end_lineno])
                        chunks.append({
                            "text": text,
                            "file": file,
                            "start_line": node.lineno,
                            "end_line": node.end_lineno
                        })
            else:
                chunks.append({
                    "text": contents,
                    "file": file,
                    "start_line": 1,
                    "end_line": len(contents.split('\n'))
                })
        except Exception:
            continue
    
    if not chunks:
        return {"chunks_count":0}
    
    chunk_count = len(chunks)
    MAX_CHARS = 12000
    texts = [chunk["text"][:MAX_CHARS] for chunk in chunks]

    for i in range(0, chunk_count, 500):
        sub_chunks = chunks[i:i+500]
        sub_texts = texts[i:i+500]
        
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=sub_texts
        )
    
        collection.upsert(
            ids=[f"{chunk['file']}:{chunk['start_line']}" for chunk in sub_chunks],
            embeddings=[item.embedding for item in response.data],
            documents=sub_texts,
            metadatas=[{"file": chunk["file"], "start_line": chunk["start_line"], "end_line": chunk["end_line"]} for chunk in sub_chunks]
        )

    return {"chunks_count": len(chunks)}

