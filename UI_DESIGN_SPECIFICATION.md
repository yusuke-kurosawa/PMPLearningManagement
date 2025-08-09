# PMPLearningManagement UI設計書
## Next.js 14 + TypeScript + Shadcn/ui 移行版

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [デザインシステム](#デザインシステム)
3. [コンポーネントライブラリ](#コンポーネントライブラリ)
4. [レイアウト設計](#レイアウト設計)
5. [画面設計](#画面設計)
6. [既存コンポーネント移行計画](#既存コンポーネント移行計画)
7. [新規画面詳細設計](#新規画面詳細設計)
8. [インタラクション設計](#インタラクション設計)
9. [アクセシビリティ](#アクセシビリティ)
10. [パフォーマンス最適化](#パフォーマンス最適化)
11. [モバイル/PWA対応](#モバイルpwa対応)
12. [ダークモード設計](#ダークモード設計)
13. [国際化（i18n）](#国際化i18n)
14. [フォーム設計](#フォーム設計)
15. [データ視覚化](#データ視覚化)
16. [テスト戦略](#テスト戦略)

---

## 🎯 プロジェクト概要

### 現状分析
- **既存実装**: React 18 + Vite + Tailwind CSS
- **コンポーネント数**: 30+（実装済み）
- **主要機能**: PMBOKマトリックス、D3.js視覚化、学習機能
- **移行対象**: Next.js 14 App Router + TypeScript

### 移行目標
- **Phase 1 (MVP - 3ヶ月)**: 認証・決済・基本機能移行
- **Phase 2 (4-6ヶ月)**: AI機能・コラボレーション・分析機能
- **技術スタック**: Next.js 14 + TypeScript + Shadcn/ui + Zustand

---

## 🎨 デザインシステム

### デザイン原則

#### 1. 継続性（Continuity）
既存ユーザーの学習体験を中断させない一貫したデザイン

#### 2. 効率性（Efficiency）
情報密度と可読性のバランスを重視した効率的なUI

#### 3. アクセシビリティ（Accessibility）
WCAG 2.1 AA準拠の包括的なユーザビリティ

#### 4. 拡張性（Scalability）
将来的な機能追加に柔軟に対応できる設計

### カラーパレット

```typescript
// colors.ts
export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // メインプライマリ
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Semantic Colors
  semantic: {
    success: {
      light: '#10b981',
      main: '#059669',
      dark: '#047857'
    },
    warning: {
      light: '#f59e0b',
      main: '#d97706',
      dark: '#b45309'
    },
    error: {
      light: '#ef4444',
      main: '#dc2626',
      dark: '#b91c1c'
    },
    info: {
      light: '#06b6d4',
      main: '#0891b2',
      dark: '#0e7490'
    }
  },
  
  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Dark Mode Colors
  dark: {
    background: '#0a0a0a',
    surface: '#111111',
    card: '#1a1a1a',
    border: '#262626',
    input: '#171717',
    primary: '#3b82f6',
    secondary: '#64748b',
    muted: '#525252',
    accent: '#8b5cf6',
    destructive: '#ef4444'
  }
} as const;
```

### タイポグラフィ

```typescript
// typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }]
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
} as const;
```

### スペーシングシステム

```typescript
// spacing.ts
export const spacing = {
  0: '0px',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  40: '10rem',     // 160px
  48: '12rem',     // 192px
  56: '14rem',     // 224px
  64: '16rem'      // 256px
} as const;
```

### グリッドシステム

```typescript
// grid.ts
export const grid = {
  container: {
    center: true,
    padding: '1rem',
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px'
    }
  },
  
  columns: 12,
  
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const;
```

### ブレークポイント戦略

```scss
// Mobile First Approach
.responsive-component {
  // Mobile (xs): 0-639px
  @apply text-sm p-4;
  
  // Tablet (sm): 640px+
  @screen sm {
    @apply text-base p-6;
  }
  
  // Desktop (md): 768px+
  @screen md {
    @apply text-lg p-8;
  }
  
  // Large Desktop (lg): 1024px+
  @screen lg {
    @apply text-xl p-10;
  }
  
  // Extra Large (xl): 1280px+
  @screen xl {
    @apply text-2xl p-12;
  }
}
```

---

## 🧩 コンポーネントライブラリ

### 基本コンポーネント

#### Button
```tsx
// components/ui/Button.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
```

#### Input
```tsx
// components/ui/Input.tsx
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
```

#### Card
```tsx
// components/ui/Card.tsx
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### 複合コンポーネント

#### Navigation
```tsx
// components/layout/Navigation.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Grid, 
  Network, 
  Layers, 
  Sparkles,
  BookOpen,
  TrendingUp,
  Brain,
  GraduationCap,
  Users,
  Database,
  Menu,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: 'new' | 'beta';
}

const navItems: NavItem[] = [
  { href: '/', label: 'ホーム', icon: Home },
  { href: '/matrix', label: 'マトリックス', icon: Grid },
  { href: '/network', label: 'ネットワーク', icon: Network },
  { href: '/integrated', label: '統合ビュー', icon: Layers },
  { href: '/visualizations', label: 'ビジュアライゼーション', icon: Sparkles, badge: 'new' },
  { href: '/glossary', label: '用語集', icon: BookOpen },
  { href: '/progress', label: '学習進捗', icon: TrendingUp },
  { href: '/flashcards', label: 'フラッシュカード', icon: Brain },
  { href: '/mock-exam', label: '模擬試験', icon: GraduationCap },
  { href: '/collaboration', label: 'コラボレーション', icon: Users, badge: 'beta' },
  { href: '/data', label: 'データ管理', icon: Database }
];

export function Navigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              PMBOK学習システム
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="relative h-9 px-3"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white items-center justify-center">
                      {item.badge === 'new' ? 'N' : 'β'}
                    </span>
                  </span>
                )}
              </Button>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t bg-background"
        >
          <div className="container py-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  router.push(item.href);
                  setIsMobileOpen(false);
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-500 text-white rounded">
                    {item.badge.toUpperCase()}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
```

### 特殊コンポーネント

#### DataVisualization
```tsx
// components/visualization/DataVisualization.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface DataPoint {
  id: string;
  name: string;
  value: number;
  category: string;
  connections?: string[];
}

interface DataVisualizationProps {
  data: DataPoint[];
  type: 'network' | 'heatmap' | 'sankey' | 'matrix';
  width?: number;
  height?: number;
  interactive?: boolean;
  exportable?: boolean;
  className?: string;
}

export function DataVisualization({
  data,
  type,
  width = 800,
  height = 600,
  interactive = true,
  exportable = true,
  className
}: DataVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoom, setZoom] = useState(1);

  const processedData = useMemo(() => {
    // データの前処理
    return data.map(d => ({
      ...d,
      x: Math.random() * width,
      y: Math.random() * height
    }));
  }, [data, width, height]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 可視化の実装
    switch (type) {
      case 'network':
        renderNetworkGraph(svg, processedData, width, height);
        break;
      case 'heatmap':
        renderHeatmap(svg, processedData, width, height);
        break;
      case 'matrix':
        renderMatrix(svg, processedData, width, height);
        break;
      default:
        break;
    }
  }, [processedData, type, width, height, zoom]);

  const handleExport = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `visualization-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>データ視覚化</CardTitle>
        {exportable && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative overflow-hidden border rounded-lg">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            className="bg-background"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ヘルパー関数
function renderNetworkGraph(svg: any, data: any[], width: number, height: number) {
  // D3.js ネットワークグラフの実装
  const simulation = d3.forceSimulation(data)
    .force("link", d3.forceLink().id((d: any) => d.id))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // ノードの描画
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("r", 8)
    .attr("fill", "#3b82f6")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // ラベルの描画
  svg.selectAll("text")
    .data(data)
    .enter().append("text")
    .text((d: any) => d.name)
    .attr("font-size", 12)
    .attr("text-anchor", "middle");

  simulation.on("tick", () => {
    svg.selectAll("circle")
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
    
    svg.selectAll("text")
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y + 4);
  });

  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

function renderHeatmap(svg: any, data: any[], width: number, height: number) {
  // ヒートマップの実装
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain(d3.extent(data, (d: any) => d.value));

  // グリッドの計算
  const gridSize = Math.ceil(Math.sqrt(data.length));
  const cellSize = Math.min(width, height) / gridSize;

  svg.selectAll("rect")
    .data(data)
    .enter().append("rect")
    .attr("x", (d: any, i: number) => (i % gridSize) * cellSize)
    .attr("y", (d: any, i: number) => Math.floor(i / gridSize) * cellSize)
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr("fill", (d: any) => colorScale(d.value))
    .on("mouseover", function(event: any, d: any) {
      // ツールチップ表示
      d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
    })
    .on("mouseout", function() {
      d3.select(this).attr("stroke", null);
    });
}

function renderMatrix(svg: any, data: any[], width: number, height: number) {
  // マトリックス視覚化の実装
  // PMBOKマトリックス用の特別な実装
}
```

---

## 🎯 レイアウト設計

### アプリケーションシェル

```tsx
// app/layout.tsx
import { Inter, Noto_Sans_JP } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansJP.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 md:px-8 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  © 2024 PMBOK学習システム. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### ナビゲーション構造

```typescript
// types/navigation.ts
export interface NavigationItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: 'new' | 'beta' | 'pro';
  children?: NavigationItem[];
  requiresAuth?: boolean;
  requiresPro?: boolean;
}

export const navigationConfig: NavigationItem[] = [
  {
    title: 'ダッシュボード',
    href: '/dashboard',
    icon: Home,
    requiresAuth: true
  },
  {
    title: '学習',
    href: '/learning',
    icon: BookOpen,
    children: [
      {
        title: 'PMBOKマトリックス',
        href: '/learning/matrix',
        icon: Grid
      },
      {
        title: 'ネットワーク図',
        href: '/learning/network',
        icon: Network
      },
      {
        title: 'フラッシュカード',
        href: '/learning/flashcards',
        icon: Brain
      }
    ]
  },
  {
    title: '試験対策',
    href: '/exam',
    icon: GraduationCap,
    children: [
      {
        title: '模擬試験',
        href: '/exam/mock',
        icon: FileText
      },
      {
        title: '問題集',
        href: '/exam/questions',
        icon: HelpCircle
      }
    ]
  },
  {
    title: '分析',
    href: '/analytics',
    icon: BarChart3,
    badge: 'pro',
    requiresPro: true
  },
  {
    title: 'コラボレーション',
    href: '/collaboration',
    icon: Users,
    badge: 'beta'
  }
];
```

### レスポンシブ戦略

```scss
// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer utilities {
  /* Responsive Typography */
  .text-responsive-xs { @apply text-xs sm:text-sm; }
  .text-responsive-sm { @apply text-sm sm:text-base; }
  .text-responsive-base { @apply text-base sm:text-lg; }
  .text-responsive-lg { @apply text-lg sm:text-xl; }
  .text-responsive-xl { @apply text-xl sm:text-2xl; }

  /* Responsive Spacing */
  .p-responsive { @apply p-4 sm:p-6 lg:p-8; }
  .px-responsive { @apply px-4 sm:px-6 lg:px-8; }
  .py-responsive { @apply py-4 sm:py-6 lg:py-8; }
  
  /* Layout Utilities */
  .container-responsive { 
    @apply container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl; 
  }
  
  /* Mobile-First Grid */
  .grid-responsive {
    @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
  }
}
```

---

## 📱 画面設計

### 画面一覧とフロー

```typescript
// types/pages.ts
export interface PageConfig {
  path: string;
  title: string;
  description: string;
  layout: 'default' | 'auth' | 'minimal' | 'dashboard';
  requiresAuth?: boolean;
  requiresPro?: boolean;
  metadata: {
    title: string;
    description: string;
    keywords?: string[];
  };
}

export const pageConfigs: PageConfig[] = [
  // パブリックページ
  {
    path: '/',
    title: 'ホーム',
    description: 'PMBOK学習システムのメインページ',
    layout: 'default',
    metadata: {
      title: 'PMBOK学習システム - 効率的なプロジェクトマネジメント学習',
      description: 'PMBOKガイドの包括的な学習プラットフォーム'
    }
  },
  
  // 認証ページ
  {
    path: '/auth/signin',
    title: 'ログイン',
    description: 'アカウントにログイン',
    layout: 'auth',
    metadata: {
      title: 'ログイン - PMBOK学習システム',
      description: 'アカウントにログインして学習を開始'
    }
  },
  {
    path: '/auth/signup',
    title: 'アカウント作成',
    description: '新規アカウントを作成',
    layout: 'auth',
    metadata: {
      title: 'アカウント作成 - PMBOK学習システム',
      description: '無料アカウントを作成して学習を始める'
    }
  },
  
  // 学習ページ
  {
    path: '/dashboard',
    title: 'ダッシュボード',
    description: '学習の進捗と統計',
    layout: 'dashboard',
    requiresAuth: true,
    metadata: {
      title: 'ダッシュボード - PMBOK学習システム',
      description: '学習進捗と成果を確認'
    }
  },
  {
    path: '/learning/matrix',
    title: 'PMBOKマトリックス',
    description: '49のプロセスをマトリックス表示',
    layout: 'default',
    requiresAuth: true,
    metadata: {
      title: 'PMBOKマトリックス - PMBOK学習システム',
      description: '知識エリアとプロセス群の対話型マトリックス'
    }
  },
  
  // プレミアム機能
  {
    path: '/analytics',
    title: '詳細分析',
    description: '学習データの詳細分析',
    layout: 'dashboard',
    requiresAuth: true,
    requiresPro: true,
    metadata: {
      title: '詳細分析 - PMBOK学習システム Pro',
      description: 'AIによる学習分析とレコメンデーション'
    }
  }
];
```

### ワイヤーフレーム設計

#### ダッシュボードページ
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LearningProgress } from '@/components/dashboard/LearningProgress';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingExams } from '@/components/dashboard/UpcomingExams';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <div className="container-responsive py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">学習の進捗と成果を確認しましょう</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <DashboardStats />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <LearningProgress />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentActivity />
          </Suspense>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          <Suspense fallback={<LoadingSpinner />}>
            <QuickActions />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <UpcomingExams />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

#### 学習ページテンプレート
```tsx
// components/layout/LearningLayout.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChevronLeft, ChevronRight, BookmarkPlus } from 'lucide-react';

interface LearningLayoutProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onBookmark?: () => void;
  sidebar?: React.ReactNode;
}

export function LearningLayout({
  title,
  currentStep,
  totalSteps,
  children,
  onNext,
  onPrevious,
  onBookmark,
  sidebar
}: LearningLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex h-screen bg-background">
      {/* サイドバー */}
      {sidebar && (
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen}>
          {sidebar}
        </Sidebar>
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* ヘッダー */}
        <header className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                ステップ {currentStep} / {totalSteps}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onBookmark}>
                <BookmarkPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* プログレスバー */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </header>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        {/* フッター */}
        <footer className="border-t px-6 py-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              前へ
            </Button>
            <Button
              onClick={onNext}
              disabled={currentStep === totalSteps}
            >
              次へ
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
```

---

## 🔄 既存コンポーネント移行計画

### Phase 1: 基盤コンポーネント（1ヶ月）

#### 優先度 High - 即座移行
1. **Navigation.jsx** → `components/layout/Navigation.tsx`
   - Shadcn/ui Button, DropdownMenuに移行
   - TypeScript型定義追加
   - Framer Motionアニメーション統合

2. **ThemeContext.jsx** → `providers/ThemeProvider.tsx`
   - next-themes統合
   - Zustand状態管理に移行
   - カスタマイズパネル機能統合

3. **Home.jsx** → `app/page.tsx`
   - App Routerレイアウト適用
   - Hero Section, Feature Cards分割
   - SEOメタデータ追加

#### 移行戦略
```tsx
// 移行例: Navigation.jsx → Navigation.tsx
// Before: React Router + 直接的なstate管理
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

// After: Next.js + TypeScript + Shadcn/ui
interface NavigationProps {
  user?: User;
  pathname?: string;
}

export function Navigation({ user, pathname }: NavigationProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
```

### Phase 2: 学習機能コンポーネント（2-3ヶ月）

#### 優先度 High - 機能保持必須
1. **PMBOKMatrix.jsx** → `components/learning/PMBOKMatrix.tsx`
   ```typescript
   // 移行内容
   interface PMBOKProcess {
     id: string;
     name: string;
     knowledgeArea: KnowledgeArea;
     processGroup: ProcessGroup;
     inputs: string[];
     tools: string[];
     outputs: string[];
   }
   
   interface PMBOKMatrixProps {
     processes: PMBOKProcess[];
     selectedProcess?: string;
     onProcessSelect: (processId: string) => void;
     filterBy?: 'knowledgeArea' | 'processGroup';
     searchQuery?: string;
   }
   ```

2. **FlashCardLearning.jsx** → `components/learning/FlashCardLearning.tsx`
   ```typescript
   // Framer Motion + Shadcn/ui統合
   interface FlashCard {
     id: string;
     question: string;
     answer: string;
     difficulty: 'easy' | 'medium' | 'hard';
     category: string;
     tags: string[];
   }
   
   // 3Dフリップアニメーション保持
   const cardVariants = {
     front: { rotateY: 0 },
     back: { rotateY: 180 }
   };
   ```

3. **MockExam.jsx** → `components/exam/MockExam.tsx`
   ```typescript
   // タイマー機能、結果分析機能保持
   interface ExamQuestion {
     id: string;
     text: string;
     options: string[];
     correctAnswer: number;
     explanation: string;
     knowledgeArea: string;
     difficulty: number;
   }
   
   interface ExamSession {
     id: string;
     startTime: Date;
     endTime?: Date;
     questions: ExamQuestion[];
     answers: Record<string, number>;
     timeRemaining: number;
     isCompleted: boolean;
   }
   ```

### Phase 3: 視覚化コンポーネント（3-4ヶ月）

#### D3.js統合戦略
```typescript
// components/visualization/D3Wrapper.tsx
interface D3WrapperProps<T> {
  data: T[];
  renderFunction: (svg: Selection<SVGSVGElement, unknown, null, undefined>, data: T[]) => void;
  width: number;
  height: number;
  dependencies?: any[];
}

export function D3Wrapper<T>({ 
  data, 
  renderFunction, 
  width, 
  height, 
  dependencies = [] 
}: D3WrapperProps<T>) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    renderFunction(svg, data);
  }, [data, renderFunction, width, height, ...dependencies]);
  
  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      className="bg-background border rounded-lg"
    />
  );
}
```

#### 移行対象コンポーネント
1. **ITTOForceGraph.jsx** → `components/visualization/NetworkGraph.tsx`
2. **SankeyDiagram.jsx** → `components/visualization/SankeyChart.tsx`
3. **EnhancedNetworkGraph.jsx** → `components/visualization/EnhancedNetwork.tsx`
4. **ProcessHeatmap.jsx** → `components/visualization/Heatmap.tsx`

### 移行優先順位マトリックス

| コンポーネント | 優先度 | 複雑度 | 依存関係 | 移行期間 |
|---------------|--------|---------|----------|----------|
| Navigation | High | Low | Theme | 1週間 |
| ThemeContext | High | Medium | All | 1週間 |
| PMBOKMatrix | High | High | Data | 3週間 |
| MockExam | High | High | Timer, Analytics | 4週間 |
| D3 Charts | Medium | Very High | D3.js, Data | 6週間 |
| FlashCard | Medium | Medium | Animation | 2週間 |

### リファクタリング方針

#### 1. TypeScript型安全性
```typescript
// Before: prop-types
Navigation.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object
};

// After: TypeScript interfaces
interface NavigationProps {
  isAuthenticated: boolean;
  user: User | null;
}
```

#### 2. 状態管理統合
```typescript
// Before: React Context + useState
const ThemeContext = createContext();

// After: Zustand + TypeScript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'sm' | 'md' | 'lg';
  setTheme: (theme: ThemeState['theme']) => void;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: 'system',
  primaryColor: 'blue',
  fontSize: 'md',
  setTheme: (theme) => set({ theme }),
  setPrimaryColor: (primaryColor) => set({ primaryColor })
}));
```

#### 3. パフォーマンス最適化
```typescript
// メモ化戦略
const PMBOKMatrix = React.memo(function PMBOKMatrix({ 
  processes, 
  selectedProcess 
}: PMBOKMatrixProps) {
  const filteredProcesses = useMemo(() => 
    processes.filter(/* フィルタロジック */), 
    [processes, filters]
  );
  
  // 仮想化リスト（大量データ対応）
  const { virtualItems, totalSize } = useVirtualizer({
    count: filteredProcesses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  });
});
```

---

## 🆕 新規画面詳細設計

### 認証フロー

#### ログイン画面
```tsx
// app/auth/signin/page.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Icons } from '@/components/ui/Icons';

const signinSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください')
});

type SigninForm = z.infer<typeof signinSchema>;

export default function SigninPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: SigninForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('認証に失敗しました');
      }
      
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <CardHeader className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <CardTitle className="text-2xl font-semibold tracking-tight">
            アカウントにログイン
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            メールアドレスとパスワードを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  {...form.register('email')}
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="px-1 text-xs text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  {...form.register('password')}
                  id="password"
                  placeholder="パスワード"
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="px-1 text-xs text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button disabled={isLoading}>
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                ログイン
              </Button>
            </div>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">または</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={isLoading}>
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" disabled={isLoading}>
              <Icons.github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### オンボーディングフロー

```tsx
// components/onboarding/OnboardingWizard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

interface OnboardingStepProps {
  onNext: () => void;
  onSkip?: () => void;
  data: Record<string, any>;
  updateData: (data: Record<string, any>) => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'PMBOK学習システムへようこそ',
    description: '効率的な学習のための初期設定を行いましょう',
    component: WelcomeStep
  },
  {
    id: 'profile',
    title: 'プロフィール設定',
    description: 'あなたの学習目標と経験レベルを教えてください',
    component: ProfileStep
  },
  {
    id: 'preferences',
    title: '学習設定',
    description: '学習スタイルと通知設定をカスタマイズしましょう',
    component: PreferencesStep
  },
  {
    id: 'goals',
    title: '学習目標設定',
    description: 'PMP試験に向けた学習計画を立てましょう',
    component: GoalsStep
  },
  {
    id: 'completion',
    title: '設定完了',
    description: '準備が完了しました。学習を始めましょう！',
    component: CompletionStep
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const step = onboardingSteps[currentStep];

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateData = (data: Record<string, any>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              ステップ {currentStep + 1} / {onboardingSteps.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% 完了
            </div>
          </div>
          <Progress value={progress} className="mb-6" />
          <CardTitle className="text-2xl">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <step.component
                onNext={handleNext}
                data={onboardingData}
                updateData={updateData}
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            
            {currentStep === onboardingSteps.length - 1 ? (
              <Button onClick={() => window.location.href = '/dashboard'}>
                学習を始める
              </Button>
            ) : (
              <Button onClick={handleNext}>
                次へ
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// オンボーディングステップコンポーネントの例
function ProfileStep({ onNext, data, updateData }: OnboardingStepProps) {
  const [profile, setProfile] = useState({
    experience: data.experience || '',
    goal: data.goal || '',
    studyTime: data.studyTime || ''
  });

  const handleSubmit = () => {
    updateData(profile);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="experience">プロジェクトマネジメント経験</Label>
        <Select value={profile.experience} onValueChange={(value) => 
          setProfile(prev => ({ ...prev, experience: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="経験レベルを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">初心者（0-2年）</SelectItem>
            <SelectItem value="intermediate">中級者（3-5年）</SelectItem>
            <SelectItem value="advanced">上級者（6年以上）</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="goal">学習目標</Label>
        <Select value={profile.goal} onValueChange={(value) => 
          setProfile(prev => ({ ...prev, goal: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="目標を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pmp-exam">PMP試験合格</SelectItem>
            <SelectItem value="knowledge-improvement">知識向上</SelectItem>
            <SelectItem value="career-advancement">キャリアアップ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="studyTime">1日の学習時間目安</Label>
        <Select value={profile.studyTime} onValueChange={(value) => 
          setProfile(prev => ({ ...prev, studyTime: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="学習時間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30min">30分</SelectItem>
            <SelectItem value="1hour">1時間</SelectItem>
            <SelectItem value="2hours">2時間</SelectItem>
            <SelectItem value="3hours">3時間以上</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={!profile.experience || !profile.goal || !profile.studyTime}
      >
        次へ進む
      </Button>
    </div>
  );
}
```

