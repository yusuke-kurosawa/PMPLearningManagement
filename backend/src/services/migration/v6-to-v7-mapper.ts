import { PrismaClient } from '@prisma/client';

interface MappingRule {
  sourceType: 'knowledge_area' | 'process_group' | 'process';
  sourceId: string;
  targetType: 'principle' | 'domain';
  targetId: string;
  mappingType: 'PRIMARY' | 'SECONDARY' | 'SUPPORTING' | 'RELATED';
  relevanceScore: number;
  rationale: string;
}

/**
 * Service for mapping PMBOK 6th Edition elements to 7th Edition
 */
export class V6ToV7Mapper {
  private prisma: PrismaClient;
  
  // Comprehensive mapping rules based on PMBOK Guide analysis
  private static readonly MAPPING_RULES: MappingRule[] = [
    // Knowledge Area to Performance Domain Mappings
    {
      sourceType: 'knowledge_area',
      sourceId: 'integration',
      targetType: 'domain',
      targetId: 'planning',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Integration management directly corresponds to planning domain activities'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'integration',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Integration ensures value delivery'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'scope',
      targetType: 'domain',
      targetId: 'planning',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Scope management is fundamental to planning'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'scope',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Scope defines what value is delivered'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'schedule',
      targetType: 'domain',
      targetId: 'planning',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Schedule management is core planning activity'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'schedule',
      targetType: 'domain',
      targetId: 'work',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Schedule drives work execution'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'cost',
      targetType: 'domain',
      targetId: 'planning',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Cost planning is essential planning component'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'cost',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Cost management ensures value delivery'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'quality',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Quality directly impacts delivery outcomes'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'quality',
      targetType: 'domain',
      targetId: 'measurement',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Quality requires measurement and metrics'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'resource',
      targetType: 'domain',
      targetId: 'team',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Human resources are the core of team domain'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'resource',
      targetType: 'domain',
      targetId: 'work',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Resources execute project work'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'communications',
      targetType: 'domain',
      targetId: 'stakeholder',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Communication is key to stakeholder engagement'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'communications',
      targetType: 'domain',
      targetId: 'team',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Team collaboration requires effective communication'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'risk',
      targetType: 'domain',
      targetId: 'uncertainty',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Risk management is the core of uncertainty domain'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'procurement',
      targetType: 'domain',
      targetId: 'work',
      mappingType: 'PRIMARY',
      relevanceScore: 8,
      rationale: 'Procurement is part of project work management'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'procurement',
      targetType: 'domain',
      targetId: 'stakeholder',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Vendors are key stakeholders'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'stakeholder',
      targetType: 'domain',
      targetId: 'stakeholder',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Direct correspondence between stakeholder management areas'
    },
    
    // Process Group to Domain Mappings
    {
      sourceType: 'process_group',
      sourceId: 'initiating',
      targetType: 'domain',
      targetId: 'stakeholder',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Initiating focuses on stakeholder identification'
    },
    {
      sourceType: 'process_group',
      sourceId: 'initiating',
      targetType: 'domain',
      targetId: 'team',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Team formation begins in initiating'
    },
    {
      sourceType: 'process_group',
      sourceId: 'planning',
      targetType: 'domain',
      targetId: 'planning',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Direct correspondence between planning areas'
    },
    {
      sourceType: 'process_group',
      sourceId: 'planning',
      targetType: 'domain',
      targetId: 'development',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Planning defines development approach'
    },
    {
      sourceType: 'process_group',
      sourceId: 'executing',
      targetType: 'domain',
      targetId: 'work',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Executing is about doing the work'
    },
    {
      sourceType: 'process_group',
      sourceId: 'executing',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Executing delivers value'
    },
    {
      sourceType: 'process_group',
      sourceId: 'executing',
      targetType: 'domain',
      targetId: 'team',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Teams execute the work'
    },
    {
      sourceType: 'process_group',
      sourceId: 'monitoring_controlling',
      targetType: 'domain',
      targetId: 'measurement',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Monitoring and controlling is about measurement'
    },
    {
      sourceType: 'process_group',
      sourceId: 'monitoring_controlling',
      targetType: 'domain',
      targetId: 'uncertainty',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'M&C manages uncertainty and changes'
    },
    {
      sourceType: 'process_group',
      sourceId: 'closing',
      targetType: 'domain',
      targetId: 'delivery',
      mappingType: 'PRIMARY',
      relevanceScore: 8,
      rationale: 'Closing ensures final delivery'
    },
    {
      sourceType: 'process_group',
      sourceId: 'closing',
      targetType: 'domain',
      targetId: 'stakeholder',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Closing involves stakeholder acceptance'
    },
    
    // Knowledge Area to Principle Mappings
    {
      sourceType: 'knowledge_area',
      sourceId: 'integration',
      targetType: 'principle',
      targetId: 'systems_thinking',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Integration requires systems thinking'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'integration',
      targetType: 'principle',
      targetId: 'value',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Integration focuses on value delivery'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'quality',
      targetType: 'principle',
      targetId: 'quality',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Direct quality principle correspondence'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'resource',
      targetType: 'principle',
      targetId: 'team',
      mappingType: 'PRIMARY',
      relevanceScore: 9,
      rationale: 'Resource management builds teams'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'resource',
      targetType: 'principle',
      targetId: 'leadership',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Resource management requires leadership'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'risk',
      targetType: 'principle',
      targetId: 'risk',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Direct risk principle correspondence'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'risk',
      targetType: 'principle',
      targetId: 'complexity',
      mappingType: 'SECONDARY',
      relevanceScore: 8,
      rationale: 'Risk management navigates complexity'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'risk',
      targetType: 'principle',
      targetId: 'adaptability',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Risk response requires adaptability'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'stakeholder',
      targetType: 'principle',
      targetId: 'stakeholders',
      mappingType: 'PRIMARY',
      relevanceScore: 10,
      rationale: 'Direct stakeholder principle correspondence'
    },
    {
      sourceType: 'knowledge_area',
      sourceId: 'stakeholder',
      targetType: 'principle',
      targetId: 'stewardship',
      mappingType: 'SECONDARY',
      relevanceScore: 7,
      rationale: 'Stakeholder management demonstrates stewardship'
    }
  ];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Map a specific PMBOK 6 process to PMBOK 7 domains and principles
   */
  async mapProcessToV7(processId: string) {
    const process = await this.prisma.process.findUnique({
      where: { id: processId },
      include: {
        knowledgeArea: true,
        processGroup: true
      }
    });

    if (!process) {
      throw new Error(`Process ${processId} not found`);
    }

    const mappings = {
      domains: [] as any[],
      principles: [] as any[]
    };

    // Find applicable mapping rules
    const applicableRules = V6ToV7Mapper.MAPPING_RULES.filter(rule => 
      (rule.sourceType === 'knowledge_area' && rule.sourceId === process.knowledgeArea.code) ||
      (rule.sourceType === 'process_group' && rule.sourceId === process.processGroup.code)
    );

    // Get unique domains
    const domainRules = applicableRules.filter(r => r.targetType === 'domain');
    const domainMap = new Map();
    
    for (const rule of domainRules) {
      const existing = domainMap.get(rule.targetId);
      if (!existing || rule.relevanceScore > existing.relevanceScore) {
        domainMap.set(rule.targetId, rule);
      }
    }

    // Get unique principles
    const principleRules = applicableRules.filter(r => r.targetType === 'principle');
    const principleMap = new Map();
    
    for (const rule of principleRules) {
      const existing = principleMap.get(rule.targetId);
      if (!existing || rule.relevanceScore > existing.relevanceScore) {
        principleMap.set(rule.targetId, rule);
      }
    }

    // Fetch domain details
    for (const [domainCode, rule] of domainMap) {
      const domain = await this.prisma.performanceDomain.findUnique({
        where: { code: domainCode }
      });
      
      if (domain) {
        mappings.domains.push({
          domain,
          mappingType: rule.mappingType,
          relevanceScore: rule.relevanceScore,
          rationale: rule.rationale
        });
      }
    }

    // Fetch principle details
    for (const [principleCode, rule] of principleMap) {
      const principle = await this.prisma.principle.findUnique({
        where: { code: principleCode }
      });
      
      if (principle) {
        mappings.principles.push({
          principle,
          mappingType: rule.mappingType,
          relevanceScore: rule.relevanceScore,
          rationale: rule.rationale
        });
      }
    }

    // Sort by relevance score
    mappings.domains.sort((a, b) => b.relevanceScore - a.relevanceScore);
    mappings.principles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return mappings;
  }

