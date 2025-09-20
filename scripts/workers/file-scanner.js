#!/usr/bin/env node

/**
 * File Scanner Worker
 * Worker Thread for parallel file scanning
 * 
 * @author Claude Code Integration System
 * @date 2025-09-20
 */

import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

class FileScannerWorker {
  constructor() {
    this.pattern = workerData.pattern;
    this.projectRoot = workerData.projectRoot;
    this.cache = new Map(workerData.cache);
    this.changes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.filesScanned = 0;
  }

  async run() {
    try {
      const files = await this.findFiles(this.pattern);
      
      for (const filePath of files) {
        await this.processFile(filePath);
      }
      
      parentPort.postMessage({
        changes: this.changes,
        cacheHits: this.cacheHits,
        cacheMisses: this.cacheMisses,
        filesScanned: this.filesScanned
      });
      
    } catch (error) {
      parentPort.postMessage({
        error: error.message
      });
    }
  }

  async findFiles(pattern) {
    try {
      // パターンを簡易的な find コマンドに変換
      const ext = pattern.match(/\*\.(\w+)/)?.[1] || '*';
      const dir = pattern.split('/')[0] || '.';
      
      const command = `find ${dir} -type f -name "*.${ext}" 2>/dev/null | head -100`;
      const result = execSync(command, {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });
      
      return result.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  async processFile(filePath) {
    this.filesScanned++;
    
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const hash = this.generateHash(content);
      const cachedHash = this.cache.get(filePath);
      
      if (hash !== cachedHash) {
        this.cacheMisses++;
        this.changes.push({
          path: filePath,
          type: cachedHash ? 'modified' : 'added',
          hash,
          size: content.length,
          timestamp: new Date().toISOString()
        });
      } else {
        this.cacheHits++;
      }
    } catch (error) {
      // ファイル読み込みエラーは無視
    }
  }

  generateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }
}

// Worker実行
const worker = new FileScannerWorker();
worker.run();