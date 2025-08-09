import React from 'react';
import { AlertTriangle, Settings, Eye, Globe } from 'lucide-react';

interface EnvironmentBannerProps {
  className?: string;
}

export const EnvironmentBanner: React.FC<EnvironmentBannerProps> = ({ className = '' }) => {
  const environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';
  const version = import.meta.env.VITE_APP_VERSION || 'unknown';
  const buildTime = import.meta.env.VITE_APP_BUILD_TIME || '';
  const branch = import.meta.env.VITE_APP_BRANCH || '';
  const prNumber = import.meta.env.VITE_APP_PR_NUMBER || '';

  // Don't show banner in production unless explicitly enabled
  if (environment === 'production' && !import.meta.env.VITE_APP_SHOW_ENV_BANNER) {
    return null;
  }

  const getBannerConfig = () => {
    switch (environment) {
      case 'staging':
        return {
          icon: Settings,
          label: 'STAGING',
          description: 'Staging Environment',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-900',
          borderColor: 'border-yellow-600'
        };
      case 'preview':
      case environment.startsWith('preview-pr-') && environment:
        return {
          icon: Eye,
          label: prNumber ? `PR #${prNumber}` : 'PREVIEW',
          description: `Preview Environment${prNumber ? ` (PR #${prNumber})` : ''}`,
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-900',
          borderColor: 'border-blue-600'
        };
      case 'development':
        return {
          icon: Settings,
          label: 'DEV',
          description: 'Development Environment',
          bgColor: 'bg-green-500',
          textColor: 'text-green-900',
          borderColor: 'border-green-600'
        };
      default:
        return {
          icon: AlertTriangle,
          label: environment.toUpperCase(),
          description: 'Unknown Environment',
          bgColor: 'bg-red-500',
          textColor: 'text-red-900',
          borderColor: 'border-red-600'
        };
    }
  };

  const config = getBannerConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50 
        ${config.bgColor} ${config.textColor} 
        border-b-2 ${config.borderColor}
        px-4 py-2 text-sm font-medium
        flex items-center justify-between
        ${className}
      `}
    >
      <div className="flex items-center space-x-2">
        <IconComponent className="h-4 w-4" />
        <span className="font-bold">{config.label}</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">{config.description}</span>
      </div>
      
      <div className="flex items-center space-x-4 text-xs opacity-75">
        {branch && (
          <span className="hidden md:inline">
            Branch: <code className="bg-black bg-opacity-20 px-1 rounded">{branch}</code>
          </span>
        )}
        {version && (
          <span className="hidden lg:inline">
            Version: <code className="bg-black bg-opacity-20 px-1 rounded">{version.substring(0, 7)}</code>
          </span>
        )}
        {buildTime && (
          <span className="hidden xl:inline">
            Built: {new Date(buildTime).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default EnvironmentBanner;