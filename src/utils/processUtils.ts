/**
 * Process utilities for PMBOK data management
 */

/**
 * Generate a unique process ID based on knowledge area and process group
 */
export function generateProcessId(
  knowledgeArea: string,
  processGroup: string,
  processIndex: number
): string {
  const kaCode = knowledgeArea.substring(0, 3).toUpperCase()
  const pgCode = processGroup.substring(0, 2).toUpperCase()
  return `${kaCode}_${pgCode}_${processIndex.toString().padStart(2, '0')}`
}

/**
 * Parse process ID to extract components
 */
export function parseProcessId(processId: string): {
  knowledgeAreaCode: string
  processGroupCode: string
  index: number
} | null {
  const match = processId.match(/^([A-Z]{3})_([A-Z]{2})_(\d{2})$/)
  if (!match) {return null}

  return {
    knowledgeAreaCode: match[1]!,
    processGroupCode: match[2]!,
    index: parseInt(match[3]!, 10),
  }
}

/**
 * Validate process data structure
 */
export function validateProcessData(processData: unknown): boolean {
  if (!processData || typeof processData !== 'object') {return false}

  const process = processData as Record<string, unknown>
  return !!(
    process.id &&
    process.name &&
    process.knowledgeArea &&
    process.processGroup &&
    process.inputs &&
    process.tools &&
    process.outputs
  )
}

/**
 * Sort processes by knowledge area and process group
 */
export function sortProcesses<T extends { knowledgeArea: string; processGroup: string }>(
  processes: T[]
): T[] {
  const knowledgeAreaOrder = [
    'Integration',
    'Scope',
    'Schedule',
    'Cost',
    'Quality',
    'Resource',
    'Communications',
    'Risk',
    'Procurement',
    'Stakeholder',
  ]

  const processGroupOrder = [
    'Initiating',
    'Planning',
    'Executing',
    'Monitoring and Controlling',
    'Closing',
  ]

  return processes.sort((a, b) => {
    const kaIndexA = knowledgeAreaOrder.indexOf(a.knowledgeArea)
    const kaIndexB = knowledgeAreaOrder.indexOf(b.knowledgeArea)

    if (kaIndexA !== kaIndexB) {
      return kaIndexA - kaIndexB
    }

    const pgIndexA = processGroupOrder.indexOf(a.processGroup)
    const pgIndexB = processGroupOrder.indexOf(b.processGroup)

    return pgIndexA - pgIndexB
  })
}

/**
 * Filter processes by criteria
 */
export function filterProcesses<
  T extends {
    knowledgeArea: string
    processGroup: string
    name: string
  },
>(
  processes: T[],
  filters: {
    knowledgeArea?: string
    processGroup?: string
    searchTerm?: string
  }
): T[] {
  return processes.filter((process) => {
    if (filters.knowledgeArea && process.knowledgeArea !== filters.knowledgeArea) {
      return false
    }

    if (filters.processGroup && process.processGroup !== filters.processGroup) {
      return false
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return process.name.toLowerCase().includes(searchLower)
    }

    return true
  })
}
