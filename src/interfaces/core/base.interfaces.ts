/**
 * Base Interface Definitions
 * @description Core interfaces that all domain entities and services extend
 * @module interfaces/core/base
 */

import { z } from 'zod'

// ============================================================================
// Base Entity Interfaces
// ============================================================================

/**
 * Base entity interface for all domain entities
 * @template T - The concrete type of the entity
 */
export interface IEntity<T = unknown> {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly version: number

  /**
   * Validates the entity against its business rules
   */
  validate(): IValidationResult

  /**
   * Converts entity to plain object
   */
  toJSON(): T

  /**
   * Creates a deep clone of the entity
   */
  clone(): IEntity<T>

  /**
   * Checks equality with another entity
   */
  equals(other: IEntity<T>): boolean
}

/**
 * Aggregate root interface for domain aggregates
 * @template T - The concrete type of the aggregate
 */
export interface IAggregateRoot<T = unknown> extends IEntity<T> {
  readonly domainEvents: IDomainEvent[]

  /**
   * Adds a domain event to be dispatched
   */
  addDomainEvent(event: IDomainEvent): void

  /**
   * Clears all pending domain events
   */
  clearEvents(): void

  /**
   * Gets uncommitted domain events
   */
  getUncommittedEvents(): IDomainEvent[]

  /**
   * Marks events as committed
   */
  markEventsAsCommitted(): void
}

/**
 * Value object interface for immutable domain values
 * @template T - The concrete type of the value object
 */
export interface IValueObject<T = unknown> {
  /**
   * Gets the primitive value
   */
  getValue(): T

  /**
   * Checks equality with another value object
   */
  equals(other: IValueObject<T>): boolean

  /**
   * Converts to string representation
   */
  toString(): string

  /**
   * Validates the value
   */
  validate(): IValidationResult
}

// ============================================================================
// Repository Interfaces
// ============================================================================

/**
 * Generic repository interface for data access
 * @template T - The entity type
 * @template ID - The identifier type
 */
export interface IRepository<T extends IEntity, ID = string> {
  /**
   * Finds an entity by ID
   */
  findById(id: ID): Promise<T | null>

  /**
   * Finds all entities matching the specification
   */
  findAll(spec?: ISpecification<T>): Promise<T[]>

  /**
   * Finds a single entity matching the specification
   */
  findOne(spec: ISpecification<T>): Promise<T | null>

  /**
   * Saves an entity
   */
  save(entity: T): Promise<T>

  /**
   * Saves multiple entities
   */
  saveAll(entities: T[]): Promise<T[]>

  /**
   * Deletes an entity
   */
  delete(entity: T): Promise<void>

  /**
   * Deletes an entity by ID
   */
  deleteById(id: ID): Promise<void>

  /**
   * Counts entities matching the specification
   */
  count(spec?: ISpecification<T>): Promise<number>

  /**
   * Checks if an entity exists
   */
  exists(id: ID): Promise<boolean>
}

/**
 * Unit of Work interface for transactional operations
 */
export interface IUnitOfWork {
  /**
   * Begins a new transaction
   */
  begin(): Promise<void>

  /**
   * Commits the current transaction
   */
  commit(): Promise<void>

  /**
   * Rolls back the current transaction
   */
  rollback(): Promise<void>

  /**
   * Gets a repository for the specified entity type
   */
  getRepository<T extends IEntity>(entityType: string): IRepository<T>

  /**
   * Registers a new entity for insertion
   */
  registerNew(entity: IEntity): void

  /**
   * Registers an entity as modified
   */
  registerDirty(entity: IEntity): void

  /**
   * Registers an entity for deletion
   */
  registerDeleted(entity: IEntity): void
}

// ============================================================================
// Specification Pattern Interfaces
// ============================================================================

/**
 * Specification interface for query criteria
 * @template T - The entity type to query
 */
export interface ISpecification<T> {
  /**
   * Checks if an entity satisfies the specification
   */
  isSatisfiedBy(entity: T): boolean

