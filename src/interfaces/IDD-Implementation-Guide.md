# IDD Implementation Guide

## Quick Start

This guide provides practical examples and templates for implementing the IDD architecture in the PMPLearningManagement system.

## Table of Contents

1. [Creating Domain Entities](#creating-domain-entities)
2. [Implementing Repositories](#implementing-repositories)
3. [Building Application Services](#building-application-services)
4. [Defining API Endpoints](#defining-api-endpoints)
5. [Testing with Mocks](#testing-with-mocks)
6. [Validation and Schemas](#validation-and-schemas)

## Creating Domain Entities

### Example: PMBOKProcess Entity

```typescript
import { 
  IEntity, 
  IValidationResult,
  ValidationResult 
} from '@/interfaces/core/base.interfaces'
import { 
  IPMBOKProcess,
  IPMBOKProcessData,
  IProcessGroup,
  IKnowledgeArea,
  IITTO 
} from '@/interfaces/domain/learning.interfaces'

export class PMBOKProcess implements IPMBOKProcess {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number
  readonly processId: string
  readonly name: string
  readonly processGroup: IProcessGroup
  readonly knowledgeArea: IKnowledgeArea
  readonly description: string
  readonly version: PMBOKVersion
  
  private _inputs: IITTO[]
  private _tools: IITTO[]
  private _outputs: IITTO[]
  
  constructor(data: IPMBOKProcessData) {
    this.id = data.processId
    this.processId = data.processId
    this.name = data.name
    this.description = data.description
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.version = 1
    
    // Initialize related entities
    this.processGroup = ProcessGroupFactory.create(data.processGroup)
    this.knowledgeArea = KnowledgeAreaFactory.create(data.knowledgeArea)
    this._inputs = data.inputs.map(ITTOFactory.create)
    this._tools = data.tools.map(ITTOFactory.create)
    this._outputs = data.outputs.map(ITTOFactory.create)
  }
  
  validate(): IValidationResult {
    const result = new ValidationResult()
    
    if (!this.name || this.name.trim().length === 0) {
      result.addError({
        field: 'name',
        message: 'Process name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      })
    }
    
    if (this._inputs.length === 0) {
      result.addError({
        field: 'inputs',
        message: 'Process must have at least one input',
        code: 'MIN_LENGTH',
        severity: 'warning'
      })
    }
    
    return result
  }
  
  toJSON(): IPMBOKProcessData {
    return {
      processId: this.processId,
      name: this.name,
      processGroup: this.processGroup.getValue().name,
      knowledgeArea: this.knowledgeArea.getValue().name,
      description: this.description,
      version: this.version,
      inputs: this._inputs.map(i => i.toJSON()),
      tools: this._tools.map(t => t.toJSON()),
      outputs: this._outputs.map(o => o.toJSON())
    }
  }
  
  clone(): IPMBOKProcess {
    return new PMBOKProcess(this.toJSON())
  }
  
  equals(other: IEntity<IPMBOKProcessData>): boolean {
    if (!(other instanceof PMBOKProcess)) return false
    return this.processId === other.processId
  }
  
  getInputs(): IITTO[] {
    return [...this._inputs]
  }
  
  getToolsAndTechniques(): IITTO[] {
    return [...this._tools]
  }
  
  getOutputs(): IITTO[] {
    return [...this._outputs]
  }
  
  getRelatedProcesses(): IPMBOKProcess[] {
    // Implementation to find related processes
    return []
  }
  
  belongsToKnowledgeArea(area: string): boolean {
    return this.knowledgeArea.getValue().name === area
  }
  
  belongsToProcessGroup(group: string): boolean {
    return this.processGroup.getValue().name === group
  }
}
```

## Implementing Repositories

### Example: Learning Path Repository

```typescript
import { 
  IRepository,
  ISpecification,
  IQueryCriteria 
} from '@/interfaces/core/base.interfaces'
import {
  ILearningPath,
  ILearningPathRepository,
  CertificationType
} from '@/interfaces/domain/learning.interfaces'
import { supabase } from '@/lib/supabase'

export class LearningPathRepository implements ILearningPathRepository {
  private table = 'learning_paths'
  
  async findById(id: string): Promise<ILearningPath | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) return null
    return this.mapToEntity(data)
  }
  
  async findAll(spec?: ISpecification<ILearningPath>): Promise<ILearningPath[]> {
    let query = supabase.from(this.table).select('*')
    
    if (spec) {
      const criteria = spec.toCriteria()
      query = this.applyCriteria(query, criteria)
    }
    
    const { data, error } = await query
    if (error || !data) return []
    
    return data.map(this.mapToEntity)
  }
  
  async findOne(spec: ISpecification<ILearningPath>): Promise<ILearningPath | null> {
    const results = await this.findAll(spec)
    return results[0] || null
  }
  
  async save(entity: ILearningPath): Promise<ILearningPath> {
    const data = entity.toJSON()
    
    const { data: saved, error } = await supabase
      .from(this.table)
      .upsert(data)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to save: ${error.message}`)
    
    return this.mapToEntity(saved)
  }
  
  async saveAll(entities: ILearningPath[]): Promise<ILearningPath[]> {
    const data = entities.map(e => e.toJSON())
    
    const { data: saved, error } = await supabase
      .from(this.table)
      .upsert(data)
      .select()
    
    if (error) throw new Error(`Failed to save: ${error.message}`)
    
    return saved.map(this.mapToEntity)
  }
  
  async delete(entity: ILearningPath): Promise<void> {
    await this.deleteById(entity.id)
  }
  
  async deleteById(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete: ${error.message}`)
  }
  
  async count(spec?: ISpecification<ILearningPath>): Promise<number> {
    let query = supabase.from(this.table).select('id', { count: 'exact' })
    
    if (spec) {
      const criteria = spec.toCriteria()
      query = this.applyCriteria(query, criteria)
    }
    
    const { count, error } = await query
    if (error) throw new Error(`Failed to count: ${error.message}`)
    
    return count || 0
  }
  
  async exists(id: string): Promise<boolean> {
    const { data } = await supabase
      .from(this.table)
      .select('id')
      .eq('id', id)
      .single()
    
    return !!data
  }
  
  // ILearningPathRepository specific methods
  async findByUser(userId: string): Promise<ILearningPath[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
    
    if (error || !data) return []
    return data.map(this.mapToEntity)
  }
  
  async findActive(userId: string): Promise<ILearningPath[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
    
    if (error || !data) return []
    return data.map(this.mapToEntity)
  }
  
  async findByCertification(
    certification: CertificationType
  ): Promise<ILearningPath[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('target_certification', certification)
    
    if (error || !data) return []
    return data.map(this.mapToEntity)
  }
  
  private applyCriteria(query: any, criteria: IQueryCriteria): any {
    if (criteria.where) {
      Object.entries(criteria.where).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    if (criteria.orderBy) {
      criteria.orderBy.forEach(({ field, direction }) => {
        query = query.order(field, { ascending: direction === 'asc' })
      })
    }
    
    if (criteria.limit) {
      query = query.limit(criteria.limit)
    }
    
    if (criteria.offset) {
      query = query.range(criteria.offset, criteria.offset + (criteria.limit || 10) - 1)
    }
    
    return query
  }
  
  private mapToEntity(data: any): ILearningPath {
    return LearningPathFactory.create(data)
  }
}
```

## Building Application Services

### Example: Learning Service

```typescript
import {
  IApplicationService,
  ICommandBus,
  IQueryBus,
  IEventBus,
  ILogger,
  IHealthStatus
} from '@/interfaces/core/base.interfaces'
import {
  IStartLearningPathCommand,
  IGetLearningProgressQuery,
  ILearningPath,
  IUserProgress
} from '@/interfaces/domain/learning.interfaces'

export class LearningApplicationService implements IApplicationService {
  constructor(
    private commandBus: ICommandBus,
    private queryBus: IQueryBus,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}
  
  getName(): string {
    return 'LearningApplicationService'
  }
  
  async initialize(): Promise<void> {
    this.logger.info('Initializing Learning Application Service')
    
    // Register command handlers
    this.commandBus.register(
      'StartLearningPath',
      new StartLearningPathHandler(/* dependencies */)
    )
    
    // Register query handlers
    this.queryBus.register(
      'GetLearningProgress',
      new GetLearningProgressHandler(/* dependencies */)
    )
  }
  
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Learning Application Service')
  }
  
  async healthCheck(): Promise<IHealthStatus> {
    return {
      status: 'healthy',
      message: 'Learning service is operational',
      timestamp: new Date()
    }
  }
  
  async handle<TCommand, TResult>(command: TCommand): Promise<TResult> {
    this.logger.debug('Handling command', { command })
    
    try {
      const result = await this.commandBus.send(command)
      this.logger.info('Command handled successfully')
      return result as TResult
    } catch (error) {
      this.logger.error('Command handling failed', error as Error)
      throw error
    }
  }
  
  // Application-specific methods
  async startLearningPath(
    userId: string,
    certification: CertificationType,
    targetDate: Date
  ): Promise<ILearningPath> {
    const command: IStartLearningPathCommand = {
      commandId: generateId(),
      timestamp: new Date(),
      userId,
      certification,
      targetDate,
      studyHoursPerDay: 2
    }
    
    return this.handle<IStartLearningPathCommand, ILearningPath>(command)
  }
  
  async getLearningProgress(
    userId: string,
    includeDetails: boolean = false
  ): Promise<IUserProgress> {
    const query: IGetLearningProgressQuery = {
      queryId: generateId(),
      timestamp: new Date(),
      userId,
      includeDetails
    }
    
    return this.queryBus.send<IGetLearningProgressQuery, IUserProgress>(query)
  }
}
```

## Defining API Endpoints

### Example: Learning API Endpoint

```typescript
import { z } from 'zod'
import {
  IApiEndpoint,
  IHttpRequest,
  IHttpResponse,
  IValidationResult,
  IEndpointDocumentation,
  HttpMethod
} from '@/interfaces/infrastructure/api.interfaces'

export class GetLearningProgressEndpoint 
  implements IApiEndpoint<void, IUserProgressResponse> {
  
  readonly path = '/api/v1/learning/progress'
  readonly method: HttpMethod = 'GET'
  readonly version = '1.0.0'
  readonly authentication = 'jwt' as const
  readonly authorization = ['user:read']
  
  constructor(
    private learningService: ILearningApplicationService,
    private validator: IValidator<void>
  ) {}
  
  async handle(
    request: IHttpRequest<void>
  ): Promise<IHttpResponse<IUserProgressResponse>> {
    // Validate request
    const validation = this.validate(request)
    if (!validation.isValid) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { errors: validation.getErrorMessages() }
      }
    }
    
    // Get user from authenticated request
    const userId = request.user?.userId
    if (!userId) {
      return {
        status: 401,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Unauthorized' }
      }
    }
    
    try {
      // Call application service
      const progress = await this.learningService.getLearningProgress(
        userId,
        request.params?.includeDetails === 'true'
      )
      
      // Transform to response DTO
      const response: IUserProgressResponse = {
        userId: progress.userId,
        overallProgress: progress.overallProgress,
        studyStreak: progress.studyStreak,
        totalStudyTime: progress.totalStudyTime,
        lastActivityAt: progress.lastActivityAt.toISOString(),
        knowledgeAreas: Array.from(progress.getProgressByKnowledgeArea()),
        processGroups: Array.from(progress.getProgressByProcessGroup()),
        readinessScore: progress.calculateReadinessScore()
      }
      
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: response
      }
    } catch (error) {
      return {
        status: 500,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Internal server error' }
      }
    }
  }
  
  validate(request: IHttpRequest<void>): IValidationResult {
    return this.validator.validate(request.body)
  }
  
  getDocumentation(): IEndpointDocumentation {
    return {
      summary: 'Get learning progress',
      description: 'Retrieves the learning progress for the authenticated user',
      tags: ['Learning', 'Progress'],
      parameters: [
        {
          name: 'includeDetails',
          in: 'query',
          description: 'Include detailed progress information',
          required: false,
          schema: { type: 'boolean' }
        }
      ],
      responses: [
        {
          status: 200,
          description: 'Success',
          content: {
            'application/json': {
              schema: this.getResponseSchema()
            }
          }
        },
        {
          status: 401,
          description: 'Unauthorized'
        }
      ]
    }
  }
  
  getRequestSchema(): z.ZodSchema<void> {
    return z.void()
  }
  
  getResponseSchema(): z.ZodSchema<IUserProgressResponse> {
    return UserProgressResponseSchema
  }
}

// Response DTO and Schema
interface IUserProgressResponse {
  userId: string
  overallProgress: number
  studyStreak: number
  totalStudyTime: number
  lastActivityAt: string
  knowledgeAreas: Array<[string, number]>
  processGroups: Array<[string, number]>
  readinessScore: number
}

const UserProgressResponseSchema = z.object({
  userId: z.string(),
  overallProgress: z.number().min(0).max(100),
  studyStreak: z.number().int().min(0),
  totalStudyTime: z.number().min(0),
  lastActivityAt: z.string().datetime(),
  knowledgeAreas: z.array(z.tuple([z.string(), z.number()])),
  processGroups: z.array(z.tuple([z.string(), z.number()])),
  readinessScore: z.number().min(0).max(100)
})
```

## Testing with Mocks

### Example: Mock Repository

```typescript
import { 
  ILearningPathRepository,
  ILearningPath,
  CertificationType
} from '@/interfaces/domain/learning.interfaces'
import { ISpecification } from '@/interfaces/core/base.interfaces'

export class MockLearningPathRepository implements ILearningPathRepository {
  private storage = new Map<string, ILearningPath>()
  
  async findById(id: string): Promise<ILearningPath | null> {
    return this.storage.get(id) || null
  }
  
  async findAll(spec?: ISpecification<ILearningPath>): Promise<ILearningPath[]> {
    const all = Array.from(this.storage.values())
    
    if (!spec) return all
    
    return all.filter(item => spec.isSatisfiedBy(item))
  }
  
  async findOne(spec: ISpecification<ILearningPath>): Promise<ILearningPath | null> {
    const results = await this.findAll(spec)
    return results[0] || null
  }
  
  async save(entity: ILearningPath): Promise<ILearningPath> {
    this.storage.set(entity.id, entity)
    return entity
  }
  
  async saveAll(entities: ILearningPath[]): Promise<ILearningPath[]> {
    entities.forEach(e => this.storage.set(e.id, e))
    return entities
  }
  
  async delete(entity: ILearningPath): Promise<void> {
    this.storage.delete(entity.id)
  }
  
  async deleteById(id: string): Promise<void> {
    this.storage.delete(id)
  }
  
  async count(spec?: ISpecification<ILearningPath>): Promise<number> {
    const results = await this.findAll(spec)
    return results.length
  }
  
  async exists(id: string): Promise<boolean> {
    return this.storage.has(id)
  }
  
  async findByUser(userId: string): Promise<ILearningPath[]> {
    return Array.from(this.storage.values())
      .filter(path => path.userId === userId)
  }
  
  async findActive(userId: string): Promise<ILearningPath[]> {
    return Array.from(this.storage.values())
      .filter(path => path.userId === userId && !path.completedAt)
  }
  
  async findByCertification(
    certification: CertificationType
  ): Promise<ILearningPath[]> {
    return Array.from(this.storage.values())
      .filter(path => path.targetCertification === certification)
  }
  
  // Test helper methods
  clear(): void {
    this.storage.clear()
  }
  
  seed(data: ILearningPath[]): void {
    data.forEach(item => this.storage.set(item.id, item))
  }
}
```

### Example: Integration Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MockLearningPathRepository } from './mocks/MockLearningPathRepository'
import { LearningApplicationService } from './LearningApplicationService'
import { createMockLearningPath } from './fixtures/learningPath'

describe('LearningApplicationService', () => {
  let service: LearningApplicationService
  let repository: MockLearningPathRepository
  
  beforeEach(async () => {
    repository = new MockLearningPathRepository()
    service = new LearningApplicationService(
      repository,
      /* other mock dependencies */
    )
    await service.initialize()
  })
  
  describe('startLearningPath', () => {
    it('should create a new learning path', async () => {
      // Arrange
      const userId = 'user-123'
      const certification = 'PMP'
      const targetDate = new Date('2025-12-31')
      
      // Act
      const result = await service.startLearningPath(
        userId,
        certification,
        targetDate
      )
      
      // Assert
      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.targetCertification).toBe(certification)
      
      // Verify repository was called
      const saved = await repository.findById(result.id)
      expect(saved).toBeDefined()
      expect(saved?.id).toBe(result.id)
    })
  })
  
  describe('getLearningProgress', () => {
    it('should retrieve user progress', async () => {
      // Arrange
      const userId = 'user-123'
      const mockPath = createMockLearningPath({ userId })
      repository.seed([mockPath])
      
      // Act
      const result = await service.getLearningProgress(userId, true)
      
      // Assert
      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.overallProgress).toBeGreaterThanOrEqual(0)
      expect(result.overallProgress).toBeLessThanOrEqual(100)
    })
  })
})
```

## Validation and Schemas

### Example: Zod Schema Generation

```typescript
import { z } from 'zod'
import {
  IPMBOKProcessData,
  ProcessGroupName,
  KnowledgeAreaName,
  ITTOType
} from '@/interfaces/domain/learning.interfaces'

// Auto-generate schemas from interfaces
export const ProcessGroupNameSchema = z.enum([
  'Initiating',
  'Planning',
  'Executing',
  'Monitoring and Controlling',
  'Closing'
])

export const KnowledgeAreaNameSchema = z.enum([
  'Integration Management',
  'Scope Management',
  'Schedule Management',
  'Cost Management',
  'Quality Management',
  'Resource Management',
  'Communications Management',
  'Risk Management',
  'Procurement Management',
  'Stakeholder Management'
])

export const ITTOTypeSchema = z.enum(['input', 'tool', 'technique', 'output'])

export const ITTODataSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  type: ITTOTypeSchema,
  category: z.string().optional(),
  relatedProcessIds: z.array(z.string())
})

export const PMBOKProcessDataSchema = z.object({
  processId: z.string(),
  name: z.string().min(1),
  processGroup: ProcessGroupNameSchema,
  knowledgeArea: KnowledgeAreaNameSchema,
  description: z.string(),
  version: z.union([z.literal(6), z.literal(7)]),
  inputs: z.array(ITTODataSchema),
  tools: z.array(ITTODataSchema),
  outputs: z.array(ITTODataSchema)
})

// Type inference from schemas
export type ProcessGroupNameType = z.infer<typeof ProcessGroupNameSchema>
export type KnowledgeAreaNameType = z.infer<typeof KnowledgeAreaNameSchema>
export type ITTODataType = z.infer<typeof ITTODataSchema>
export type PMBOKProcessDataType = z.infer<typeof PMBOKProcessDataSchema>

// Validation helper
export class SchemaValidator<T> implements IValidator<T> {
  constructor(private schema: z.ZodSchema<T>) {}
  
  validate(value: T): IValidationResult {
    const result = this.schema.safeParse(value)
    
    if (result.success) {
      return ValidationResult.success()
    }
    
    return ValidationResult.fromZodError(result.error)
  }
  
  async validateAsync(value: T): Promise<IValidationResult> {
    return this.validate(value)
  }
  
  getSchema(): z.ZodSchema<T> {
    return this.schema
  }
}

// Usage
const processValidator = new SchemaValidator(PMBOKProcessDataSchema)
const validationResult = processValidator.validate(processData)

if (!validationResult.isValid) {
  console.error('Validation failed:', validationResult.getErrorMessages())
}
```

## Dependency Injection Setup

### Example: DI Container Configuration

```typescript
import { Container } from 'inversify'
import {
  ILearningPathRepository,
  IAssessmentRepository,
  IProgressRepository,
  ILearningApplicationService,
  IAICoaching
} from '@/interfaces'

const container = new Container()

// Bind repositories
container.bind<ILearningPathRepository>('ILearningPathRepository')
  .to(LearningPathRepository)
  .inSingletonScope()

container.bind<IAssessmentRepository>('IAssessmentRepository')
  .to(AssessmentRepository)
  .inSingletonScope()

container.bind<IProgressRepository>('IProgressRepository')
  .to(ProgressRepository)
  .inSingletonScope()

// Bind services
container.bind<ILearningApplicationService>('ILearningApplicationService')
  .to(LearningApplicationService)
  .inSingletonScope()

container.bind<IAICoaching>('IAICoaching')
  .to(AICoachingService)
  .inSingletonScope()

// Bind infrastructure
container.bind<ILogger>('ILogger')
  .to(ConsoleLogger)
  .inSingletonScope()

container.bind<ICache>('ICache')
  .to(RedisCache)
  .inSingletonScope()

container.bind<IEventBus>('IEventBus')
  .to(EventBus)
  .inSingletonScope()

// Factory for creating instances
export const serviceFactory = {
  getLearningService(): ILearningApplicationService {
    return container.get<ILearningApplicationService>('ILearningApplicationService')
  },
  
  getAICoaching(): IAICoaching {
    return container.get<IAICoaching>('IAICoaching')
  },
  
  getLearningPathRepository(): ILearningPathRepository {
    return container.get<ILearningPathRepository>('ILearningPathRepository')
  }
}

// Usage in components
const learningService = serviceFactory.getLearningService()
const progress = await learningService.getLearningProgress(userId)
```

## Migration Checklist

To migrate existing code to IDD architecture:

- [ ] Identify existing services and extract interfaces
- [ ] Create interface definitions for all domain entities
- [ ] Define repository contracts for data access
- [ ] Establish application service interfaces
- [ ] Create API endpoint contracts
- [ ] Generate validation schemas from interfaces
- [ ] Implement mock versions for testing
- [ ] Set up dependency injection container
- [ ] Migrate concrete implementations incrementally
- [ ] Add contract tests for all interfaces
- [ ] Update documentation with interface contracts
- [ ] Configure code generation pipeline

## Best Practices

1. **Interface Segregation**: Keep interfaces focused and minimal
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Contract Testing**: Test against interfaces, not implementations
4. **Mock First**: Create mocks before implementations
5. **Schema Validation**: Use runtime validation for all external data
6. **Version Management**: Version interfaces to manage breaking changes
7. **Documentation**: Keep interface documentation up-to-date
8. **Code Generation**: Automate boilerplate code generation

## Conclusion

This IDD implementation provides a robust foundation for building scalable, testable, and maintainable applications. By following these patterns and examples, the PMPLearningManagement system can achieve full IDD compliance while maintaining flexibility and performance.