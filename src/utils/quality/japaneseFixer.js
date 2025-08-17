/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */
/**
 * 日本語文法修正ルール
 */
const GRAMMAR_RULES = {
  // 重複表現の修正
  duplications: [
    { pattern: /まず最初に/g, replacement: 'まず' },
    { pattern: /一番最初/g, replacement: '最初' },
    { pattern: /一番最後/g, replacement: '最後' },
    { pattern: /各々/g, replacement: 'それぞれ' },
    { pattern: /約([0-9]+)個程度/g, replacement: '約$1個' },
    { pattern: /約([0-9]+)件程度/g, replacement: '約$1件' },
  ],

  // 敬語の統一
  honorifics: [
    { pattern: /です。ます。/g, replacement: 'です。' },
    { pattern: /ください。/g, replacement: 'ください。' },
    { pattern: /致します/g, replacement: 'いたします' },
    { pattern: /頂く/g, replacement: 'いただく' },
    { pattern: /御座います/g, replacement: 'ございます' },
  ],

  // 句読点の正規化
  punctuation: [
    { pattern: /、+/g, replacement: '、' },
    { pattern: /。+/g, replacement: '。' },
    { pattern: /\s+、/g, replacement: '、' },
    { pattern: /\s+。/g, replacement: '。' },
    { pattern: /([、。])\s+/g, replacement: '$1' },
  ],

  // カタカナ表記の統一
  katakana: [
    { pattern: /コンピューター/g, replacement: 'コンピュータ' },
    { pattern: /サーバー/g, replacement: 'サーバ' },
    { pattern: /ユーザー/g, replacement: 'ユーザ' },
    { pattern: /マネージャー/g, replacement: 'マネジャー' },
    { pattern: /マネージメント/g, replacement: 'マネジメント' },
  ],
}

/**
 * PMBOK専門用語の統一辞書
 */
const PMBOK_TERMINOLOGY = {
  // 英語 → 日本語の統一
  'Project Charter': 'プロジェクト憲章',
  'Work Breakdown Structure': 'WBS（作業分解構造）',
  'Critical Path': 'クリティカルパス',
  'Earned Value': 'アーンドバリュー',
  Stakeholder: 'ステークホルダー',
  'Risk Register': 'リスク登録簿',
  'Lessons Learned': '教訓',
  'Change Request': '変更要求',
  Baseline: 'ベースライン',
  Deliverable: '成果物',

  // 日本語表記の統一
  プロジェクトマネージャー: 'プロジェクト・マネジャー',
  プロジェクトマネージメント: 'プロジェクト・マネジメント',
  ステークホルダ: 'ステークホルダー',
  スケジューリング: 'スケジュール作成',
  モニタリング: '監視',
  コントロール: 'コントロール',
}

/**
 * 文法エラーの自動修正
 */
export function fixGrammarErrors(text) {
  let fixedText = text

  // 重複表現の修正
  GRAMMAR_RULES.duplications.forEach((rule) => {
    fixedText = fixedText.replace(rule.pattern, rule.replacement)
  })

  // 助詞の修正
  fixedText = fixParticles(fixedText)

  // 接続詞の修正
  fixedText = fixConjunctions(fixedText)

  return fixedText
}

/**
 * 助詞の修正
 */
function fixParticles(text) {
  const particleRules = [
    // 「は」と「が」の使い分け
    { pattern: /([^。、\s]+)が([^。、\s]+)です/g, check: shouldUseWa },
    // 「を」と「で」の使い分け
    { pattern: /([^。、\s]+)を使用で/g, replacement: '$1を使用して' },
    // 「に」と「へ」の使い分け
    { pattern: /([^。、\s]+)へ行く/g, replacement: '$1に行く' },
  ]

  let fixed = text
  particleRules.forEach((rule) => {
    if (rule.replacement) {
      fixed = fixed.replace(rule.pattern, rule.replacement)
    }
  })

  return fixed
}

/**
 * 「は」を使うべきか判定
 */
function shouldUseWa(match) {
  // 主題を示す場合は「は」を使用
  const topicIndicators = ['について', 'とは', 'という']
  return topicIndicators.some((indicator) => match.includes(indicator))
}

/**
 * 接続詞の修正
 */
function fixConjunctions(text) {
  const conjunctionRules = [
    { pattern: /しかし、/g, replacement: 'ただし、' },
    { pattern: /だが、/g, replacement: 'しかし、' },
    { pattern: /けれども、/g, replacement: 'しかし、' },
    { pattern: /それで、/g, replacement: 'そのため、' },
  ]

  let fixed = text
  conjunctionRules.forEach((rule) => {
    fixed = fixed.replace(rule.pattern, rule.replacement)
  })

  return fixed
}

