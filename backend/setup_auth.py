#!/usr/bin/env python3
"""
Azure Authentication Setup Helper

This script helps you set up authentication for Azure AI Agents service.
It will guide you through the authentication options.
"""

import os
import subprocess
import sys
from azure.identity import DefaultAzureCredential
from azure.core.exceptions import ClientAuthenticationError

def check_azure_cli():
    """Check if Azure CLI is installed and user is logged in."""
    try:
        result = subprocess.run(['az', 'account', 'show'], 
                              capture_output=True, text=True, check=True)
        print("✅ Azure CLI is installed and you are logged in")
        return True
    except subprocess.CalledProcessError:
        print("❌ Azure CLI not logged in or not available")
        return False
    except FileNotFoundError:
        print("❌ Azure CLI is not installed")
        return False

def check_environment_variables():
    """Check if required environment variables are set."""
    endpoint = os.getenv("AZURE_AI_PROJECT_CONNECTION_STRING")
    api_key = os.getenv("AZURE_AI_AGENTS_API_KEY")
    
    print(f"AZURE_AI_PROJECT_CONNECTION_STRING: {'✅ Set' if endpoint else '❌ Not set'}")
    print(f"AZURE_AI_AGENTS_API_KEY: {'✅ Set' if api_key else '❌ Not set'}")
    
    return endpoint, api_key

def test_default_azure_credential():
    """Test if DefaultAzureCredential works."""
    try:
        credential = DefaultAzureCredential()
        # Try to get a token for the Azure Management API
        token = credential.get_token("https://management.azure.com/.default")
        print("✅ DefaultAzureCredential is working")
        return True
    except ClientAuthenticationError as e:
        print(f"❌ DefaultAzureCredential failed: {e}")
        return False
    except Exception as e:
        print(f"❌ DefaultAzureCredential failed: {e}")
        return False

def main():
    print("Azure AI Agents Authentication Setup")
    print("=" * 40)
    
    # Check environment variables
    print("\n1. Checking environment variables...")
    endpoint, api_key = check_environment_variables()
    
    if not endpoint:
        print("\n⚠️  AZURE_AI_PROJECT_CONNECTION_STRING is not set!")
        print("This should be your Azure AI Project endpoint URL.")
        print("Format: https://<your-project-name>.services.ai.azure.com/api/projects/<project-id>")
        print("You can find this in your Azure AI Foundry Project overview page.")
    
    # Check Azure CLI
    print("\n2. Checking Azure CLI authentication...")
    cli_available = check_azure_cli()
    
    # Test DefaultAzureCredential
    print("\n3. Testing DefaultAzureCredential...")
    credential_works = test_default_azure_credential()
    
    # Provide recommendations
    print("\n" + "=" * 40)
    print("RECOMMENDATIONS:")
    print("=" * 40)
    
    if not endpoint:
        print("1. Set AZURE_AI_PROJECT_CONNECTION_STRING environment variable")
        print("   - Find your Project endpoint in Azure AI Foundry Project overview")
        print("   - Set it in your .env file or environment")
    
    if not credential_works and not cli_available:
        print("2. Set up authentication (choose one):")
        print("   Option A (Recommended): Use Azure CLI")
        print("   - Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli")
        print("   - Run: az login")
        print("   - Ensure you have access to the Azure AI Project")
        print("")
        print("   Option B: Use API Key (if available)")
        print("   - Set AZURE_AI_AGENTS_API_KEY environment variable")
        print("   - Get the API key from your Azure AI resource")
    
    if endpoint and credential_works:
        print("✅ Authentication is properly configured!")
        print("You should be able to use the Azure AI Agents service now.")
    
    print("\n" + "=" * 40)
    print("For more information, see:")
    print("https://learn.microsoft.com/en-us/python/api/overview/azure/identity-readme")

if __name__ == "__main__":
    main() 