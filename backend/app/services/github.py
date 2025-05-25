import base64
from functools import lru_cache
from typing import Dict, Optional, Any, List
from githubkit import GitHub

from ..config import GITHUB_TOKEN
from ..constants import DEPENDENCY_FILES
from ..models.schemas import RepositoryFileInfo


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
        
    async def get_repository_files(self, owner: str, repo: str, branch: Optional[str] = None) -> List[RepositoryFileInfo]:
        """
        Get a list of all files in a repository using the Git Tree API.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            branch: Branch name (defaults to the repository's default branch)
            
        Returns:
            List of RepositoryFileInfo objects representing files in the repository
        """
        try:
            print(f"Fetching file list for {owner}/{repo}...")
            client = gh()
            
            if not branch:
                repo_info = client.rest.repos.get(owner=owner, repo=repo).parsed_data
                branch = repo_info.default_branch
                
            branch_data = client.rest.repos.get_branch(owner=owner, repo=repo, branch=branch).parsed_data
            commit_sha = branch_data.commit.sha
            
            tree_response = client.rest.git.get_tree(
                owner=owner,
                repo=repo,
                tree_sha=commit_sha,
                recursive="1"  # Get all files recursively
            ).parsed_data
            
            files = []
            for item in tree_response.tree:
                files.append(
                    RepositoryFileInfo(
                        path=item.path,
                        type=item.type,
                        size=item.size if hasattr(item, "size") else None
                    )
                )
            
            print(f"Found {len(files)} files in repository")
            return files
        except Exception as e:
            error_message = str(e)
            print(f"Error fetching repository files for {owner}/{repo}: {error_message}")
            return []
            
    async def get_file_content(self, owner: str, repo: str, path: str, ref: Optional[str] = None) -> Optional[str]:
        """
        Get the content of a specific file in a repository.
        
        Args:
            owner: Repository owner/organization
            repo: Repository name
            path: Path to the file
            ref: Branch, tag, or commit SHA (defaults to the default branch)
            
        Returns:
            File content as a string or None if not found
        """
        try:
            content_response = gh().rest.repos.get_content(
                owner=owner,
                repo=repo,
                path=path,
                ref=ref
            ).parsed_data
            
            if hasattr(content_response, "content") and hasattr(content_response, "encoding"):
                if content_response.encoding == "base64":
                    return base64.b64decode(content_response.content).decode("utf-8")
            return None
        except Exception:
            return None
            
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
            
            token_preview = GITHUB_TOKEN[:5] if GITHUB_TOKEN else "None"
            print(f"Creating GitHub client with token: {token_preview}...")
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
            
            files = await self.get_repository_files(owner, repo)
            
            return {
                "full_name": meta.full_name,
                "description": meta.description or "No description available",
                "stars": meta.stargazers_count,
                "language": primary_language,
                "default_branch": meta.default_branch,
                "readme": readme,
                "files": files
            }
        except Exception as e:
            error_message = str(e)
            print(f"Error in get_repository_snapshot for {owner}/{repo}: {error_message}")
            
            print(f"Detailed error: {repr(e)}")
            
            raise RuntimeError(f"Failed to fetch repository data: {error_message}")
