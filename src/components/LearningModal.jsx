import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, BookOpen, Save, Play, Pause } from 'lucide-react';
import { useProgress, progressService } from '../services/progressService';

const LearningModal = ({ isOpen, onClose, process, processId, knowledgeArea, processGroup }) => {
  const { updateProgress, updateStudyTime } = useProgress();
  const [progress, setProgress] = useState({
    completed: false,
    understanding: 0,
    notes: ''
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isOpen && process) {
      // 既存の進捗データを読み込む
      const existingProgress = progressService.getProcessProgress(processId);
      setProgress(existingProgress || {
        completed: false,
        understanding: 0,
        notes: ''
      });
    }
  }, [isOpen, processId, process]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      const endTime = Date.now();
      const sessionTime = Math.floor((endTime - startTime) / 60000); // 分単位
      updateStudyTime(sessionTime);
    } else {
      setIsTimerRunning(true);
      setStartTime(Date.now());
    }
  };

  const handleSave = async () => {
    await updateProgress(processId, progress);
    if (isTimerRunning) {
      handleTimerToggle(); // タイマーを停止して時間を保存
    }
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !process) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{process.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">プロセス情報</h3>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">知識エリア:</span> {knowledgeArea}
                </p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">プロセス群:</span> {processGroup}
                </p>
              </div>

              {process.inputs && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    インプット
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {process.inputs.map((input, idx) => (
                      <li key={idx}>{input}</li>
                    ))}
                  </ul>
                </div>
              )}

              {process.tools && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">ツールと技法</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {process.tools.map((tool, idx) => (
                      <li key={idx}>{tool}</li>
                    ))}
                  </ul>
                </div>
              )}

              {process.outputs && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">アウトプット</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {process.outputs.map((output, idx) => (
                      <li key={idx}>{output}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">学習タイマー</h3>
                  <button
                    onClick={handleTimerToggle}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      isTimerRunning 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isTimerRunning ? '停止' : '開始'}
                  </button>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-gray-700">
                    {formatTime(studyTime)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">学習時間</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={progress.completed}
                    onChange={(e) => setProgress({ ...progress, completed: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">学習完了</span>
                  <CheckCircle2 className={`w-5 h-5 ml-auto ${progress.completed ? 'text-green-600' : 'text-gray-400'}`} />
                </label>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-900">
                  理解度: {progress.understanding}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress.understanding}
                  onChange={(e) => setProgress({ ...progress, understanding: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress.understanding}%, #E5E7EB ${progress.understanding}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-900">
                  学習メモ
                </label>
                <textarea
                  value={progress.notes}
                  onChange={(e) => setProgress({ ...progress, notes: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="このプロセスについての理解、重要なポイント、疑問点などを記録..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LearningModal);