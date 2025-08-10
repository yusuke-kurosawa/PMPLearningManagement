import React, { useState, useEffect } from 'react'
import { Info, Globe, Code, Clock, GitBranch, Hash, User, Calendar } from 'lucide-react'

interface DeploymentInfo {
  environment: string
  deploymentType: string
  version: string
  buildTime: string
  branch: string
  prNumber: number | null
  url: string
  commit: {
    sha: string
    message: string
    author: string
  }
}

interface EnvironmentInfoProps {
  className?: string
  showDetails?: boolean
}

export const EnvironmentInfo: React.FC<EnvironmentInfoProps> = ({
  className = '',
  showDetails = false,
}) => {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDeploymentInfo = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/deployment-info.json')
        if (response.ok) {
          const info = await response.json()
          setDeploymentInfo(info)
        }
      } catch (error) {
        console.warn('Could not fetch deployment info:', error)
        // Fallback to environment variables
        setDeploymentInfo({
          environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
          deploymentType: 'unknown',
          version: import.meta.env.VITE_APP_VERSION || 'unknown',
          buildTime: import.meta.env.VITE_APP_BUILD_TIME || '',
          branch: import.meta.env.VITE_APP_BRANCH || '',
          prNumber: import.meta.env.VITE_APP_PR_NUMBER
            ? parseInt(import.meta.env.VITE_APP_PR_NUMBER)
            : null,
          url: window.location.origin,
          commit: {
            sha: import.meta.env.VITE_APP_VERSION || 'unknown',
            message: '',
            author: '',
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeploymentInfo()
  }, [])

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!deploymentInfo) {
    return null
  }

  const formatBuildTime = (buildTime: string) => {
    if (!buildTime) return 'Unknown'
    try {
      return new Date(buildTime).toLocaleString()
    } catch {
      return buildTime
    }
  }

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'staging':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'development':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        if (env.startsWith('preview-pr-')) {
          return 'text-purple-600 bg-purple-50 border-purple-200'
        }
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="p-4">
        <div className="mb-4 flex items-center space-x-2">
          <Info className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Environment Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Environment */}
          <div className="flex items-center space-x-3">
            <Globe className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Environment</p>
              <span
                className={`
                  inline-flex rounded-full border px-2 py-1 text-xs font-medium
                  ${getEnvironmentColor(deploymentInfo.environment)}
                `}
              >
                {deploymentInfo.environment}
              </span>
            </div>
          </div>

          {/* Version */}
          <div className="flex items-center space-x-3">
            <Hash className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Version</p>
              <p className="font-mono text-sm text-gray-900">
                {deploymentInfo.version.substring(0, 8)}
              </p>
            </div>
          </div>

          {/* Branch */}
          {deploymentInfo.branch && (
            <div className="flex items-center space-x-3">
              <GitBranch className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-mono text-sm text-gray-900">{deploymentInfo.branch}</p>
              </div>
            </div>
          )}

          {/* PR Number */}
          {deploymentInfo.prNumber && (
            <div className="flex items-center space-x-3">
              <Code className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Pull Request</p>
                <p className="font-mono text-sm text-blue-600">#{deploymentInfo.prNumber}</p>
              </div>
            </div>
          )}

          {/* Build Time */}
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Build Time</p>
              <p className="text-sm text-gray-900">{formatBuildTime(deploymentInfo.buildTime)}</p>
            </div>
          </div>

          {/* Deployment Type */}
          <div className="flex items-center space-x-3">
            <Info className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Deployment Type</p>
              <p className="text-sm capitalize text-gray-900">
                {deploymentInfo.deploymentType.replace('-', ' ')}
              </p>
            </div>
          </div>
        </div>

        {showDetails && deploymentInfo.commit && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-900">Commit Information</h4>
            <div className="space-y-2">
              {deploymentInfo.commit.message && (
                <div className="flex items-start space-x-3">
                  <Code className="mt-0.5 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="font-mono text-sm text-gray-900">
                      {deploymentInfo.commit.message}
                    </p>
                  </div>
                </div>
              )}
              {deploymentInfo.commit.author && (
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Author</p>
                    <p className="text-sm text-gray-900">{deploymentInfo.commit.author}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Health Check */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className="flex items-center text-sm text-green-600">
              <div className="mr-2 h-2 w-2 rounded-full bg-green-600"></div>
              Healthy
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentInfo
