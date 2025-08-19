#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

/**
 * 最終ビルドエラー修正スクリプト
 */

function fixFinalBuildErrors() {
  console.log('🔧 最終ビルドエラーを修正中...\n')
  
  // ContextManagerContext.tsxの修正
  const contextFile = path.resolve('src/contexts/ContextManagerContext.tsx')
  if (fs.existsSync(contextFile)) {
    let content = fs.readFileSync(contextFile, 'utf8')
    
    // 壊れたパラメータ名を修正
    content = content.replace(/usedM, B:/g, 'usedMB:')
    content = content.replace(/lazyLoadCacheSiz, e:/g, 'lazyLoadCacheSize:')
    content = content.replace(/\(ke, y:/g, '(key:')
    content = content.replace(/\(maxAg, e:/g, '(maxAge:')
    content = content.replace(/\(Componen, t:/g, '(Component:')
    content = content.replace(/\(componentKe, y:/g, '(componentKey:')
    content = content.replace(/\(elemen, t:/g, '(element:')
    content = content.replace(/\(fun, c:/g, '(func:')
    
    // useEffectの閉じ括弧を修正
    content = content.replace(/return \(\) => clearInterval\(interval\)\s*\}\s*$/gm, 'return () => clearInterval(interval)\n  }, [])')
    
    fs.writeFileSync(contextFile, content, 'utf8')
    console.log('  ✓ ContextManagerContext.tsx修正完了')
  }
  
  // ProcessFlowDiagram.tsxの修正
  const processFlowFile = path.resolve('src/components/visualizations/ProcessFlowDiagram.tsx')
  if (fs.existsSync(processFlowFile)) {
    let content = fs.readFileSync(processFlowFile, 'utf8')
    
    // useEffectの依存配列追加
    content = content.replace(/return \(\) => window\.removeEventListener\('resize', handleResize\)\s*\}\s*$/gm, 
      "return () => window.removeEventListener('resize', handleResize)\n  }, [])")
    
    fs.writeFileSync(processFlowFile, content, 'utf8')
    console.log('  ✓ ProcessFlowDiagram.tsx修正完了')
  }
  
  // ProcessHeatmap.tsxの修正
  const heatmapFile = path.resolve('src/components/visualizations/ProcessHeatmap.tsx')
  if (fs.existsSync(heatmapFile)) {
    let content = fs.readFileSync(heatmapFile, 'utf8')
    
    // metricsオブジェクトの構文修正
    content = content.replace(/コミュニケーションの管理: 8\s*\}\s*return/g, 
      'コミュニケーションの管理: 8\n        }\n        return')
    
    fs.writeFileSync(heatmapFile, content, 'utf8')
    console.log('  ✓ ProcessHeatmap.tsx修正完了')
  }
  
  // その他のファイルで一般的な構文エラーを修正
  const files = [
    'src/components/visualizations/MindMapView.tsx',
    'src/components/visualizations/EnhancedNetworkGraph.tsx',
    'src/components/visualizations/ITTOForceGraph.tsx',
    'src/components/visualizations/IntegratedView.tsx',
    'src/components/visualizations/SankeyDiagram.tsx',
    'src/components/visualizations/KnowledgeAreaHeatmap.tsx'
  ]
  
  for (const file of files) {
    const filePath = path.resolve(file)
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      let originalContent = content
      
      // useEffectの依存配列修正
      content = content.replace(/\}\s*,\s*\[\]\s*\)/g, '}, [])')
      
      // 余分な閉じ括弧の削除
      content = content.replace(/\}\s*\)\s*\)/g, '})')
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`  ✓ ${path.basename(file)}修正完了`)
      }
    }
  }
  
  console.log('\n✅ 最終ビルドエラー修正完了!')
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fixFinalBuildErrors()
  console.log('\n🎉 全修正が完了しました!')
  console.log('次のコマンドでビルドを確認してください:')
  console.log('  npm run build')
}

export default fixFinalBuildErrors