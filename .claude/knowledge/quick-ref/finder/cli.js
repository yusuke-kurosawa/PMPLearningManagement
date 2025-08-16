#!/usr/bin/env node

/**
 * Interactive Command Finder CLI
 * Quick reference system for DevOps commands
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import fuzzy from 'fuzzy'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import { promisify } from 'util'

const __dirname = dirname(fileURLToPath(import.meta.url))
const execAsync = promisify(exec)

// Load all reference files
const loadReferences = () => {
  const refDir = join(__dirname, '..')
  const files = readdirSync(refDir).filter((f) => f.endsWith('.md'))
  const references = {}

  files.forEach((file) => {
    const content = readFileSync(join(refDir, file), 'utf-8')
    const category = file.replace('.md', '')
    references[category] = parseCommands(content)
  })

  return references
}

// Parse commands from markdown
const parseCommands = (content) => {
  const commands = []
  const lines = content.split('\n')
  let currentCommand = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect command blocks
    if (line.startsWith('```bash') || line.startsWith('```sh')) {
      currentCommand = {
        commands: [],
        description: '',
        category: '',
        tags: [],
      }

      // Look for description in previous lines
      for (let j = i - 1; j >= 0 && j > i - 5; j--) {
        if (lines[j].startsWith('#')) {
          currentCommand.category = lines[j].replace(/^#+\s*/, '').trim()
          break
        }
      }

      continue
    }

    if (line.startsWith('```') && currentCommand) {
      if (currentCommand.commands.length > 0) {
        commands.push(currentCommand)
      }
      currentCommand = null
      continue
    }

    if (currentCommand && line.trim()) {
      // Skip comments but extract description
      if (line.trim().startsWith('#')) {
        const comment = line.trim().substring(1).trim()
        if (!currentCommand.description && comment.length > 0) {
          currentCommand.description = comment
        }
      } else if (!line.trim().startsWith('//') && !line.trim().startsWith('echo')) {
        // Extract the actual command
        const cmd = line.trim()
        if (cmd.length > 0) {
          currentCommand.commands.push(cmd)

          // Extract tags from command
          if (cmd.includes('npm')) currentCommand.tags.push('npm')
          if (cmd.includes('docker')) currentCommand.tags.push('docker')
          if (cmd.includes('git')) currentCommand.tags.push('git')
          if (cmd.includes('test')) currentCommand.tags.push('test')
          if (cmd.includes('build')) currentCommand.tags.push('build')
          if (cmd.includes('deploy')) currentCommand.tags.push('deploy')
        }
      }
    }
  }

  return commands
}

// Search commands
const searchCommands = (references, query) => {
  const allCommands = []

  Object.entries(references).forEach(([category, commands]) => {
    commands.forEach((cmd) => {
      cmd.commands.forEach((command) => {
        allCommands.push({
          command,
          description: cmd.description,
          category: `${category} > ${cmd.category}`,
          tags: cmd.tags,
          score: 0,
        })
      })
    })
  })

  // Fuzzy search
  const options = {
    extract: (item) => `${item.command} ${item.description} ${item.tags.join(' ')}`,
  }

  const results = fuzzy.filter(query, allCommands, options)
  return results
    .map((r) => ({
      ...r.original,
      score: r.score,
    }))
    .slice(0, 20)
}

// Format command for display
const formatCommand = (cmd) => {
  let output = '\n'
  output += chalk.cyan('━'.repeat(80)) + '\n'
  output += chalk.yellow('📂 Category: ') + chalk.white(cmd.category) + '\n'
  if (cmd.description) {
    output += chalk.yellow('📝 Description: ') + chalk.gray(cmd.description) + '\n'
  }
  if (cmd.tags.length > 0) {
    output +=
      chalk.yellow('🏷️  Tags: ') + cmd.tags.map((t) => chalk.magenta(`#${t}`)).join(' ') + '\n'
  }
  output += chalk.yellow('💻 Command:\n')
  output += chalk.green('  ' + cmd.command) + '\n'
  output += chalk.cyan('━'.repeat(80)) + '\n'
  return output
}

// Copy to clipboard
const copyToClipboard = async (text) => {
  try {
    if (process.platform === 'darwin') {
      await execAsync(`echo "${text}" | pbcopy`)
    } else if (process.platform === 'linux') {
      await execAsync(`echo "${text}" | xclip -selection clipboard`)
    } else if (process.platform === 'win32') {
      await execAsync(`echo ${text} | clip`)
    }
    return true
  } catch (error) {
    return false
  }
}

