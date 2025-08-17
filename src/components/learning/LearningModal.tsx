import React, { useState, useEffect, useRef } from 'react'
import { X, CheckCircle2, BookOpen, Save, Play, Pause } from 'lucide-react'
import { useProgress, progressService } from '../../services/progressService'

const LearningModal = ({ isOpen, onClose, process, processId, knowledgeArea, processGroup }) => {
  const { updateProgress, updateStudyTime } = useProgress()
  const [progress, setProgress] = useState({
    completed: false,
    understanding: 0,
    notes: '',
  })
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [studyTime, setStudyTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)
  const _firstFocusableRef = useRef(null)

  useEffect(() => {
    if (isOpen && process) {
      // 既存の進捗データを読み込む
      const existingProgress = progressService.getProcessProgress(processId)
      setProgress(
        existingProgress || {
          completed: false,
          understanding: 0,
          notes: '',
        }
      )
      
      // Focus management for accessibility
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
      }
    }
  }, [isOpen, processId, process])
  
  // Handle ESC key press and focus trap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
      
      // Focus trap logic
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false)
      const endTime = Date.now()
      const sessionTime = Math.floor((endTime - startTime) / 60000) // 分単位
      updateStudyTime(sessionTime)
    } else {
      setIsTimerRunning(true)
      setStartTime(Date.now())
    }
  }

  const handleSave = async () => {
    await updateProgress(processId, progress)
    if (isTimerRunning) {
      handleTimerToggle() // タイマーを停止して時間を保存
    }
    onClose()
  }
  
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen || !process) {return null}

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">{process.name}</h2>
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div id="modal-description" className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">プロセス情報</h3>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">知識エリア:</span> {knowledgeArea}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">プロセス群:</span> {processGroup}
                </p>
              </div>

              {process.inputs && (
                <div className="mb-4">
                  <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                    <BookOpen className="h-4 w-4" />
                    インプット
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {process.inputs.map((input, idx) => (
                      <li key={idx}>{input}</li>
                    ))}
                  </ul>
                </div>
              )}

              {process.tools && (
                <div className="mb-4">
                  <h3 className="mb-2 font-semibold text-gray-900">ツールと技法</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {process.tools.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {process.outputs && (
                <div className="mb-4">
                  <h3 className="mb-2 font-semibold text-gray-900">アウトプット</h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {process.outputs.map((output, idx) => (
                      <li key={idx}>{output}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">学習タイマー</h3>
                  <button
                    onClick={handleTimerToggle}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isTimerRunning
                        ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500'
                        : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
                    }`}
                    aria-label={isTimerRunning ? 'Stop study timer' : 'Start study timer'}
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isTimerRunning ? '停止' : '開始'}
                  </button>
                </div>
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold text-gray-700">
                    {formatTime(studyTime)}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">学習時間</p>
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={progress.completed}
                    onChange={(e) => setProgress({ ...progress, completed: e.target.checked })}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    aria-describedby="completion-help"
                  />
                  <span className="font-medium text-gray-900">学習完了</span>
                  <span id="completion-help" className="sr-only">Mark this process as completed in your learning progress</span>
                  <CheckCircle2
                    className={`ml-auto h-5 w-5 ${progress.completed ? 'text-green-600' : 'text-gray-400'}`}
                  />
                </label>
              </div>

              <div>
                <label htmlFor="understanding-slider" className="mb-2 block font-medium text-gray-900">
                  理解度: {progress.understanding}%
                </label>
                <input
                  id="understanding-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={progress.understanding}
                  onChange={(e) =>
                    setProgress({ ...progress, understanding: parseInt(e.target.value) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress.understanding}%, #E5E7EB ${progress.understanding}%, #E5E7EB 100%)`,
                  }}
                  aria-describedby="understanding-help"
                />
                <span id="understanding-help" className="sr-only">Slide to set your understanding level from 0 to 100 percent</span>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label htmlFor="learning-notes" className="mb-2 block font-medium text-gray-900">学習メモ</label>
                <textarea
                  id="learning-notes"
                  value={progress.notes}
                  onChange={(e) => setProgress({ ...progress, notes: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="このプロセスについての理解、重要なポイント、疑問点などを記録..."
                  aria-describedby="notes-help"
                />
                <span id="notes-help" className="sr-only">Write your understanding, key points, and questions about this process</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(LearningModal)
