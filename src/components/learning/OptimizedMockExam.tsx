import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
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
  Play,
} from 'lucide-react';
import { generateExam, questionTypes, analyzeExamResults } from '../../data/fixtures/examQuestions';
import { progressService } from '../../services/progressService';
import VirtualList from '../shared/VirtualList';
import { throttle, debounce } from '@/utils/performance';

interface Question {
  id: number;
  type: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Answer {
  questionId: number;
  selectedOption: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

// Memoized Question Component
const QuestionItem = memo<{
  question: Question;
  answer?: Answer;
  isBookmarked: boolean;
  onAnswerChange: (questionId: number, optionIndex: number) => void;
  onBookmark: (questionId: number) => void;
}>(({ question, answer, isBookmarked, onAnswerChange, onBookmark }) => {
  const handleOptionChange = useCallback(
    (optionIndex: number) => {
      onAnswerChange(question.id, optionIndex);
    },
    [question.id, onAnswerChange]
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">
              Question {question.id}
            </span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {question.category}
            </span>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
              {question.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 whitespace-pre-wrap">
            {question.question}
          </h3>
        </div>
        <button
          onClick={() => onBookmark(question.id)}
          className={`p-2 rounded-lg transition-colors ${
            isBookmarked
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-gray-100 text-gray-400 hover:text-gray-600'
          }`}
        >
          <Flag className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label
            key={index}
            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              answer?.selectedOption === index
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={answer?.selectedOption === index}
                onChange={() => handleOptionChange(index)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-900">{option}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
});

QuestionItem.displayName = 'QuestionItem';

// Memoized Timer Component
const ExamTimer = memo<{
  timeRemaining: number;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
}>(({ timeRemaining, isPaused, onPause, onResume }) => {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="flex items-center space-x-3 bg-white rounded-lg shadow-md p-4">
      <Clock className="h-5 w-5 text-gray-600" />
      <span className="text-lg font-semibold">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </span>
      <button
        onClick={isPaused ? onResume : onPause}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>
    </div>
  );
});

ExamTimer.displayName = 'ExamTimer';

// Main Optimized Mock Exam Component
const OptimizedMockExam: React.FC = () => {
  const navigate = useNavigate();
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<number, Answer>>(new Map());
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<number>>(new Set());
  const [examState, setExamState] = useState<'not_started' | 'in_progress' | 'paused' | 'completed'>('not_started');
  const [timeRemaining, setTimeRemaining] = useState(230 * 60); // 230 minutes in seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate exam questions
  const startExam = useCallback(() => {
    const questions = generateExam(180); // Full 180 questions for production
    setExamQuestions(questions);
    setExamState('in_progress');
    setTimeRemaining(230 * 60);
    setAnswers(new Map());
    setBookmarkedQuestions(new Set());
    setShowAllQuestions(true); // Show all questions in virtual list
  }, []);

  // Timer management
  useEffect(() => {
    if (examState === 'in_progress' && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
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

  // Throttled answer update
  const updateAnswer = useMemo(
    () =>
      throttle((questionId: number, selectedOption: number) => {
        setAnswers((prev) => {
          const newAnswers = new Map(prev);
          newAnswers.set(questionId, {
            questionId,
            selectedOption,
            timeSpent: 0,
          });
          return newAnswers;
        });
      }, 100),
    []
  );

  // Toggle bookmark
  const toggleBookmark = useCallback((questionId: number) => {
    setBookmarkedQuestions((prev) => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(questionId)) {
        newBookmarks.delete(questionId);
      } else {
        newBookmarks.add(questionId);
      }
      return newBookmarks;
    });
  }, []);

  // Submit exam
  const submitExam = useCallback(() => {
    setExamState('completed');
    const results = analyzeExamResults(
      examQuestions,
      Array.from(answers.values())
    );

    // Save progress
    progressService.updateExamHistory({
      date: new Date().toISOString(),
      score: results.score,
      timeSpent: 230 * 60 - timeRemaining,
      questionsAnswered: answers.size,
      totalQuestions: examQuestions.length,
    });

    // Navigate to results
    navigate('/exam-results', { state: { results } });
  }, [examQuestions, answers, timeRemaining, navigate]);

  // Pause/Resume handlers
  const handlePause = useCallback(() => setIsPaused(true), []);
  const handleResume = useCallback(() => setIsPaused(false), []);

  // Progress calculation
  const progress = useMemo(() => {
    if (examQuestions.length === 0) return 0;
    return (answers.size / examQuestions.length) * 100;
  }, [answers.size, examQuestions.length]);

  // Render question item for virtual list
  const renderQuestion = useCallback(
    (question: Question) => (
      <QuestionItem
        question={question}
        answer={answers.get(question.id)}
        isBookmarked={bookmarkedQuestions.has(question.id)}
        onAnswerChange={updateAnswer}
        onBookmark={toggleBookmark}
      />
    ),
    [answers, bookmarkedQuestions, updateAnswer, toggleBookmark]
  );

  if (examState === 'not_started') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              PMP Mock Exam
            </h1>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Exam Details</h3>
                <ul className="space-y-1 text-blue-700">
                  <li>• 180 questions</li>
                  <li>• 230 minutes (3 hours 50 minutes)</li>
                  <li>• Covers all PMBOK knowledge areas</li>
                  <li>• Immediate results and explanations</li>
                </ul>
              </div>
              <button
                onClick={startExam}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">PMP Mock Exam</h1>
            <div className="flex items-center space-x-4">
              <ExamTimer
                timeRemaining={timeRemaining}
                isPaused={isPaused}
                onPause={handlePause}
                onResume={handleResume}
              />
              <button
                onClick={submitExam}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {answers.size} of {examQuestions.length} answered
              </span>
              <span className="text-sm font-medium text-gray-700">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions with Virtual Scrolling */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <VirtualList
          items={examQuestions}
          itemHeight={400} // Estimated height for each question
          renderItem={renderQuestion}
          getItemKey={(item) => item.id}
          overscan={2}
          containerClassName="h-screen"
          className="pb-20"
        />
      </div>

      {/* Question Navigator (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-20 gap-1">
            {examQuestions.slice(0, 20).map((q) => (
              <button
                key={q.id}
                className={`h-8 w-8 rounded text-xs font-medium ${
                  answers.has(q.id)
                    ? 'bg-green-100 text-green-800'
                    : bookmarkedQuestions.has(q.id)
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {q.id}
              </button>
            ))}
            {examQuestions.length > 20 && (
              <span className="col-span-2 text-center text-sm text-gray-500">
                ... +{examQuestions.length - 20} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(OptimizedMockExam);