### 決済フロー

```tsx
// components/billing/PricingPlans.tsx
import { useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  popular?: boolean;
  cta: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'フリー',
    description: '基本的な学習機能',
    price: { monthly: 0, yearly: 0 },
    features: [
      'PMBOKマトリックス表示',
      '基本的な用語集',
      'フラッシュカード（制限あり）',
      '学習進捗の基本統計',
      'コミュニティサポート'
    ],
    cta: '無料で始める'
  },
  {
    id: 'pro',
    name: 'プロ',
    description: '本格的な試験対策',
    price: { monthly: 2980, yearly: 29800 },
    features: [
      'すべての学習機能',
      '無制限フラッシュカード',
      '模擬試験（月10回）',
      '詳細な学習分析',
      'エクスポート機能',
      'プライオリティサポート'
    ],
    popular: true,
    cta: 'プロを始める'
  },
  {
    id: 'premium',
    name: 'プレミアム',
    description: 'AI学習アシスタント付き',
    price: { monthly: 4980, yearly: 49800 },
    features: [
      'プロのすべての機能',
      'AI学習アシスタント',
      '無制限模擬試験',
      'パーソナライズされた学習計画',
      'ライブセッション参加',
      '1対1メンタリング（月1回）',
      '優先カスタマーサポート'
    ],
    cta: 'プレミアムを始める'
  }
];

export function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">あなたに最適なプランを選択</h2>
        <p className="text-lg text-muted-foreground mb-8">
          PMP試験合格に向けた最適な学習環境を提供します
        </p>
        
        {/* 課金周期切り替え */}
        <div className="inline-flex items-center p-1 bg-muted rounded-lg">
          <Button
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('monthly')}
          >
            月額
          </Button>
          <Button
            variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingCycle('yearly')}
          >
            年額
            <Badge variant="secondary" className="ml-2">17%割引</Badge>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-3 py-1 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  人気
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {plan.name}
                {plan.id === 'premium' && <Zap className="w-5 h-5 text-yellow-500" />}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  ¥{plan.price[billingCycle].toLocaleString()}
                </span>
                {plan.price[billingCycle] > 0 && (
                  <span className="text-muted-foreground">
                    /{billingCycle === 'monthly' ? '月' : '年'}
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePlanSelect(plan.id, billingCycle)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎭 インタラクション設計

### マイクロインタラクション

```tsx
// components/ui/InteractiveButton.tsx
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './Button';