// Interactive mode
const interactiveMode = async () => {
  console.clear()
  console.log(
    chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║     🚀 DevOps Quick Reference - Interactive CLI 🚀        ║
╚═══════════════════════════════════════════════════════════╝
  `)
  )

  const references = loadReferences()
  let continueSearching = true

  while (continueSearching) {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'What would you like to do?',
        choices: [
          { name: '🔍 Search commands', value: 'search' },
          { name: '📚 Browse by category', value: 'browse' },
          { name: '⭐ Show favorites', value: 'favorites' },
          { name: '📊 Show statistics', value: 'stats' },
          { name: '❌ Exit', value: 'exit' },
        ],
      },
    ])

    if (mode === 'exit') {
      console.log(chalk.green('\n👋 Goodbye! Happy DevOps-ing!\n'))
      process.exit(0)
    }

    if (mode === 'search') {
      const { query } = await inquirer.prompt([
        {
          type: 'input',
          name: 'query',
          message: 'Enter search query:',
          validate: (input) => input.length > 0 || 'Please enter a search query',
        },
      ])

      const results = searchCommands(references, query)

      if (results.length === 0) {
        console.log(chalk.red('\n❌ No commands found matching your query.\n'))
        continue
      }

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: `Found ${results.length} results. Select a command:`,
          choices: results.map((r, i) => ({
            name: `${chalk.green(r.command.substring(0, 60))}${r.command.length > 60 ? '...' : ''}\n     ${chalk.gray(r.category)}`,
            value: i,
          })),
          pageSize: 10,
        },
      ])

      const selectedCommand = results[selected]
      console.log(formatCommand(selectedCommand))

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 Copy to clipboard', value: 'copy' },
            { name: '▶️  Execute command', value: 'execute' },
            { name: '🔍 Search again', value: 'search' },
            { name: '↩️  Main menu', value: 'menu' },
          ],
        },
      ])

      if (action === 'copy') {
        const copied = await copyToClipboard(selectedCommand.command)
        if (copied) {
          console.log(chalk.green('✅ Command copied to clipboard!'))
        } else {
          console.log(chalk.yellow('⚠️  Could not copy to clipboard. Command printed above.'))
        }
      } else if (action === 'execute') {
        console.log(chalk.yellow('\n⚠️  Executing command...\n'))
        try {
          const { stdout, stderr } = await execAsync(selectedCommand.command)
          if (stdout) console.log(chalk.green(stdout))
          if (stderr) console.log(chalk.red(stderr))
        } catch (error) {
          console.log(chalk.red(`❌ Error executing command: ${error.message}`))
        }
      } else if (action === 'search') {
        continue
      }
    } else if (mode === 'browse') {
      const categories = Object.keys(references)

      const { category } = await inquirer.prompt([
        {
          type: 'list',
          name: 'category',
          message: 'Select a category:',
          choices: categories.map((c) => ({
            name: `📁 ${c.charAt(0).toUpperCase() + c.slice(1)}`,
            value: c,
          })),
        },
      ])

      const commands = references[category]
      console.log(
        chalk.cyan(`\n📚 ${category.toUpperCase()} - ${commands.length} command groups\n`)
      )

      // Show first few commands
      commands.slice(0, 5).forEach((cmd) => {
        if (cmd.commands.length > 0) {
          console.log(chalk.yellow('• ') + chalk.green(cmd.commands[0]))
          if (cmd.description) {
            console.log('  ' + chalk.gray(cmd.description))
          }
        }
      })

      if (commands.length > 5) {
        console.log(chalk.gray(`\n... and ${commands.length - 5} more\n`))
      }
    } else if (mode === 'stats') {
      let totalCommands = 0
      const stats = {}

      Object.entries(references).forEach(([category, commands]) => {
        let count = 0
        commands.forEach((cmd) => {
          count += cmd.commands.length
        })
        stats[category] = count
        totalCommands += count
      })

      console.log(chalk.cyan('\n📊 Quick Reference Statistics\n'))
      console.log(chalk.yellow('Total Commands: ') + chalk.white(totalCommands))
      console.log(chalk.yellow('\nCommands by Category:'))

      Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => {
          const bar = '█'.repeat(Math.floor(count / 10))
          console.log(`  ${chalk.green(cat.padEnd(15))} ${chalk.cyan(bar)} ${count}`)
        })

      console.log('')
    }

    // Ask if user wants to continue
    const { again } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'again',
        message: 'Continue using Quick Reference?',
        default: true,
      },
    ])

    continueSearching = again
  }
}

// Main execution
const main = async () => {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    // Interactive mode
    await interactiveMode()
  } else {
    // Direct search mode
    const query = args.join(' ')
    const references = loadReferences()
    const results = searchCommands(references, query)

    if (results.length === 0) {
      console.log(chalk.red('No commands found.'))
      process.exit(1)
    }

    // Show top 5 results
    console.log(chalk.cyan(`\nTop ${Math.min(5, results.length)} results for "${query}":\n`))
    results.slice(0, 5).forEach((cmd, i) => {
      console.log(chalk.yellow(`${i + 1}.`) + ' ' + chalk.green(cmd.command))
      if (cmd.description) {
        console.log('   ' + chalk.gray(cmd.description))
      }
      console.log('   ' + chalk.blue(cmd.category))
      console.log('')
    })
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Error:', error.message))
  process.exit(1)
})

// Run the CLI
main().catch(console.error)
