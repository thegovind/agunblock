import base64
import httpx
from ..config import GITHUB_TOKEN, GITHUB_API_URL

class GitHubService:
    def __init__(self):
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
        }
        if GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    async def get_repository_info(self, owner: str, repo: str):
        """Get basic repository information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_URL}/repos/{owner}/{repo}", 
                headers=self.headers
            )
            if response.status_code == 200:
                return response.json()
            return None
    
    async def get_readme_content(self, owner: str, repo: str):
        """Get the README content of a repository."""
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
    
    async def get_requirements(self, owner: str, repo: str):
        """Try to get requirements.txt or similar dependency files."""
        dependency_files = ["requirements.txt", "package.json", "pom.xml", "build.gradle"]
        results = {}
        
        async with httpx.AsyncClient() as client:
            for file in dependency_files:
                response = await client.get(
                    f"{GITHUB_API_URL}/repos/{owner}/{repo}/contents/{file}", 
                    headers=self.headers
                )
                if response.status_code == 200:
                    data = response.json()
                    if data.get("content") and data.get("encoding") == "base64":
                        results[file] = base64.b64decode(data["content"]).decode("utf-8")
        
        return results
