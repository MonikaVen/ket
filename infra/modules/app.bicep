targetScope = 'resourceGroup'

@description('Logical name for this module (matches azure.yaml service name)')
param name string = 'web'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Name of the environment used in resource naming')
param environmentName string

@description('Tags applied to all resources')
param tags object = {}

// Naming: az{prefix}{resourceToken} (alphanumeric). Token is unique per env/region/sub.
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location, environmentName)
var identityName = 'azid${resourceToken}'
var planName = 'azpln${resourceToken}'
var webName = 'azweb${resourceToken}'
var logName = 'azlog${resourceToken}'
var insightsName = 'azai${resourceToken}'

var appTags = union(tags, { 'azd-service-name': name })

resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: tags
}

// PerGB2018 includes a monthly free grant; enough for occasional study traffic.
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// F1 Free: ~$0, unloads after idle, 60 CPU minutes/day. alwaysOn and healthCheckPath are not supported.
resource plan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: planName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true // Linux App Service plan
  }
}

resource web 'Microsoft.Web/sites@2024-11-01' = {
  name: webName
  location: location
  tags: appTags
  kind: 'app,linux'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${identity.id}': {}
    }
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appCommandLine: 'npm start'
      cors: {
        allowedOrigins: [
          '*'
        ]
        supportCredentials: false
      }
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          // Oryx must install typescript/vite (devDependencies) to run `npm run build`.
          name: 'NPM_CONFIG_PRODUCTION'
          value: 'false'
        }
        {
          name: 'PRE_BUILD_COMMAND'
          value: 'npm install --include=dev'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
      ]
    }
  }
}

resource webDiag 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'webdiag'
  scope: web
  properties: {
    workspaceId: logAnalytics.id
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
      {
        category: 'AppServiceAppLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
  }
}

output webUrl string = 'https://${web.properties.defaultHostName}'
output webName string = web.name
output logAnalyticsWorkspaceId string = logAnalytics.id
