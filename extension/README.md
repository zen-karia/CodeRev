# CodeRev

A VS Code extension that uses RAG (Retrieval-Augmented Generation) to perform AI-powered code reviews on GitHub pull requests, grounded in your actual codebase.

## How It Works

1. **Index your codebase** — CodeRev reads your workspace files, chunks them intelligently (Python files are chunked by function/class using AST; other files as whole chunks), embeds them using OpenAI `text-embedding-3-small`, and stores them in a local ChromaDB vector database.
2. **Fetch a PR diff** — CodeRev pulls the file changes from any GitHub PR using the GitHub API.
3. **RAG review** — The diff is embedded and used to retrieve the most relevant chunks from your indexed codebase. The diff + retrieved context is sent to GPT-4o for a grounded, context-aware review.
4. **Webview panel** — The review is displayed in a VS Code tab.

## Features

- Index any codebase with a single command
- Supports TypeScript, JavaScript, Python, Go, Java, C++, C, C#, Ruby, Rust
- Python files are chunked by function and class (AST-based) for higher precision
- ChromaDB persists the index to disk — no re-indexing needed on restart
- Reviews are grounded in your actual codebase, not just the diff in isolation
- Review output displayed in a dedicated VS Code webview panel

## Requirements

- Python 3.10+
- A Python virtual environment at `backend/venv/` with the following packages installed:
  ```
  fastapi uvicorn openai chromadb python-dotenv
  ```
- An OpenAI API key
- A GitHub personal access token with `repo` scope

## Setup

1. Clone the repository
2. Create and activate a Python virtual environment inside `backend/`:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate      # Windows
   pip install fastapi uvicorn openai chromadb python-dotenv
   ```
3. Create a `.env` file inside `backend/` with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Open the `extension/` folder in VS Code
5. Run `npm install` then `npm run watch`
6. Press `F5` to launch the Extension Development Host
