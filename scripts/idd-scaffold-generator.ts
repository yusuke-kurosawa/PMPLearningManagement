#!/usr/bin/env ts-node

/**
 * IDD Interface Scaffold Generator
 * Automated tool for generating Interface Driven Development compliant components
 */

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import * as inquirer from 'inquirer';
import * as prettier from 'prettier';
import { z } from 'zod';

// Configuration schemas
const ComponentTypeSchema = z.enum([
  'entity',
  'repository',
  'service',
  'controller',
  'use-case',
  'value-object',
  'api-endpoint',
  'dto',
  'command',
  'query',
  'event-handler'
]);

const DomainSchema = z.enum([
  'learning',
  'assessment',
  'user',
  'content',
  'collaboration',
  'analytics',
  'notification',
  'system'
]);

const GenerationConfigSchema = z.object({
  name: z.string().min(1),
  domain: DomainSchema,
  componentType: ComponentTypeSchema,
  description: z.string().optional(),
  properties: z.array(z.object({
    name: z.string(),
    type: z.string(),
    optional: z.boolean().default(false),
    description: z.string().optional()
  })).optional(),
  methods: z.array(z.object({
    name: z.string(),
    returnType: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      type: z.string(),
      optional: z.boolean().default(false)
    })).optional(),
    description: z.string().optional()
  })).optional(),
  generateMock: z.boolean().default(true),
  generateTest: z.boolean().default(true),
  generateValidation: z.boolean().default(true),
  generateDocumentation: z.boolean().default(true)
});

type GenerationConfig = z.infer<typeof GenerationConfigSchema>;
type ComponentType = z.infer<typeof ComponentTypeSchema>;
type Domain = z.infer<typeof DomainSchema>;

interface TemplateContext {
  name: string;
  pascalName: string;
  camelName: string;
  kebabName: string;
  domain: string;
  componentType: string;
  description: string;
  properties: any[];
  methods: any[];
  timestamp: string;
  author: string;
}

class IDDScaffoldGenerator {
  private config: GenerationConfig;
  private outputDir: string;
  private templateDir: string;

  constructor(config: GenerationConfig) {
    this.config = config;
    this.outputDir = path.join(process.cwd(), 'src');
    this.templateDir = path.join(__dirname, 'templates', 'idd');
  }

  async generate(): Promise<void> {
    console.log('🚀 Generating IDD-compliant components...');
    
    const context = this.buildTemplateContext();
    
    // Generate main interface
    await this.generateInterface(context);
    
    // Generate implementation stub
    await this.generateImplementation(context);
    
    if (this.config.generateMock) {
      await this.generateMockImplementation(context);
    }
    
    if (this.config.generateTest) {
      await this.generateTests(context);
    }
    
    if (this.config.generateValidation) {
      await this.generateValidationSchema(context);
    }
    
    if (this.config.generateDocumentation) {
      await this.generateDocumentation(context);
    }
    
    // Update barrel exports
    await this.updateExports(context);
    
    console.log('✅ IDD scaffold generation completed!');
    this.printSummary(context);
  }

  private buildTemplateContext(): TemplateContext {
    const name = this.config.name;
    const pascalName = this.toPascalCase(name);
    const camelName = this.toCamelCase(name);
    const kebabName = this.toKebabCase(name);
    
    return {
      name,
      pascalName,
      camelName,
      kebabName,
      domain: this.config.domain,
      componentType: this.config.componentType,
      description: this.config.description || `${pascalName} ${this.config.componentType}`,
      properties: this.config.properties || [],
      methods: this.config.methods || [],
      timestamp: new Date().toISOString(),
      author: process.env.USER || 'IDD Generator'
    };
  }

  private async generateInterface(context: TemplateContext): Promise<void> {
    const template = this.getInterfaceTemplate(context.componentType as ComponentType);
    const content = this.renderTemplate(template, context);
    
    const outputPath = this.getInterfacePath(context);
    await this.writeFile(outputPath, content);
    
    console.log(`📄 Generated interface: ${outputPath}`);
  }

