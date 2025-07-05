import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle, 
  AlertCircle,
  List,
  Send,
  Pause,
  Play
} from 'lucide-react';
import { generateExam, questionTypes, analyzeExamResults } from '../data/examQuestions';
import { progressService } from '../services/progressService';

const MockExam = () => {
  const navigate = useNavigate();
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  const [examState, setExamState] = useState('not_started'); // not_started, in_progress, paused, completed
  const [timeRemaining, setTimeRemaining] = useState(230 * 60); // 230分（秒単位）
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // 試験開始
  const startExam = () => {
    const questions = generateExam(10); // デモ用に10問（実際は180問）
    setExamQuestions(questions);
    setExamState('in_progress');
    setTimeRemaining(230 * 60);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setBookmarkedQuestions(new Set());
  };

  // タイマー機能
  useEffect(() => {
    if (examState === 'in_progress' && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            submitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [examState, isPaused]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 回答の保存
  const handleAnswer = (answer) => {
    const question = examQuestions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [question.id]: answer
    }));
  };

  // 複数選択の回答処理
  const handleMultipleAnswer = (option) => {
    const question = examQuestions[currentQuestionIndex];
    const currentAnswers = answers[question.id] || [];
    
    if (currentAnswers.includes(option)) {
      handleAnswer(currentAnswers.filter(a => a !== option));
    } else {
      handleAnswer([...currentAnswers, option]);
    }
  };

  // ブックマーク切り替え
  const toggleBookmark = () => {
    const question = examQuestions[currentQuestionIndex];
    const newBookmarks = new Set(bookmarkedQuestions);
    
    if (newBookmarks.has(question.id)) {
      newBookmarks.delete(question.id);
    } else {
      newBookmarks.add(question.id);
    }
    
    setBookmarkedQuestions(newBookmarks);
  };

  // 問題ナビゲーション
  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowQuestionList(false);
  };

  // 試験提出
  const submitExam = () => {
    setExamState('completed');
    const results = analyzeExamResults(answers, examQuestions);
    
    // 結果を保存
    progressService.recordExamResult({
      timestamp: new Date().toISOString(),
      duration: (230 * 60) - timeRemaining,
      results,
      bookmarkedQuestions: Array.from(bookmarkedQuestions)
    });
    
    // 結果ページへ遷移
    navigate('/exam-results', { state: { results, examQuestions, answers } });
  };

  if (examState === 'not_started') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">PMP模擬試験</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>試験時間: 230分（3時間50分）</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <span>問題数: 180問（デモ: 10問）</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <span>合格基準: 正答率61%以上</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">試験の構成</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• People (42%): チーム管理、リーダーシップ</li>
              <li>• Process (50%): プロジェクト管理プロセス</li>
              <li>• Business Environment (8%): ビジネス戦略との整合</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startExam}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              試験を開始する
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'completed') {
    return <div>試験完了 - 結果ページへ自動遷移します...</div>;
  }

  const currentQuestion = examQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isBookmarked = bookmarkedQuestions.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">PMP模擬試験</h2>
              <span className="text-sm text-gray-600">
                問題 {currentQuestionIndex + 1} / {examQuestions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className={`font-mono text-lg ${timeRemaining < 600 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* 問題表示エリア */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {currentQuestion.domain.toUpperCase()}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {currentQuestion.difficulty === 'easy' ? '易' : currentQuestion.difficulty === 'medium' ? '中' : '難'}
                </span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>
            
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const optionLetter = option.charAt(0);
              const isSelected = currentQuestion.type === questionTypes.SINGLE_CHOICE 
                ? currentAnswer === optionLetter
                : (currentAnswer || []).includes(optionLetter);
              
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (currentQuestion.type === questionTypes.SINGLE_CHOICE) {
                      handleAnswer(optionLetter);
                    } else {
                      handleMultipleAnswer(optionLetter);
                    }
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {currentQuestion.type === questionTypes.MULTIPLE_CHOICE && (
            <p className="mt-4 text-sm text-gray-600">
              ※ 複数選択問題です。該当するものをすべて選択してください。
            </p>
          )}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            前の問題
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, examQuestions.length) }, (_, i) => {
              const index = Math.max(0, Math.min(currentQuestionIndex - 2 + i, examQuestions.length - 1));
              const question = examQuestions[index];
              const hasAnswer = !!answers[question.id];
              
              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : hasAnswer
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {currentQuestionIndex < examQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              次の問題
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitExam}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              試験を提出
            </button>
          )}
        </div>
      </div>

      {/* 問題一覧サイドバー */}
      {showQuestionList && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">問題一覧</h3>
              <button
                onClick={() => setShowQuestionList(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {examQuestions.map((question, index) => {
                const hasAnswer = !!answers[question.id];
                const isBookmarked = bookmarkedQuestions.has(question.id);
                
                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`relative p-3 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : hasAnswer
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                    {isBookmarked && (
                      <Flag className="absolute top-0 right-0 w-3 h-3 text-yellow-500" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>回答済み ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>未回答 ({examQuestions.length - Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-yellow-500" />
                <span>ブックマーク ({bookmarkedQuestions.size})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MockExam);