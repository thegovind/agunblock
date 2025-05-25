from typing import Optional, List
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

class RepositoryInfoResponse(BaseModel):
    full_name: str
    description: str
    language: str
    stars: int
    default_branch: str
    readme: Optional[str] = None
