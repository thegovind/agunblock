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

# Streaming analysis progress models
class AnalysisProgressUpdate(BaseModel):
    step: int  # 1, 2, or 3
    step_name: str
    status: str  # "starting", "in_progress", "completed", "failed"
    message: str
    progress_percentage: int  # 0-100
    elapsed_time: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
