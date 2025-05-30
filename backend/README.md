# gitagu Backend

This is the backend API for gitagu, an open-source utility under Microsoft that helps developers leverage AI agents for their Software Development Life Cycle (SDLC).

## Features

- FastAPI-based RESTful API
- Integration with Azure AI Agents SDK
- GitHub API integration for repository analysis
- Repository-specific AI agent configuration guides

## Getting Started

### Prerequisites

- Python 3.8+
- pip
- uv ([install instructions](https://github.com/astral-sh/uv#installation))
- Azure AI Agents subscription (for production)
- GitHub token (optional, for higher rate limits)

### Installation

```bash
# Create and activate virtual environment
uv venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
uv pip install -r requirements.txt
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Azure AI Agents Configuration
AZURE_AI_AGENTS_ENDPOINT=your_endpoint
AZURE_AI_AGENTS_API_KEY=your_api_key
AZURE_AI_AGENTS_PROJECT_NAME=gitagu

# GitHub API Configuration
GITHUB_TOKEN=your_github_token
```

### Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

## API Endpoints

### Repository Analysis

```
POST /api/analyze
```

Request body:
```json
{
  "owner": "github_username",
  "repo": "repository_name",
  "agent_id": "github-copilot"
}
```

Response:
```json
{
  "agent_id": "github-copilot",
  "repo_name": "github_username/repository_name",
  "analysis": "Markdown-formatted analysis content",
  "error": null
}
```

## Project Structure

- `app/main.py` - FastAPI application and routes
- `app/services/` - Service modules for GitHub and Azure AI Agents
- `app/models/` - Pydantic models for request/response schemas
- `app/config.py` - Configuration settings

## Learn More

Visit [gitagu.com](https://gitagu.com) to see the live application and explore how AI agents can enhance your development workflow.

---

© 2025 Microsoft Corporation. gitagu is an open source project.
