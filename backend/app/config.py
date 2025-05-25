import os
from dotenv import load_dotenv

load_dotenv()

# Azure AI Agents Configuration (following official sample patterns)
PROJECT_ENDPOINT = os.getenv("PROJECT_ENDPOINT")
MODEL_DEPLOYMENT_NAME = os.getenv("MODEL_DEPLOYMENT_NAME") or os.getenv("AZURE_AI_MODEL_DEPLOYMENT_NAME", "gpt-4o")

# Legacy support for old environment variable names
AZURE_AI_PROJECT_CONNECTION_STRING = os.getenv("AZURE_AI_PROJECT_CONNECTION_STRING") or PROJECT_ENDPOINT
AZURE_AI_AGENTS_API_KEY = os.getenv("AZURE_AI_AGENTS_API_KEY")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API_URL = "https://api.github.com"

CORS_ORIGINS = [
    "http://localhost:5173",  # Development frontend
    "https://agunblock.com",  # Production frontend
    "*",  # Allow all origins for Azure Container Apps communication
]
