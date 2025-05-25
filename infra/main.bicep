@description('Azure region to deploy to')
param location string = 'westus2'

@description('Environment-specific name that azd passes in')
param envName string

// Create a cleaner name prefix and ACR name that's alphanumeric only
var namePrefix = toLower('agunblock-${envName}')
var acrName = toLower('acr${replace(envName, '-', '')}')

// -------- Static Web App --------------------------------------------------
resource static 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${namePrefix}-swa'
  location: location
  tags: {
    'azd-service-name': 'web'
  }
  sku: {
    name: 'Standard'
  }
  properties: {
    repositoryUrl: 'https://github.com/microsoft/agunblock'
    branch: 'main'
    buildProperties: {
      appLocation: '/frontend'
      outputLocation: 'dist'
    }
  }
}

// -------- Container Registry ----------------------------------------------
resource acr 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: acrName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// -------- Container Apps Environment --------------------------------------
resource env 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${namePrefix}-env'
  location: location
  properties: {}
}

// -------- Backend Container App -------------------------------------------
resource api 'Microsoft.App/containerApps@2025-02-02-preview' = {
  name: '${namePrefix}-api'
  location: location
  tags: {
    'azd-service-name': 'api'
  }
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: acr.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: '0.5'
            memory: '1Gi'
          }
        }
      ]
    }
  }
}

// -------- Outputs ----------------------------------------------------------
output staticWebAppHostname string = static.properties.defaultHostname
output apiUrl string = 'https://${api.properties.configuration.ingress.fqdn}'
output containerRegistryLoginServer string = acr.properties.loginServer
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = acr.properties.loginServer