interface InteractiveButtonProps extends ButtonProps {
  haptic?: boolean;
  successState?: boolean;
  loadingState?: boolean;
}

export function InteractiveButton({ 
  children, 
  haptic = true,
  successState = false,
  loadingState = false,
  onClick,
  ...props 
}: InteractiveButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // ハプティックフィードバック
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // リップル効果
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    onClick?.(e);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={handleClick}
        className="relative overflow-hidden"
        {...props}
      >
        <motion.div
          animate={loadingState ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: loadingState ? Infinity : 0 }}
        >
          {successState ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              ✓
            </motion.div>
          ) : (
            children
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
}
```

### アニメーション戦略

```typescript
// utils/animations.ts
import { Variants } from 'framer-motion';

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const slideInFromLeft: Variants = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const scaleIn: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const cardHover: Variants = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: { duration: 0.2 }
  }
};

// 使用例
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={scaleIn}
      whileHover="hover"
      custom={cardHover}
      className="bg-card rounded-lg p-6 shadow-sm"
    >
      {children}
    </motion.div>
  );
}
```

### ローディング状態

```tsx
// components/ui/LoadingStates.tsx
import { motion } from 'framer-motion';
import { Skeleton } from './Skeleton';

// スピナーローディング
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`border-2 border-primary border-t-transparent rounded-full ${sizeClasses[size]}`}
    />
  );
}