  /**
   * Map a PMBOK 7 domain back to PMBOK 6 processes
   */
  async mapDomainToV6(domainId: string) {
    const domain = await this.prisma.performanceDomain.findUnique({
      where: { id: domainId }
    });

    if (!domain) {
      throw new Error(`Domain ${domainId} not found`);
    }

    // Find reverse mappings
    const reverseRules = V6ToV7Mapper.MAPPING_RULES.filter(
      rule => rule.targetType === 'domain' && rule.targetId === domain.code
    );

    const mappings = {
      knowledgeAreas: [] as any[],
      processGroups: [] as any[],
      processes: [] as any[]
    };

    // Map to knowledge areas
    const kaRules = reverseRules.filter(r => r.sourceType === 'knowledge_area');
    for (const rule of kaRules) {
      const ka = await this.prisma.knowledgeArea.findUnique({
        where: { code: rule.sourceId },
        include: { processes: true }
      });
      
      if (ka) {
        mappings.knowledgeAreas.push({
          knowledgeArea: ka,
          mappingType: rule.mappingType,
          relevanceScore: rule.relevanceScore,
          processCount: ka.processes.length
        });
      }
    }

    // Map to process groups
    const pgRules = reverseRules.filter(r => r.sourceType === 'process_group');
    for (const rule of pgRules) {
      const pg = await this.prisma.processGroup.findUnique({
        where: { code: rule.sourceId },
        include: { processes: true }
      });
      
      if (pg) {
        mappings.processGroups.push({
          processGroup: pg,
          mappingType: rule.mappingType,
          relevanceScore: rule.relevanceScore,
          processCount: pg.processes.length
        });
      }
    }

    // Get specific processes based on knowledge areas and process groups
    const processSet = new Set<string>();
    
    for (const ka of mappings.knowledgeAreas) {
      ka.knowledgeArea.processes.forEach((p: any) => processSet.add(p.id));
    }
    
    for (const pg of mappings.processGroups) {
      pg.processGroup.processes.forEach((p: any) => processSet.add(p.id));
    }
    
    const processes = await this.prisma.process.findMany({
      where: { id: { in: Array.from(processSet) } },
      include: {
        knowledgeArea: true,
        processGroup: true
      }
    });
    
    mappings.processes = processes;

    return mappings;
  }