  /**
   * Combines with another specification using AND logic
   */
  and(other: ISpecification<T>): ISpecification<T>

  /**
   * Combines with another specification using OR logic
   */
  or(other: ISpecification<T>): ISpecification<T>

  /**
   * Negates the specification
   */
  not(): ISpecification<T>

  /**
   * Converts to query criteria
   */
  toCriteria(): IQueryCriteria
}

/**
 * Query criteria for database queries
 */
export interface IQueryCriteria {
  where?: Record<string, unknown>
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>
  limit?: number
  offset?: number
  include?: string[]
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Base service interface
 */
export interface IService {
  /**
   * Gets the service name
   */
  getName(): string

  /**
   * Initializes the service
   */
  initialize(): Promise<void>

  /**
   * Shuts down the service
   */
  shutdown(): Promise<void>

  /**
   * Checks if the service is healthy
   */
  healthCheck(): Promise<IHealthStatus>
}

/**
 * Domain service interface
 */
export interface IDomainService extends IService {
  /**
   * Executes a domain operation
   */
  execute<TInput, TOutput>(input: TInput): Promise<TOutput>
}

/**
 * Application service interface
 */
export interface IApplicationService extends IService {
  /**
   * Handles a use case
   */
  handle<TCommand, TResult>(command: TCommand): Promise<TResult>
}

// ============================================================================
// Event Interfaces
// ============================================================================

/**
 * Domain event interface
 */
export interface IDomainEvent {
  readonly aggregateId: string
  readonly eventType: string
  readonly eventVersion: number
  readonly occurredAt: Date
  readonly payload: Record<string, unknown>

  /**
   * Gets the event name
   */
  getEventName(): string

  /**
   * Serializes the event
   */
  serialize(): string
}

/**
 * Event handler interface
 * @template T - The event type to handle
 */
export interface IEventHandler<T extends IDomainEvent> {
  /**
   * Handles the event
   */
  handle(event: T): Promise<void>

  /**
   * Gets the events this handler subscribes to
   */
  subscribesTo(): string[]
}

/**
 * Event bus interface for publishing and subscribing to events
 */
export interface IEventBus {
  /**
   * Publishes an event
   */
  publish(event: IDomainEvent): Promise<void>

  /**
   * Publishes multiple events
   */
  publishAll(events: IDomainEvent[]): Promise<void>

  /**
   * Subscribes to an event
   */
  subscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void

  /**
   * Unsubscribes from an event
   */
  unsubscribe(eventType: string, handler: IEventHandler<IDomainEvent>): void
}

// ============================================================================
// Validation Interfaces
// ============================================================================

/**
 * Validation result interface
 */
export interface IValidationResult {
  readonly isValid: boolean
  readonly errors: IValidationError[]

  /**
   * Adds an error to the result
   */
  addError(error: IValidationError): void

  /**
   * Merges with another validation result
   */
  merge(other: IValidationResult): IValidationResult

  /**
   * Gets formatted error messages
   */
  getErrorMessages(): string[]
}

/**
 * Validation error interface
 */
export interface IValidationError {
  readonly field: string
  readonly message: string
  readonly code: string
  readonly severity: 'error' | 'warning' | 'info'
  readonly metadata?: Record<string, unknown>
}

/**
 * Validator interface
 * @template T - The type to validate
 */
export interface IValidator<T> {
  /**
   * Validates an object
   */
  validate(value: T): IValidationResult

  /**
   * Validates asynchronously
   */
  validateAsync(value: T): Promise<IValidationResult>

  /**
   * Gets the validation schema
   */
  getSchema(): z.ZodSchema<T>
}

// ============================================================================
// Infrastructure Interfaces
// ============================================================================

/**
 * Logger interface
 */
export interface ILogger {
  /**
   * Logs a debug message
   */
  debug(message: string, meta?: Record<string, unknown>): void

