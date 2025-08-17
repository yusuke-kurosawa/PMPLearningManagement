/**
 * @file .eslintrc.header.js
 * @description TypeScript専用ヘッダーコメント検証設定
 * @developer Developer 7: セキュリティ・DevOps・インフラ
 * @agent devops-engineer
 * @lastModified 2025-08-17
 */

const headerConfig = require('./.eslintrc.header.json');

module.exports = {
  plugins: ['header'],
  overrides: [
    // Developer 1: 認証・認可システム
    {
      files: headerConfig.developerAgentMapping['Developer 1'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description 認証・認可システム実装',
            ' * @developer Developer 1: 認証・認可システム（RBAC）',
            ' * @agent backend-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @security Critical - 認証フロー',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 2: API・マイクロサービス
    {
      files: headerConfig.developerAgentMapping['Developer 2'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description API・マイクロサービス実装',
            ' * @developer Developer 2: API・マイクロサービス',
            ' * @agent microservices-architect',
            ' * @lastModified YYYY-MM-DD',
            ' * @performance Optimized for scalability',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 3: 決済・サブスクリプション
    {
      files: headerConfig.developerAgentMapping['Developer 3'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description 決済システム統合',
            ' * @developer Developer 3: 決済・サブスクリプション管理',
            ' * @agent backend-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @security Critical - PCI DSS準拠',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 4: UI/UX・ビジュアライゼーション
    {
      files: headerConfig.developerAgentMapping['Developer 4'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description UI/UXコンポーネント実装',
            ' * @developer Developer 4: UI/UX・ビジュアライゼーション',
            ' * @agent frontend-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @performance Lazy-loaded component',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 5: データベース・パフォーマンス
    {
      files: headerConfig.developerAgentMapping['Developer 5'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description データベース層実装',
            ' * @developer Developer 5: データベース・パフォーマンス最適化',
            ' * @agent database-admin',
            ' * @lastModified YYYY-MM-DD',
            ' * @performance Connection pooling enabled',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 6: PWA & Mobile
    {
      files: headerConfig.developerAgentMapping['Developer 6'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description PWA・モバイル機能実装',
            ' * @developer Developer 6: PWA & Mobile Developer',
            ' * @agent mobile-app-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @performance Service Worker optimized',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 7: セキュリティ・DevOps
    {
      files: headerConfig.developerAgentMapping['Developer 7'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description セキュリティ・監視システム実装',
            ' * @developer Developer 7: セキュリティ・DevOps・インフラ',
            ' * @agent devops-engineer',
            ' * @lastModified YYYY-MM-DD',
            ' * @security Production-ready',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 8: 品質保証
    {
      files: headerConfig.developerAgentMapping['Developer 8'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description テストケース実装',
            ' * @developer Developer 8: 品質保証エンジニア',
            ' * @agent qa-expert',
            ' * @lastModified YYYY-MM-DD',
            ' * @module Test Suite',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 9: フロントエンドサービス
    {
      files: headerConfig.developerAgentMapping['Developer 9'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description フロントエンドサービス層実装',
            ' * @developer Developer 9: フロントエンドサービス・状態管理',
            ' * @agent frontend-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @module State Management',
            ' */'
          ],
          2
        ]
      }
    },
    // Developer 10: 学習・教育システム
    {
      files: headerConfig.developerAgentMapping['Developer 10'].paths,
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description 学習管理システム実装',
            ' * @developer Developer 10: 学習・教育システム',
            ' * @agent frontend-developer',
            ' * @lastModified YYYY-MM-DD',
            ' * @module Learning Management',
            ' */'
          ],
          2
        ]
      }
    },
    // デフォルトルール（どのDeveloperにも属さないファイル）
    {
      files: ['src/**/*.{ts,tsx}'],
      excludedFiles: [
        ...headerConfig.developerAgentMapping['Developer 1'].paths,
        ...headerConfig.developerAgentMapping['Developer 2'].paths,
        ...headerConfig.developerAgentMapping['Developer 3'].paths,
        ...headerConfig.developerAgentMapping['Developer 4'].paths,
        ...headerConfig.developerAgentMapping['Developer 5'].paths,
        ...headerConfig.developerAgentMapping['Developer 6'].paths,
        ...headerConfig.developerAgentMapping['Developer 7'].paths,
        ...headerConfig.developerAgentMapping['Developer 8'].paths,
        ...headerConfig.developerAgentMapping['Developer 9'].paths,
        ...headerConfig.developerAgentMapping['Developer 10'].paths
      ],
      rules: {
        'header/header': [
          'error',
          'block',
          [
            '/**',
            ' * @file File path',
            ' * @description Component/Module description',
            ' * @developer Developer Team',
            ' * @agent code-assistant',
            ' * @lastModified YYYY-MM-DD',
            ' */'
          ],
          2
        ]
      }
    }
  ]
};