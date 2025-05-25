"""
Constants used throughout the application.
"""

AGENT_ID_GITHUB_COPILOT_COMPLETIONS = 'github-copilot-completions'
AGENT_ID_GITHUB_COPILOT_AGENT = 'github-copilot-agent'
AGENT_ID_DEVIN = 'devin'
AGENT_ID_CODEX_CLI = 'codex-cli'
AGENT_ID_SREAGENT = 'sreagent'

LEGACY_AGENT_ID_MAP = {
    'github-copilot': AGENT_ID_GITHUB_COPILOT_COMPLETIONS,
}

DEPENDENCY_FILES = ["requirements.txt", "package.json", "pom.xml", "build.gradle"]

LANGUAGE_MAP = {
    "requirements.txt": "Python",
    "package.json": "JavaScript/TypeScript",
    "pom.xml": "Java",
    "build.gradle": "Java/Kotlin",
}
