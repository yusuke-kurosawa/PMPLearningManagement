import React, { useState, useEffect } from 'react'
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
    }
  }, [isOpen, processId, process])

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen || !process) {return null}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-900">{process.name}</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
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
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                      isTimerRunning
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
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
                  />
                  <span className="font-medium text-gray-900">学習完了</span>
                  <CheckCircle2
                    className={`ml-auto h-5 w-5 ${progress.completed ? 'text-green-600' : 'text-gray-400'}`}
                  />
                </label>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900">
                  理解度: {progress.understanding}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress.understanding}
                  onChange={(e) =>
                    setProgress({ ...progress, understanding: parseInt(e.target.value) })
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress.understanding}%, #E5E7EB ${progress.understanding}%, #E5E7EB 100%)`,
                  }}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-900">学習メモ</label>
                <textarea
                  value={progress.notes}
                  onChange={(e) => setProgress({ ...progress, notes: e.target.value })}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="このプロセスについての理解、重要なポイント、疑問点などを記録..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