/**
 * 敬語の統一
 */
export function unifyHonorifics(text) {
  let fixedText = text

  GRAMMAR_RULES.honorifics.forEach((rule) => {
    fixedText = fixedText.replace(rule.pattern, rule.replacement)
  })

  // 文体の統一（です・ます調）
  fixedText = unifyWritingStyle(fixedText)

  return fixedText
}

/**
 * 文体の統一
 */
function unifyWritingStyle(text) {
  // である調→です・ます調への変換
  const styleRules = [
    { pattern: /である。/g, replacement: 'です。' },
    { pattern: /であった。/g, replacement: 'でした。' },
    { pattern: /している。/g, replacement: 'しています。' },
    { pattern: /していた。/g, replacement: 'していました。' },
    { pattern: /する。/g, replacement: 'します。' },
    { pattern: /した。/g, replacement: 'しました。' },
  ]

  let fixed = text
  styleRules.forEach((rule) => {
    fixed = fixed.replace(rule.pattern, rule.replacement)
  })

  return fixed
}

/**
 * 句読点の正規化
 */
export function normalizePunctuation(text) {
  let fixedText = text

  GRAMMAR_RULES.punctuation.forEach((rule) => {
    fixedText = fixedText.replace(rule.pattern, rule.replacement)
  })

  // 括弧の正規化
  fixedText = normalizeBrackets(fixedText)

  return fixedText
}

/**
 * 括弧の正規化
 */
function normalizeBrackets(text) {
  const bracketRules = [
    { pattern: /（([^）]+)）/g, replacement: '（$1）' }, // 全角括弧に統一
    { pattern: /\(([^)]+)\)/g, replacement: '（$1）' }, // 半角→全角
    { pattern: /「([^」]+)」/g, replacement: '「$1」' }, // 鉤括弧の確認
    { pattern: /『([^』]+)』/g, replacement: '『$1』' }, // 二重鉤括弧の確認
  ]

  let fixed = text
  bracketRules.forEach((rule) => {
    fixed = fixed.replace(rule.pattern, rule.replacement)
  })

  return fixed
}

/**
 * カタカナ表記の統一
 */
export function unifyKatakana(text) {
  let fixedText = text

  GRAMMAR_RULES.katakana.forEach((rule) => {
    fixedText = fixedText.replace(rule.pattern, rule.replacement)
  })

  // 長音記号の統一
  fixedText = unifyLongVowelMark(fixedText)

  return fixedText
}

/**
 * 長音記号の統一
 */
function unifyLongVowelMark(text) {
  // 3音以上のカタカナ語の末尾の長音記号を削除
  // const longVowelRules = [{ pattern: /([ァ-ヴ]{3,})ー([^ァ-ヴ]|$)/g, check: shouldRemoveLongVowel }]

  let fixed = text
  // JIS規格に基づく処理
  fixed = fixed.replace(/コンピューター/g, 'コンピュータ')
  fixed = fixed.replace(/プリンター/g, 'プリンタ')
  fixed = fixed.replace(/サーバー/g, 'サーバ')

  return fixed
}

/**
 * 長音記号を削除すべきか判定
 */
function shouldRemoveLongVowel(word) {
  const exceptions = ['データ', 'ユーザー', 'エラー', 'パワー']
  return !exceptions.some((exception) => word.includes(exception))
}

/**
 * PMBOK専門用語の統一
 */
export function unifyPMBOKTerminology(text) {
  let fixedText = text

  Object.entries(PMBOK_TERMINOLOGY).forEach(([original, unified]) => {
    const pattern = new RegExp(original, 'g')
    fixedText = fixedText.replace(pattern, unified)
  })

  return fixedText
}

/**
 * 数字表記の統一
 */
export function unifyNumbers(text) {
  // 算用数字と漢数字の使い分け
  const numberRules = [
    // 基本的に算用数字を使用
    { pattern: /一つ/g, replacement: '1つ' },
    { pattern: /二つ/g, replacement: '2つ' },
    { pattern: /三つ/g, replacement: '3つ' },
    // 慣用句は漢数字を維持
    { pattern: /一般的/g, replacement: '一般的' },
    { pattern: /一部/g, replacement: '一部' },
    { pattern: /一覧/g, replacement: '一覧' },
  ]

  let fixed = text
  numberRules.forEach((rule) => {
    fixed = fixed.replace(rule.pattern, rule.replacement)
  })

  // 半角数字に統一
  fixed = fixed.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))

  return fixed
}

/**
 * 不適切な表現の修正
 */
