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
 * 画像のalt属性を自動生成・修正
 */
export function fixImageAltText(htmlContent) {
  // img要素のalt属性を修正
  return htmlContent.replace(/<img([^>]*?)(?:alt="")?([^>]*?)>/gi, (match, before, after) => {
    if (match.includes('alt=')) {
      return match // 既にalt属性がある場合はスキップ
    }

    // src属性からファイル名を抽出してalt属性を生成
    const srcMatch = match.match(/src=["']([^"']+)["']/)
    if (srcMatch) {
      const filename = srcMatch[1].split('/').pop().split('.')[0]
      const altText = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
      return `<img${before} alt="${altText}"${after}>`
    }
    return match
  })
}

/**
 * ARIAラベルの自動追加
 */
export function addAriaLabels(component) {
  const ariaRules = {
    button: 'aria-label',
    nav: 'aria-label',
    main: 'role="main"',
    header: 'role="banner"',
    footer: 'role="contentinfo"',
    aside: 'role="complementary"',
  }

  let modifiedComponent = component

  Object.entries(ariaRules).forEach(([element, attribute]) => {
    const regex = new RegExp(`<${element}([^>]*?)>`, 'gi')
    modifiedComponent = modifiedComponent.replace(regex, (match, attrs) => {
      if (!attrs.includes('aria-') && !attrs.includes('role=')) {
        if (attribute.startsWith('aria-label')) {
          return `<${element} ${attribute}="${element} element"${attrs}>`
        } else {
          return `<${element} ${attribute}${attrs}>`
        }
      }
      return match
    })
  })

  return modifiedComponent
}

/**
 * フォーム要素のラベル関連付けを修正
 */
export function fixFormLabels(htmlContent) {
  let idCounter = 1

  // input要素にIDを追加し、対応するlabelを作成
  return htmlContent.replace(/<input([^>]*?)>/gi, (match, attrs) => {
    // type属性を取得
    const typeMatch = attrs.match(/type=["']([^"']+)["']/)
    const type = typeMatch ? typeMatch[1] : 'text'

    // id属性があるか確認
    if (!attrs.includes('id=')) {
      const id = `input-${type}-${idCounter++}`
      const label = generateLabelForInput(type)
      return `<label for="${id}">${label}</label>\n<input id="${id}"${attrs}>`
    }
    return match
  })
}

/**
 * input typeに応じたラベルテキストを生成
 */
function generateLabelForInput(type) {
  const labelMap = {
    text: 'テキスト入力',
    email: 'メールアドレス',
    password: 'パスワード',
    number: '数値',
    tel: '電話番号',
    url: 'URL',
    search: '検索',
    date: '日付',
    time: '時刻',
    checkbox: 'チェックボックス',
    radio: 'ラジオボタン',
  }

  return labelMap[type] || '入力フィールド'
}

/**
 * キーボードナビゲーションの改善
 */
export function improveKeyboardNavigation(component) {
  // tabindexの追加
  const interactiveElements = ['a', 'button', 'input', 'select', 'textarea']
  let modified = component

  interactiveElements.forEach((element) => {
    const regex = new RegExp(`<${element}([^>]*?)>`, 'gi')
    modified = modified.replace(regex, (match, attrs) => {
      if (!attrs.includes('tabindex')) {
        return `<${element} tabindex="0"${attrs}>`
      }
      return match
    })
  })

  return modified
}

/**
 * カラーコントラストの自動修正
 */
export function fixColorContrast(cssContent) {
  const contrastRules = {
    // 低コントラストの色の組み合わせを高コントラストに修正
    '#999': '#595959', // 薄いグレー → 濃いグレー
    '#ccc': '#666666', // 薄いグレー → 中間グレー
    '#ffff00': '#FFD700', // 黄色 → ゴールド
    '#00ff00': '#228B22', // 明るい緑 → フォレストグリーン
  }

  let modifiedCSS = cssContent

  Object.entries(contrastRules).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(oldColor, 'gi')
    modifiedCSS = modifiedCSS.replace(regex, newColor)
  })

  return modifiedCSS
}

/**
 * スキップリンクの追加
 */