  private async generateImplementation(context: TemplateContext): Promise<void> {
    const template = this.getImplementationTemplate(context.componentType as ComponentType);
    const content = this.renderTemplate(template, context);
    
    const outputPath = this.getImplementationPath(context);
    await this.writeFile(outputPath, content);
    
    console.log(`🔧 Generated implementation: ${outputPath}`);
  }

  private async generateMockImplementation(context: TemplateContext): Promise<void> {
    const template = this.getMockTemplate(context.componentType as ComponentType);
    const content = this.renderTemplate(template, context);
    
    const outputPath = this.getMockPath(context);
    await this.writeFile(outputPath, content);
    
    console.log(`🎭 Generated mock: ${outputPath}`);
  }

  private async generateTests(context: TemplateContext): Promise<void> {
    // Interface test
    const interfaceTestTemplate = this.getInterfaceTestTemplate();
    const interfaceTestContent = this.renderTemplate(interfaceTestTemplate, context);
    const interfaceTestPath = this.getInterfaceTestPath(context);
    await this.writeFile(interfaceTestPath, interfaceTestContent);
    
    // Implementation test
    const implTestTemplate = this.getImplementationTestTemplate(context.componentType as ComponentType);
    const implTestContent = this.renderTemplate(implTestTemplate, context);
    const implTestPath = this.getImplementationTestPath(context);
    await this.writeFile(implTestPath, implTestContent);
    
    console.log(`🧪 Generated tests: ${interfaceTestPath}, ${implTestPath}`);
  }

  private async generateValidationSchema(context: TemplateContext): Promise<void> {
    const template = this.getValidationTemplate();
    const content = this.renderTemplate(template, context);
    
    const outputPath = this.getValidationPath(context);
    await this.writeFile(outputPath, content);
    
    console.log(`✅ Generated validation: ${outputPath}`);
  }

  private async generateDocumentation(context: TemplateContext): Promise<void> {
    const template = this.getDocumentationTemplate();
    const content = this.renderTemplate(template, context);
    
    const outputPath = this.getDocumentationPath(context);
    await this.writeFile(outputPath, content);
    
    console.log(`📚 Generated documentation: ${outputPath}`);
  }

