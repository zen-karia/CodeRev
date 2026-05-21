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

---

## Installation

1. Install **CodeRev** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=zen-karia.coderev)
2. Set up the Python backend (required — the extension spawns a local FastAPI server):
   ```bash
   cd <extension-install-path>/backend
   python -m venv venv
   venv\Scripts\activate      # Windows
   pip install fastapi uvicorn openai chromadb python-dotenv
   ```
3. Create a `.env` file inside the `backend/` folder:
   ```
   OPENAI_API_KEY=your_key_here
   ```
4. Configure settings in VS Code (`Ctrl+,`, search `coderev`):

| Setting | Description |
|---|---|
| `coderev.githubToken` | GitHub personal access token (needs `repo` scope) |
| `coderev.repoOwner` | GitHub username or org |
| `coderev.repoName` | Repository name |

## Usage

1. `Ctrl+Shift+P` → **CodeRev: Index Workspace** — indexes all supported files in the workspace
2. `Ctrl+Shift+P` → **CodeRev: Review PR** — enter a PR number and wait for the review to appear in a new tab

## Requirements

- Python 3.10+
- An OpenAI API key
- A GitHub personal access token with `repo` scope
