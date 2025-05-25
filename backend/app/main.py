from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import asyncio
from .models.schemas import RepositoryAnalysisRequest, RepositoryAnalysisResponse, RepositoryInfoResponse, AnalysisProgressUpdate
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
        
        files = await github_service.get_repository_files(request.owner, request.repo)
        print(f"Repository files found: {len(files)}")
        
        files_dict = [{"path": file.path, "type": file.type, "size": file.size} for file in files]
        
        analysis_result = await agent_service.analyze_repository(
            request.agent_id,
            f"{request.owner}/{request.repo}",
            readme_content or "No README found",  # Provide default if None
            dependencies or {},  # Provide empty dict if None
            files_dict
        )
        
        analysis = analysis_result.get("analysis", "")
        setup_commands = analysis_result.get("setup_commands", {})
        
        print(f"Analysis result length: {len(analysis)}")
        print(f"Setup commands found: {len(setup_commands)}")
        
        return RepositoryAnalysisResponse(
            agent_id=request.agent_id,
            repo_name=f"{request.owner}/{request.repo}",
            analysis=analysis,
            setup_commands=setup_commands
        )
    except Exception as e:
        print(f"Error analyzing repository: {str(e)}")
        return RepositoryAnalysisResponse(
            agent_id=request.agent_id,
            repo_name=f"{request.owner}/{request.repo}",
            analysis=f"Error analyzing repository: {str(e)}",
            error=str(e)
        )

@app.post("/api/analyze-stream")
async def analyze_repository_stream(
    request: RepositoryAnalysisRequest,
    github_service: GitHubService = Depends(get_github_service),
    agent_service: AzureAgentService = Depends(get_agent_service)
):
    """Stream real-time progress updates during repository analysis."""
    
    async def generate_progress_stream():
        try:
            print(f"Starting streaming analysis for repository: {request.owner}/{request.repo} with agent: {request.agent_id}")
            
            # Create a queue to collect progress updates
            import asyncio
            progress_queue = asyncio.Queue()
            analysis_complete = False
            
            async def progress_callback(update: AnalysisProgressUpdate):
                await progress_queue.put(update)
            
            # Start the analysis in a background task
            async def run_analysis():
                nonlocal analysis_complete
                try:
                    # Fetch repository data
                    repo_info = await github_service.get_repository_info(request.owner, request.repo)
                    if not repo_info:
                        print(f"Repository not found: {request.owner}/{request.repo}")
                        repo_info = {"name": request.repo, "full_name": f"{request.owner}/{request.repo}"}
                    
                    readme_content = await github_service.get_readme_content(request.owner, request.repo)
                    dependencies = await github_service.get_requirements(request.owner, request.repo)
                    files = await github_service.get_repository_files(request.owner, request.repo)
                    
                    files_dict = [{"path": file.path, "type": file.type, "size": file.size} for file in files]
                    
                    # Perform analysis with progress callback
                    analysis_result = await agent_service.analyze_repository(
                        request.agent_id,
                        f"{request.owner}/{request.repo}",
                        readme_content or "No README found",
                        dependencies or {},
                        files_dict,
                        progress_callback=progress_callback
                    )
                    
                    # Send final result to queue
                    final_response = RepositoryAnalysisResponse(
                        agent_id=request.agent_id,
                        repo_name=f"{request.owner}/{request.repo}",
                        analysis=analysis_result.get("analysis", ""),
                        setup_commands=analysis_result.get("setup_commands", {})
                    )
                    
                    await progress_queue.put({"type": "final_result", "data": final_response.model_dump()})
                    await progress_queue.put({"type": "complete"})
                    
                except Exception as e:
                    print(f"Error in analysis task: {str(e)}")
                    await progress_queue.put({
                        "type": "error",
                        "error": str(e),
                        "agent_id": request.agent_id,
                        "repo_name": f"{request.owner}/{request.repo}"
                    })
                finally:
                    analysis_complete = True
            
            # Start the analysis task
            analysis_task = asyncio.create_task(run_analysis())
            
            # Stream progress updates as they come in
            while not analysis_complete or not progress_queue.empty():
                try:
                    # Wait for next update with timeout
                    update = await asyncio.wait_for(progress_queue.get(), timeout=1.0)
                    
                    if hasattr(update, 'model_dump'):  # It's an AnalysisProgressUpdate
                        yield f"data: {json.dumps(update.model_dump())}\n\n"
                    else:  # It's a dict (final result, error, etc.)
                        yield f"data: {json.dumps(update)}\n\n"
                        
                        if update.get("type") in ["complete", "error"]:
                            break
                            
                except asyncio.TimeoutError:
                    # Check if analysis is still running
                    if analysis_complete:
                        break
                    continue
            
            # Ensure the analysis task completes
            if not analysis_task.done():
                await analysis_task
            
        except Exception as e:
            print(f"Error in streaming analysis: {str(e)}")
            error_response = {
                "type": "error",
                "error": str(e),
                "agent_id": request.agent_id,
                "repo_name": f"{request.owner}/{request.repo}"
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return StreamingResponse(
        generate_progress_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )

@app.get("/api/repo-info/{owner}/{repo}", response_model=RepositoryInfoResponse)
async def get_repository_info(
    owner: str,
    repo: str,
    github_service: GitHubService = Depends(get_github_service)
):
    try:
        print(f"Fetching repository data for {owner}/{repo}...")
        repo_data = await github_service.get_repository_snapshot(owner, repo)
        if not repo_data:
            print(f"Repository not found: {owner}/{repo}")
            raise HTTPException(status_code=404, detail="Repository not found")
        
        return RepositoryInfoResponse(**repo_data)
    except RuntimeError as e:
        error_msg = f"Error fetching repository info: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
