import base64
from functools import lru_cache
from typing import Dict, Optional, Any
from githubkit import GitHub

from ..config import GITHUB_TOKEN
from ..constants import DEPENDENCY_FILES


@lru_cache
def gh() -> GitHub:
    if not GITHUB_TOKEN:
        raise RuntimeError("GITHUB_TOKEN not set")
    return GitHub(GITHUB_TOKEN)


class GitHubService:
    """Service for interacting with the GitHub API using githubkit."""
    
    def __init__(self) -> None:
        """Initialize the GitHub service."""
        pass
    
    async def get_repository_info(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """
        Get basic repository information from GitHub API.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            
        Returns:
            Repository information as a dictionary or None if not found
        """
        try:
            meta = gh().rest.repos.get(owner=owner, repo=repo).parsed_data
            return {
                "name": meta.name,
                "full_name": meta.full_name,
                "description": meta.description or "No description available",
                "default_branch": meta.default_branch,
            }
        except Exception:
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
        try:
            readme_response = gh().rest.repos.get_readme(owner=owner, repo=repo).parsed_data
            return base64.b64decode(readme_response.content).decode()
        except Exception:
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
        
        for file in DEPENDENCY_FILES:
            try:
                content_response = gh().rest.repos.get_content(
                    owner=owner,
                    repo=repo,
                    path=file
                ).parsed_data
                
                if hasattr(content_response, "content") and hasattr(content_response, "encoding"):
                    if content_response.encoding == "base64":
                        results[file] = base64.b64decode(content_response.content).decode("utf-8")
            except Exception:
                continue
        
        return results
        
    async def get_repository_snapshot(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """
        Get comprehensive repository information from GitHub API.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            
        Returns:
            Repository information as a dictionary or None if not found
        """
        try:
            print(f"Fetching repository data for {owner}/{repo}...")
            
            print(f"Creating GitHub client with token: {GITHUB_TOKEN[:5]}...")
            client = gh()
            
            meta = client.rest.repos.get(owner=owner, repo=repo).parsed_data
            print(f"Repository metadata fetched successfully")
            
            readme = ""
            try:
                readme_response = client.rest.repos.get_readme(owner=owner, repo=repo).parsed_data
                readme = base64.b64decode(readme_response.content).decode()
                print(f"README content fetched successfully")
            except Exception as e:
                print(f"Error fetching README: {str(e)}")
                readme = ""
            
            primary_language = "Unknown"
            try:
                languages_response = client.rest.repos.list_languages(owner=owner, repo=repo).parsed_data
                languages_dict = dict(languages_response)
                if languages_dict:
                    primary_language = max(languages_dict.items(), key=lambda x: x[1])[0]
                    print(f"Primary language detected: {primary_language}")
                else:
                    print("No language information available")
            except Exception as e:
                print(f"Error fetching languages: {str(e)}")
            
            return {
                "full_name": meta.full_name,
                "description": meta.description or "No description available",
                "stars": meta.stargazers_count,
                "language": primary_language,
                "default_branch": meta.default_branch,
                "readme": readme,
            }
        except Exception as e:
            error_message = str(e)
            print(f"Error in get_repository_snapshot for {owner}/{repo}: {error_message}")
            raise RuntimeError(f"Failed to fetch repository data: {error_message}")
