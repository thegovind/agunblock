import os
from dotenv import load_dotenv

load_dotenv()

AZURE_AI_PROJECT_CONNECTION_STRING = os.getenv("AZURE_AI_PROJECT_CONNECTION_STRING")
AZURE_AI_AGENTS_API_KEY = os.getenv("AZURE_AI_AGENTS_API_KEY")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API_URL = "https://api.github.com"

CORS_ORIGINS = [
    "http://localhost:5173",  # Development frontend
    "https://agunblock.com",  # Production frontend
    "*",  # Allow all origins for Azure Container Apps communication
]
