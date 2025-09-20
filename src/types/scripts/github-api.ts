/**
 * GitHub API Integration Type Definitions
 * GitHub REST API、Issues、PRs、Actionsの型定義
 */

import type { Octokit } from '@octokit/rest'

// GitHub API Base Types
export interface GitHubRepository {
  readonly owner: string
  readonly repo: string
  readonly fullName: string
}

export interface GitHubUser {
  readonly id: number
  readonly login: string
  readonly name?: string
  readonly email?: string
  readonly avatar_url: string
}

// Issues Management
export interface GitHubIssue {
  readonly id: number
  readonly number: number
  readonly title: string
  readonly body?: string
  readonly state: 'open' | 'closed'
  readonly labels: GitHubLabel[]
  readonly assignees: GitHubUser[]
  readonly milestone?: GitHubMilestone
  readonly created_at: string
  readonly updated_at: string
  readonly closed_at?: string
  readonly html_url: string
}

export interface GitHubLabel {
  readonly id: number
  readonly name: string
  readonly color: string
  readonly description?: string
  readonly default: boolean
}

export interface GitHubMilestone {
  readonly id: number
  readonly number: number
  readonly title: string
  readonly description?: string
  readonly state: 'open' | 'closed'
  readonly due_on?: string
}

// Pull Requests
export interface GitHubPullRequest {
  readonly id: number
  readonly number: number
  readonly title: string
  readonly body?: string
  readonly state: 'open' | 'closed' | 'merged'
  readonly head: GitHubBranch
  readonly base: GitHubBranch
  readonly mergeable?: boolean
  readonly merged: boolean
  readonly merged_at?: string
  readonly html_url: string
}

export interface GitHubBranch {
  readonly ref: string
  readonly sha: string
  readonly repo: GitHubRepository
}

// GitHub Actions
export interface GitHubWorkflow {
  readonly id: number
  readonly name: string
  readonly path: string
  readonly state:
    | 'active'
    | 'deleted'
    | 'disabled_fork'
    | 'disabled_inactivity'
    | 'disabled_manually'
  readonly html_url: string
}

export interface GitHubWorkflowRun {
  readonly id: number
  readonly name: string
  readonly head_branch: string
  readonly head_sha: string
  readonly status: 'queued' | 'in_progress' | 'completed'
  readonly conclusion?:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
  readonly workflow_id: number
  readonly html_url: string
  readonly created_at: string
  readonly updated_at: string
  readonly run_number: number
}

// GitHub API Operations
export interface GitHubAPIConfig {
  readonly token: string
  readonly baseUrl?: string
  readonly userAgent?: string
  readonly timeout?: number
}

export interface GitHubAPIClient {
  readonly rest: Octokit['rest']
  readonly repository: GitHubRepository
}

// Issue Quality Analysis
export interface IssueQualityMetrics {
  readonly hasTitle: boolean
  readonly hasDescription: boolean
  readonly hasLabels: boolean
  readonly hasAssignee: boolean
  readonly hasMilestone: boolean
  readonly hasLinkedPR: boolean
  readonly qualityScore: number // 0-100
}

export interface IssueAnalysisResult {
  readonly issue: GitHubIssue
  readonly quality: IssueQualityMetrics
  readonly suggestions: string[]
  readonly complianceLevel: 'high' | 'medium' | 'low'
}

// Batch Operations
export interface GitHubBatchOperation<T> {
  readonly operation: 'create' | 'update' | 'delete'
  readonly resource: T
  readonly options?: Record<string, unknown>
}

export interface GitHubBatchResult<T> {
  readonly successful: T[]
  readonly failed: Array<{
    resource: T
    error: Error
  }>
  readonly summary: {
    total: number
    successful: number
    failed: number
  }
}

// Label Management
export interface LabelOperation {
  readonly type: 'create' | 'update' | 'delete'
  readonly label: GitHubLabel
  readonly reason?: string
}

export interface LabelMigrationPlan {
  readonly operations: LabelOperation[]
  readonly summary: {
    toCreate: number
    toUpdate: number
    toDelete: number
  }
}

// Repository Statistics
export interface RepositoryStats {
  readonly issues: {
    open: number
    closed: number
    total: number
  }
  readonly pullRequests: {
    open: number
    closed: number
    merged: number
    total: number
  }
  readonly workflow: {
    active: number
    disabled: number
    total: number
  }
  readonly labels: {
    total: number
    withDescription: number
  }
}

// API Rate Limiting
export interface RateLimitInfo {
  readonly limit: number
  readonly remaining: number
  readonly used: number
  readonly reset: Date
}

export interface APIUsageTracking {
  readonly requestCount: number
  readonly rateLimit: RateLimitInfo
  readonly recommendedDelay: number
}