  /**
   * Perform bulk migration of all mappings
   */
  async performBulkMigration() {
    const results = {
      processDomainMappings: 0,
      principleDomainMappings: 0,
      errors: [] as string[]
    };

    try {
      // Create process-domain mappings
      const processes = await this.prisma.process.findMany({
        include: {
          knowledgeArea: true,
          processGroup: true
        }
      });

      for (const process of processes) {
        try {
          const v7Mappings = await this.mapProcessToV7(process.id);
          
          // Create domain mappings
          for (const domainMapping of v7Mappings.domains) {
            await this.prisma.processDomainMapping.upsert({
              where: {
                processId_domainId: {
                  processId: process.id,
                  domainId: domainMapping.domain.id
                }
              },
              update: {
                mappingType: domainMapping.mappingType,
                relevanceScore: domainMapping.relevanceScore,
                description: domainMapping.rationale
              },
              create: {
                processId: process.id,
                domainId: domainMapping.domain.id,
                mappingType: domainMapping.mappingType,
                relevanceScore: domainMapping.relevanceScore,
                description: domainMapping.rationale
              }
            });
            results.processDomainMappings++;
          }
        } catch (error) {
          results.errors.push(`Error mapping process ${process.id}: ${error}`);
        }
      }

      // Create principle-domain mappings based on rules
      const principleDomainRules = V6ToV7Mapper.MAPPING_RULES.filter(
        r => r.targetType === 'principle'
      );

      for (const rule of principleDomainRules) {
        try {
          const principle = await this.prisma.principle.findUnique({
            where: { code: rule.targetId }
          });
          
          if (principle) {
            // Find related domains through knowledge area
            const relatedDomainRules = V6ToV7Mapper.MAPPING_RULES.filter(
              r => r.sourceType === rule.sourceType && 
                   r.sourceId === rule.sourceId && 
                   r.targetType === 'domain'
            );
            
            for (const domainRule of relatedDomainRules) {
              const domain = await this.prisma.performanceDomain.findUnique({
                where: { code: domainRule.targetId }
              });
              
              if (domain) {
                await this.prisma.principleDomainMapping.upsert({
                  where: {
                    principleId_domainId: {
                      principleId: principle.id,
                      domainId: domain.id
                    }
                  },
                  update: {
                    mappingType: domainRule.mappingType,
                    relevanceScore: Math.min(rule.relevanceScore, domainRule.relevanceScore),
                    description: `${rule.rationale} + ${domainRule.rationale}`
                  },
                  create: {
                    principleId: principle.id,
                    domainId: domain.id,
                    mappingType: domainRule.mappingType,
                    relevanceScore: Math.min(rule.relevanceScore, domainRule.relevanceScore),
                    description: `${rule.rationale} + ${domainRule.rationale}`
                  }
                });
                results.principleDomainMappings++;
              }
            }
          }
        } catch (error) {
          results.errors.push(`Error creating principle-domain mapping: ${error}`);
        }
      }

    } catch (error) {
      results.errors.push(`Bulk migration error: ${error}`);
    }

    return results;
  }

