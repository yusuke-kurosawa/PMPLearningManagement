/**
 * Enhanced Mock Exam Component with Backend Integration
 * Developer 1: Mock Exam Lead Implementation
 */

import React, { useEffect, useCallback, useState } from 'react';
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
  AlertTriangle,
  BookOpen,
  BarChart3,
  Save,
  RefreshCw
} from 'lucide-react';
import { useExamStore, useExamTimer, type ExamSettings } from '../../stores/examStore';
import { api } from '../../lib/api/client';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';

interface MockExamSessionProps {
  initialSettings?: ExamSettings;
}

const MockExamSession: React.FC<MockExamSessionProps> = ({ initialSettings }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Store state
  const {
    currentSession,
    isLoading,
    error,
    initializeExam,
    startExam,
    pauseExam,
    resumeExam,
    answerQuestion,
    bookmarkQuestion,
    unbookmarkQuestion,
    navigateToQuestion,
    submitExam,
    abandonExam,
    getProgress,
    getCurrentQuestion,
    canNavigateNext,
    canNavigatePrevious,
  } = useExamStore();

  // Timer hook
  useExamTimer();

  // Local state
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save answers periodically
  useEffect(() => {
    if (!currentSession?.isCompleted) {
      const interval = setInterval(async () => {
        if (currentSession?.answers && Object.keys(currentSession.answers).length > 0) {
          setAutoSaveStatus('saving');
          try {
            await api.exam.saveProgress.mutate({
              sessionId: currentSession.id,
              answers: currentSession.answers,
              bookmarkedQuestions: Array.from(currentSession.bookmarkedQuestions),
              currentQuestionIndex: currentSession.currentQuestionIndex,
              timeRemaining: currentSession.timeRemaining,
            });
            setAutoSaveStatus('saved');
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } catch (error) {
            setAutoSaveStatus('error');
            console.error('Auto-save failed:', error);
          }
        }
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [currentSession]);

  // Initialize exam on mount
  useEffect(() => {
    if (initialSettings && !currentSession) {
      handleInitializeExam(initialSettings);
    }
  }, [initialSettings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (currentSession && !currentSession.isCompleted) {
        switch (event.key) {
          case 'ArrowLeft':
            if (canNavigatePrevious()) {
              navigateToQuestion(currentSession.currentQuestionIndex - 1);
            }
            break;
          case 'ArrowRight':
            if (canNavigateNext()) {
              navigateToQuestion(currentSession.currentQuestionIndex + 1);
            }
            break;
          case ' ':
            event.preventDefault();
            if (currentSession.isPaused) {
              resumeExam();
            } else {
              pauseExam();
            }
            break;
          case 'b':
            if (event.ctrlKey || event.metaKey) {
              event.preventDefault();
              toggleBookmark();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSession, canNavigateNext, canNavigatePrevious]);

  const handleInitializeExam = async (settings: ExamSettings) => {
    try {
      await initializeExam(settings);
      startExam();
      toast({
        title: "Exam Started",
        description: `Good luck with your ${settings.questionsCount}-question exam!`,
      });
    } catch (error) {
      toast({
        title: "Failed to Start Exam",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (answer: string | string[]) => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, answer);
    }
  };

  const handleMultipleAnswerChange = (option: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const currentAnswers = (currentSession?.answers[currentQuestion.id] as string[]) || [];
    
    if (currentAnswers.includes(option)) {
      handleAnswerChange(currentAnswers.filter(a => a !== option));
    } else {
      handleAnswerChange([...currentAnswers, option]);
    }
  };

  const toggleBookmark = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const isBookmarked = currentSession?.bookmarkedQuestions.has(currentQuestion.id);
    if (isBookmarked) {
      unbookmarkQuestion(currentQuestion.id);
      toast({ description: "Question unbookmarked" });
    } else {
      bookmarkQuestion(currentQuestion.id);
      toast({ description: "Question bookmarked" });
    }
  };

  const handleSubmitExam = async () => {
    if (!currentSession) return;

    try {
      const results = await submitExam();
      toast({
        title: "Exam Submitted Successfully",
        description: `Score: ${results.percentageScore.toFixed(1)}%`,
      });
      navigate('/exam-results', { state: { results, sessionId: currentSession.id } });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit exam",
        variant: "destructive",
      });
    }
  };

  const handleAbandonExam = () => {
    abandonExam();
    navigate('/dashboard');
    toast({
      title: "Exam Abandoned",
      description: "Your progress has been discarded",
      variant: "destructive",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = (timeRemaining: number, totalTime: number) => {
    const percentage = (timeRemaining / totalTime) * 100;
    if (percentage > 50) return 'good';
    if (percentage > 25) return 'warning';
    return 'danger';
  };

  const progress = currentSession ? getProgress() : { answered: 0, total: 0, percentage: 0, bookmarked: 0 };
  const currentQuestion = getCurrentQuestion();
  const currentAnswer = currentSession && currentQuestion 
    ? currentSession.answers[currentQuestion.id] 
    : undefined;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold mb-2">Loading Exam</h3>
            <p className="text-gray-600">Please wait while we prepare your questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Exam Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No session - show setup
  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Mock Exam Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please configure your exam settings to begin.
            </p>
            <Button onClick={() => navigate('/exam-setup')}>
              Configure Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeStatus = getTimeStatus(currentSession.timeRemaining, currentSession.totalDuration);
  const isBookmarked = currentQuestion && currentSession.bookmarkedQuestions.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">PMP Mock Exam</h2>
              <Badge variant={currentSession.settings.practiceMode ? "secondary" : "default"}>
                {currentSession.settings.practiceMode ? "Practice Mode" : "Exam Mode"}
              </Badge>
              <span className="text-sm text-gray-600">
                Question {currentSession.currentQuestionIndex + 1} / {currentSession.questions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Auto-save status */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Save className="w-3 h-3" />
                {autoSaveStatus === 'saving' && "Saving..."}
                {autoSaveStatus === 'saved' && "Saved"}
                {autoSaveStatus === 'error' && "Save failed"}
                {autoSaveStatus === 'idle' && "Auto-save enabled"}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className={`font-mono text-lg font-medium ${
                  timeStatus === 'danger' ? 'text-red-600' : 
                  timeStatus === 'warning' ? 'text-yellow-600' : 
                  'text-gray-900'
                }`}>
                  {formatTime(currentSession.timeRemaining)}
                </span>
              </div>
              
              {/* Controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => currentSession.isPaused ? resumeExam() : pauseExam()}
                className="p-2"
              >
                {currentSession.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionList(!showQuestionList)}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAbandonDialog(true)}
                className="text-red-600 hover:text-red-700"
              >
                Abandon
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>{progress.answered} of {progress.total} answered</span>
              <span>{progress.bookmarked} bookmarked</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Pause overlay */}
        {currentSession.isPaused && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardContent className="p-6 text-center">
                <Pause className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">Exam Paused</h3>
                <p className="text-gray-600 mb-4">Timer is stopped. Click resume to continue.</p>
                <Button onClick={resumeExam} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Resume Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.domain.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant={
                        currentQuestion.difficulty === 'easy' ? 'secondary' :
                        currentQuestion.difficulty === 'medium' ? 'default' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {currentQuestion.difficulty === 'easy' ? 'Easy' : 
                       currentQuestion.difficulty === 'medium' ? 'Medium' : 'Hard'}
                    </Badge>
                    {currentQuestion.type === 'multiple' && (
                      <Badge variant="outline" className="text-xs">
                        Multiple Choice
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>
                
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBookmark}
                  className={`ml-4 ${isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = currentQuestion.type === 'single'
                    ? currentAnswer === optionLetter
                    : Array.isArray(currentAnswer) && currentAnswer.includes(optionLetter);
                  
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        if (currentQuestion.type === 'single') {
                          handleAnswerChange(optionLetter);
                        } else {
                          handleMultipleAnswerChange(optionLetter);
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
                        <div>
                          <span className="font-medium text-gray-700 mr-2">{optionLetter}.</span>
                          <span className="text-gray-800">{option.substring(2)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentQuestion.type === 'multiple' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      <strong>Multiple Choice:</strong> Select all correct answers. This question may have more than one correct response.
                    </p>
                  </div>
                </div>
              )}

              {/* Show explanation in practice mode */}
              {currentSession.settings.practiceMode && currentSession.settings.showExplanations && currentAnswer && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Explanation:</h4>
                  <p className="text-green-800 text-sm">{currentQuestion.explanation}</p>
                  {currentQuestion.references && (
                    <div className="mt-2">
                      <p className="text-green-700 text-xs font-medium">References:</p>
                      <ul className="text-green-700 text-xs mt-1">
                        {currentQuestion.references.map((ref, index) => (
                          <li key={index}>• {ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateToQuestion(currentSession.currentQuestionIndex - 1)}
            disabled={!canNavigatePrevious()}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* Quick navigation dots */}
            {Array.from({ length: Math.min(10, currentSession.questions.length) }, (_, i) => {
              const baseIndex = Math.max(0, Math.min(
                currentSession.currentQuestionIndex - 5,
                currentSession.questions.length - 10
              ));
              const index = baseIndex + i;
              const question = currentSession.questions[index];
              const hasAnswer = question && currentSession.answers[question.id];
              const isBookmarked = question && currentSession.bookmarkedQuestions.has(question.id);
              
              return (
                <Button
                  key={index}
                  variant={index === currentSession.currentQuestionIndex ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigateToQuestion(index)}
                  className={`w-10 h-10 relative ${
                    hasAnswer ? 'ring-2 ring-green-300' : ''
                  }`}
                >
                  {index + 1}
                  {isBookmarked && (
                    <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                  )}
                </Button>
              );
            })}
          </div>

          {canNavigateNext() ? (
            <Button onClick={() => navigateToQuestion(currentSession.currentQuestionIndex + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Exam
            </Button>
          )}
        </div>
      </div>

      {/* Question List Sidebar */}
      {showQuestionList && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestionList(false)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {currentSession.questions.map((question, index) => {
                const hasAnswer = !!currentSession.answers[question.id];
                const isBookmarked = currentSession.bookmarkedQuestions.has(question.id);
                const isCurrent = index === currentSession.currentQuestionIndex;
                
                return (
                  <Button
                    key={index}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      navigateToQuestion(index);
                      setShowQuestionList(false);
                    }}
                    className={`relative p-3 ${
                      hasAnswer ? 'ring-2 ring-green-300' : ''
                    }`}
                  >
                    {index + 1}
                    {isBookmarked && (
                      <Flag className="absolute top-0 right-0 w-3 h-3 text-yellow-500" />
                    )}
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 ring-2 ring-green-300 rounded"></div>
                <span>Answered ({progress.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Not answered ({progress.total - progress.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-yellow-500" />
                <span>Bookmarked ({progress.bookmarked})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your exam? You have answered {progress.answered} out of {progress.total} questions.
              {progress.answered < progress.total && (
                <span className="block mt-2 text-yellow-600 font-medium">
                  Warning: You have {progress.total - progress.answered} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitExam}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Abandon Dialog */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandon Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to abandon this exam? All your progress will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbandonExam} className="bg-red-600 hover:bg-red-700">
              Abandon Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MockExamSession;