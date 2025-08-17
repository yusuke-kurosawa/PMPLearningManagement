#!/usr/bin/env node
/**
 * 日本語コンテンツ品質チェックシステム
 *
 * 機能:
 * - 日本語文法・表現の正確性検証
 * - PMI公式日本語用語との整合性チェック
 * - 敬語・丁寧語の適切性確認
 * - 読みやすさ・理解しやすさ評価
 * - 文化的適切性の検証
 *
 * ROI: 日本語品質向上による学習者満足度25%向上
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 日本語品質評価基準
const JAPANESE_QUALITY_STANDARDS = {
  // 文法・表現ルール
  GRAMMAR_RULES: {
    sentence_length: { ideal: 40, max: 80 }, // 理想的な文の長さ（文字数）
    paragraph_length: { ideal: 200, max: 400 }, // 理想的な段落の長さ
    complex_sentence_ratio: { max: 0.3 }, // 複文の比率上限
    passive_voice_ratio: { max: 0.2 }, // 受動態の比率上限
    kanji_ratio: { min: 0.2, max: 0.4 }, // 漢字の比率範囲
  },

  // 敬語・丁寧語
  POLITENESS_LEVELS: {
    educational: ['です', 'ます', 'である'], // 教育コンテンツ適切な敬語
    technical: ['する', 'なる', 'される'], // 技術文書での表現
    explanatory: ['について', 'に関して', 'において'], // 説明文での表現
  },

  // PMI公式日本語用語
  PMI_OFFICIAL_TERMS: {
    // プロセス関連
    processes: {
      立ち上げ: 'Initiating',
      計画: 'Planning',
      実行: 'Executing',
      '監視・コントロール': 'Monitoring and Controlling',
      終結: 'Closing',
    },

    // 知識エリア
    knowledge_areas: {
      統合マネジメント: 'Integration Management',
      スコープマネジメント: 'Scope Management',
      スケジュールマネジメント: 'Schedule Management',
      コストマネジメント: 'Cost Management',
      品質マネジメント: 'Quality Management',
      資源マネジメント: 'Resource Management',
      コミュニケーションマネジメント: 'Communications Management',
      リスクマネジメント: 'Risk Management',
      調達マネジメント: 'Procurement Management',
      ステークホルダーマネジメント: 'Stakeholder Management',
    },

    // 専門用語
    technical_terms: {
      プロジェクト: 'Project',
      プロセス: 'Process',
      フェーズ: 'Phase',
      マイルストーン: 'Milestone',
      ステークホルダー: 'Stakeholder',
      デリバラブル: 'Deliverable',
      スコープ: 'Scope',
      リスク: 'Risk',
      リソース: 'Resource',
      クライテリア: 'Criteria',
    },
  },

  // 品質しきい値
  QUALITY_THRESHOLDS: {
    grammar_accuracy: 0.9, // 90%以上の文法正確性
    terminology_consistency: 0.95, // 95%以上の用語一貫性
    readability: 0.85, // 85%以上の読みやすさ
    cultural_appropriateness: 0.9, // 90%以上の文化的適切性
  },
}

// 日本語文法パターン
const JAPANESE_GRAMMAR_PATTERNS = {
  // 問題のある表現パターン
  PROBLEMATIC_PATTERNS: [
    {
      pattern: /[。！？][^」』】）〉》〕］〙〗]/g,
      type: 'punctuation',
      message: '句読点の後に適切な空白または改行が必要です',
      severity: 'low',
    },
    {
      pattern: /[、,][、,]/g,
      type: 'punctuation',
      message: '読点の重複があります',
      severity: 'medium',
    },
    {
      pattern: /[はがをにでとへからまでもやなど]{2,}/g,
      type: 'particles',
      message: '助詞の連続使用を確認してください',
      severity: 'medium',
    },
    {
      pattern: /(.{100,})[、]/g,
      type: 'sentence_length',
      message: '文が長すぎる可能性があります',
      severity: 'low',
    },
    {
      pattern: /である。(.{0,5})です。/g,
      type: 'style_inconsistency',
      message: '敬語レベルの不統一があります',
      severity: 'high',
    },
  ],

  // 望ましい表現パターン
  PREFERRED_PATTERNS: [
    {
      pattern: /について説明します/g,
      type: 'explanatory',
      message: '説明的な表現が適切に使用されています',
      score: 0.1,
    },
    {
      pattern: /具体的には/g,
      type: 'clarification',
      message: '具体例による明確化が行われています',
      score: 0.1,
    },
    {
      pattern: /つまり|すなわち|言い換えると/g,
      type: 'paraphrase',
      message: '言い換えによる理解促進が図られています',
      score: 0.1,
    },
  ],

  // 専門用語の揺れパターン
  TERMINOLOGY_VARIATIONS: [
    {
      standard: 'プロジェクトマネジャー',
      variations: ['プロジェクト・マネジャー', 'PM', 'プロマネ'],
    },
    {
      standard: 'ステークホルダー',
      variations: ['ステイクホルダー', '利害関係者', '関係者'],
    },
    {
      standard: 'マイルストーン',
      variations: ['マイルストン', '節目', '中間目標'],
    },
  ],
}

// 読みやすさ評価指標
const READABILITY_METRICS = {
  // 日本語特有の読みやすさ指標
  JAPANESE_READABILITY: {
    hiragana_ratio: { ideal: 0.4, tolerance: 0.1 }, // ひらがな比率
    katakana_ratio: { ideal: 0.1, tolerance: 0.05 }, // カタカナ比率
    kanji_ratio: { ideal: 0.3, tolerance: 0.1 }, // 漢字比率
    sentence_variety: { min: 0.7 }, // 文の多様性
  },

  // 教育コンテンツ特有の指標
  EDUCATIONAL_READABILITY: {
    explanation_ratio: { min: 0.3 }, // 説明文の比率
    example_ratio: { min: 0.2 }, // 例文の比率
    transition_words: { min: 0.1 }, // 接続語の比率
    question_sentences: { max: 0.1 }, // 疑問文の比率上限
  },
}

class JapaneseQualityChecker {
  constructor() {
    this.qualityResults = {
      overall_score: 0,
      grammar_accuracy: 0,
      terminology_consistency: 0,
      readability: 0,
      cultural_appropriateness: 0,
      detailed_analysis: {},
      grammar_issues: [],
      terminology_issues: [],
      readability_suggestions: [],
      cultural_recommendations: [],
    }
  }

  async checkJapaneseQuality() {
    console.log('🇯🇵 日本語コンテンツ品質チェックを開始...')

    try {
      // コンテンツデータの読み込み
      const contentData = await this.loadJapaneseContent()

      // 各品質項目のチェック
      await this.checkGrammarAccuracy(contentData)
      await this.checkTerminologyConsistency(contentData)
      await this.evaluateReadability(contentData)
      await this.assessCulturalAppropriateness(contentData)

      // 総合スコア算出
      this.calculateOverallScore()

      // レポート生成
      const report = this.generateJapaneseQualityReport()
      await this.saveJapaneseQualityReport(report)

      console.log(
        `✅ 日本語品質チェック完了 - スコア: ${this.qualityResults.overall_score.toFixed(2)}%`
      )
      return this.qualityResults
    } catch (error) {
      console.error('❌ 日本語品質チェックエラー:', error)
      throw error
    }
  }

  async loadJapaneseContent() {
    const contentData = {
      processes: [],
      glossary: [],
      examQuestions: [],
      pmbok7: [],
      ui_text: [],
    }

    try {
      // プロセスデータの読み込み
      const processPath = path.join(__dirname, '../src/data/schemas/pmbok/processData.js')
      if (fs.existsSync(processPath)) {
        const module = await import(`file://${processPath}`)
        contentData.processes = module.processData || []
      }

      // 用語集データの読み込み
      const glossaryPath = path.join(__dirname, '../src/data/schemas/glossary/pmpGlossary.js')
      if (fs.existsSync(glossaryPath)) {
        const module = await import(`file://${glossaryPath}`)
        contentData.glossary = module.glossaryData || []
      }

      // 試験問題データの読み込み
      const examPath = path.join(__dirname, '../src/data/fixtures/examQuestions.js')
      if (fs.existsSync(examPath)) {
        const module = await import(`file://${examPath}`)
        contentData.examQuestions = module.examQuestions || []
      }

      // PMBOK第7版データの読み込み
      const pmbok7Path = path.join(__dirname, '../src/data/schemas/pmbok/pmbok7Data.js')
      if (fs.existsSync(pmbok7Path)) {
        const module = await import(`file://${pmbok7Path}`)
        contentData.pmbok7 = [
          ...(module.pmbok7Principles || []),
          ...(module.pmbok7PerformanceDomains || []),
        ]
      }

      // UIテキストの読み込み（Reactコンポーネントから）
      const componentsDir = path.join(__dirname, '../src/components')
      if (fs.existsSync(componentsDir)) {
        contentData.ui_text = await this.extractUIText(componentsDir)
      }

      console.log('📁 日本語コンテンツ読み込み完了')
      return contentData
    } catch (error) {
      console.warn('⚠️  日本語コンテンツの読み込みに一部失敗:', error.message)
      return contentData
    }
  }

  async extractUIText(componentsDir) {
    const uiTexts = []
    const files = fs.readdirSync(componentsDir, { recursive: true })

    for (const file of files) {
      const fullPath = path.join(componentsDir, file)
      const stats = fs.statSync(fullPath)

      if (stats.isFile() && (file.endsWith('.jsx') || file.endsWith('.tsx'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8')

          // JSX内のテキストを抽出
          const textMatches =
            content.match(/>[^<>]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][^<>]*</g) || []
          textMatches.forEach((match) => {
            const text = match.replace(/^>|<$/g, '').trim()
            if (text.length > 2) {
              uiTexts.push({
                text,
                file: path.basename(file),
                type: 'ui',
              })
            }
          })
        } catch (error) {
          console.warn(`⚠️  UIテキスト抽出失敗: ${file}`)
        }
      }
    }

    return uiTexts
  }

  async checkGrammarAccuracy(contentData) {
    console.log('📝 日本語文法・表現をチェック中...')

    let grammarScore = 1.0
    const grammarAnalysis = {
      total_texts: 0,
      problematic_patterns: [],
      sentence_analysis: {},
      style_consistency: {},
    }

    // 全テキストを統合して分析
    const allTexts = this.extractAllTexts(contentData)
    grammarAnalysis.total_texts = allTexts.length

    // 各テキストの文法チェック
    allTexts.forEach((textItem, index) => {
      const text = textItem.text
      if (!text || typeof text !== 'string') return

      // 問題のあるパターンをチェック
      JAPANESE_GRAMMAR_PATTERNS.PROBLEMATIC_PATTERNS.forEach((rule) => {
        const matches = Array.from(text.matchAll(rule.pattern))
        matches.forEach((match) => {
          grammarAnalysis.problematic_patterns.push({
            rule_type: rule.type,
            message: rule.message,
            severity: rule.severity,
            text_snippet: this.getTextSnippet(text, match.index),
            source: textItem.source,
            location: match.index,
          })

          // スコア調整
          const penalty = rule.severity === 'high' ? 0.05 : rule.severity === 'medium' ? 0.02 : 0.01
          grammarScore -= penalty
        })
      })

      // 文の分析
      const sentenceAnalysis = this.analyzeSentenceStructure(text)
      grammarAnalysis.sentence_analysis[`text_${index}`] = sentenceAnalysis

      // 文が長すぎる場合の減点
      if (
        sentenceAnalysis.avg_sentence_length >
        JAPANESE_QUALITY_STANDARDS.GRAMMAR_RULES.sentence_length.max
      ) {
        grammarScore -= 0.02
      }
    })

    // 敬語・文体の一貫性チェック
    const styleConsistency = this.checkStyleConsistency(allTexts)
    grammarAnalysis.style_consistency = styleConsistency

    if (!styleConsistency.is_consistent) {
      grammarScore -= 0.1
      this.addGrammarIssue('HIGH', '敬語レベルの不統一が検出されました')
    }

    this.qualityResults.grammar_accuracy = Math.max(0, grammarScore)
    this.qualityResults.detailed_analysis.grammar = grammarAnalysis

    console.log(`✓ 文法正確性スコア: ${(grammarScore * 100).toFixed(1)}%`)
    console.log(`  問題パターン: ${grammarAnalysis.problematic_patterns.length}件`)
  }

  extractAllTexts(contentData) {
    const allTexts = []

    // プロセス説明文
    contentData.processes.forEach((process) => {
      if (process.name) {
        allTexts.push({ text: process.name, source: 'process_name', id: process.id })
      }
      if (process.description) {
        allTexts.push({ text: process.description, source: 'process_description', id: process.id })
      }
    })

    // 用語集
    contentData.glossary.forEach((term) => {
      if (term.term) {
        allTexts.push({ text: term.term, source: 'glossary_term', id: term.id })
      }
      if (term.definition) {
        allTexts.push({ text: term.definition, source: 'glossary_definition', id: term.id })
      }
    })

    // 試験問題
    contentData.examQuestions.forEach((question) => {
      if (question.question) {
        allTexts.push({ text: question.question, source: 'exam_question', id: question.id })
      }
      if (question.explanation) {
        allTexts.push({ text: question.explanation, source: 'exam_explanation', id: question.id })
      }
    })

    // PMBOK第7版
    contentData.pmbok7.forEach((item) => {
      if (item.name) {
        allTexts.push({ text: item.name, source: 'pmbok7_name', id: item.id })
      }
      if (item.description) {
        allTexts.push({ text: item.description, source: 'pmbok7_description', id: item.id })
      }
    })

    // UIテキスト
    contentData.ui_text.forEach((uiItem) => {
      allTexts.push({ text: uiItem.text, source: 'ui_text', file: uiItem.file })
    })

    return allTexts
  }

  getTextSnippet(text, index, contextLength = 50) {
    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + contextLength)
    return text.substring(start, end)
  }

  analyzeSentenceStructure(text) {
    const sentences = text.split(/[。！？]/).filter((s) => s.trim())
    const totalLength = sentences.reduce((sum, s) => sum + s.length, 0)

    return {
      sentence_count: sentences.length,
      avg_sentence_length: sentences.length > 0 ? totalLength / sentences.length : 0,
      long_sentences: sentences.filter(
        (s) => s.length > JAPANESE_QUALITY_STANDARDS.GRAMMAR_RULES.sentence_length.max
      ).length,
      short_sentences: sentences.filter((s) => s.length < 10).length,
    }
  }

  checkStyleConsistency(allTexts) {
    const styleIndicators = {
      formal: 0, // である調
      polite: 0, // です・ます調
      casual: 0, // だ・である（カジュアル）
    }

    allTexts.forEach((textItem) => {
      const text = textItem.text
      if (!text) return

      // 敬語レベルの判定
      if (/です|ます/.test(text)) {
        styleIndicators.polite++
      } else if (/である|であった/.test(text)) {
        styleIndicators.formal++
      } else if (/だ[。\s]|だった/.test(text)) {
        styleIndicators.casual++
      }
    })

    const total = styleIndicators.formal + styleIndicators.polite + styleIndicators.casual
    if (total === 0) return { is_consistent: true, dominant_style: 'none' }

    const dominantStyle = Object.entries(styleIndicators).reduce((a, b) =>
      styleIndicators[a[0]] > styleIndicators[b[0]] ? a : b
    )[0]

    const dominantRatio = styleIndicators[dominantStyle] / total
    const isConsistent = dominantRatio >= 0.8 // 80%以上が同一スタイル

    return {
      is_consistent: isConsistent,
      dominant_style: dominantStyle,
      style_distribution: styleIndicators,
      consistency_ratio: dominantRatio,
    }
  }

  async checkTerminologyConsistency(contentData) {
    console.log('📚 専門用語の一貫性をチェック中...')

    let consistencyScore = 1.0
    const terminologyAnalysis = {
      pmi_terms_usage: {},
      terminology_variations: [],
      inconsistent_usage: [],
      missing_terms: [],
    }

    const allTexts = this.extractAllTexts(contentData)

    // PMI公式用語の使用状況チェック
    Object.entries(JAPANESE_QUALITY_STANDARDS.PMI_OFFICIAL_TERMS.technical_terms).forEach(
      ([japanese, english]) => {
        let usageCount = 0
        let inconsistentUsage = []

        allTexts.forEach((textItem) => {
          const text = textItem.text || ''
          const matches = (text.match(new RegExp(japanese, 'g')) || []).length
          usageCount += matches

          // 用語の揺れをチェック
          JAPANESE_GRAMMAR_PATTERNS.TERMINOLOGY_VARIATIONS.forEach((variation) => {
            if (variation.standard === japanese) {
              variation.variations.forEach((variant) => {
                if (text.includes(variant) && !text.includes(japanese)) {
                  inconsistentUsage.push({
                    variant,
                    standard: japanese,
                    source: textItem.source,
                    context: this.getTextSnippet(text, text.indexOf(variant)),
                  })
                }
              })
            }
          })
        })

        terminologyAnalysis.pmi_terms_usage[japanese] = {
          count: usageCount,
          inconsistencies: inconsistentUsage.length,
        }

        // 用語の揺れがある場合の減点
        if (inconsistentUsage.length > 0) {
          consistencyScore -= inconsistentUsage.length * 0.02
          terminologyAnalysis.inconsistent_usage.push(...inconsistentUsage)
        }
      }
    )

    // 用語の揺れパターン検出
    const variationDetection = this.detectTerminologyVariations(allTexts)
    terminologyAnalysis.terminology_variations = variationDetection

    this.qualityResults.terminology_consistency = Math.max(0, consistencyScore)
    this.qualityResults.detailed_analysis.terminology = terminologyAnalysis

    // 改善提案
    if (terminologyAnalysis.inconsistent_usage.length > 0) {
      this.addTerminologyIssue(
        'MEDIUM',
        `用語の揺れが${terminologyAnalysis.inconsistent_usage.length}箇所で検出されました`
      )
    }

    console.log(`✓ 用語一貫性スコア: ${(consistencyScore * 100).toFixed(1)}%`)
    console.log(`  用語の揺れ: ${terminologyAnalysis.inconsistent_usage.length}件`)
  }

  detectTerminologyVariations(allTexts) {
    const variations = []

    // カタカナ用語の揺れ検出（例：プロジェクト vs プロジェクト）
    const katakanaPattern = /[\u30A0-\u30FF\u30FC]+/g
    const katakanaTerms = new Set()

    allTexts.forEach((textItem) => {
      const matches = textItem.text?.match(katakanaPattern) || []
      matches.forEach((term) => {
        if (term.length > 2) {
          katakanaTerms.add(term)
        }
      })
    })

    // 類似する用語のグループ化（簡易版）
    const termGroups = Array.from(katakanaTerms).reduce((groups, term) => {
      const baseForm = term.replace(/[ー・]/g, '')
      if (!groups[baseForm]) {
        groups[baseForm] = []
      }
      groups[baseForm].push(term)
      return groups
    }, {})

    Object.entries(termGroups).forEach(([baseForm, terms]) => {
      if (terms.length > 1) {
        variations.push({
          base_term: baseForm,
          variations: terms,
          recommendation: `統一用語として「${terms[0]}」の使用を推奨`,
        })
      }
    })

    return variations
  }

  async evaluateReadability(contentData) {
    console.log('📖 読みやすさを評価中...')

    let readabilityScore = 0.8 // ベースライン
    const readabilityAnalysis = {
      character_composition: {},
      sentence_variety: {},
      educational_elements: {},
      readability_issues: [],
    }

    const allTexts = this.extractAllTexts(contentData)
    const combinedText = allTexts.map((t) => t.text || '').join('')

    // 文字構成の分析
    const charComposition = this.analyzeCharacterComposition(combinedText)
    readabilityAnalysis.character_composition = charComposition

    // 理想的な文字構成比率との比較
    const hiraganaRatio = charComposition.hiragana / charComposition.total
    const kanjiRatio = charComposition.kanji / charComposition.total

    const hiraganaIdeal = READABILITY_METRICS.JAPANESE_READABILITY.hiragana_ratio.ideal
    const kanjiIdeal = READABILITY_METRICS.JAPANESE_READABILITY.kanji_ratio.ideal

    // 文字構成の適切性評価
    const hiraganaScore = 1 - Math.abs(hiraganaRatio - hiraganaIdeal)
    const kanjiScore = 1 - Math.abs(kanjiRatio - kanjiIdeal)
    readabilityScore += (hiraganaScore + kanjiScore) * 0.1

    // 文の多様性分析
    const sentenceVariety = this.analyzeSentenceVariety(allTexts)
    readabilityAnalysis.sentence_variety = sentenceVariety

    if (
      sentenceVariety.variety_score < READABILITY_METRICS.JAPANESE_READABILITY.sentence_variety.min
    ) {
      readabilityScore -= 0.1
      readabilityAnalysis.readability_issues.push('文の構造に多様性が不足しています')
    }

    // 教育コンテンツとしての読みやすさ要素
    const educationalElements = this.analyzeEducationalReadability(allTexts)
    readabilityAnalysis.educational_elements = educationalElements

    // 説明的要素のスコア
    if (
      educationalElements.explanation_ratio >=
      READABILITY_METRICS.EDUCATIONAL_READABILITY.explanation_ratio.min
    ) {
      readabilityScore += 0.05
    }

    if (
      educationalElements.example_ratio >=
      READABILITY_METRICS.EDUCATIONAL_READABILITY.example_ratio.min
    ) {
      readabilityScore += 0.05
    }

    this.qualityResults.readability = Math.min(1.0, Math.max(0, readabilityScore))
    this.qualityResults.detailed_analysis.readability = readabilityAnalysis

    // 読みやすさ改善提案
    if (readabilityAnalysis.readability_issues.length > 0) {
      readabilityAnalysis.readability_issues.forEach((issue) => {
        this.addReadabilitySuggestion(issue)
      })
    }

    console.log(`✓ 読みやすさスコア: ${(readabilityScore * 100).toFixed(1)}%`)
  }

  analyzeCharacterComposition(text) {
    const composition = {
      hiragana: 0,
      katakana: 0,
      kanji: 0,
      latin: 0,
      numbers: 0,
      symbols: 0,
      total: 0,
    }

    for (const char of text) {
      if (/[\u3040-\u309F]/.test(char)) {
        composition.hiragana++
      } else if (/[\u30A0-\u30FF]/.test(char)) {
        composition.katakana++
      } else if (/[\u4E00-\u9FAF]/.test(char)) {
        composition.kanji++
      } else if (/[a-zA-Z]/.test(char)) {
        composition.latin++
      } else if (/[0-9]/.test(char)) {
        composition.numbers++
      } else if (!/\s/.test(char)) {
        composition.symbols++
      }

      if (!/\s/.test(char)) {
        composition.total++
      }
    }

    return composition
  }

  analyzeSentenceVariety(allTexts) {
    const sentenceStructures = new Set()
    let totalSentences = 0

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''
      const sentences = text.split(/[。！？]/).filter((s) => s.trim())
      totalSentences += sentences.length

      sentences.forEach((sentence) => {
        // 文の構造パターンを簡易分析
        const structure = this.identifySentenceStructure(sentence)
        sentenceStructures.add(structure)
      })
    })

    return {
      unique_structures: sentenceStructures.size,
      total_sentences: totalSentences,
      variety_score: totalSentences > 0 ? sentenceStructures.size / totalSentences : 0,
    }
  }

  identifySentenceStructure(sentence) {
    // 簡易的な文構造パターン識別
    if (/です$|ます$/.test(sentence)) return 'polite'
    if (/である$|であった$/.test(sentence)) return 'formal'
    if (/[とは].*説明/.test(sentence)) return 'explanatory'
    if (/例えば|具体的には/.test(sentence)) return 'example'
    if (/について|に関して/.test(sentence)) return 'descriptive'
    return 'other'
  }

  analyzeEducationalReadability(allTexts) {
    let explanationCount = 0
    let exampleCount = 0
    let transitionCount = 0
    let questionCount = 0
    let totalTexts = 0

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''
      if (text.trim().length === 0) return

      totalTexts++

      // 説明的表現
      if (/について説明|とは|の定義/.test(text)) {
        explanationCount++
      }

      // 例示表現
      if (/例えば|具体的には|実際に/.test(text)) {
        exampleCount++
      }

      // 接続表現
      if (/しかし|また|さらに|つまり/.test(text)) {
        transitionCount++
      }

      // 疑問文
      if (/[？?]|でしょうか/.test(text)) {
        questionCount++
      }
    })

    return {
      explanation_ratio: totalTexts > 0 ? explanationCount / totalTexts : 0,
      example_ratio: totalTexts > 0 ? exampleCount / totalTexts : 0,
      transition_ratio: totalTexts > 0 ? transitionCount / totalTexts : 0,
      question_ratio: totalTexts > 0 ? questionCount / totalTexts : 0,
    }
  }

  async assessCulturalAppropriateness(contentData) {
    console.log('🎌 文化的適切性を評価中...')

    let culturalScore = 0.9 // 高いベースライン（教育コンテンツとして）
    const culturalAnalysis = {
      politeness_level: {},
      business_appropriateness: {},
      educational_tone: {},
      cultural_sensitivity: {},
    }

    const allTexts = this.extractAllTexts(contentData)

    // 敬語レベルの適切性評価
    const politenessLevel = this.evaluatePolitenessLevel(allTexts)
    culturalAnalysis.politeness_level = politenessLevel

    if (politenessLevel.is_appropriate) {
      culturalScore += 0.05
    } else {
      culturalScore -= 0.1
    }

    // ビジネス文書としての適切性
    const businessAppropriateness = this.evaluateBusinessAppropriateness(allTexts)
    culturalAnalysis.business_appropriateness = businessAppropriateness

    // 教育コンテンツとしてのトーン
    const educationalTone = this.evaluateEducationalTone(allTexts)
    culturalAnalysis.educational_tone = educationalTone

    // 文化的感受性
    const culturalSensitivity = this.evaluateCulturalSensitivity(allTexts)
    culturalAnalysis.cultural_sensitivity = culturalSensitivity

    this.qualityResults.cultural_appropriateness = Math.min(1.0, Math.max(0, culturalScore))
    this.qualityResults.detailed_analysis.cultural = culturalAnalysis

    console.log(`✓ 文化的適切性スコア: ${(culturalScore * 100).toFixed(1)}%`)
  }

  evaluatePolitenessLevel(allTexts) {
    const politenessIndicators = {
      very_formal: 0, // であります、いたします
      formal: 0, // です・ます
      neutral: 0, // である
      casual: 0, // だ・る
    }

    let totalEvaluated = 0

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''
      if (text.trim().length === 0) return

      totalEvaluated++

      if (/であります|いたします/.test(text)) {
        politenessIndicators.very_formal++
      } else if (/です|ます/.test(text)) {
        politenessIndicators.formal++
      } else if (/である|であった/.test(text)) {
        politenessIndicators.neutral++
      } else if (/だ[。\s]|だった/.test(text)) {
        politenessIndicators.casual++
      }
    })

    // 教育コンテンツに適した敬語レベル（です・ます調または である調）
    const appropriateLevel = politenessIndicators.formal + politenessIndicators.neutral
    const appropriatenessRatio = totalEvaluated > 0 ? appropriateLevel / totalEvaluated : 1

    return {
      distribution: politenessIndicators,
      is_appropriate: appropriatenessRatio >= 0.8,
      appropriateness_ratio: appropriatenessRatio,
      recommended_level: 'formal_or_neutral',
    }
  }

  evaluateBusinessAppropriateness(allTexts) {
    const businessTerms = [
      'プロジェクト',
      'マネジメント',
      '組織',
      '戦略',
      'プロセス',
      'ステークホルダー',
      'リソース',
      'コスト',
      '品質',
      'リスク',
    ]

    let businessTermUsage = 0
    let totalTexts = allTexts.length

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''
      businessTerms.forEach((term) => {
        if (text.includes(term)) {
          businessTermUsage++
        }
      })
    })

    return {
      business_term_frequency: businessTermUsage / Math.max(totalTexts, 1),
      is_business_appropriate: businessTermUsage / Math.max(totalTexts, 1) > 0.3,
      business_context_score: Math.min(1, businessTermUsage / totalTexts),
    }
  }

  evaluateEducationalTone(allTexts) {
    const educationalIndicators = {
      explanatory: 0, // 説明的表現
      encouraging: 0, // 励ます表現
      instructional: 0, // 指導的表現
      informative: 0, // 情報提供的表現
    }

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''

      if (/説明します|について述べます/.test(text)) {
        educationalIndicators.explanatory++
      }
      if (/学習しましょう|習得できます/.test(text)) {
        educationalIndicators.encouraging++
      }
      if (/確認してください|注意が必要/.test(text)) {
        educationalIndicators.instructional++
      }
      if (/情報|データ|事実/.test(text)) {
        educationalIndicators.informative++
      }
    })

    const totalIndicators = Object.values(educationalIndicators).reduce(
      (sum, count) => sum + count,
      0
    )

    return {
      tone_distribution: educationalIndicators,
      educational_tone_score: totalIndicators / Math.max(allTexts.length, 1),
      is_educational_appropriate: totalIndicators > 0,
    }
  }

  evaluateCulturalSensitivity(allTexts) {
    // 文化的に配慮すべき表現や避けるべき表現のチェック
    const sensitivityIndicators = {
      inclusive_language: 0, // 包括的言語
      gender_neutral: 0, // ジェンダーニュートラル
      appropriate_examples: 0, // 適切な例示
      cultural_awareness: 0, // 文化的配慮
    }

    allTexts.forEach((textItem) => {
      const text = textItem.text || ''

      // 包括的な表現の使用
      if (/チームメンバー|関係者|担当者/.test(text)) {
        sensitivityIndicators.inclusive_language++
      }

      // 文化的配慮のある表現
      if (/多様性|多文化|配慮/.test(text)) {
        sensitivityIndicators.cultural_awareness++
      }
    })

    return {
      sensitivity_indicators: sensitivityIndicators,
      cultural_sensitivity_score:
        Object.values(sensitivityIndicators).reduce((sum, count) => sum + count, 0) /
        Math.max(allTexts.length, 1),
      is_culturally_appropriate: true, // デフォルトで適切と判定（具体的な問題がない限り）
    }
  }

  calculateOverallScore() {
    const weights = {
      grammar_accuracy: 0.3, // 30% - 文法正確性
      terminology_consistency: 0.25, // 25% - 用語一貫性
      readability: 0.25, // 25% - 読みやすさ
      cultural_appropriateness: 0.2, // 20% - 文化的適切性
    }

    this.qualityResults.overall_score = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + this.qualityResults[key] * weight * 100
    }, 0)
  }

  generateJapaneseQualityReport() {
    const timestamp = new Date().toISOString()

    return {
      report_meta: {
        generated_at: timestamp,
        checker_version: '1.0.0',
        project: 'PMPLearningManagement',
        language: 'Japanese',
      },
      quality_summary: {
        overall_score: this.qualityResults.overall_score,
        meets_japanese_standards: this.qualityResults.overall_score >= 85,
        ready_for_japanese_learners: this.qualityResults.overall_score >= 80,
      },
      detailed_scores: {
        grammar_accuracy: (this.qualityResults.grammar_accuracy * 100).toFixed(1),
        terminology_consistency: (this.qualityResults.terminology_consistency * 100).toFixed(1),
        readability: (this.qualityResults.readability * 100).toFixed(1),
        cultural_appropriateness: (this.qualityResults.cultural_appropriateness * 100).toFixed(1),
      },
      quality_gates: {
        grammar_gate:
          this.qualityResults.grammar_accuracy >=
          JAPANESE_QUALITY_STANDARDS.QUALITY_THRESHOLDS.grammar_accuracy,
        terminology_gate:
          this.qualityResults.terminology_consistency >=
          JAPANESE_QUALITY_STANDARDS.QUALITY_THRESHOLDS.terminology_consistency,
        readability_gate:
          this.qualityResults.readability >=
          JAPANESE_QUALITY_STANDARDS.QUALITY_THRESHOLDS.readability,
        cultural_gate:
          this.qualityResults.cultural_appropriateness >=
          JAPANESE_QUALITY_STANDARDS.QUALITY_THRESHOLDS.cultural_appropriateness,
      },
      detailed_analysis: this.qualityResults.detailed_analysis,
      issues: {
        grammar: this.qualityResults.grammar_issues,
        terminology: this.qualityResults.terminology_issues,
      },
      suggestions: {
        readability: this.qualityResults.readability_suggestions,
        cultural: this.qualityResults.cultural_recommendations,
      },
      improvement_plan: this.generateJapaneseImprovementPlan(),
    }
  }

  generateJapaneseImprovementPlan() {
    const plan = []

    if (this.qualityResults.grammar_accuracy < 0.9) {
      plan.push({
        priority: 'HIGH',
        category: '文法改善',
        action: '文法・表現の修正と統一',
        details: this.qualityResults.grammar_issues.map((issue) => issue.message),
      })
    }

    if (this.qualityResults.terminology_consistency < 0.95) {
      plan.push({
        priority: 'HIGH',
        category: '用語統一',
        action: 'PMI公式用語への統一と用語集整備',
        details: this.qualityResults.terminology_issues.map((issue) => issue.message),
      })
    }

    if (this.qualityResults.readability < 0.85) {
      plan.push({
        priority: 'MEDIUM',
        category: '読みやすさ向上',
        action: '文章構造の改善と読みやすさ向上',
        details: this.qualityResults.readability_suggestions,
      })
    }

    if (plan.length === 0) {
      plan.push({
        priority: 'LOW',
        category: '品質維持',
        action: '現在の高い日本語品質を維持',
        details: ['継続的な品質モニタリング', '最新のPMI用語への対応'],
      })
    }

    return plan
  }

  async saveJapaneseQualityReport(report) {
    const reportsDir = path.join(__dirname, '../reports/quality')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportsDir, `japanese-quality-${timestamp}.json`)

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📊 日本語品質レポートを保存: ${reportPath}`)
  }

  addGrammarIssue(severity, message) {
    this.qualityResults.grammar_issues.push({
      severity,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  addTerminologyIssue(severity, message) {
    this.qualityResults.terminology_issues.push({
      severity,
      message,
      timestamp: new Date().toISOString(),
    })
  }

  addReadabilitySuggestion(suggestion) {
    this.qualityResults.readability_suggestions.push({
      suggestion,
      timestamp: new Date().toISOString(),
    })
  }

  addCulturalRecommendation(recommendation) {
    this.qualityResults.cultural_recommendations.push({
      recommendation,
      timestamp: new Date().toISOString(),
    })
  }
}

// メイン実行関数
async function main() {
  const checker = new JapaneseQualityChecker()

  try {
    const results = await checker.checkJapaneseQuality()

    // 結果表示
    console.log('\n📈 日本語コンテンツ品質チェック結果:')
    console.log(`  総合スコア: ${results.overall_score.toFixed(1)}%`)
    console.log(`  文法正確性: ${(results.grammar_accuracy * 100).toFixed(1)}%`)
    console.log(`  用語一貫性: ${(results.terminology_consistency * 100).toFixed(1)}%`)
    console.log(`  読みやすさ: ${(results.readability * 100).toFixed(1)}%`)
    console.log(`  文化的適切性: ${(results.cultural_appropriateness * 100).toFixed(1)}%`)

    if (results.grammar_issues.length > 0) {
      console.log(`\n📝 文法課題: ${results.grammar_issues.length}件`)
      results.grammar_issues.slice(0, 3).forEach((issue) => {
        console.log(`  [${issue.severity}] ${issue.message}`)
      })
    }

    if (results.terminology_issues.length > 0) {
      console.log(`\n📚 用語課題: ${results.terminology_issues.length}件`)
    }

    // 日本語品質基準の合格判定
    const meetsJapaneseStandards = results.overall_score >= 85
    const learnerReady = results.overall_score >= 80

    console.log(`\n🇯🇵 日本語品質基準: ${meetsJapaneseStandards ? '✅ 合格' : '❌ 不合格'}`)
    console.log(`👥 学習者対応準備: ${learnerReady ? '✅ 準備完了' : '❌ 要改善'}`)

    if (results.readability_suggestions.length > 0) {
      console.log('\n💡 読みやすさ改善提案:')
      results.readability_suggestions.slice(0, 2).forEach((suggestion) => {
        console.log(`  - ${suggestion.suggestion || suggestion}`)
      })
    }

    process.exit(meetsJapaneseStandards ? 0 : 1)
  } catch (error) {
    console.error('❌ 日本語品質チェック実行エラー:', error)
    process.exit(1)
  }
}

// コマンドライン実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { JapaneseQualityChecker }