export function fixInappropriateExpressions(text) {
  const inappropriateRules = [
    { pattern: /問題ない/g, replacement: '問題ありません' },
    { pattern: /大丈夫/g, replacement: '問題ありません' },
    { pattern: /ちゃんと/g, replacement: '適切に' },
    { pattern: /ちょっと/g, replacement: '少し' },
    { pattern: /すごく/g, replacement: '非常に' },
    { pattern: /すごい/g, replacement: '素晴らしい' },
  ]

  let fixed = text
  inappropriateRules.forEach((rule) => {
    fixed = fixed.replace(rule.pattern, rule.replacement)
  })

  return fixed
}

/**
 * 読みやすさの向上
 */
export function improveReadability(text) {
  // 長い文を分割
  let fixed = splitLongSentences(text)

  // 適切な改行を追加
  fixed = addAppropriateLineBreaks(fixed)

  // 箇条書きの整形
  fixed = formatBulletPoints(fixed)

  return fixed
}

/**
 * 長い文を分割
 */
function splitLongSentences(text) {
  const sentences = text.split('。')
  const maxLength = 100 // 100文字以上は長文とみなす

  return sentences
    .map((sentence) => {
      if (sentence.length > maxLength) {
        // 接続助詞で分割
        const splitPoints = ['が、', 'ので、', 'ため、', 'し、']
        for (const point of splitPoints) {
          if (sentence.includes(point)) {
            return sentence.replace(point, `${point.slice(0, -1)}。\n`)
          }
        }
      }
      return sentence
    })
    .join('。')
}

/**
 * 適切な改行を追加
 */
function addAppropriateLineBreaks(text) {
  // 段落の区切りを明確化
  let fixed = text.replace(/。([^」\n])/g, '。\n$1')

  // 見出しの前後に改行
  fixed = fixed.replace(/(#+\s+[^\n]+)/g, '\n$1\n')

  return fixed
}

/**
 * 箇条書きの整形
 */
function formatBulletPoints(text) {
  // 箇条書きのインデントを統一
  let fixed = text.replace(/^[\s]*[・●◆]/gm, '• ')

  // 番号付きリストの整形
  fixed = fixed.replace(/^[\s]*([0-9]+)[.)]/gm, '$1. ')

  return fixed
}

/**
 * 総合的な日本語品質修正
 */
export function fixAllJapaneseIssues(text) {
  let fixedText = text

  // 1. 文法エラーの修正
  fixedText = fixGrammarErrors(fixedText)

  // 2. 敬語の統一
  fixedText = unifyHonorifics(fixedText)

  // 3. 句読点の正規化
  fixedText = normalizePunctuation(fixedText)

  // 4. カタカナ表記の統一
  fixedText = unifyKatakana(fixedText)

  // 5. 専門用語の統一
  fixedText = unifyPMBOKTerminology(fixedText)

  // 6. 数字表記の統一
  fixedText = unifyNumbers(fixedText)

  // 7. 不適切な表現の修正
  fixedText = fixInappropriateExpressions(fixedText)

  // 8. 読みやすさの向上
  fixedText = improveReadability(fixedText)

  return fixedText
}

/**
 * 日本語品質スコアの計算
 */
export function calculateJapaneseQualityScore(text) {
  const issues = {
    grammar: 0,
    punctuation: 0,
    terminology: 0,
    readability: 0,
  }

  // 文法エラーのチェック
  GRAMMAR_RULES.duplications.forEach((rule) => {
    const matches = text.match(rule.pattern)
    if (matches) {
      issues.grammar += matches.length
    }
  })

  // 句読点エラーのチェック
  GRAMMAR_RULES.punctuation.forEach((rule) => {
    const matches = text.match(rule.pattern)
    if (matches) {
      issues.punctuation += matches.length
    }
  })

  // 専門用語の不統一チェック
  Object.keys(PMBOK_TERMINOLOGY).forEach((term) => {
    const pattern = new RegExp(term, 'g')
    const matches = text.match(pattern)
    if (matches) {
      issues.terminology += matches.length
    }
  })

  // 読みやすさのチェック（長文の数）
  const sentences = text.split('。')
  sentences.forEach((sentence) => {
    if (sentence.length > 100) {
      issues.readability++
    }
  })

  // スコア計算（100点満点）
  const totalIssues = Object.values(issues).reduce((sum, count) => sum + count, 0)
  const textLength = text.length
  const issueRate = totalIssues / (textLength / 100) // 100文字あたりの問題数

  // 問題が少ないほど高スコア
  const score = Math.max(0, Math.min(100, 100 - issueRate * 10))

  return {
    score,
    issues,
    totalIssues,
  }
}

export default {
  fixGrammarErrors,
  unifyHonorifics,
  normalizePunctuation,
  unifyKatakana,
  unifyPMBOKTerminology,
  unifyNumbers,
  fixInappropriateExpressions,
  improveReadability,
  fixAllJapaneseIssues,
  calculateJapaneseQualityScore,
}
