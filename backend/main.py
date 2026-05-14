from fastapi import FastAPI
from pydantic import BaseModel

class IndexRequest(BaseModel):
    files: list[str]

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/index")
def index_workspace(request: IndexRequest):
    return {"received": len(request.files)}