import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  XCircle, 
  CheckCircle, 
  BarChart3, 
  Clock,
  AlertCircle,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Home
} from 'lucide-react';
import { examDomains } from '../data/examQuestions';
import { processCategories } from '../services/progressService';

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, examQuestions, answers } = location.state || {};
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  if (!results) {
    navigate('/mock-exam');
    return null;
  }

  const isPassed = results.score >= 61;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}時間${minutes}分`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 61) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 61) return 'bg-blue-100';
    if (percentage >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const questionsToShow = showIncorrectOnly 
    ? results.incorrectQuestions 
    : examQuestions;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 結果サマリー */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            {isPassed ? (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isPassed ? '合格おめでとうございます！' : '今回は不合格でした'}
            </h1>
            
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${getScoreBgColor(results.score)} mb-4`}>
              <span className={`text-4xl font-bold ${getScoreColor(results.score)}`}>
                {results.score}%
              </span>
              <span className="text-gray-600">
                ({results.correctAnswers}/{results.totalQuestions})
              </span>
            </div>
            
            <p className="text-gray-600">
              {isPassed 
                ? 'PMP試験の合格基準（61%）を達成しました。' 
                : 'もう少しで合格です。苦手分野を重点的に復習しましょう。'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">正解数</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{results.correctAnswers}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">不正解数</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium">未回答</span>
              </div>
              <p className="text-2xl font-bold text-gray-600">{results.unanswered}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/mock-exam')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
            >
              <RefreshCw className="w-5 h-5" />
              もう一度挑戦
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
            >
              <Home className="w-5 h-5" />
              ホームに戻る
            </button>
          </div>
        </div>

        {/* ドメイン別分析 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            ドメイン別分析
          </h2>
          
          <div className="space-y-4">
            {Object.entries(examDomains).map(([key, domain]) => {
              const domainScore = results.domainScores[key];
              if (!domainScore || domainScore.total === 0) return null;
              
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{domain.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({domainScore.correct}/{domainScore.total})
                      </span>
                    </div>
                    <span className={`font-bold ${getScoreColor(domainScore.percentage)}`}>
                      {domainScore.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        domainScore.percentage >= 80 ? 'bg-green-600' :
                        domainScore.percentage >= 61 ? 'bg-blue-600' :
                        domainScore.percentage >= 40 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${domainScore.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 知識エリア別分析 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            知識エリア別分析
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(results.knowledgeAreaScores).map(([area, score]) => {
              const areaName = processCategories[area] || area;
              
              return (
                <div key={area} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{areaName}</span>
                    <span className={`font-bold ${getScoreColor(score.percentage)}`}>
                      {score.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        score.percentage >= 80 ? 'bg-green-600' :
                        score.percentage >= 61 ? 'bg-blue-600' :
                        score.percentage >= 40 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${score.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {score.correct}/{score.total} 問正解
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 問題と解答の詳細 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              問題と解答の詳細
            </h2>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showIncorrectOnly}
                onChange={(e) => setShowIncorrectOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">不正解のみ表示</span>
            </label>
          </div>
          
          <div className="space-y-6">
            {questionsToShow.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = 
                (question.type === 'single_choice' && userAnswer === question.correctAnswer) ||
                (question.type === 'multiple_choice' && 
                  JSON.stringify((userAnswer || []).sort()) === JSON.stringify(question.correctAnswers.sort()));
              
              return (
                <div key={question.id} className="border rounded-lg p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">問題 {question.questionNumber || index + 1}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {question.domain.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-4">{question.question}</p>
                      
                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => {
                          const optionLetter = option.charAt(0);
                          const isUserAnswer = question.type === 'single_choice'
                            ? userAnswer === optionLetter
                            : (userAnswer || []).includes(optionLetter);
                          const isCorrectAnswer = question.type === 'single_choice'
                            ? question.correctAnswer === optionLetter
                            : question.correctAnswers.includes(optionLetter);
                          
                          return (
                            <div
                              key={option}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer 
                                  ? 'bg-green-50 border border-green-300'
                                  : isUserAnswer && !isCorrectAnswer
                                  ? 'bg-red-50 border border-red-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <span className={`${
                                  isCorrectAnswer ? 'font-medium' : ''
                                }`}>{option}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!isCorrect && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">解説</h4>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                          {question.references && (
                            <div className="mt-2 text-xs text-blue-700">
                              参考: {question.references.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ExamResults);