  private getInterfaceTemplate(componentType: ComponentType): string {
    const templates: Record<ComponentType, string> = {
      entity: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 * @author {{author}}
 * @date {{timestamp}}
 */

import { IEntity, EntityId } from '../core/base.interfaces';

export interface I{{pascalName}} extends IEntity {
  id: EntityId;
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};{{#if description}} // {{description}}{{/if}}
  {{/each}}
}

export interface I{{pascalName}}Repository {
  {{#each methods}}
  {{name}}({{#each parameters}}{{name}}{{#if optional}}?{{/if}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): Promise<{{returnType}}>;{{#if description}} // {{description}}{{/if}}
  {{/each}}
  
  // Standard repository methods
  findById(id: EntityId): Promise<I{{pascalName}} | null>;
  findAll(): Promise<I{{pascalName}}[]>;
  save(entity: I{{pascalName}}): Promise<I{{pascalName}}>;
  delete(id: EntityId): Promise<void>;
}

export interface I{{pascalName}}Service {
  create{{pascalName}}(data: Create{{pascalName}}Request): Promise<I{{pascalName}}>;
  update{{pascalName}}(id: EntityId, data: Update{{pascalName}}Request): Promise<I{{pascalName}}>;
  delete{{pascalName}}(id: EntityId): Promise<void>;
  get{{pascalName}}(id: EntityId): Promise<I{{pascalName}} | null>;
  list{{pascalName}}s(criteria?: List{{pascalName}}Criteria): Promise<I{{pascalName}}[]>;
}

// Request/Response DTOs
export interface Create{{pascalName}}Request {
  {{#each properties}}
  {{#unless (eq name 'id')}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/unless}}
  {{/each}}
}

export interface Update{{pascalName}}Request {
  {{#each properties}}
  {{#unless (eq name 'id')}}
  {{name}}?: {{type}};
  {{/unless}}
  {{/each}}
}

export interface List{{pascalName}}Criteria {
  limit?: number;
  offset?: number;
  sortBy?: keyof I{{pascalName}};
  sortOrder?: 'asc' | 'desc';
  filters?: Partial<I{{pascalName}}>;
}`,
      
      repository: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IRepository, ISpecification, EntityId } from '../core/base.interfaces';

export interface I{{pascalName}}<T> extends IRepository<T> {
  {{#each methods}}
  {{name}}({{#each parameters}}{{name}}{{#if optional}}?{{/if}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): Promise<{{returnType}}>;
  {{/each}}
}

export interface I{{pascalName}}Specification<T> extends ISpecification<T> {
  // Domain-specific specification methods
}`,

      service: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IApplicationService } from '../core/base.interfaces';

export interface I{{pascalName}} extends IApplicationService {
  {{#each methods}}
  {{name}}({{#each parameters}}{{name}}{{#if optional}}?{{/if}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): Promise<{{returnType}}>;{{#if description}} // {{description}}{{/if}}
  {{/each}}
}

export interface I{{pascalName}}Config {
  // Service configuration
}`,

      controller: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { Request, Response } from 'express';
import { IController, IApiEndpoint } from '../infrastructure/api.interfaces';

export interface I{{pascalName}} extends IController {
  {{#each methods}}
  {{name}}(req: Request, res: Response): Promise<void>;{{#if description}} // {{description}}{{/if}}
  {{/each}}
}

export const {{pascalName}}Endpoints: IApiEndpoint[] = [
  {{#each methods}}
  {
    method: 'GET', // Adjust as needed
    path: '/api/{{kebabName}}/{{name}}',
    handler: '{{name}}',
    middleware: [],
    documentation: {
      summary: '{{description}}',
      tags: ['{{domain}}'],
      responses: {
        '200': { description: 'Success' }
      }
    }
  },
  {{/each}}
];`,

      'use-case': `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { ICommand, IQuery, ICommandHandler, IQueryHandler } from '../core/base.interfaces';

// Commands
{{#each methods}}
{{#if (startsWith name 'create')}}
export interface {{pascalCase name}}Command extends ICommand {
  {{#each ../properties}}
  {{#unless (eq name 'id')}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/unless}}
  {{/each}}
}

export interface I{{pascalCase name}}Handler extends ICommandHandler<{{pascalCase name}}Command> {
  handle(command: {{pascalCase name}}Command): Promise<void>;
}
{{/if}}
{{/each}}

// Queries
{{#each methods}}
{{#if (startsWith name 'get')}}
export interface {{pascalCase name}}Query extends IQuery {
  id: string;
}

export interface I{{pascalCase name}}Handler extends IQueryHandler<{{pascalCase name}}Query> {
  handle(query: {{pascalCase name}}Query): Promise<any>;
}
{{/if}}
{{/each}}`,

      'value-object': `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IValueObject } from '../core/base.interfaces';

export interface I{{pascalName}} extends IValueObject {
  {{#each properties}}
  readonly {{name}}: {{type}};{{#if description}} // {{description}}{{/if}}
  {{/each}}
  
  equals(other: I{{pascalName}}): boolean;
  toString(): string;
}

export interface I{{pascalName}}Factory {
  create({{#each properties}}{{name}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): I{{pascalName}};
  createFromString(value: string): I{{pascalName}};
}`,

      'api-endpoint': `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IApiEndpoint, IHttpRequest, IHttpResponse } from '../infrastructure/api.interfaces';

export interface I{{pascalName}}Endpoint extends IApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (req: IHttpRequest) => Promise<IHttpResponse>;
}

export interface I{{pascalName}}Request extends IHttpRequest {
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

export interface I{{pascalName}}Response extends IHttpResponse {
  data: {
    {{#each methods}}
    {{name}}: {{returnType}};
    {{/each}}
  };
}`,

      dto: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

export interface I{{pascalName}} {
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};{{#if description}} // {{description}}{{/if}}
  {{/each}}
}

export interface I{{pascalName}}Mapper {
  toDto(entity: any): I{{pascalName}};
  fromDto(dto: I{{pascalName}}): any;
  toDtoList(entities: any[]): I{{pascalName}}[];
}`,

      command: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { ICommand, ICommandHandler } from '../core/base.interfaces';

export interface I{{pascalName}} extends ICommand {
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

export interface I{{pascalName}}Handler extends ICommandHandler<I{{pascalName}}> {
  handle(command: I{{pascalName}}): Promise<void>;
}

export interface I{{pascalName}}Result {
  success: boolean;
  data?: any;
  errors?: string[];
}`,

      query: `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IQuery, IQueryHandler } from '../core/base.interfaces';

export interface I{{pascalName}} extends IQuery {
  {{#each properties}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

export interface I{{pascalName}}Handler extends IQueryHandler<I{{pascalName}}> {
  handle(query: I{{pascalName}}): Promise<{{methods.0.returnType || 'any'}}>;
}`,

      'event-handler': `/**
 * {{description}}
 * @generated by IDD Scaffold Generator
 */

import { IDomainEvent, IEventHandler } from '../core/base.interfaces';

export interface I{{pascalName}}Event extends IDomainEvent {
  {{#each properties}}
  {{name}}: {{type}};
  {{/each}}
}

export interface I{{pascalName}}Handler extends IEventHandler<I{{pascalName}}Event> {
  handle(event: I{{pascalName}}Event): Promise<void>;
  canHandle(event: IDomainEvent): boolean;
}`
    };

    return templates[componentType];
  }

  private getImplementationTemplate(componentType: ComponentType): string {
    // Implementation templates for each component type
    // This would be much longer in practice
    return `/**
 * {{description}} Implementation
 * @generated by IDD Scaffold Generator
 */

import { I{{pascalName}} } from '../interfaces/{{domain}}/{{kebabName}}.interfaces';

export class {{pascalName}} implements I{{pascalName}} {
  constructor(
    // Inject dependencies here
  ) {}

  {{#each methods}}
  async {{name}}({{#each parameters}}{{name}}{{#if optional}}?{{/if}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): Promise<{{returnType}}> {
    // TODO: Implement {{name}}
    throw new Error('Method not implemented');
  }
  {{/each}}
}`;
  }

  private getMockTemplate(componentType: ComponentType): string {
    return `/**
 * {{description}} Mock Implementation
 * @generated by IDD Scaffold Generator
 */

import { I{{pascalName}} } from '../interfaces/{{domain}}/{{kebabName}}.interfaces';

export class Mock{{pascalName}} implements I{{pascalName}} {
  {{#each methods}}
  async {{name}}({{#each parameters}}{{name}}{{#if optional}}?{{/if}}: {{type}}{{#unless @last}}, {{/unless}}{{/each}}): Promise<{{returnType}}> {
    // Mock implementation
    return {} as {{returnType}};
  }
  {{/each}}
}

export const create{{pascalName}}Mock = (): I{{pascalName}} => {
  return new Mock{{pascalName}}();
};`;
  }

  private getInterfaceTestTemplate(): string {
    return `/**
 * {{description}} Interface Tests
 * @generated by IDD Scaffold Generator
 */

import { describe, it, expect } from 'vitest';
import { I{{pascalName}} } from '../interfaces/{{domain}}/{{kebabName}}.interfaces';
import { Mock{{pascalName}} } from '../mocks/{{kebabName}}.mock';

describe('I{{pascalName}} Interface Contract', () => {
  let mock{{pascalName}}: I{{pascalName}};

  beforeEach(() => {
    mock{{pascalName}} = new Mock{{pascalName}}();
  });

  {{#each methods}}
  it('should have {{name}} method', () => {
    expect(mock{{pascalName}}.{{name}}).toBeDefined();
    expect(typeof mock{{pascalName}}.{{name}}).toBe('function');
  });
  {{/each}}

  it('should satisfy interface contract', () => {
    // Verify that mock implements all interface methods
    const requiredMethods = [{{#each methods}}'{{name}}'{{#unless @last}}, {{/unless}}{{/each}}];
    
    requiredMethods.forEach(method => {
      expect(mock{{pascalName}}[method]).toBeDefined();
    });
  });
});`;
  }

  private getImplementationTestTemplate(componentType: ComponentType): string {
    return `/**
 * {{description}} Implementation Tests
 * @generated by IDD Scaffold Generator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { {{pascalName}} } from '../implementations/{{kebabName}}';
import { I{{pascalName}} } from '../interfaces/{{domain}}/{{kebabName}}.interfaces';

describe('{{pascalName}} Implementation', () => {
  let {{camelName}}: I{{pascalName}};

  beforeEach(() => {
    {{camelName}} = new {{pascalName}}(
      // Inject test dependencies
    );
  });

  {{#each methods}}
  describe('{{name}}', () => {
    it('should implement {{name}} correctly', async () => {
      // TODO: Add test implementation
      expect({{../camelName}}.{{name}}).toBeDefined();
    });
  });
  {{/each}}
});`;
  }

  private getValidationTemplate(): string {
    return `/**
 * {{description}} Validation Schema
 * @generated by IDD Scaffold Generator
 */

import { z } from 'zod';

export const {{pascalName}}Schema = z.object({
  {{#each properties}}
  {{name}}: z.{{getZodType type}}(){{#if optional}}.optional(){{/if}},{{#if description}} // {{description}}{{/if}}
  {{/each}}
});

export type {{pascalName}}Type = z.infer<typeof {{pascalName}}Schema>;

export const validate{{pascalName}} = (data: unknown): {{pascalName}}Type => {
  return {{pascalName}}Schema.parse(data);
};

export const is{{pascalName}}Valid = (data: unknown): data is {{pascalName}}Type => {
  return {{pascalName}}Schema.safeParse(data).success;
};`;
  }

  private getDocumentationTemplate(): string {
    return `# {{pascalName}} {{componentType}}

{{description}}

## Interface Definition

\`\`\`typescript
// See: src/interfaces/{{domain}}/{{kebabName}}.interfaces.ts
\`\`\`

## Implementation

\`\`\`typescript
// See: src/implementations/{{kebabName}}.ts
\`\`\`

## Usage Example

\`\`\`typescript
import { I{{pascalName}} } from '../interfaces/{{domain}}/{{kebabName}}.interfaces';
import { {{pascalName}} } from '../implementations/{{kebabName}}';

// Inject dependencies and create instance
const {{camelName}}: I{{pascalName}} = new {{pascalName}}(
  // dependencies
);

{{#each methods}}
// {{description}}
const result = await {{../camelName}}.{{name}}(/* parameters */);
{{/each}}
\`\`\`

## Testing

\`\`\`typescript
import { Mock{{pascalName}} } from '../mocks/{{kebabName}}.mock';

const mock{{pascalName}} = new Mock{{pascalName}}();
// Use mock for testing
\`\`\`

## Validation

\`\`\`typescript
import { validate{{pascalName}} } from '../validation/{{kebabName}}.validation';

const data = validate{{pascalName}}(input);
\`\`\`

---
Generated by IDD Scaffold Generator on {{timestamp}}
`;
  }

  // Path generation methods
  private getInterfacePath(context: TemplateContext): string {
    return path.join(this.outputDir, 'interfaces', context.domain, `${context.kebabName}.interfaces.ts`);
  }

  private getImplementationPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'implementations', context.domain, `${context.kebabName}.ts`);
  }

  private getMockPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'mocks', context.domain, `${context.kebabName}.mock.ts`);
  }

  private getInterfaceTestPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'tests', 'interfaces', `${context.kebabName}.interface.test.ts`);
  }

  private getImplementationTestPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'tests', 'implementations', `${context.kebabName}.test.ts`);
  }

  private getValidationPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'validation', context.domain, `${context.kebabName}.validation.ts`);
  }

  private getDocumentationPath(context: TemplateContext): string {
    return path.join(this.outputDir, 'docs', 'components', `${context.kebabName}.md`);
  }

  // Utility methods
  private renderTemplate(template: string, context: TemplateContext): string {
    // Simple template engine (in production, use Handlebars or similar)
    let rendered = template;
    
    Object.entries(context).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });
    
    // Handle loops (simplified)
    rendered = this.renderLoops(rendered, context);
    
    return rendered;
  }

  private renderLoops(template: string, context: TemplateContext): string {
    // Simplified loop rendering for properties and methods
    const propertyLoop = /{{#each properties}}([\s\S]*?){{\/each}}/g;
    const methodLoop = /{{#each methods}}([\s\S]*?){{\/each}}/g;
    
    template = template.replace(propertyLoop, (match, content) => {
      return context.properties.map(prop => {
        let renderedContent = content;
        Object.entries(prop).forEach(([key, value]) => {
          renderedContent = renderedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
        return renderedContent;
      }).join('\n');
    });
    
    template = template.replace(methodLoop, (match, content) => {
      return context.methods.map(method => {
        let renderedContent = content;
        Object.entries(method).forEach(([key, value]) => {
          renderedContent = renderedContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
        return renderedContent;
      }).join('\n');
    });
    
    return template;
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Format with Prettier
    try {
      const formatted = await prettier.format(content, {
        parser: filePath.endsWith('.ts') ? 'typescript' : 'markdown',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        tabWidth: 2,
      });
      fs.writeFileSync(filePath, formatted);
    } catch (error) {
      console.warn(`Warning: Could not format ${filePath}, writing raw content`);
      fs.writeFileSync(filePath, content);
    }
  }

  private async updateExports(context: TemplateContext): Promise<void> {
    const indexPath = path.join(this.outputDir, 'interfaces', context.domain, 'index.ts');
    const exportLine = `export * from './${context.kebabName}.interfaces';`;
    
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (!content.includes(exportLine)) {
        fs.appendFileSync(indexPath, `\n${exportLine}\n`);
      }
    } else {
      await this.writeFile(indexPath, `${exportLine}\n`);
    }
  }

  private printSummary(context: TemplateContext): void {
    console.log('\n📋 Generation Summary:');
    console.log(`   Name: ${context.pascalName}`);
    console.log(`   Domain: ${context.domain}`);
    console.log(`   Type: ${context.componentType}`);
    console.log(`   Files Generated:`);
    console.log(`     - Interface: src/interfaces/${context.domain}/${context.kebabName}.interfaces.ts`);
    console.log(`     - Implementation: src/implementations/${context.domain}/${context.kebabName}.ts`);
    
    if (this.config.generateMock) {
      console.log(`     - Mock: src/mocks/${context.domain}/${context.kebabName}.mock.ts`);
    }
    
    if (this.config.generateTest) {
      console.log(`     - Tests: src/tests/interfaces/${context.kebabName}.interface.test.ts`);
      console.log(`     - Implementation Tests: src/tests/implementations/${context.kebabName}.test.ts`);
    }
    
    if (this.config.generateValidation) {
      console.log(`     - Validation: src/validation/${context.domain}/${context.kebabName}.validation.ts`);
    }
    
    if (this.config.generateDocumentation) {
      console.log(`     - Documentation: src/docs/components/${context.kebabName}.md`);
    }
    
    console.log('\n🎉 Ready to implement your IDD-compliant component!');
  }

  // String utilities
  private toPascalCase(str: string): string {
    return str.replace(/(?:^|[-_])(\w)/g, (_, char) => char.toUpperCase());
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }
}

// CLI Interface
async function main() {
  const program = new Command();

  program
    .name('idd-scaffold')
    .description('Generate IDD-compliant components')
    .version('1.0.0');

  program
    .command('generate')
    .description('Generate IDD component scaffold')
    .option('-i, --interactive', 'Interactive mode')
    .option('-c, --config <path>', 'Config file path')
    .action(async (options) => {
      let config: GenerationConfig;

      if (options.interactive) {
        config = await promptForConfig();
      } else if (options.config) {
        const configData = JSON.parse(fs.readFileSync(options.config, 'utf8'));
        config = GenerationConfigSchema.parse(configData);
      } else {
        console.error('Please use --interactive or --config option');
        process.exit(1);
      }

      const generator = new IDDScaffoldGenerator(config);
      await generator.generate();
    });

  program
    .command('validate')
    .description('Validate IDD compliance')
    .option('-p, --path <path>', 'Path to validate')
    .action(async (options) => {
      const validator = new IDDValidator();
      const result = await validator.validate(options.path || 'src');
      
      console.log('🔍 IDD Compliance Report:');
      console.log(`   Compliance Score: ${result.score}/100`);
      console.log(`   Issues Found: ${result.issues.length}`);
      
      if (result.issues.length > 0) {
        console.log('\n❌ Issues:');
        result.issues.forEach(issue => {
          console.log(`   - ${issue.severity}: ${issue.message} (${issue.file})`);
        });
      }
    });

  await program.parseAsync();
}

async function promptForConfig(): Promise<GenerationConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Component name:',
      validate: (input) => input.length > 0 || 'Name is required'
    },
    {
      type: 'list',
      name: 'domain',
      message: 'Domain:',
      choices: ['learning', 'assessment', 'user', 'content', 'collaboration', 'analytics', 'notification', 'system']
    },
    {
      type: 'list',
      name: 'componentType',
      message: 'Component type:',
      choices: ['entity', 'repository', 'service', 'controller', 'use-case', 'value-object', 'api-endpoint', 'dto', 'command', 'query', 'event-handler']
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):'
    },
    {
      type: 'confirm',
      name: 'generateMock',
      message: 'Generate mock implementation?',
      default: true
    },
    {
      type: 'confirm',
      name: 'generateTest',
      message: 'Generate tests?',
      default: true
    },
    {
      type: 'confirm',
      name: 'generateValidation',
      message: 'Generate validation schemas?',
      default: true
    }
  ]);

  return GenerationConfigSchema.parse(answers);
}

// IDD Compliance Validator
class IDDValidator {
  async validate(basePath: string): Promise<{score: number, issues: Array<{severity: string, message: string, file: string}>}> {
    const issues = [];
    let score = 100;

    // Check for interface definitions
    const interfacesPath = path.join(basePath, 'interfaces');
    if (!fs.existsSync(interfacesPath)) {
      issues.push({
        severity: 'ERROR',
        message: 'No interfaces directory found',
        file: interfacesPath
      });
      score -= 20;
    }

    // Check for implementation separation
    const implementationsPath = path.join(basePath, 'implementations');
    if (!fs.existsSync(implementationsPath)) {
      issues.push({
        severity: 'WARNING',
        message: 'No implementations directory found',
        file: implementationsPath
      });
      score -= 10;
    }

    // Check for mock implementations
    const mocksPath = path.join(basePath, 'mocks');
    if (!fs.existsSync(mocksPath)) {
      issues.push({
        severity: 'WARNING',
        message: 'No mocks directory found - testing may be difficult',
        file: mocksPath
      });
      score -= 10;
    }

    return { score, issues };
  }
}

// Run CLI
if (require.main === module) {
  main().catch(console.error);
}

export { IDDScaffoldGenerator, IDDValidator, GenerationConfig };