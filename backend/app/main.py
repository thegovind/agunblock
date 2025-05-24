from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from .models.schemas import RepositoryAnalysisRequest, RepositoryAnalysisResponse
from .services.github import GitHubService
from .services.agent import AzureAgentService
from .config import CORS_ORIGINS

app = FastAPI(title="AGUnblock Backend", description="Backend API for AGUnblock")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_github_service():
    return GitHubService()

def get_agent_service():
    return AzureAgentService()

@app.get("/")
async def root():
    return {"message": "AGUnblock Backend API"}

@app.post("/api/analyze", response_model=RepositoryAnalysisResponse)
async def analyze_repository(
    request: RepositoryAnalysisRequest,
    github_service: GitHubService = Depends(get_github_service),
    agent_service: AzureAgentService = Depends(get_agent_service)
):
    try:
        print(f"Analyzing repository: {request.owner}/{request.repo} with agent: {request.agent_id}")
        
        repo_info = await github_service.get_repository_info(request.owner, request.repo)
        if not repo_info:
            print(f"Repository not found: {request.owner}/{request.repo}")
            repo_info = {"name": request.repo, "full_name": f"{request.owner}/{request.repo}"}
        
        readme_content = await github_service.get_readme_content(request.owner, request.repo)
        print(f"README content found: {readme_content is not None}")
        
        dependencies = await github_service.get_requirements(request.owner, request.repo)
        print(f"Dependencies found: {len(dependencies)}")
        
        analysis = await agent_service.analyze_repository(
            request.agent_id,
            f"{request.owner}/{request.repo}",
            readme_content or "No README found",  # Provide default if None
            dependencies or {}  # Provide empty dict if None
        )
        
        print(f"Analysis result length: {len(analysis)}")
        
        return RepositoryAnalysisResponse(
            agent_id=request.agent_id,
            repo_name=f"{request.owner}/{request.repo}",
            analysis=analysis
        )
    except Exception as e:
        print(f"Error analyzing repository: {str(e)}")
        return RepositoryAnalysisResponse(
            agent_id=request.agent_id,
            repo_name=f"{request.owner}/{request.repo}",
            analysis=f"Error analyzing repository: {str(e)}",
            error=str(e)
        )