  /**
   * Generate a comprehensive mapping report
   */
  async generateMappingReport() {
    const report = {
      summary: {
        totalProcesses: 0,
        totalPrinciples: 0,
        totalDomains: 0,
        totalMappings: 0
      },
      coverage: {
        processesWithDomainMappings: 0,
        domainsWithProcessMappings: 0,
        principlesWithDomainMappings: 0,
        unmappedProcesses: [] as string[],
        unmappedDomains: [] as string[],
        unmappedPrinciples: [] as string[]
      },
      statistics: {
        avgMappingsPerProcess: 0,
        avgMappingsPerDomain: 0,
        avgRelevanceScore: 0,
        mappingTypeDistribution: {} as Record<string, number>
      }
    };

    // Get counts
    report.summary.totalProcesses = await this.prisma.process.count();
    report.summary.totalPrinciples = await this.prisma.principle.count();
    report.summary.totalDomains = await this.prisma.performanceDomain.count();
    
    // Get mapping counts
    const processDomainMappings = await this.prisma.processDomainMapping.findMany();
    const principleDomainMappings = await this.prisma.principleDomainMapping.findMany();
    
    report.summary.totalMappings = processDomainMappings.length + principleDomainMappings.length;
    
    // Calculate coverage
    const mappedProcessIds = new Set(processDomainMappings.map(m => m.processId));
    const mappedDomainIds = new Set([
      ...processDomainMappings.map(m => m.domainId),
      ...principleDomainMappings.map(m => m.domainId)
    ]);
    const mappedPrincipleIds = new Set(principleDomainMappings.map(m => m.principleId));
    
    report.coverage.processesWithDomainMappings = mappedProcessIds.size;
    report.coverage.domainsWithProcessMappings = mappedDomainIds.size;
    report.coverage.principlesWithDomainMappings = mappedPrincipleIds.size;
    
    // Find unmapped entities
    const allProcesses = await this.prisma.process.findMany({ select: { id: true, name: true } });
    const allDomains = await this.prisma.performanceDomain.findMany({ select: { id: true, name: true } });
    const allPrinciples = await this.prisma.principle.findMany({ select: { id: true, name: true } });
    
    report.coverage.unmappedProcesses = allProcesses
      .filter(p => !mappedProcessIds.has(p.id))
      .map(p => p.name);
    
    report.coverage.unmappedDomains = allDomains
      .filter(d => !mappedDomainIds.has(d.id))
      .map(d => d.name);
    
    report.coverage.unmappedPrinciples = allPrinciples
      .filter(p => !mappedPrincipleIds.has(p.id))
      .map(p => p.name);
    
    // Calculate statistics
    if (processDomainMappings.length > 0) {
      report.statistics.avgMappingsPerProcess = processDomainMappings.length / mappedProcessIds.size;
      report.statistics.avgMappingsPerDomain = processDomainMappings.length / mappedDomainIds.size;
      
      const totalRelevance = processDomainMappings.reduce((sum, m) => sum + m.relevanceScore, 0);
      report.statistics.avgRelevanceScore = totalRelevance / processDomainMappings.length;
      
      // Mapping type distribution
      processDomainMappings.forEach(m => {
        report.statistics.mappingTypeDistribution[m.mappingType] = 
          (report.statistics.mappingTypeDistribution[m.mappingType] || 0) + 1;
      });
    }
    
    return report;
  }
}