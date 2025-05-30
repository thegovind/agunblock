import logging
import sys
from typing import Optional

def setup_logging(level: str = "INFO", format_style: str = "detailed") -> logging.Logger:
    """
    Set up logging configuration for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        format_style: Either "simple" or "detailed"
    
    Returns:
        Configured logger instance
    """
    
    # Create logger
    logger = logging.getLogger("gitagu")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers to avoid duplicates
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(getattr(logging, level.upper()))
    
    # Create formatter
    if format_style == "detailed":
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
    else:
        formatter = logging.Formatter(
            '[%(levelname)s] %(message)s'
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Don't propagate to root logger to avoid duplicate messages
    logger.propagate = False
    
    return logger

def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance for a specific module or function.
    
    Args:
        name: Optional name for the logger. If None, uses "gitagu"
    
    Returns:
        Logger instance
    """
    if name:
        return logging.getLogger(f"gitagu.{name}")
    return logging.getLogger("gitagu")

# Pre-configured loggers for common use cases
def get_agent_logger() -> logging.Logger:
    """Get logger for Azure AI Agents operations."""
    return get_logger("agent")

def get_github_logger() -> logging.Logger:
    """Get logger for GitHub API operations."""
    return get_logger("github")

def get_api_logger() -> logging.Logger:
    """Get logger for API operations."""
    return get_logger("api") 