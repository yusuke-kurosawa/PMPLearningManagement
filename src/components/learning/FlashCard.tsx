import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react'

const FlashCard = ({ process, onNext, onPrevious, onAnswer, currentIndex, totalCards }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(true)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleFlip()
    }
  }

  const handleAnswer = (isCorrect) => {
    onAnswer(process.id, isCorrect)
    setIsFlipped(false)
    setShowAnswer(false)
    onNext()
  }

  const handleNavigate = (direction) => {
    setIsFlipped(false)
    setShowAnswer(false)
    if (direction === 'next') {
      onNext()
    } else {
      onPrevious()
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl" role="main">
      {/* Screen reader announcement for card state */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isFlipped ? `Answer shown for ${process.name}` : `Question shown for ${process.name}`}
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">
          カード {currentIndex + 1} / {totalCards}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{process.knowledgeArea}</span>
          <span className="text-sm text-gray-600">•</span>
          <span className="text-sm text-gray-600">{process.processGroup}</span>
        </div>
      </div>

      <div className="relative mb-6 h-96">
        <div
          className={`preserve-3d absolute inset-0 h-full w-full transform-gpu cursor-pointer transition-all duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={isFlipped ? 'Card showing answer. Press Enter or Space to show question again' : 'Card showing question. Press Enter or Space to flip and see answer'}
          aria-pressed={isFlipped}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 表面 - 問題 */}
          <div className="backface-hidden absolute inset-0 h-full w-full rounded-lg shadow-xl">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-8">
              <h3 className="mb-4 text-center text-2xl font-bold text-gray-800">{process.name}</h3>
              <p className="text-center text-gray-600">
                このプロセスのITTO（インプット、ツールと技法、アウトプット）は？
              </p>
              <div className="mt-8">
                <button 
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Flip card to see answer"
                >
                  <RotateCcw className="h-4 w-4" />
                  答えを見る
                </button>
              </div>
            </div>
          </div>

          {/* 裏面 - 答え */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 h-full w-full rounded-lg shadow-xl">
            <div className="h-full w-full overflow-y-auto rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
              <h3 className="mb-4 text-center text-xl font-bold text-gray-800">{process.name}</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-gray-700">インプット</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                    {process.inputs?.map((input, idx) => (
                      <li key={idx}>{input}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-700">ツールと技法</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                    {process.tools?.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-gray-700">アウトプット</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
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
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
          aria-label="Previous flashcard"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {showAnswer && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Mark as not remembered"
            >
              <X className="h-4 w-4" />
              まだ覚えていない
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Mark as remembered"
            >
              <Check className="h-4 w-4" />
              覚えた！
            </button>
          </div>
        )}

        <button
          onClick={() => handleNavigate('next')}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === totalCards - 1}
          aria-label="Next flashcard"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default React.memo(FlashCard)