// プログレスローディング
export function ProgressLoader({ progress, label }: { progress: number; label?: string }) {
  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="w-full bg-secondary rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
    </div>
  );
}

// スケルトンローディング
export function ContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

// データローディング用高次コンポーネント
export function withLoading<T extends object>(
  Component: React.ComponentType<T>,
  LoadingComponent = ContentSkeleton
) {
  return function LoadingWrapper(props: T & { isLoading?: boolean }) {
    const { isLoading, ...componentProps } = props;
    
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <Component {...(componentProps as T)} />;
  };
}
```

### エラーハンドリング

```tsx
// components/ui/ErrorBoundary.tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // エラーレポートサービスに送信
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              エラーが発生しました
            </CardTitle>
            <CardDescription>
              申し訳ございません。予期しないエラーが発生しました。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  エラー詳細を表示
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {this.state.error?.message}
                </pre>
              </details>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ページを再読み込み
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// エラーフォールバックコンポーネント
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">何かが間違っています</CardTitle>
          <CardDescription>
            {error.message || '予期しないエラーが発生しました'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetError} variant="outline" className="w-full">
            再試行
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### トースト通知システム

```tsx
// components/ui/Toast.tsx
import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
    });
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 5000,
    });
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />,
      duration: 4000,
    });
  },

  // カスタムアクション付きトースト
  action: (
    message: string, 
    actionLabel: string, 
    action: () => void,
    description?: string
  ) => {
    sonnerToast(message, {
      description,
      action: {
        label: actionLabel,
        onClick: action,
      },
      duration: 8000,
    });
  },

  // プロミス状態に応じたトースト
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  }
};

// 使用例
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    // バルクアクション用
    showBulkSuccess: (count: number, action: string) => {
      toast.success(`${count}件の${action}が完了しました`, 'すべての操作が正常に実行されました');
    },
    
    // 学習機能専用
    showLearningProgress: (progress: number) => {
      if (progress === 100) {
        toast.success('学習完了！', '素晴らしい！すべてのセクションを完了しました 🎉');
      } else {
        toast.info(`学習進捗: ${progress}%`, '順調に進んでいます！');
      }
    },
    
    // 試験関連
    showExamResult: (score: number, passed: boolean) => {
      if (passed) {
        toast.success(`試験合格！スコア: ${score}点`, 'おめでとうございます！🎉');
      } else {
        toast.warning(`試験結果: ${score}点`, '頑張りました！復習して再挑戦しましょう');
      }
    }
  };
}
```

---

このUI設計書は、PMPLearningManagementプロジェクトのNext.js 14への移行と新機能追加のための包括的なガイドとなります。既存資産を最大限活用しながら、モダンなUI/UXを実現する設計となっています。

継続して残りのセクション（アクセシビリティ、パフォーマンス最適化、モバイル/PWA対応、等）も詳細に記述いたしましょうか？