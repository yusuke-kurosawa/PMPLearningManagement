/**
 * Vector Store Service for PMBOK Content Embeddings
 * Manages document embeddings, similarity search, and content retrieval
 */

import { OpenAIEmbeddings } from '@langchain/openai'
import { CohereEmbeddings } from '@langchain/cohere'
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import { Document } from '@langchain/core/documents'
import { VectorStore } from '@langchain/core/vectorstores'
import { PineconeStore } from '@langchain/pinecone'
import { QdrantVectorStore } from '@langchain/qdrant'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { Pinecone } from '@pinecone-database/pinecone'
import { QdrantClient } from '@qdrant/js-client-rest'
import { ChromaClient } from 'chromadb'
import { Pool } from 'pg'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// Import PMBOK data
import { completeProcesses } from '../../data/pmbok/completeProcesses'
import { pmbok7Data } from '../../data/pmbok7Data'
import { pmpGlossary } from '../../data/pmpGlossary'

export interface VectorStoreConfig {
  provider: 'pinecone' | 'qdrant' | 'chroma' | 'pgvector'
  embeddingProvider: 'openai' | 'cohere' | 'huggingface'
  embeddingModel?: string
  indexName: string
  dimension: number
  apiKey?: string
  url?: string
  namespace?: string
  metricType?: 'cosine' | 'euclidean' | 'dotProduct'
}

export interface DocumentMetadata {
  source: string
  type: 'process' | 'knowledge_area' | 'principle' | 'domain' | 'glossary' | 'itto'
  knowledgeArea?: string
  processGroup?: string
  chapter?: string
  version?: 'PMBOK6' | 'PMBOK7'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
  lastUpdated?: Date
}

export interface SearchOptions {
  k?: number
  filter?: Record<string, any>
  scoreThreshold?: number
  searchType?: 'similarity' | 'mmr' | 'hybrid'
  lambda?: number // For MMR diversity
  fetchK?: number // For MMR initial fetch
}

export interface IndexingProgress {
  total: number
  processed: number
  failed: number
  currentDocument?: string
}

/**
 * Main Vector Store Service class
 */
export class VectorStoreService {
  private vectorStore: VectorStore
  private embeddings: OpenAIEmbeddings | CohereEmbeddings | HuggingFaceInferenceEmbeddings
  private textSplitter: RecursiveCharacterTextSplitter
  private client: Pinecone | QdrantClient | ChromaClient | Pool
  private isInitialized: boolean = false

  constructor(private config: VectorStoreConfig) {
    this.initializeEmbeddings()
    this.initializeTextSplitter()
  }

  /**
   * Initialize embedding model
   */
  private initializeEmbeddings(): void {
    switch (this.config.embeddingProvider) {
      case 'openai':
        this.embeddings = new OpenAIEmbeddings({
          openAIApiKey: this.config.apiKey,
          modelName: this.config.embeddingModel || 'text-embedding-3-large',
          dimensions: this.config.dimension,
        })
        break
      case 'cohere':
        this.embeddings = new CohereEmbeddings({
          apiKey: this.config.apiKey,
          model: this.config.embeddingModel || 'embed-english-v3.0',
        })
        break
      case 'huggingface':
        this.embeddings = new HuggingFaceInferenceEmbeddings({
          apiKey: this.config.apiKey,
          model: this.config.embeddingModel || 'sentence-transformers/all-mpnet-base-v2',
        })
        break
    }
  }

