from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class RepositoryAnalysisRequest(BaseModel):
    owner: str
    repo: str
    agent_id: str
    
class RepositoryAnalysisResponse(BaseModel):
    agent_id: str
    repo_name: str
    analysis: str
    error: Optional[str] = None
    setup_commands: Optional[Dict[str, str]] = None

class RepositoryFileInfo(BaseModel):
    path: str
    type: str  # "blob" or "tree"
    size: Optional[int] = None

class RepositoryInfoResponse(BaseModel):
    full_name: str
    description: str
    language: str
    stars: int
    default_branch: str
    readme: Optional[str] = None
    files: Optional[List[RepositoryFileInfo]] = None

class DevinSetupCommand(BaseModel):
    step: str
    description: str
    commands: List[str]
