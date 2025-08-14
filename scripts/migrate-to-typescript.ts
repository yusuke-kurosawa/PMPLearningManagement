#!/usr/bin/env node

/**
 * TypeScript Migration Script
 * Automatically converts JavaScript files to TypeScript with basic type annotations
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface MigrationStats {
  totalFiles: number
  migratedFiles: number
  errors: Array<{ file: string; error: string }>
}

class TypeScriptMigrator {
  private stats: MigrationStats = {
    totalFiles: 0,
    migratedFiles: 0,
    errors: [],
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting TypeScript migration...\n')

    try {
      // Find all .js and .jsx files
      const jsFiles = await glob('src/**/*.{js,jsx}', {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.test.js',
          '**/*.spec.js',
        ],
      })

      this.stats.totalFiles = jsFiles.length
      console.log(`Found ${jsFiles.length} JavaScript files to migrate\n`)

      for (const file of jsFiles) {
        await this.migrateFile(file)
      }

      this.printSummary()
    } catch (error) {
      console.error('Migration failed:', error)
      process.exit(1)
    }
  }

  private async migrateFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const isReactFile = filePath.endsWith('.jsx') || this.containsJSX(content)
      const newExtension = isReactFile ? '.tsx' : '.ts'
      const newPath = filePath.replace(/\.(jsx?|js)$/, newExtension)

      // Add basic type annotations
      let modifiedContent = this.addTypeAnnotations(content, isReactFile)

      // Fix import statements
      modifiedContent = this.fixImports(modifiedContent)

      // Add basic type definitions for common patterns
      modifiedContent = this.addCommonTypes(modifiedContent, isReactFile)

      // Write the new TypeScript file
      fs.writeFileSync(newPath, modifiedContent)

      // Delete the old JavaScript file
      fs.unlinkSync(filePath)

      this.stats.migratedFiles++
      console.log(`✅ Migrated: ${filePath} → ${newPath}`)
    } catch (error) {
      this.stats.errors.push({
        file: filePath,
        error: error instanceof Error ? error.message : String(error),
      })
      console.error(`❌ Failed to migrate ${filePath}:`, error)
    }
  }

  private containsJSX(content: string): boolean {
    // Check for JSX patterns
    return /<[A-Z]\w*[\s/>]/.test(content) || /<\/[A-Z]\w*>/.test(content)
  }

  private addTypeAnnotations(content: string, isReact: boolean): string {
    let modified = content

    // Add React import if needed
    if (isReact && !content.includes("from 'react'") && !content.includes('from "react"')) {
      modified = `import React from 'react'\n${modified}`
    }

    // Replace PropTypes with TypeScript interfaces
    modified = this.replacePropTypes(modified)

    // Add function parameter types
    modified = this.addFunctionTypes(modified)

    // Replace 'any' with 'unknown' for better type safety
    modified = modified.replace(/:\s*any\b/g, ': unknown')

    return modified
  }

  private replacePropTypes(content: string): string {
    // Remove PropTypes imports
    let modified = content.replace(/import\s+PropTypes\s+from\s+['"]prop-types['"]\s*;?\s*\n?/g, '')

    // Convert PropTypes to TypeScript interfaces
    const propTypesRegex = /(\w+)\.propTypes\s*=\s*{([^}]+)}/g
    modified = modified.replace(propTypesRegex, (match, componentName, propTypes) => {
      const props = this.parsePropTypes(propTypes)
      const interfaceDef = `interface ${componentName}Props {\n${props}\n}`
      return `// ${interfaceDef}`
    })

    return modified
  }

  private parsePropTypes(propTypesString: string): string {
    const lines = propTypesString.split(',').map((line) => line.trim())
    const props = lines
      .filter((line) => line.length > 0)
      .map((line) => {
        const [name, type] = line.split(':').map((s) => s.trim())
        const tsType = this.propTypeToTsType(type)
        const optional = !type.includes('isRequired') ? '?' : ''
        return `  ${name}${optional}: ${tsType}`
      })
    return props.join('\n')
  }

  private propTypeToTsType(propType: string): string {
    if (propType.includes('string')) return 'string'
    if (propType.includes('number')) return 'number'
    if (propType.includes('bool')) return 'boolean'
    if (propType.includes('func')) return '(...args: any[]) => any'
    if (propType.includes('object')) return 'Record<string, unknown>'
    if (propType.includes('array')) return 'unknown[]'
    if (propType.includes('node')) return 'React.ReactNode'
    if (propType.includes('element')) return 'React.ReactElement'
    return 'unknown'
  }

  private addFunctionTypes(content: string): string {
    // Add types to function parameters that don't have them
    let modified = content

    // Add types to useState hooks
    modified = modified.replace(
      /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState\((.*?)\)/g,
      (match, state, initialValue) => {
        const type = this.inferType(initialValue)
        return match.replace('useState(', `useState<${type}>(`)
      }
    )

    // Add types to event handlers
    modified = modified.replace(
      /const\s+handle\w+\s*=\s*\((e)\)/g,
      'const handle$1 = (e: React.ChangeEvent<HTMLInputElement>)'
    )

    return modified
  }

  private inferType(value: string): string {
    if (value === 'null') return 'unknown | null'
    if (value === 'undefined') return 'unknown | undefined'
    if (value === 'true' || value === 'false') return 'boolean'
    if (/^['"`]/.test(value)) return 'string'
    if (/^\d+$/.test(value)) return 'number'
    if (value.startsWith('[')) return 'unknown[]'
    if (value.startsWith('{')) return 'Record<string, unknown>'
    return 'unknown'
  }

  private fixImports(content: string): string {
    // Fix relative imports to include extensions
    let modified = content.replace(
      /from\s+['"](\.\.?\/[^'"]+)(?<!\.tsx?)(?<!\.ts)['"]/g,
      (match, importPath) => {
        // Don't add extension to node_modules imports
        if (importPath.includes('node_modules')) return match
        return match
      }
    )

    return modified
  }

  private addCommonTypes(content: string, isReact: boolean): string {
    let modified = content

    if (isReact) {
      // Add FC type to functional components
      modified = modified.replace(
        /const\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*{/g,
        'const $1: React.FC = () => {'
      )

      // Add FC type with props
      modified = modified.replace(
        /const\s+(\w+)\s*=\s*\(\s*{\s*([\w\s,]+)\s*}\s*\)\s*=>\s*{/g,
        'const $1: React.FC<$1Props> = ({ $2 }) => {'
      )
    }

    return modified
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 Migration Summary')
    console.log('='.repeat(50))
    console.log(`Total files: ${this.stats.totalFiles}`)
    console.log(`Successfully migrated: ${this.stats.migratedFiles}`)
    console.log(`Failed: ${this.stats.errors.length}`)

    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors:')
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`)
      })
    }

    console.log('\n✨ Migration complete!')
  }
}

// Run the migration
const migrator = new TypeScriptMigrator()
migrator.migrate().catch(console.error)