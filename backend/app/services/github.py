import base64
from typing import Dict, Optional, Any

import httpx

from ..config import GITHUB_TOKEN, GITHUB_API_URL
from ..constants import DEPENDENCY_FILES


class GitHubService:
    """Service for interacting with the GitHub API."""
    
    def __init__(self) -> None:
        """Initialize the GitHub service with authentication headers."""
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    async def get_repository_info(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """
        Get basic repository information from GitHub API.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            
        Returns:
            Repository information as a dictionary or None if not found
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_URL}/repos/{owner}/{repo}", 
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_readme_content(self, owner: str, repo: str) -> Optional[str]:
        """
        Get the README content of a repository.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            
        Returns:
            README content as a string or None if not found
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_URL}/repos/{owner}/{repo}/readme", 
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("content") and data.get("encoding") == "base64":
                    return base64.b64decode(data["content"]).decode("utf-8")
            return None
    
    async def get_requirements(self, owner: str, repo: str) -> Dict[str, str]:
        """
        Try to get requirements.txt or similar dependency files.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            
        Returns:
            Dictionary mapping file names to their contents
        """
        results: Dict[str, str] = {}
        
        async with httpx.AsyncClient() as client:
            for file in DEPENDENCY_FILES:
                response = await client.get(
                    f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{file}", 
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("content") and data.get("encoding") == "base64":
                        results[file] = base64.b64decode(data["content"]).decode("utf-8")
        
        return results
