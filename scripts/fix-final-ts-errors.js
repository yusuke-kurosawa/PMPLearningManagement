#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// TypeScriptエラーを自動修正する最終スクリプト
console.log('🔧 TypeScriptエラーの最終修正を開始...')

// 修正対象ファイルと修正内容
const fixes = [
  {
    file: 'src/utils/logger.ts',
    fixes: [
      {
        search: 'import { logger } from',
        replace: '// import { logger } from',
      },
      {
        search: 'export const logger = {',
        replace: 'const loggerImpl = {',
      },
      {
        search: 'const logger: Logger = {',
        replace: 'export const logger: Logger = {',
      },
    ],
  },
  {
    file: 'src/utils/performance.ts',
    fixes: [
      {
        search: 'export function throttle(func, limit) {',
        replace: 'export function throttle(func: (...args: any[]) => void, limit: number) {',
      },
      {
        search: 'let inThrottle;',
        replace: 'let inThrottle: boolean = false;',
      },
      {
        search: 'return function(...args) {',
        replace: 'return function(this: any, ...args: any[]) {',
      },
      {
        search: 'export function memoize(key, computeFn) {',
        replace: 'export function memoize(key: string, computeFn: () => any) {',
      },
      {
        search: 'export function virtualScroll(items, containerHeight, itemHeight, scrollTop) {',
        replace:
          'export function virtualScroll(items: any[], containerHeight: number, itemHeight: number, scrollTop: number) {',
      },
      {
        search: 'export function batchUpdate(updates) {',
        replace: 'export function batchUpdate(updates: (() => void)[]) {',
      },
      {
        search: 'updates.forEach((update) => {',
        replace: 'updates.forEach((update: () => void) => {',
      },
    ],
  },
  {
    file: 'src/utils/processUtils.ts',
    fixes: [
      {
        search: 'export function getProcessName(knowledgeAreaId, processGroup, processIndex) {',
        replace:
          'export function getProcessName(knowledgeAreaId: number, processGroup: string, processIndex: number): string {',
      },
      {
        search: 'export function getProcessById(processId) {',
        replace: 'export function getProcessById(processId: string): any {',
      },
    ],
  },
  {
    file: 'src/test/utils/test-utils.tsx',
    fixes: [
      {
        search: 'function customRender(ui, options = {}) {',
        replace: 'function customRender(ui: React.ReactElement, options: any = {}) {',
      },
      {
        search: 'function AllTheProviders({ children }) {',
        replace: 'function AllTheProviders({ children }: { children: React.ReactNode }) {',
      },
      {
        search: 'export async function waitForAsync(ui, options) {',
        replace: 'export async function waitForAsync(ui: React.ReactElement, options?: any) {',
      },
      {
        search: 'const mockLocalStorage = {',
        replace: 'const mockLocalStorage: any = {',
      },
    ],
  },
  {
    file: 'src/test/utils/accessibility.ts',
    fixes: [
      {
        search: 'async function axeTest(container) {',
        replace: 'async function axeTest(container: any) {',
      },
      {
        search: 'function checkAriaLabels(container) {',
        replace: 'function checkAriaLabels(container: any) {',
      },
      {
        search: 'function checkKeyboardNavigation(container) {',
        replace: 'function checkKeyboardNavigation(container: any) {',
      },
      {
        search: 'function checkColorContrast(container) {',
        replace: 'function checkColorContrast(container: any) {',
      },
      {
        search: 'element => element',
        replace: '(element: any) => element',
      },
      {
        search: '.forEach(element =>',
        replace: '.forEach((element: any) =>',
      },
      {
        search: '.filter(node =>',
        replace: '.filter((node: any) =>',
      },
    ],
  },
  {
    file: 'playwright.config.ts',
    fixes: [
      {
        search: '    timeout: 60000,',
        replace: '    // timeout: 60000,',
      },
      {
        search: "      mode: 'css',",
        replace: "      // mode: 'css',",
      },
    ],
  },
  {
    file: 'vitest.config.ts',
    fixes: [
      {
        search: '    threads: false,',
        replace: '    // threads: false,',
      },
    ],
  },
]

// 各ファイルを修正
fixes.forEach(({ file, fixes }) => {
  const filePath = path.join(process.cwd(), file)

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ファイルが存在しません: ${file}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  fixes.forEach(({ search, replace }) => {
    if (content.includes(search)) {
      content = content.replace(
        new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        replace
      )
      modified = true
    }
  })

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`✅ 修正完了: ${file}`)
  } else {
    console.log(`ℹ️  修正不要: ${file}`)
  }
})

console.log('✨ TypeScriptエラー修正完了！')
