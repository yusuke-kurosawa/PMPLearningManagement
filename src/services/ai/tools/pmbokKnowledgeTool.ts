/**
 * PMBOK Knowledge Tool for LangChain Agent
 * Provides access to PMBOK content and knowledge retrieval
 */

import { Tool } from '@langchain/core/tools'
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { Document } from '@langchain/core/documents'

export class PMBOKKnowledgeTool extends Tool {
  name = 'pmbok_knowledge'
  description = `Retrieve PMBOK knowledge about processes, knowledge areas, ITTO, principles, and domains. 
    Input should be a specific question or topic about PMBOK content.
    Example: "What are the inputs for the Develop Project Charter process?"`

  constructor(private retriever: VectorStoreRetriever) {
    super()
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Enhance query for better retrieval
      const enhancedQuery = this.enhanceQuery(input)

      // Retrieve relevant documents
      const documents = await this.retriever.getRelevantDocuments(enhancedQuery)

      if (documents.length === 0) {
        return 'No relevant PMBOK information found for your query. Please try rephrasing or being more specific.'
      }

      // Format and return the response
      return this.formatResponse(documents, input)
    } catch (error) {
      console.error('Error in PMBOK Knowledge Tool:', error)
      return `Error retrieving PMBOK knowledge: ${error.message}`
    }
  }

  private enhanceQuery(input: string): string {
    // Add PMBOK context to improve retrieval
    const keywords = this.extractKeywords(input)

    if (keywords.includes('itto') || keywords.includes('inputs') || keywords.includes('outputs')) {
      return `PMBOK ITTO ${input}`
    }

    if (keywords.includes('process')) {
      return `PMBOK process ${input}`
    }

    if (keywords.includes('knowledge area')) {
      return `PMBOK knowledge area ${input}`
    }

    return `PMBOK ${input}`
  }

  private extractKeywords(text: string): string[] {
    return text.toLowerCase().split(/\s+/)
  }

  private formatResponse(documents: Document[], originalQuery: string): string {
    const sections: string[] = []

    // Group documents by type
    const grouped = this.groupDocumentsByType(documents)

    // Add process information
    if (grouped.process.length > 0) {
      sections.push(this.formatProcessSection(grouped.process))
    }

    // Add ITTO information
    if (grouped.itto.length > 0) {
      sections.push(this.formatITTOSection(grouped.itto))
    }

    // Add principle/domain information
    if (grouped.principle.length > 0 || grouped.domain.length > 0) {
      sections.push(this.formatPMBOK7Section([...grouped.principle, ...grouped.domain]))
    }

    // Add glossary information
    if (grouped.glossary.length > 0) {
      sections.push(this.formatGlossarySection(grouped.glossary))
    }

    return sections.join('\n\n')
  }

  private groupDocumentsByType(documents: Document[]): Record<string, Document[]> {
    const grouped: Record<string, Document[]> = {
      process: [],
      itto: [],
      principle: [],
      domain: [],
      glossary: [],
      other: [],
    }

    documents.forEach((doc) => {
      const type = doc.metadata.type || 'other'
      if (grouped[type]) {
        grouped[type].push(doc)
      } else {
        grouped.other.push(doc)
      }
    })

    return grouped
  }

  private formatProcessSection(documents: Document[]): string {
    const lines = ['📋 **Process Information:**']

    documents.forEach((doc) => {
      const { processName, knowledgeArea, processGroup } = doc.metadata
      lines.push(`\n**${processName}**`)
      lines.push(`- Knowledge Area: ${knowledgeArea}`)
      lines.push(`- Process Group: ${processGroup}`)
      lines.push(`- Details: ${doc.pageContent.substring(0, 500)}...`)
    })

    return lines.join('\n')
  }

  private formatITTOSection(documents: Document[]): string {
    const lines = ['🔧 **ITTO (Inputs, Tools & Techniques, Outputs):**']

    // Group by ITTO type
    const byType: Record<string, Document[]> = {}
    documents.forEach((doc) => {
      const type = doc.metadata.ittoType || 'unknown'
      if (!byType[type]) {
        byType[type] = []
      }
      byType[type].push(doc)
    })

    if (byType.input) {
      lines.push('\n**Inputs:**')
      byType.input.forEach((doc) => {
        lines.push(`- ${doc.pageContent.split('\n')[0]}`)
      })
    }

    if (byType.tool) {
      lines.push('\n**Tools & Techniques:**')
      byType.tool.forEach((doc) => {
        lines.push(`- ${doc.pageContent.split('\n')[0]}`)
      })
    }

    if (byType.output) {
      lines.push('\n**Outputs:**')
      byType.output.forEach((doc) => {
        lines.push(`- ${doc.pageContent.split('\n')[0]}`)
      })
    }

    return lines.join('\n')
  }

  private formatPMBOK7Section(documents: Document[]): string {
    const lines = ['🎯 **PMBOK 7th Edition Content:**']

    documents.forEach((doc) => {
      const type = doc.metadata.type === 'principle' ? 'Principle' : 'Performance Domain'
      const name = doc.metadata.principleName || doc.metadata.domainName
      lines.push(`\n**${type}: ${name}**`)
      lines.push(doc.pageContent.substring(0, 400) + '...')
    })

    return lines.join('\n')
  }

  private formatGlossarySection(documents: Document[]): string {
    const lines = ['📖 **Glossary Terms:**']

    documents.forEach((doc) => {
      const term = doc.metadata.term
      const category = doc.metadata.category
      lines.push(`\n**${term}** (${category})`)
      lines.push(doc.pageContent.split('\n')[1]) // Get definition line
    })

    return lines.join('\n')
  }
}
