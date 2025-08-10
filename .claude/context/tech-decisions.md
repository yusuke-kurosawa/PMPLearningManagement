# 技術的決定事項（圧縮版）

*最終更新: 2025-08-10*

## 🏗️ 主要ADR

| 決定事項 | ステータス | 理由 |
|---------|-----------|------|
| **React 18.2** | ✅ 完了 | 大規模エコシステム、パフォーマンス |
| **TypeScript** | 🚧 移行中 | 型安全性、開発体験向上 |
| **tRPC** | ✅ 採用 | E2E型安全性、自動補完 |
| **Prisma ORM** | ✅ 採用 | 型安全クエリ、マイグレーション |
| **GitHub Pages** | ✅ 現行 | コスト削減、2025 Q2にAWS移行 |

## 🛠️ 技術スタック

**フロント**: React 18.2, Vite 5, Tailwind 3, D3.js 7  
**バックエンド**: Node.js 20, tRPC 10, Prisma 5, PostgreSQL 15  
**テスト**: Vitest 1.0, Playwright 1.40, Testing Library 14

## 📋 設計原則

1. **Mobile-First** - モバイルから設計
2. **Component-Based** - 再利用可能コンポーネント
3. **Performance Budget** - 初期ロード <3秒, バンドル <500KB
4. **Security by Design** - ゼロトラスト、最小権限
5. **Accessibility First** - WCAG 2.1 AA準拠

## 🔐 セキュリティ

- **認証**: JWT + Refresh Token（15分/7日）
- **暗号化**: AES-256-GCM（PII、機密データ）
- **通信**: HTTPS必須、HSTS有効

## 🚀 パフォーマンス

**キャッシュ**: ブラウザ→SW→CDN→Redis  
**最適化**: コード分割、WebP/AVIF、Critical CSS、Tree Shaking

## 🔄 インフラ計画

**現在**: GitHub Pages + Actions  
**2025 Q2**: AWS (ECS+ALB, RDS, ElastiCache, CloudFront)

## 📅 今後の検討事項

- **Q2 2025**: AI/ML統合、国際化対応
- **Q3 2025**: マイクロサービス化（認証・決済・通知）

*詳細は個別ADRドキュメントを参照*