export function addSkipLinks(htmlContent) {
  const skipLink = `
    <a href="#main-content" class="skip-link">
      メインコンテンツへスキップ
    </a>
  `

  const skipLinkCSS = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    .skip-link:focus {
      top: 0;
    }
  `

  // body開始タグの直後にスキップリンクを追加
  let modified = htmlContent.replace(/<body([^>]*?)>/i, `<body$1>\n${skipLink}`)

  // main要素にIDを追加
  modified = modified.replace(/<main([^>]*?)>/i, '<main id="main-content"$1>')

  return { html: modified, css: skipLinkCSS }
}

/**
 * ヘッディング階層の修正
 */
export function fixHeadingHierarchy(htmlContent) {
  const headings = []
  const headingRegex = /<h([1-6])([^>]*?)>(.*?)<\/h\1>/gi

  // 現在のヘッディングを収集
  let match
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      fullMatch: match[0],
      attributes: match[2],
      content: match[3],
    })
  }

  // ヘッディング階層を修正
  let modifiedContent = htmlContent
  let previousLevel = 0

  headings.forEach((heading) => {
    if (heading.level - previousLevel > 1) {
      // スキップされたレベルを修正
      const newLevel = previousLevel + 1
      const newHeading = `<h${newLevel}${heading.attributes}>${heading.content}</h${newLevel}>`
      modifiedContent = modifiedContent.replace(heading.fullMatch, newHeading)
      previousLevel = newLevel
    } else {
      previousLevel = heading.level
    }
  })

  return modifiedContent
}

/**
 * フォーカスインジケーターの改善
 */
export function improveFocusIndicators(cssContent) {
  const focusStyles = `
    /* フォーカスインジケーターの改善 */
    *:focus {
      outline: 2px solid #0066cc !important;
      outline-offset: 2px !important;
    }
    
    button:focus,
    a:focus,
    input:focus,
    select:focus,
    textarea:focus {
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.25) !important;
    }
    
    /* キーボードフォーカス時のみ表示 */
    *:focus:not(:focus-visible) {
      outline: none !important;
    }
    
    *:focus-visible {
      outline: 2px solid #0066cc !important;
      outline-offset: 2px !important;
    }
  `

  return cssContent + '\n' + focusStyles
}

/**
 * エラーメッセージのアクセシビリティ改善
 */
export function improveErrorMessages(component) {
  // エラーメッセージにrole="alert"を追加
  return component.replace(
    /<(div|span|p)([^>]*?class=["'][^"']*error[^"']*["'][^>]*?)>/gi,
    '<$1 role="alert"$2>'
  )
}

/**
 * テーブルのアクセシビリティ改善
 */
export function improveTableAccessibility(htmlContent) {
  // caption要素の追加
  let modified = htmlContent.replace(/<table([^>]*?)>/gi, (match, attrs) => {
    if (!htmlContent.includes('<caption>')) {
      return `<table${attrs}>\n  <caption>データテーブル</caption>`
    }
    return match
  })

  // scope属性の追加
  modified = modified.replace(/<th([^>]*?)>/gi, (match, attrs) => {
    if (!attrs.includes('scope=')) {
      return `<th scope="col"${attrs}>`
    }
    return match
  })

  return modified
}

/**
 * 総合的なアクセシビリティ修正
 */
export function fixAllAccessibilityIssues(htmlContent, cssContent = '') {
  let fixedHTML = htmlContent
  let fixedCSS = cssContent

  // HTML修正
  fixedHTML = fixImageAltText(fixedHTML)
  fixedHTML = addAriaLabels(fixedHTML)
  fixedHTML = fixFormLabels(fixedHTML)
  fixedHTML = improveKeyboardNavigation(fixedHTML)
  fixedHTML = fixHeadingHierarchy(fixedHTML)
  fixedHTML = improveErrorMessages(fixedHTML)
  fixedHTML = improveTableAccessibility(fixedHTML)

  // スキップリンクの追加
  const skipLinkResult = addSkipLinks(fixedHTML)
  fixedHTML = skipLinkResult.html
  fixedCSS += skipLinkResult.css

  // CSS修正
  fixedCSS = fixColorContrast(fixedCSS)
  fixedCSS = improveFocusIndicators(fixedCSS)

  return {
    html: fixedHTML,
    css: fixedCSS,
  }
}

export default {
  fixImageAltText,
  addAriaLabels,
  fixFormLabels,
  improveKeyboardNavigation,
  fixColorContrast,
  addSkipLinks,
  fixHeadingHierarchy,
  improveFocusIndicators,
  improveErrorMessages,
  improveTableAccessibility,
  fixAllAccessibilityIssues,
}