  /**
   * Logs an info message
   */
  info(message: string, meta?: Record<string, unknown>): void

  /**
   * Logs a warning message
   */
  warn(message: string, meta?: Record<string, unknown>): void

  /**
   * Logs an error message
   */
  error(message: string, error?: Error, meta?: Record<string, unknown>): void

  /**
   * Creates a child logger with context
   */
  child(context: Record<string, unknown>): ILogger
}

/**
 * Cache interface
 * @template T - The type of cached values
 */
export interface ICache<T = unknown> {
  /**
   * Gets a value from cache
   */
  get(key: string): Promise<T | null>

  /**
   * Sets a value in cache
   */
  set(key: string, value: T, ttl?: number): Promise<void>

  /**
   * Deletes a value from cache
   */
  delete(key: string): Promise<void>

  /**
   * Clears all cached values
   */
  clear(): Promise<void>

  /**
   * Checks if a key exists
   */
  has(key: string): Promise<boolean>

  /**
   * Gets multiple values
   */
  mget(keys: string[]): Promise<(T | null)[]>

  /**
   * Sets multiple values
   */
  mset(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void>
}

/**
 * Health status interface
 */
export interface IHealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly message?: string
  readonly details?: Record<string, unknown>
  readonly timestamp: Date
}

// ============================================================================
// Factory Interfaces
// ============================================================================

/**
 * Factory interface for creating instances
 * @template T - The type to create
 */
export interface IFactory<T> {
  /**
   * Creates an instance
   */
  create(...args: unknown[]): T

  /**
   * Creates an instance asynchronously
   */
  createAsync(...args: unknown[]): Promise<T>
}

/**
 * Abstract factory interface
 * @template T - The base type of products
 */
export interface IAbstractFactory<T> {
  /**
   * Creates a product by type
   */
  create(type: string, ...args: unknown[]): T

  /**
   * Registers a factory for a type
   */
  register(type: string, factory: IFactory<T>): void

  /**
   * Checks if a type is registered
   */
  hasType(type: string): boolean
}

// ============================================================================
// Command and Query Interfaces (CQRS)
// ============================================================================

/**
 * Command interface for write operations
 */
export interface ICommand {
  readonly commandId: string
  readonly timestamp: Date
  readonly userId: string
  readonly metadata?: Record<string, unknown>
}

/**
 * Command handler interface
 * @template TCommand - The command type
 * @template TResult - The result type
 */
export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  /**
   * Handles the command
   */
  handle(command: TCommand): Promise<TResult>

  /**
   * Validates the command
   */
  validate(command: TCommand): IValidationResult
}

/**
 * Query interface for read operations
 */
export interface IQuery {
  readonly queryId: string
  readonly timestamp: Date
  readonly userId: string
  readonly metadata?: Record<string, unknown>
}

/**
 * Query handler interface
 * @template TQuery - The query type
 * @template TResult - The result type
 */
export interface IQueryHandler<TQuery extends IQuery, TResult> {
  /**
   * Handles the query
   */
  handle(query: TQuery): Promise<TResult>

  /**
   * Validates the query
   */
  validate(query: TQuery): IValidationResult
}

/**
 * Command bus interface
 */
export interface ICommandBus {
  /**
   * Sends a command
   */
  send<TCommand extends ICommand, TResult>(command: TCommand): Promise<TResult>

  /**
   * Registers a command handler
   */
  register<TCommand extends ICommand, TResult>(
    commandType: string,
    handler: ICommandHandler<TCommand, TResult>
  ): void
}

/**
 * Query bus interface
 */
export interface IQueryBus {
  /**
   * Sends a query
   */
  send<TQuery extends IQuery, TResult>(query: TQuery): Promise<TResult>

  /**
   * Registers a query handler
   */
  register<TQuery extends IQuery, TResult>(
    queryType: string,
    handler: IQueryHandler<TQuery, TResult>
  ): void
}

// Export all interfaces as a namespace
export * as BaseInterfaces from './base.interfaces'
