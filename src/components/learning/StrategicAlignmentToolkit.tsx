import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calculator,
  Compass,
  TrendingUp,
  Users,
  Settings,
  ArrowRight,
  RefreshCw,
  Download
} from 'lucide-react';

interface StrategicAlignmentToolkitProps {
  className?: string;
}

interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface ProjectScenario {
  id: string;
  title: string;
  description: string;
  industry: string;
  complexity: 'low' | 'medium' | 'high';
  duration: string;
  budget: string;
  stakeholders: string[];
  challenges: string[];
}

const StrategicAlignmentToolkit: React.FC<StrategicAlignmentToolkitProps> = ({ className = '' }) => {
  const [currentTool, setCurrentTool] = useState('swot-analyzer');
  const [swotAnalysis, setSWOTAnalysis] = useState<SWOTAnalysis>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: []
  });
  const [selectedScenario, setSelectedScenario] = useState<ProjectScenario | null>(null);
  const [alignmentScore, setAlignmentScore] = useState<number | null>(null);

  // プロジェクトシナリオデータ
  const projectScenarios: ProjectScenario[] = [
    {
      id: 'digital-transformation',
      title: 'デジタル変革プロジェクト',
      description: '全社的なDXを推進し、業務プロセスのデジタル化と新サービス創出を目指すプロジェクト',
      industry: 'manufacturing',
      complexity: 'high',
      duration: '24ヶ月',
      budget: '5億円',
      stakeholders: ['経営陣', 'IT部門', '各事業部', '外部ベンダー', '顧客', '従業員'],
      challenges: [
        '既存システムとの統合',
        '従業員のスキル不足',
        '変革への抵抗',
        '技術選定の困難さ',
        'ROI測定の複雑さ'
      ]
    },
    {
      id: 'new-product-launch',
      title: '新製品開発・市場投入',
      description: '市場ニーズに基づく革新的な製品開発と効果的な市場投入戦略の実行',
      industry: 'technology',
      complexity: 'medium',
      duration: '18ヶ月',
      budget: '2億円',
      stakeholders: ['R&D部門', 'マーケティング', '営業', '製造', '品質保証'],
      challenges: [
        '市場ニーズの変化',
        '競合他社の動向',
        '技術的リスク',
        '製造コスト管理',
        'タイムトゥマーケット'
      ]
    },
    {
      id: 'infrastructure-upgrade',
      title: 'ITインフラ刷新',
      description: '老朽化したITインフラの刷新とクラウド移行によるコスト削減と性能向上',
      industry: 'finance',
      complexity: 'high',
      duration: '12ヶ月',
      budget: '3億円',
      stakeholders: ['IT部門', 'セキュリティ部門', '各事業部', 'クラウドベンダー'],
      challenges: [
        'システム移行リスク',
        'セキュリティ要件',
        'ダウンタイム最小化',
        '既存データ移行',
        '法規制遵守'
      ]
    }
  ];

  // SWOT分析ツール
  const SWOTAnalyzer: React.FC = () => {
    const [newItem, setNewItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<keyof SWOTAnalysis>('strengths');

    const addItem = () => {
      if (newItem.trim()) {
        setSWOTAnalysis(prev => ({
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], newItem.trim()]
        }));
        setNewItem('');
      }
    };

    const removeItem = (category: keyof SWOTAnalysis, index: number) => {
      setSWOTAnalysis(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    };

    const generateInsights = () => {
      const insights: string[] = [];
      
      if (swotAnalysis.strengths.length > swotAnalysis.weaknesses.length) {
        insights.push('強みが弱みを上回っており、ポジティブな基盤があります。');
      }
      
      if (swotAnalysis.opportunities.length > swotAnalysis.threats.length) {
        insights.push('機会が脅威を上回っており、成長の可能性が高いです。');
      }
      
      if (swotAnalysis.strengths.length > 0 && swotAnalysis.opportunities.length > 0) {
        insights.push('SO戦略（強みを活かして機会を捉える）が有効です。');
      }
      
      if (swotAnalysis.weaknesses.length > 0 && swotAnalysis.threats.length > 0) {
        insights.push('WT戦略（弱みを改善し脅威を回避する）が重要です。');
      }

      return insights;
    };

    const categories = [
      { key: 'strengths' as const, label: '強み (Strengths)', color: 'bg-green-100 text-green-800', icon: '💪' },
      { key: 'weaknesses' as const, label: '弱み (Weaknesses)', color: 'bg-red-100 text-red-800', icon: '⚠️' },
      { key: 'opportunities' as const, label: '機会 (Opportunities)', color: 'bg-blue-100 text-blue-800', icon: '🚀' },
      { key: 'threats' as const, label: '脅威 (Threats)', color: 'bg-orange-100 text-orange-800', icon: '⚡' }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">SWOT分析ツール</h2>
          <p className="text-gray-600">プロジェクトや組織の内部・外部環境を分析します</p>
        </div>

        {/* 入力セクション */}
        <Card>
          <CardHeader>
            <CardTitle>項目追加</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  {category.icon} {category.label.split(' ')[0]}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={`${categories.find(c => c.key === selectedCategory)?.label}を入力...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && addItem()}
              />
              <Button onClick={addItem}>追加</Button>
            </div>
          </CardContent>
        </Card>

        {/* SWOT マトリックス */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <Card key={category.key}>
              <CardHeader>
                <CardTitle className={`text-center p-3 rounded-lg ${category.color}`}>
                  {category.icon} {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 min-h-[200px]">
                  {swotAnalysis[category.key].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(category.key, index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {swotAnalysis[category.key].length === 0 && (
                    <p className="text-gray-400 text-center py-8">項目を追加してください</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 洞察とアクション */}
        {generateInsights().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>分析結果と推奨アクション</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {generateInsights().map((insight, index) => (
                  <Alert key={index}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // プロジェクト評価ツール
  const ProjectEvaluator: React.FC = () => {
    const [evaluationScores, setEvaluationScores] = useState<{ [key: string]: number }>({});

    const evaluationCriteria = [
      {
        id: 'strategic-fit',
        name: '戦略適合性',
        description: '組織戦略との整合性',
        weight: 0.25
      },
      {
        id: 'business-value',
        name: 'ビジネス価値',
        description: '期待される事業価値',
        weight: 0.30
      },
      {
        id: 'feasibility',
        name: '実現可能性',
        description: '技術・リソース面での実現性',
        weight: 0.20
      },
      {
        id: 'risk-level',
        name: 'リスクレベル',
        description: 'プロジェクトリスクの大きさ（逆転スコア）',
        weight: 0.15
      },
      {
        id: 'urgency',
        name: '緊急性',
        description: '実施の緊急度',
        weight: 0.10
      }
    ];

    const updateScore = (criteriaId: string, score: number) => {
      setEvaluationScores(prev => ({
        ...prev,
        [criteriaId]: score
      }));
    };

    const calculateOverallScore = () => {
      if (Object.keys(evaluationScores).length !== evaluationCriteria.length) {
        return 0;
      }

      return evaluationCriteria.reduce((total, criteria) => {
        const score = evaluationScores[criteria.id] || 0;
        const adjustedScore = criteria.id === 'risk-level' ? (6 - score) : score; // リスクは逆転
        return total + (adjustedScore * criteria.weight * 20); // 100点満点に変換
      }, 0);
    };

    const getScoreCategory = (score: number) => {
      if (score >= 80) return { label: '優先度: 高', color: 'text-green-600' };
      if (score >= 60) return { label: '優先度: 中', color: 'text-blue-600' };
      if (score >= 40) return { label: '優先度: 低', color: 'text-orange-600' };
      return { label: '優先度: 要検討', color: 'text-red-600' };
    };

    const overallScore = calculateOverallScore();
    const scoreCategory = getScoreCategory(overallScore);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">プロジェクト優先度評価</h2>
          <p className="text-gray-600">複数の評価軸からプロジェクトの優先度を評価します</p>
        </div>

        {/* シナリオ選択 */}
        <Card>
          <CardHeader>
            <CardTitle>評価対象プロジェクト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projectScenarios.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-all ${
                    selectedScenario?.id === scenario.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedScenario(scenario)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">{scenario.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">期間:</span>
                        <span className="text-xs">{scenario.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">予算:</span>
                        <span className="text-xs">{scenario.budget}</span>
                      </div>
                      <Badge 
                        variant={
                          scenario.complexity === 'high' ? 'destructive' :
                          scenario.complexity === 'medium' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        複雑度: {scenario.complexity}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedScenario && (
          <>
            {/* 選択されたシナリオの詳細 */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedScenario.title} - 詳細情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">主要ステークホルダー</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedScenario.stakeholders.map((stakeholder, index) => (
                        <Badge key={index} variant="outline">{stakeholder}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">主要な課題</h4>
                    <ul className="space-y-1">
                      {selectedScenario.challenges.map((challenge, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-2 text-orange-500" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 評価セクション */}
            <Card>
              <CardHeader>
                <CardTitle>評価項目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {evaluationCriteria.map((criteria) => (
                    <div key={criteria.id}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold">{criteria.name}</h4>
                          <p className="text-sm text-gray-600">{criteria.description}</p>
                        </div>
                        <Badge variant="secondary">重み: {(criteria.weight * 100).toFixed(0)}%</Badge>
                      </div>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <Button
                            key={score}
                            variant={evaluationScores[criteria.id] === score ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => updateScore(criteria.id, score)}
                          >
                            {score}
                          </Button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>1: 非常に低い</span>
                        <span>3: 普通</span>
                        <span>5: 非常に高い</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 評価結果 */}
            {overallScore > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>評価結果</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <div className="text-4xl font-bold text-blue-600">
                        {overallScore.toFixed(1)}
                      </div>
                      <div className="text-gray-600">総合スコア (100点満点)</div>
                    </div>
                    <Progress value={overallScore} className="w-full" />
                    <div className={`text-lg font-semibold ${scoreCategory.color}`}>
                      {scoreCategory.label}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold">項目別スコア</h4>
                    {evaluationCriteria.map((criteria) => {
                      const score = evaluationScores[criteria.id] || 0;
                      const adjustedScore = criteria.id === 'risk-level' ? (6 - score) : score;
                      const weightedScore = adjustedScore * criteria.weight * 20;
                      
                      return (
                        <div key={criteria.id} className="flex items-center justify-between">
                          <span className="text-sm">{criteria.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {weightedScore.toFixed(1)}点
                            </span>
                            <Progress value={weightedScore} className="w-20 h-2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 推奨アクション */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">推奨アクション</h4>
                    <div className="space-y-2">
                      {overallScore >= 80 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            高優先度プロジェクトです。早期実行を推奨します。
                          </AlertDescription>
                        </Alert>
                      )}
                      {overallScore >= 60 && overallScore < 80 && (
                        <Alert>
                          <Target className="h-4 w-4" />
                          <AlertDescription>
                            中優先度プロジェクトです。リソース状況を考慮して実行タイミングを決定してください。
                          </AlertDescription>
                        </Alert>
                      )}
                      {overallScore < 60 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            低優先度または要検討プロジェクトです。計画の見直しや改善を検討してください。
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">戦略適合ツールキット</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          実践的なツールを使って戦略分析とプロジェクト評価を体験します。
        </p>
      </div>

      {/* ツール選択 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>分析ツール選択</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${
                currentTool === 'swot-analyzer' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setCurrentTool('swot-analyzer')}
            >
              <CardContent className="p-6 text-center">
                <Compass className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-lg font-semibold mb-2">SWOT分析ツール</h3>
                <p className="text-sm text-gray-600">
                  強み・弱み・機会・脅威を分析し、戦略的洞察を得ます
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                currentTool === 'project-evaluator' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setCurrentTool('project-evaluator')}
            >
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">プロジェクト評価ツール</h3>
                <p className="text-sm text-gray-600">
                  複数の評価軸からプロジェクトの優先度を定量的に評価します
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 選択されたツールの表示 */}
      {currentTool === 'swot-analyzer' && <SWOTAnalyzer />}
      {currentTool === 'project-evaluator' && <ProjectEvaluator />}
    </div>
  );
};

export default StrategicAlignmentToolkit;