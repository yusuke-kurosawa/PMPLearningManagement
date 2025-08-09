import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

const FlashCard = ({ process, onNext, onPrevious, onAnswer, currentIndex, totalCards }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect) => {
    onAnswer(process.id, isCorrect);
    setIsFlipped(false);
    setShowAnswer(false);
    onNext();
  };

  const handleNavigate = (direction) => {
    setIsFlipped(false);
    setShowAnswer(false);
    if (direction === 'next') {
      onNext();
    } else {
      onPrevious();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">
          カード {currentIndex + 1} / {totalCards}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{process.knowledgeArea}</span>
          <span className="text-sm text-gray-600">•</span>
          <span className="text-sm text-gray-600">{process.processGroup}</span>
        </div>
      </div>

      <div className="relative h-96 mb-6">
        <div 
          className={`absolute inset-0 w-full h-full transition-all duration-500 transform-gpu preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 表面 - 問題 */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-lg shadow-xl">
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                {process.name}
              </h2>
              <p className="text-gray-600 text-center">
                このプロセスのITTO（インプット、ツールと技法、アウトプット）は？
              </p>
              <div className="mt-8">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  答えを見る
                </button>
              </div>
            </div>
          </div>

          {/* 裏面 - 答え */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-xl">
            <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                {process.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">インプット</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {process.inputs?.map((input, idx) => (
                      <li key={idx}>{input}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">ツールと技法</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {process.tools?.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">アウトプット</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {process.outputs?.map((output, idx) => (
                      <li key={idx}>{output}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* コントロール */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleNavigate('previous')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {showAnswer && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              まだ覚えていない
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              覚えた！
            </button>
          </div>
        )}

        <button
          onClick={() => handleNavigate('next')}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={currentIndex === totalCards - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default React.memo(FlashCard);