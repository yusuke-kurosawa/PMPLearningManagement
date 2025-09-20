import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Building, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Users,
  Target,
  Settings,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { 
  enterpriseEnvironmentalFactors, 
  organizationalProcessAssets,
  EnterpriseEnvironmentalFactor,
  OrganizationalProcessAsset
} from '../../data/pmbok/strategicAlignmentData';

interface BusinessEnvironmentAnalysisProps {
  className?: string;
}

const BusinessEnvironmentAnalysis: React.FC<BusinessEnvironmentAnalysisProps> = ({ className = '' }) => {
  const [selectedTab, setSelectedTab] = useState('eef');
  const [selectedEEF, setSelectedEEF] = useState<string | null>(null);
  const [selectedOPA, setSelectedOPA] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [practiceResults, setPracticeResults] = useState<{ [key: string]: boolean }>({});

  // 練習問題データ
  const practiceQuestions = [
    {
      id: 'q1',
      scenario: 'あなたのプロジェクトチームは、新しい製品開発プロジェクトを開始しようとしています。しかし、組織には類似のプロジェクト経験が少なく、業界の技術標準も急速に変化しています。',
      question: 'この状況で最も重要なEEF（企業環境要因）は何ですか？',
      options: [
        '組織文化と構造',
        '技術動向',
        'リソースの可用性',
        '規制・法的環境'
      ],
      correct: 1,
      explanation: '急速に変化する技術標準は外部の技術動向として分類され、プロジェクトの技術選択や実装方法に大きな影響を与えるため、最も重要なEEFです。'
    },
    {
      id: 'q2',
      scenario: 'ITシステム更新プロジェクトで、社内には過去5年間の類似プロジェクトの詳細な記録と、失敗・成功要因の分析結果があります。',
      question: 'これはどのタイプのOPA（組織プロセス資産）に該当しますか？',
      options: [
        'プロセスとガイドライン',
        '知識とナレッジベース',
        'テンプレートとフォーム',
        'ガバナンス・ガイドライン'
      ],
      correct: 1,
      explanation: '過去のプロジェクト記録と分析結果は、組織の知識とナレッジベースに分類される貴重なOPAです。これらの情報は今後のプロジェクト計画に活用できます。'
    },
    {
      id: 'q3',
      scenario: '国際的なプロジェクトで、複数の国の法規制に準拠する必要があり、各国の政治情勢も不安定な状況です。',
      question: 'この場合、プロジェクトマネージャーが最も注意すべきEEFのカテゴリーは？',
      options: [
        '内部要因',
        '外部要因',
        'どちらも同程度',
        '判断できない'
      ],
      correct: 1,
      explanation: '国際的な法規制と政治情勢は組織外部の環境要因であり、プロジェクトマネージャーが直接制御できない外部要因として管理する必要があります。'
    },
    {
      id: 'q4',
      scenario: 'プロジェクト開始時に、組織の標準的なプロジェクト憲章テンプレートと承認プロセスを使用することになりました。',
      question: 'これらは主にどのようなOPAに分類されますか？',
      options: [
        'テンプレートとフォーム、プロセスとガイドライン',
        '知識とナレッジベース',
        'ガバナンス・ガイドライン',
        '人事ポリシー'
      ],
      correct: 0,
      explanation: 'プロジェクト憲章テンプレートは「テンプレートとフォーム」、承認プロセスは「プロセスとガイドライン」に分類される複合的なOPAです。'
    },
    {
      id: 'q5',
      scenario: '組織のリスク許容度が非常に低く、すべてのプロジェクト決定に複数レベルの承認が必要です。',
      question: 'これは主にどのEEFに関連しますか？',
      options: [
        'インフラストラクチャ',
        'ステークホルダーのリスク許容度',
        '市場状況',
        'リソースの可用性'
      ],
      correct: 1,
      explanation: '組織のリスク許容度の低さと多重承認システムは、ステークホルダーのリスク許容度というEEFに直接関連し、プロジェクト運営方法に影響します。'
    }
  ];

  // 練習開始
  const startPractice = () => {
    setPracticeMode(true);
    setCurrentQuestion(0);
    setPracticeResults({});
  };

  // 回答処理
  const handleAnswer = (answerIndex: number) => {
    const question = practiceQuestions[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    setPracticeResults(prev => ({
      ...prev,
      [question.id]: isCorrect
    }));
  };

  // 次の質問
  const nextQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 練習完了
      const correctCount = Object.values(practiceResults).filter(Boolean).length;
      alert(`練習完了！ ${correctCount}/${practiceQuestions.length} 問正解しました。`);
      setPracticeMode(false);
    }
  };

  // EEF詳細コンポーネント
  const EEFDetail: React.FC<{ eef: EnterpriseEnvironmentalFactor }> = ({ eef }) => {
    const categoryIcon = eef.category === 'internal' ? Building : Globe;
    const impactColor = eef.impact === 'high' ? 'text-red-600' : eef.impact === 'medium' ? 'text-orange-600' : 'text-green-600';

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <categoryIcon className="h-6 w-6" />
            <span>{eef.name}</span>
            <Badge variant={eef.category === 'internal' ? 'default' : 'secondary'}>
              {eef.category === 'internal' ? '内部要因' : '外部要因'}
            </Badge>
            <Badge className={impactColor}>
              影響度: {eef.impact === 'high' ? '高' : eef.impact === 'medium' ? '中' : '低'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">{eef.description}</p>

          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              具体例
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {eef.examples.map((example, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                  <span className="text-sm">{example}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              影響するプロジェクトフェーズ
            </h4>
            <div className="flex flex-wrap gap-2">
              {eef.projectPhases.map((phase, index) => (
                <Badge key={index} variant="outline">{phase}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              管理のヒント
            </h4>
            <div className="space-y-2">
              {eef.managementTips.map((tip, index) => (
                <Alert key={index}>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>{tip}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // OPA詳細コンポーネント
  const OPADetail: React.FC<{ opa: OrganizationalProcessAsset }> = ({ opa }) => {
    const typeIcons = {
      processes: Settings,
      knowledge: BookOpen,
      guidelines: Shield,
      templates: FileText
    };
    const TypeIcon = typeIcons[opa.type];

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TypeIcon className="h-6 w-6" />
            <span>{opa.name}</span>
            <Badge variant="default">
              {opa.type === 'processes' && 'プロセス'}
              {opa.type === 'knowledge' && 'ナレッジ'}
              {opa.type === 'guidelines' && 'ガイドライン'}
              {opa.type === 'templates' && 'テンプレート'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">{opa.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                具体例
              </h4>
              <ul className="space-y-2">
                {opa.examples.map((example, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                    <span className="text-sm">{example}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                メリット
              </h4>
              <ul className="space-y-2">
                {opa.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 mt-0.5 text-blue-500" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>責任者:</strong> {opa.owner}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
              <span className="text-sm"><strong>更新頻度:</strong> {opa.updateFrequency}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 練習問題コンポーネント
  const PracticeQuestion: React.FC = () => {
    const question = practiceQuestions[currentQuestion];
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleAnswerSelect = (answerIndex: number) => {
      setSelectedAnswer(answerIndex);
      handleAnswer(answerIndex);
      setShowExplanation(true);
    };

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>EEF・OPA 識別練習</span>
            <Badge variant="outline">
              {currentQuestion + 1} / {practiceQuestions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>シナリオ:</strong> {question.scenario}
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={
                    showExplanation
                      ? index === question.correct
                        ? "default"
                        : selectedAnswer === index
                        ? "destructive"
                        : "outline"
                      : selectedAnswer === index
                      ? "secondary"
                      : "outline"
                  }
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => !showExplanation && handleAnswerSelect(index)}
                  disabled={showExplanation}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                    {showExplanation && index === question.correct && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {showExplanation && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>解説:</strong> {question.explanation}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setPracticeMode(false)}
            >
              練習を終了
            </Button>
            {showExplanation && (
              <Button onClick={nextQuestion}>
                {currentQuestion < practiceQuestions.length - 1 ? '次の問題' : '練習完了'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">ビジネス環境分析</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          企業環境要因（EEF）と組織プロセス資産（OPA）を理解し、
          プロジェクト環境の分析と活用方法を学習します。
        </p>
      </div>

      {practiceMode ? (
        <PracticeQuestion />
      ) : (
        <>
          {/* 概要と練習開始 */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-6 w-6" />
                <span>ビジネス環境の構成要素</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Globe className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold">企業環境要因（EEF）</h3>
                        <p className="text-sm text-gray-600">Enterprise Environmental Factors</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">
                      プロジェクトの計画と実行に影響を与える、組織内外の環境条件。
                      プロジェクトチームが制御できない要因。
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="default">内部要因: {enterpriseEnvironmentalFactors.filter(e => e.category === 'internal').length}個</Badge>
                      <Badge variant="secondary">外部要因: {enterpriseEnvironmentalFactors.filter(e => e.category === 'external').length}個</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold">組織プロセス資産（OPA）</h3>
                        <p className="text-sm text-gray-600">Organizational Process Assets</p>
                      </div>
                    </div>
                    <p className="text-sm mb-4">
                      組織が蓄積した計画、プロセス、ポリシー、手順、知識。
                      プロジェクトの実行を支援する資産。
                    </p>
                    <div className="flex space-x-2">
                      <Badge variant="default">総数: {organizationalProcessAssets.length}個</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <Button onClick={startPractice} size="lg">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  EEF・OPA 識別練習を開始
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* タブ形式での詳細表示 */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>詳細解説</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="eef">企業環境要因（EEF）</TabsTrigger>
                  <TabsTrigger value="opa">組織プロセス資産（OPA）</TabsTrigger>
                </TabsList>

                <TabsContent value="eef" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {enterpriseEnvironmentalFactors.map((eef) => (
                      <Card 
                        key={eef.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedEEF === eef.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedEEF(eef.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${
                              eef.category === 'internal' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {eef.category === 'internal' ? (
                                <Building className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Globe className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{eef.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{eef.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant={eef.category === 'internal' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {eef.category === 'internal' ? '内部' : '外部'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    eef.impact === 'high' ? 'text-red-600' : 
                                    eef.impact === 'medium' ? 'text-orange-600' : 'text-green-600'
                                  }`}
                                >
                                  {eef.impact === 'high' ? '高影響' : eef.impact === 'medium' ? '中影響' : '低影響'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedEEF && (
                    <EEFDetail eef={enterpriseEnvironmentalFactors.find(e => e.id === selectedEEF)!} />
                  )}
                </TabsContent>

                <TabsContent value="opa" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {organizationalProcessAssets.map((opa) => (
                      <Card 
                        key={opa.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedOPA === opa.id ? 'ring-2 ring-green-500' : ''
                        }`}
                        onClick={() => setSelectedOPA(opa.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              {opa.type === 'processes' && <Settings className="h-5 w-5 text-green-600" />}
                              {opa.type === 'knowledge' && <BookOpen className="h-5 w-5 text-green-600" />}
                              {opa.type === 'guidelines' && <Shield className="h-5 w-5 text-green-600" />}
                              {opa.type === 'templates' && <FileText className="h-5 w-5 text-green-600" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{opa.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{opa.description}</p>
                              <div className="flex items-center justify-between mt-3">
                                <Badge variant="default">
                                  {opa.type === 'processes' && 'プロセス'}
                                  {opa.type === 'knowledge' && 'ナレッジ'}
                                  {opa.type === 'guidelines' && 'ガイドライン'}
                                  {opa.type === 'templates' && 'テンプレート'}
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedOPA && (
                    <OPADetail opa={organizationalProcessAssets.find(o => o.id === selectedOPA)!} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BusinessEnvironmentAnalysis;