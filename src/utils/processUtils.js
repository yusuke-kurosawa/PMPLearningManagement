/**
 * ファイル説明: {description}
 * 開発者: {developer}
 * 専門分野: {specialization}
 * 作成日: {created}
 * 最終更新: {updated}
 * 依存関係: {dependencies}
 * セキュリティレベル: {security_level}
 */ export const generateProcessId = (knowledgeAreaId, processGroup, processIndex) => {
  const groupMap = {
    立上げ: 'initiating',
    計画: 'planning',
    実行: 'executing',
    '監視・コントロール': 'monitoring',
    終結: 'closing',
  }

  return `${knowledgeAreaId}-${groupMap[processGroup]}-${processIndex}`
}

// プロセスIDからプロセス情報を抽出
export const parseProcessId = (processId) => {
  const [knowledgeArea, processGroup, index] = processId.split('-')
  return { knowledgeArea, processGroup, index: parseInt(index) }
}

// 知識エリアの日本語名マッピング
export const knowledgeAreaNames = {
  integration: '統合管理',
  scope: 'スコープ管理',
  schedule: 'スケジュール管理',
  cost: 'コスト管理',
  quality: '品質管理',
  resource: '資源管理',
  communications: 'コミュニケーション管理',
  risk: 'リスク管理',
  procurement: '調達管理',
  stakeholder: 'ステークホルダー管理',
}

// プロセス群の日本語名マッピング
export const processGroupNames = {
  initiating: '立上げ',
  planning: '計画',
  executing: '実行',
  monitoring: '監視・コントロール',
  closing: '終結',
}
