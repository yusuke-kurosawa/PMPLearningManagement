import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Target,
  Layers,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Lightbulb,
  Settings,
} from 'lucide-react'
import { opmFramework, implementationRoadmap, opmBenefits } from '../../data/pmbok/opmData.js'
import type {
  OPMFramework,
  ImplementationRoadmap,
  OPMBenefits,
} from '../../data/schemas/pmbok/opmTypes'

interface HierarchyCardProps {
  level: any
  index: number
  isSelected: boolean
  onSelect: (id: string) => void
  theme: 'light' | 'dark'
}

const HierarchyCard: React.FC<HierarchyCardProps> = ({
  level,
  index,
  isSelected,
  onSelect,
  theme,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const hierarchyIcons = [
    <Building2 className='h-8 w-8' />,
    <Target className='h-8 w-8' />,
    <Layers className='h-8 w-8' />,
  ]

  const hierarchyColors = [
    'bg-purple-100 border-purple-300 text-purple-700',
    'bg-blue-100 border-blue-300 text-blue-700',
    'bg-green-100 border-green-300 text-green-700',
  ]

  const hierarchyColorsDark = [
    'bg-purple-900/30 border-purple-600 text-purple-300',
    'bg-blue-900/30 border-blue-600 text-blue-300',
    'bg-green-900/30 border-green-600 text-green-300',
  ]

  const colorClass = theme === 'dark' ? hierarchyColorsDark[index] : hierarchyColors[index]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 ${
        isSelected
          ? `${colorClass} scale-105 shadow-lg`
          : theme === 'dark'
            ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
            : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => onSelect(level.id)}
    >
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div
            className={`rounded-lg p-3 ${isSelected ? 'bg-white/20' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            {hierarchyIcons[index]}
          </div>
          <div>
            <h3
              className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              {level.name}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              レベル {level.level}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
          className={`rounded-lg p-2 transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          {isExpanded ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
        </button>
      </div>

      <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {level.definition}
      </p>

      <div
        className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
      >
        主要フォーカス: {level.primaryFocus}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='mt-4 space-y-4'
          >
            <div>
              <h4
                className={`mb-2 font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要特徴
              </h4>
              <ul className='space-y-1'>
                {level.keyCharacteristics.map((characteristic: string, idx: number) => (
                  <li
                    key={idx}
                    className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                    {characteristic}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className={`mb-2 font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要成果物
              </h4>
              <ul className='space-y-1'>
                {level.deliverables.map((deliverable: string, idx: number) => (
                  <li
                    key={idx}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    • {deliverable}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className={`mb-2 font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
              >
                主要メトリクス
              </h4>
              <ul className='space-y-1'>
                {level.metrics.map((metric: string, idx: number) => (
                  <li
                    key={idx}
                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <BarChart3 className='mr-2 inline h-4 w-4' />
                    {metric}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface ValueFlowVisualizationProps {
  theme: 'light' | 'dark'
}

const ValueFlowVisualization: React.FC<ValueFlowVisualizationProps> = ({ theme }) => {
  const valueFlow = opmFramework.relationships.value_flow
  const strategicAlignment = opmFramework.relationships.strategic_alignment

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`mb-6 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        OPM価値実現システム
      </h3>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* 戦略的整合性の流れ */}
        <div>
          <div className='mb-4 flex items-center'>
            <ArrowDown className='mr-2 h-5 w-5 text-blue-500' />
            <h4 className={`font-semibold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
              戦略的整合性（Top-Down）
            </h4>
          </div>
          <div className='space-y-3'>
            {strategicAlignment.flow.map((item: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`rounded-lg border p-3 ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className='flex items-center'>
                  <div
                    className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                    {item}
                  </span>
                </div>
                {index < strategicAlignment.flow.length - 1 && (
                  <div className='mt-2 flex justify-center'>
                    <ArrowDown className='h-4 w-4 text-blue-500' />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 価値の流れ */}
        <div>
          <div className='mb-4 flex items-center'>
            <ArrowUp className='mr-2 h-5 w-5 text-green-500' />
            <h4
              className={`font-semibold ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}
            >
              価値の流れ（Bottom-Up）
            </h4>
          </div>
          <div className='space-y-3'>
            {valueFlow.flow.map((item: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`rounded-lg border p-3 ${
                  theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className='flex items-center'>
                  <div
                    className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      theme === 'dark' ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>
                    {item}
                  </span>
                </div>
                {index < valueFlow.flow.length - 1 && (
                  <div className='mt-2 flex justify-center'>
                    <ArrowUp className='h-4 w-4 text-green-500' />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface BenefitsOverviewProps {
  theme: 'light' | 'dark'
}

const BenefitsOverview: React.FC<BenefitsOverviewProps> = ({ theme }) => {
  const benefitIcons = {
    organizational: <Building2 className='h-6 w-6' />,
    financial: <DollarSign className='h-6 w-6' />,
    operational: <Settings className='h-6 w-6' />,
    strategic: <Lightbulb className='h-6 w-6' />,
  }

  const benefitColors = {
    organizational:
      theme === 'dark' ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-100 border-purple-300',
    financial:
      theme === 'dark' ? 'bg-green-900/30 border-green-600' : 'bg-green-100 border-green-300',
    operational:
      theme === 'dark' ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-100 border-blue-300',
    strategic:
      theme === 'dark' ? 'bg-orange-900/30 border-orange-600' : 'bg-orange-100 border-orange-300',
  }

  const benefitNames = {
    organizational: '組織的効果',
    financial: '財務的効果',
    operational: '運用的効果',
    strategic: '戦略的効果',
  }

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`mb-6 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        OPM導入効果
      </h3>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {Object.entries(opmBenefits).map(([category, benefits]) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border-2 p-4 ${benefitColors[category as keyof typeof benefitColors]}`}
          >
            <div className='mb-3 flex items-center'>
              <div
                className={`mr-3 rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
              >
                {benefitIcons[category as keyof typeof benefitIcons]}
              </div>
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {benefitNames[category as keyof typeof benefitNames]}
              </h4>
            </div>
            <ul className='space-y-2'>
              {benefits.map((benefit: string, index: number) => (
                <li
                  key={index}
                  className={`flex items-start text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  <CheckCircle className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500' />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

interface ImplementationRoadmapProps {
  theme: 'light' | 'dark'
}

const ImplementationRoadmapComponent: React.FC<ImplementationRoadmapProps> = ({ theme }) => {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  const phaseColors = [
    theme === 'dark' ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-100 border-blue-300',
    theme === 'dark' ? 'bg-purple-900/30 border-purple-600' : 'bg-purple-100 border-purple-300',
    theme === 'dark' ? 'bg-green-900/30 border-green-600' : 'bg-green-100 border-green-300',
  ]

  return (
    <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`mb-6 text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        実装ロードマップ
      </h3>

      <div className='space-y-4'>
        {Object.entries(implementationRoadmap).map(([phaseKey, phase], index) => (
          <motion.div
            key={phaseKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
              selectedPhase === phaseKey
                ? `${phaseColors[index]} shadow-lg`
                : theme === 'dark'
                  ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPhase(selectedPhase === phaseKey ? null : phaseKey)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div
                  className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h4
                    className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {phase.name}
                  </h4>
                  <div className='mt-1 flex items-center'>
                    <Clock className='mr-1 h-4 w-4 text-gray-500' />
                    <span
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {phase.duration}
                    </span>
                  </div>
                </div>
              </div>
              {selectedPhase === phaseKey ? (
                <ChevronUp className='h-5 w-5' />
              ) : (
                <ChevronDown className='h-5 w-5' />
              )}
            </div>

            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {phase.focus}
            </p>

            <AnimatePresence>
              {selectedPhase === phaseKey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className='mt-4'
                >
                  <h5
                    className={`mb-2 font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    主要活動:
                  </h5>
                  <ul className='space-y-1'>
                    {phase.activities.map((activity: string, idx: number) => (
                      <li
                        key={idx}
                        className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const OPMLearningHub: React.FC = () => {
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('portfolio')
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'flow' | 'benefits' | 'roadmap'>(
    'hierarchy'
  )
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const hierarchyLevels = [
    opmFramework.hierarchy.portfolio,
    opmFramework.hierarchy.program,
    opmFramework.hierarchy.project,
  ]

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <div className='container mx-auto px-6 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 text-center'
        >
          <h1
            className={`mb-4 text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            OPM学習ハブ
          </h1>
          <p
            className={`mx-auto max-w-3xl text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {opmFramework.definition.description}
          </p>
          <div className='mt-4 flex justify-center'>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`rounded-lg px-4 py-2 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'light' ? '🌙 ダークモード' : '☀️ ライトモード'}
            </button>
          </div>
        </motion.div>

        {/* タブナビゲーション */}
        <div className='mb-8 flex justify-center'>
          <div
            className={`inline-flex rounded-xl p-1 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            {[
              { key: 'hierarchy', label: '階層構造', icon: <Layers className='h-5 w-5' /> },
              { key: 'flow', label: '価値の流れ', icon: <TrendingUp className='h-5 w-5' /> },
              { key: 'benefits', label: '導入効果', icon: <CheckCircle className='h-5 w-5' /> },
              { key: 'roadmap', label: 'ロードマップ', icon: <Clock className='h-5 w-5' /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 rounded-lg px-6 py-3 transition-all ${
                  activeTab === tab.key
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className='font-medium'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* コンテンツエリア */}
        <AnimatePresence mode='wait'>
          {activeTab === 'hierarchy' && (
            <motion.div
              key='hierarchy'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className='grid grid-cols-1 gap-8 lg:grid-cols-3'
            >
              {hierarchyLevels.map((level, index) => (
                <HierarchyCard
                  key={level.id}
                  level={level}
                  index={index}
                  isSelected={selectedHierarchy === level.id}
                  onSelect={setSelectedHierarchy}
                  theme={theme}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'flow' && (
            <motion.div
              key='flow'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ValueFlowVisualization theme={theme} />
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key='benefits'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BenefitsOverview theme={theme} />
            </motion.div>
          )}

          {activeTab === 'roadmap' && (
            <motion.div
              key='roadmap'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ImplementationRoadmapComponent theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OPMLearningHub