  /**
   * Initialize text splitter for document chunking
   */
  private initializeTextSplitter(): void {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '.', '!', '?', ',', ' ', ''],
      lengthFunction: (text: string) => text.length,
    })
  }

  /**
   * Initialize vector store connection
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      switch (this.config.provider) {
        case 'pinecone':
          await this.initializePinecone()
          break
        case 'qdrant':
          await this.initializeQdrant()
          break
        case 'chroma':
          await this.initializeChroma()
          break
        case 'pgvector':
          await this.initializePGVector()
          break
      }

      this.isInitialized = true

      // Check if index needs initialization
      const needsIndexing = await this.checkIndexStatus()
      if (needsIndexing) {
        await this.indexPMBOKContent()
      }
    } catch (error) {
      console.error('Failed to initialize vector store:', error)
      throw error
    }
  }

  /**
   * Initialize Pinecone vector store
   */
  private async initializePinecone(): Promise<void> {
    this.client = new Pinecone({
      apiKey: this.config.apiKey!,
    })

    const index = this.client.index(this.config.indexName)

    this.vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: index,
      namespace: this.config.namespace,
    })
  }

  /**
   * Initialize Qdrant vector store
   */
  private async initializeQdrant(): Promise<void> {
    this.client = new QdrantClient({
      url: this.config.url,
      apiKey: this.config.apiKey,
    })

    // Check if collection exists, create if not
    const collections = await this.client.getCollections()
    const collectionExists = collections.collections.some((c) => c.name === this.config.indexName)

    if (!collectionExists) {
      await this.client.createCollection(this.config.indexName, {
        vectors: {
          size: this.config.dimension,
          distance: this.config.metricType === 'dotProduct' ? 'Dot' : 'Cosine',
        },
      })
    }

    this.vectorStore = await QdrantVectorStore.fromExistingCollection(this.embeddings, {
      client: this.client,
      collectionName: this.config.indexName,
    })
  }

  /**
   * Initialize Chroma vector store
   */
  private async initializeChroma(): Promise<void> {
    this.client = new ChromaClient({
      path: this.config.url,
    })

    this.vectorStore = await Chroma.fromExistingCollection(this.embeddings, {
      collectionName: this.config.indexName,
      url: this.config.url,
    })
  }

  /**
   * Initialize PGVector store
   */
  private async initializePGVector(): Promise<void> {
    this.client = new Pool({
      connectionString: this.config.url,
    })

    // Ensure pgvector extension is installed
    await this.client.query('CREATE EXTENSION IF NOT EXISTS vector')

    this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: {
        connectionString: this.config.url,
      },
      tableName: this.config.indexName,
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    })
  }

  /**
   * Check if index needs initialization with PMBOK content
   */
  private async checkIndexStatus(): Promise<boolean> {
    try {
      const results = await this.vectorStore.similaritySearch('PMBOK test query', 1)
      return results.length === 0
    } catch {
      return true
    }
  }

  /**
   * Index all PMBOK content
   */
  public async indexPMBOKContent(onProgress?: (progress: IndexingProgress) => void): Promise<void> {
    const documents: Document[] = []
    let processed = 0
    let failed = 0

    // Prepare all documents
    const allContent = [
      ...this.preparePMBOK6Documents(),
      ...this.preparePMBOK7Documents(),
      ...this.prepareGlossaryDocuments(),
    ]

    const total = allContent.length

    // Process documents in batches
    const batchSize = 100
    for (let i = 0; i < allContent.length; i += batchSize) {
      const batch = allContent.slice(i, i + batchSize)

      try {
        // Split documents into chunks
        const splitDocs = await Promise.all(
          batch.map(async (doc) => {
            const splits = await this.textSplitter.splitDocuments([doc])
            return splits.map((split) => ({
              ...split,
              metadata: {
                ...doc.metadata,
                ...split.metadata,
                chunkIndex: splits.indexOf(split),
                totalChunks: splits.length,
              },
            }))
          })
        )

        const flatDocs = splitDocs.flat()
        documents.push(...flatDocs)

        // Add to vector store
        await this.vectorStore.addDocuments(flatDocs)

        processed += batch.length

        if (onProgress) {
          onProgress({
            total,
            processed,
            failed,
            currentDocument: batch[batch.length - 1].metadata.source,
          })
        }
      } catch (error) {
        console.error('Failed to process batch:', error)
        failed += batch.length
      }
    }

    console.log(`Indexing complete: ${processed} processed, ${failed} failed`)
  }

  /**
   * Prepare PMBOK 6 process documents
   */
  private preparePMBOK6Documents(): Document[] {
    const documents: Document[] = []

    Object.entries(completeProcesses).forEach(([processId, process]) => {
      // Main process document
      const processDoc = new Document({
        pageContent: this.formatProcessContent(process),
        metadata: {
          source: `PMBOK6-${processId}`,
          type: 'process',
          knowledgeArea: process.knowledgeArea,
          processGroup: process.processGroup,
          version: 'PMBOK6',
          processName: process.name,
          processId,
          tags: [process.knowledgeArea, process.processGroup],
        } as DocumentMetadata,
      })
      documents.push(processDoc)

      // ITTO documents
      if (process.itto) {
        // Inputs
        process.itto.inputs?.forEach((input, index) => {
          documents.push(
            new Document({
              pageContent: `Input for ${process.name}: ${input.name}\n${input.description || ''}`,
              metadata: {
                source: `PMBOK6-${processId}-input-${index}`,
                type: 'itto',
                knowledgeArea: process.knowledgeArea,
                processGroup: process.processGroup,
                version: 'PMBOK6',
                ittoType: 'input',
                processName: process.name,
                tags: ['input', process.knowledgeArea],
              } as DocumentMetadata,
            })
          )
        })

        // Tools and Techniques
        process.itto.toolsTechniques?.forEach((tool, index) => {
          documents.push(
            new Document({
              pageContent: `Tool/Technique for ${process.name}: ${tool.name}\n${tool.description || ''}`,
              metadata: {
                source: `PMBOK6-${processId}-tool-${index}`,
                type: 'itto',
                knowledgeArea: process.knowledgeArea,
                processGroup: process.processGroup,
                version: 'PMBOK6',
                ittoType: 'tool',
                processName: process.name,
                tags: ['tool', process.knowledgeArea],
              } as DocumentMetadata,
            })
          )
        })

        // Outputs
        process.itto.outputs?.forEach((output, index) => {
          documents.push(
            new Document({
              pageContent: `Output from ${process.name}: ${output.name}\n${output.description || ''}`,
              metadata: {
                source: `PMBOK6-${processId}-output-${index}`,
                type: 'itto',
                knowledgeArea: process.knowledgeArea,
                processGroup: process.processGroup,
                version: 'PMBOK6',
                ittoType: 'output',
                processName: process.name,
                tags: ['output', process.knowledgeArea],
              } as DocumentMetadata,
            })
          )
        })
      }
    })

    return documents
  }

  /**
   * Format process content for indexing
   */
  private formatProcessContent(process: any): string {
    return `
Process: ${process.name}
Knowledge Area: ${process.knowledgeArea}
Process Group: ${process.processGroup}
Description: ${process.description || 'No description available'}

Key Concepts:
${process.keyConcepts?.join('\n') || 'None specified'}

Best Practices:
${process.bestPractices?.join('\n') || 'None specified'}

Common Pitfalls:
${process.commonPitfalls?.join('\n') || 'None specified'}

Exam Tips:
${process.examTips?.join('\n') || 'None specified'}
    `.trim()
  }

  /**
   * Prepare PMBOK 7 documents
   */
  private preparePMBOK7Documents(): Document[] {
    const documents: Document[] = []

    // Performance Domains
    pmbok7Data.performanceDomains?.forEach((domain, index) => {
      documents.push(
        new Document({
          pageContent: `
Performance Domain: ${domain.name}
Description: ${domain.description}
Key Focus Areas: ${domain.keyFocusAreas?.join(', ') || 'None'}
Outcomes: ${domain.outcomes?.join(', ') || 'None'}
        `.trim(),
          metadata: {
            source: `PMBOK7-domain-${index}`,
            type: 'domain',
            version: 'PMBOK7',
            domainName: domain.name,
            tags: ['performance-domain', 'PMBOK7'],
          } as DocumentMetadata,
        })
      )
    })

    // Principles
    pmbok7Data.principles?.forEach((principle, index) => {
      documents.push(
        new Document({
          pageContent: `
Principle: ${principle.name}
Description: ${principle.description}
Application: ${principle.application || 'General application across all projects'}
Benefits: ${principle.benefits?.join(', ') || 'Multiple benefits'}
        `.trim(),
          metadata: {
            source: `PMBOK7-principle-${index}`,
            type: 'principle',
            version: 'PMBOK7',
            principleName: principle.name,
            tags: ['principle', 'PMBOK7'],
          } as DocumentMetadata,
        })
      )
    })

    return documents
  }

  /**
   * Prepare glossary documents
   */
  private prepareGlossaryDocuments(): Document[] {
    return pmpGlossary.map(
      (term, index) =>
        new Document({
          pageContent: `
Term: ${term.term}
Definition: ${term.definition}
Category: ${term.category}
Related Terms: ${term.relatedTerms?.join(', ') || 'None'}
Example: ${term.example || 'No example provided'}
      `.trim(),
          metadata: {
            source: `glossary-${index}`,
            type: 'glossary',
            term: term.term,
            category: term.category,
            tags: ['glossary', term.category],
          } as DocumentMetadata,
        })
    )
  }

  /**
   * Perform similarity search
   */
  public async similaritySearch(query: string, options: SearchOptions = {}): Promise<Document[]> {
    const { k = 5, filter, scoreThreshold = 0.7, searchType = 'similarity' } = options

    if (searchType === 'mmr') {
      return this.maxMarginalRelevanceSearch(query, options)
    }

    if (searchType === 'hybrid') {
      return this.hybridSearch(query, options)
    }

    const results = await this.vectorStore.similaritySearchWithScore(query, k, filter)

    // Filter by score threshold
    return results.filter(([_, score]) => score >= scoreThreshold).map(([doc]) => doc)
  }

  /**
   * Maximum Marginal Relevance search for diversity
   */
  private async maxMarginalRelevanceSearch(
    query: string,
    options: SearchOptions
  ): Promise<Document[]> {
    const { k = 5, fetchK = 20, lambda = 0.5, filter } = options

    return this.vectorStore.maxMarginalRelevanceSearch(query, {
      k,
      fetchK,
      lambda,
      filter,
    })
  }

  /**
   * Hybrid search combining vector and keyword search
   */
  private async hybridSearch(query: string, options: SearchOptions): Promise<Document[]> {
    const { k = 5, filter } = options

    // Vector search
    const vectorResults = await this.vectorStore.similaritySearch(query, Math.ceil(k * 0.7), filter)

    // Keyword search (simplified - in production, use proper text search)
    const keywordResults = await this.keywordSearch(query, Math.ceil(k * 0.3), filter)

    // Combine and deduplicate
    const combined = [...vectorResults, ...keywordResults]
    const unique = Array.from(new Map(combined.map((doc) => [doc.metadata.source, doc])).values())

    return unique.slice(0, k)
  }

  /**
   * Simple keyword search implementation
   */
  private async keywordSearch(
    query: string,
    k: number,
    filter?: Record<string, any>
  ): Promise<Document[]> {
    // This is a simplified implementation
    // In production, use proper text search with the database
    const allDocs = await this.vectorStore.similaritySearch('', 100, filter)

    const queryWords = query.toLowerCase().split(' ')
    const scored = allDocs.map((doc) => {
      const content = doc.pageContent.toLowerCase()
      const score = queryWords.reduce((sum, word) => {
        return sum + (content.includes(word) ? 1 : 0)
      }, 0)
      return { doc, score }
    })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((item) => item.doc)
  }

  /**
   * Get related documents for a given document
   */
  public async getRelatedDocuments(documentId: string, k: number = 5): Promise<Document[]> {
    // First, find the original document
    const results = await this.vectorStore.similaritySearch('', 100, { source: documentId })

    if (results.length === 0) {
      return []
    }

    const originalDoc = results[0]

    // Find similar documents
    const similar = await this.vectorStore.similaritySearch(originalDoc.pageContent, k + 1)

    // Remove the original document from results
    return similar.filter((doc) => doc.metadata.source !== documentId).slice(0, k)
  }

  /**
   * Update document in the vector store
   */
  public async updateDocument(
    documentId: string,
    newContent: string,
    newMetadata?: Partial<DocumentMetadata>
  ): Promise<void> {
    // Delete old document
    await this.deleteDocuments([documentId])

    // Add updated document
    const doc = new Document({
      pageContent: newContent,
      metadata: {
        source: documentId,
        ...newMetadata,
        lastUpdated: new Date(),
      },
    })

    await this.vectorStore.addDocuments([doc])
  }

  /**
   * Delete documents from the vector store
   */
  public async deleteDocuments(documentIds: string[]): Promise<void> {
    // Implementation depends on the vector store provider
    // Most providers support deletion by metadata filter
    for (const id of documentIds) {
      try {
        // This is provider-specific
        if (this.config.provider === 'qdrant' && this.client instanceof QdrantClient) {
          await this.client.delete(this.config.indexName, {
            filter: {
              must: [
                {
                  key: 'source',
                  match: { value: id },
                },
              ],
            },
          })
        }
        // Add other provider implementations as needed
      } catch (error) {
        console.error(`Failed to delete document ${id}:`, error)
      }
    }
  }

  /**
   * Get vector store statistics
   */
  public async getStatistics(): Promise<{
    totalDocuments: number
    indexSize: number
    dimensions: number
    provider: string
  }> {
    let totalDocuments = 0
    let indexSize = 0

    try {
      if (this.config.provider === 'qdrant' && this.client instanceof QdrantClient) {
        const info = await this.client.getCollection(this.config.indexName)
        totalDocuments = info.points_count || 0
        indexSize = info.indexed_vectors_count || 0
      }
      // Add other provider implementations
    } catch (error) {
      console.error('Failed to get statistics:', error)
    }

    return {
      totalDocuments,
      indexSize,
      dimensions: this.config.dimension,
      provider: this.config.provider,
    }
  }

  /**
   * Create a retriever for use with LangChain
   */
  public asRetriever(options: SearchOptions = {}): any {
    return this.vectorStore.asRetriever({
      k: options.k || 5,
      filter: options.filter,
      searchType: options.searchType || 'similarity',
      searchKwargs: {
        scoreThreshold: options.scoreThreshold,
        fetchK: options.fetchK,
        lambda: options.lambda,
      },
    })
  }

  /**
   * Backup vector store data
   */
  public async backup(path: string): Promise<void> {
    // Export all documents
    const allDocs = await this.vectorStore.similaritySearch('', 10000)

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      provider: this.config.provider,
      documents: allDocs.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    }

    // Save to file
    const fs = await import('fs/promises')
    await fs.writeFile(path, JSON.stringify(backup, null, 2))
  }

  /**
   * Restore vector store from backup
   */
  public async restore(path: string): Promise<void> {
    const fs = await import('fs/promises')
    const backupData = await fs.readFile(path, 'utf-8')
    const backup = JSON.parse(backupData)

    const documents = backup.documents.map(
      (doc: any) =>
        new Document({
          pageContent: doc.content,
          metadata: doc.metadata,
        })
    )

    // Clear existing data (provider-specific)
    // Then add restored documents
    await this.vectorStore.addDocuments(documents)
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.client) {
      if (this.client instanceof Pool) {
        await this.client.end()
      }
      // Add cleanup for other clients as needed
    }
  }
}

export default VectorStoreService
