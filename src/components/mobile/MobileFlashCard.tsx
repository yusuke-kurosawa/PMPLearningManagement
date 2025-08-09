import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTouchGestures, useHapticFeedback } from '@/hooks/useTouchGestures';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashCardData {
  id: string;
  processName: string;
  knowledgeArea: string;
  processGroup: string;
  inputs: string[];
  tools: string[];
  outputs: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MobileFlashCardProps {
  cards: FlashCardData[];
  onComplete?: (results: Record<string, boolean>) => void;
}

export function MobileFlashCard({ cards, onComplete }: MobileFlashCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const haptic = useHapticFeedback();

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setExitDirection('left');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setExitDirection(null);
      }, 300);
      haptic.light();
    } else if (onComplete) {
      onComplete(results);
      haptic.success();
    }
  }, [currentIndex, cards.length, results, onComplete, haptic]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setExitDirection('right');
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsFlipped(false);
        setExitDirection(null);
      }, 300);
      haptic.light();
    }
  }, [currentIndex, haptic]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
    haptic.light();
  }, [haptic]);

  const handleMarkResult = useCallback((correct: boolean) => {
    setResults(prev => ({
      ...prev,
      [currentCard.id]: correct
    }));
    haptic.medium();
    handleNext();
  }, [currentCard?.id, handleNext, haptic]);

  // Touch gesture handlers
  useTouchGestures({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    onDoubleTap: handleFlip,
  });

  if (!currentCard) return null;

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-4 py-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            カード {currentIndex + 1} / {cards.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ 
              x: exitDirection === 'left' ? 300 : exitDirection === 'right' ? -300 : 0,
              opacity: exitDirection ? 0 : 1 
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: exitDirection === 'left' ? -300 : exitDirection === 'right' ? 300 : 0,
              opacity: 0 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
          >
            <Card 
              className="relative w-full aspect-[3/4] cursor-pointer touch-none select-none"
              onClick={handleFlip}
            >
              <div className={`
                absolute inset-0 w-full h-full transition-transform duration-500 preserve-3d
                ${isFlipped ? 'rotate-y-180' : ''}
              `}>
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden p-6 flex flex-col">
                  <div className="mb-4">
                    <span className={`
                      inline-block px-2 py-1 text-xs font-semibold rounded-full
                      ${currentCard.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        currentCard.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'}
                    `}>
                      {currentCard.difficulty === 'easy' ? '簡単' :
                       currentCard.difficulty === 'medium' ? '普通' : '難しい'}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      {currentCard.processName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      知識エリア: {currentCard.knowledgeArea}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      プロセス群: {currentCard.processGroup}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      タップして答えを見る
                    </p>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 overflow-y-auto">
                  <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                    ITTO詳細
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-sm text-blue-600 dark:text-blue-400 mb-2">
                        インプット ({currentCard.inputs.length})
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {currentCard.inputs.slice(0, 3).map((input, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{input}</span>
                          </li>
                        ))}
                        {currentCard.inputs.length > 3 && (
                          <li className="text-gray-500 dark:text-gray-400">
                            他 {currentCard.inputs.length - 3} 項目
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2">
                        ツールと技法 ({currentCard.tools.length})
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {currentCard.tools.slice(0, 3).map((tool, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{tool}</span>
                          </li>
                        ))}
                        {currentCard.tools.length > 3 && (
                          <li className="text-gray-500 dark:text-gray-400">
                            他 {currentCard.tools.length - 3} 項目
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-sm text-purple-600 dark:text-purple-400 mb-2">
                        アウトプット ({currentCard.outputs.length})
                      </h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {currentCard.outputs.slice(0, 3).map((output, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span className="flex-1">{output}</span>
                          </li>
                        ))}
                        {currentCard.outputs.length > 3 && (
                          <li className="text-gray-500 dark:text-gray-400">
                            他 {currentCard.outputs.length - 3} 項目
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      <div className="mt-6 space-y-4">
        {/* Flip and Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-12 w-12"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            onClick={handleFlip}
            className="h-12 px-6"
          >
            <RotateCw className="h-5 w-5 mr-2" />
            回転
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="h-12 w-12"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Result Marking */}
        {isFlipped && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleMarkResult(false)}
              className="flex-1 h-12 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-5 w-5 mr-2 text-red-600" />
              わからない
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMarkResult(true)}
              className="flex-1 h-12 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Check className="h-5 w-5 mr-2 text-green-600" />
              わかる
            </Button>
          </div>
        )}
      </div>

      {/* Gesture Hints */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>スワイプで前後移動 • ダブルタップで回転</p>
      </div>
    </div>
  );
}

export default MobileFlashCard;