import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  BookOpen,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Users,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight,
  Star,
  Bookmark,
  Play,
  Settings,
} from 'lucide-react'
import { agileManifestoData } from '../../data/pmbok/agileManifestoData'
import type {
  AgilePractice,
  AgilePracticeCategory,
  AgileFramework,
} from '../../data/schemas/pmbok/agileTypes'

interface FilterState {
  category: AgilePracticeCategory | 'all'
  framework: AgileFramework | 'all'
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all'
  search: string
}

const AgilePracticesLibrary: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    framework: 'all',
    difficulty: 'all',
    search: '',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPractice, setSelectedPractice] = useState<AgilePractice | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const practices = agileManifestoData.practices

  const categories = [
    { key: 'all', label: 'すべて', count: practices.length },
    { key: 'scrum', label: 'Scrum', count: practices.filter((p) => p.category === 'scrum').length },
    {
      key: 'kanban',
      label: 'Kanban',
      count: practices.filter((p) => p.category === 'kanban').length,
    },
    { key: 'xp', label: 'XP', count: practices.filter((p) => p.category === 'xp').length },
    { key: 'lean', label: 'Lean', count: practices.filter((p) => p.category === 'lean').length },
    {
      key: 'planning',
      label: '計画',
      count: practices.filter((p) => p.category === 'planning').length,
    },
    {
      key: 'development',
      label: '開発',
      count: practices.filter((p) => p.category === 'development').length,
    },
    {
      key: 'testing',
      label: 'テスト',
      count: practices.filter((p) => p.category === 'testing').length,
    },
    {
      key: 'collaboration',
      label: 'コラボレーション',
      count: practices.filter((p) => p.category === 'collaboration').length,
    },
  ]

  const frameworks = [
    { key: 'all', label: 'すべて' },
    { key: 'Scrum', label: 'Scrum' },
    { key: 'Kanban', label: 'Kanban' },
    { key: 'XP', label: 'XP' },
    { key: 'Lean', label: 'Lean' },
    { key: 'SAFe', label: 'SAFe' },
    { key: 'Generic', label: 'Generic' },
  ]

  const difficulties = [
    { key: 'all', label: 'すべて' },
    { key: 'beginner', label: '初級' },
    { key: 'intermediate', label: '中級' },
    { key: 'advanced', label: '上級' },
  ]

  const filteredPractices = useMemo(() => {
    return practices.filter((practice) => {
      // Category filter
      if (filters.category !== 'all' && practice.category !== filters.category) {
        return false
      }

      // Framework filter
      if (
        filters.framework !== 'all' &&
        !practice.framework.includes(filters.framework as AgileFramework)
      ) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty !== 'all' && practice.difficulty !== filters.difficulty) {
        return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          practice.name.toLowerCase().includes(searchTerm) ||
          practice.description.toLowerCase().includes(searchTerm) ||
          practice.purpose.toLowerCase().includes(searchTerm)
        )
      }

      return true
    })
  }, [practices, filters])

  const toggleFavorite = (practiceId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(practiceId)) {
      newFavorites.delete(practiceId)
    } else {
      newFavorites.add(practiceId)
    }
    setFavorites(newFavorites)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getDifficultyColor = (difficulty: string) => {
    const colorMap = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colorMap[difficulty as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      scrum: Users,
      kanban: TrendingUp,
      xp: CheckCircle,
      lean: Target,
      planning: Clock,
      development: Settings,
      testing: AlertTriangle,
      collaboration: Users,
    }
    return iconMap[category as keyof typeof iconMap] || BookOpen
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <div className='mx-auto max-w-7xl space-y-8 p-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='space-y-4 text-center'
      >
        <div className='flex items-center justify-center space-x-3'>
          <div className='rounded-xl bg-gradient-to-r from-green-500 to-blue-600 p-3'>
            <BookOpen className='h-8 w-8 text-white' />
          </div>
          <h1 className='bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent'>
            アジャイル・プラクティス・ライブラリ
          </h1>
        </div>
        <p className='mx-auto max-w-3xl text-xl text-muted-foreground'>
          51のアジャイル・プラクティスを探索し、実践的な知識を身につける
        </p>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='space-y-4'
      >
        {/* Search Bar */}
        <div className='relative mx-auto max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
          <input
            type='text'
            placeholder='プラクティスを検索...'
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className='w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-ring'
          />
        </div>

        {/* Filter Controls */}
        <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-x-4 md:space-y-0'>
          {/* Category Filter */}
          <div className='flex flex-wrap gap-2'>
            {categories.map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filters.category === key ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilters((prev) => ({ ...prev, category: key as any }))}
                className='flex items-center space-x-2'
              >
                <span>{label}</span>
                <Badge variant='secondary' className='text-xs'>
                  {count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className='flex items-center space-x-2'>
            {/* Framework Filter */}
            <select
              value={filters.framework}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, framework: e.target.value as any }))
              }
              className='rounded-lg border border-input bg-background px-3 py-2 text-sm'
            >
              {frameworks.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, difficulty: e.target.value as any }))
              }
              className='rounded-lg border border-input bg-background px-3 py-2 text-sm'
            >
              {difficulties.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className='flex space-x-1 rounded-lg bg-muted p-1'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{filteredPractices.length} 件のプラクティスが見つかりました</span>
          <span>{favorites.size} 件をブックマーク済み</span>
        </div>
      </motion.div>

      {/* Practices Display */}
      <AnimatePresence mode='wait'>
        {viewMode === 'grid' ? (
          <motion.div
            key='grid'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          >
            {filteredPractices.map((practice, index) => (
              <motion.div key={practice.id} variants={itemVariants}>
                <PracticeGridCard
                  practice={practice}
                  isFavorite={favorites.has(practice.id)}
                  onToggleFavorite={() => toggleFavorite(practice.id)}
                  onSelect={() => setSelectedPractice(practice)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key='list'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-4'
          >
            {filteredPractices.map((practice, index) => (
              <motion.div key={practice.id} variants={itemVariants}>
                <PracticeListCard
                  practice={practice}
                  isFavorite={favorites.has(practice.id)}
                  onToggleFavorite={() => toggleFavorite(practice.id)}
                  onSelect={() => setSelectedPractice(practice)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Practice Detail Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'
            onClick={() => setSelectedPractice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='max-h-[90vh] max-w-4xl overflow-y-auto rounded-lg bg-background'
              onClick={(e) => e.stopPropagation()}
            >
              <PracticeDetailCard
                practice={selectedPractice}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
                onClose={() => setSelectedPractice(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Grid Card Component
const PracticeGridCard: React.FC<{
  practice: AgilePractice
  isFavorite: boolean
  onToggleFavorite: () => void
  onSelect: () => void
}> = ({ practice, isFavorite, onToggleFavorite, onSelect }) => {
  const CategoryIcon = getCategoryIcon(practice.category)

  return (
    <Card className='group h-full cursor-pointer transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex flex-1 items-center space-x-3'>
            <div className='rounded-lg bg-gradient-to-r from-blue-500 to-green-500 p-2'>
              <CategoryIcon className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0 flex-1'>
              <CardTitle className='truncate text-lg transition-colors group-hover:text-primary'>
                {practice.name}
              </CardTitle>
              <CardDescription className='line-clamp-2 text-sm'>
                {practice.description}
              </CardDescription>
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className='p-1'
          >
            <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current text-yellow-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent onClick={onSelect}>
        <div className='space-y-4'>
          {/* Framework and Difficulty */}
          <div className='flex items-center justify-between'>
            <div className='flex flex-wrap gap-1'>
              {practice.framework.slice(0, 2).map((framework) => (
                <Badge key={framework} variant='outline' className='text-xs'>
                  {framework}
                </Badge>
              ))}
            </div>
            <Badge className={`text-xs ${getDifficultyColor(practice.difficulty)}`}>
              {practice.difficulty === 'beginner'
                ? '初級'
                : practice.difficulty === 'intermediate'
                  ? '中級'
                  : '上級'}
            </Badge>
          </div>

          {/* Metrics */}
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex items-center space-x-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='truncate text-xs text-muted-foreground'>{practice.duration}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='truncate text-xs text-muted-foreground'>{practice.teamSize}</span>
            </div>
          </div>

          {/* Purpose Preview */}
          <p className='line-clamp-3 text-sm text-muted-foreground'>{practice.purpose}</p>

          {/* Call to Action */}
          <Button
            size='sm'
            className='w-full group-hover:bg-primary group-hover:text-primary-foreground'
          >
            詳細を見る
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// List Card Component
const PracticeListCard: React.FC<{
  practice: AgilePractice
  isFavorite: boolean
  onToggleFavorite: () => void
  onSelect: () => void
}> = ({ practice, isFavorite, onToggleFavorite, onSelect }) => {
  const CategoryIcon = getCategoryIcon(practice.category)

  return (
    <Card className='cursor-pointer transition-all duration-300 hover:shadow-md' onClick={onSelect}>
      <CardContent className='pt-6'>
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-gradient-to-r from-blue-500 to-green-500 p-3'>
            <CategoryIcon className='h-6 w-6 text-white' />
          </div>

          <div className='min-w-0 flex-1'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='truncate text-lg font-semibold'>{practice.name}</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite()
                }}
                className='p-1'
              >
                <Bookmark
                  className={`h-4 w-4 ${isFavorite ? 'fill-current text-yellow-500' : ''}`}
                />
              </Button>
            </div>

            <p className='mb-3 line-clamp-2 text-sm text-muted-foreground'>
              {practice.description}
            </p>

            <div className='flex items-center space-x-4 text-sm'>
              <div className='flex flex-wrap gap-1'>
                {practice.framework.slice(0, 3).map((framework) => (
                  <Badge key={framework} variant='outline' className='text-xs'>
                    {framework}
                  </Badge>
                ))}
              </div>

              <Badge className={`text-xs ${getDifficultyColor(practice.difficulty)}`}>
                {practice.difficulty === 'beginner'
                  ? '初級'
                  : practice.difficulty === 'intermediate'
                    ? '中級'
                    : '上級'}
              </Badge>

              <div className='flex items-center space-x-1 text-muted-foreground'>
                <Clock className='h-3 w-3' />
                <span className='text-xs'>{practice.duration}</span>
              </div>

              <div className='flex items-center space-x-1 text-muted-foreground'>
                <Users className='h-3 w-3' />
                <span className='text-xs'>{practice.teamSize}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Practice Detail Card Component
const PracticeDetailCard: React.FC<{
  practice: AgilePractice
  expandedSections: Set<string>
  onToggleSection: (section: string) => void
  onClose: () => void
}> = ({ practice, expandedSections, onToggleSection, onClose }) => {
  const CategoryIcon = getCategoryIcon(practice.category)

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='rounded-lg bg-gradient-to-r from-blue-500 to-green-500 p-3'>
            <CategoryIcon className='h-8 w-8 text-white' />
          </div>
          <div>
            <h2 className='text-2xl font-bold'>{practice.name}</h2>
            <p className='text-muted-foreground'>{practice.description}</p>
          </div>
        </div>
        <Button variant='ghost' onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Meta Information */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <div className='space-y-1'>
          <span className='text-sm font-medium'>カテゴリ</span>
          <div>
            <Badge variant='secondary'>{practice.category}</Badge>
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm font-medium'>フレームワーク</span>
          <div className='flex flex-wrap gap-1'>
            {practice.framework.map((framework) => (
              <Badge key={framework} variant='outline' className='text-xs'>
                {framework}
              </Badge>
            ))}
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm font-medium'>難易度</span>
          <div>
            <Badge className={getDifficultyColor(practice.difficulty)}>
              {practice.difficulty === 'beginner'
                ? '初級'
                : practice.difficulty === 'intermediate'
                  ? '中級'
                  : '上級'}
            </Badge>
          </div>
        </div>
        <div className='space-y-1'>
          <span className='text-sm font-medium'>所要時間</span>
          <div className='flex items-center space-x-1'>
            <Clock className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm'>{practice.duration}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Purpose */}
      <div>
        <h3 className='mb-2 text-lg font-semibold'>目的</h3>
        <p className='text-muted-foreground'>{practice.purpose}</p>
      </div>

      {/* Collapsible Sections */}
      <div className='space-y-4'>
        <CollapsibleSection
          title='実装方法'
          icon={<Settings className='h-4 w-4' />}
          isExpanded={expandedSections.has(`${practice.id}-implementation`)}
          onToggle={() => onToggleSection(`${practice.id}-implementation`)}
        >
          <ul className='space-y-2'>
            {practice.howToImplement.map((step, index) => (
              <li key={index} className='flex items-start space-x-2'>
                <div className='mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                  <span className='text-xs font-medium text-blue-800 dark:text-blue-200'>
                    {index + 1}
                  </span>
                </div>
                <span className='text-sm'>{step}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection
          title='利点'
          icon={<CheckCircle className='h-4 w-4' />}
          isExpanded={expandedSections.has(`${practice.id}-benefits`)}
          onToggle={() => onToggleSection(`${practice.id}-benefits`)}
        >
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {practice.benefits.map((benefit, index) => (
              <div key={index} className='flex items-start space-x-2'>
                <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                <span className='text-sm'>{benefit}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='課題と対策'
          icon={<AlertTriangle className='h-4 w-4' />}
          isExpanded={expandedSections.has(`${practice.id}-challenges`)}
          onToggle={() => onToggleSection(`${practice.id}-challenges`)}
        >
          <div className='space-y-3'>
            <div>
              <h5 className='mb-2 font-medium text-orange-600'>課題</h5>
              <ul className='space-y-1'>
                {practice.challenges.map((challenge, index) => (
                  <li key={index} className='text-sm text-muted-foreground'>
                    • {challenge}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className='mb-2 font-medium text-red-600'>一般的な落とし穴</h5>
              <ul className='space-y-1'>
                {practice.commonPitfalls.map((pitfall, index) => (
                  <li key={index} className='text-sm text-red-600 dark:text-red-400'>
                    • {pitfall}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='成功要因'
          icon={<Award className='h-4 w-4' />}
          isExpanded={expandedSections.has(`${practice.id}-success`)}
          onToggle={() => onToggleSection(`${practice.id}-success`)}
        >
          <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
            {practice.successFactors.map((factor, index) => (
              <div key={index} className='rounded-lg bg-green-50 p-3 dark:bg-green-950'>
                <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                  {factor}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title='実世界の事例'
          icon={<Star className='h-4 w-4' />}
          isExpanded={expandedSections.has(`${practice.id}-examples`)}
          onToggle={() => onToggleSection(`${practice.id}-examples`)}
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            {practice.realWorldExamples.map((example, index) => (
              <div
                key={index}
                className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950'
              >
                <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                  {example}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  )
}

// Collapsible Section Component
const CollapsibleSection: React.FC<{
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  isExpanded: boolean
  onToggle: () => void
}> = ({ title, icon, children, isExpanded, onToggle }) => {
  return (
    <div className='rounded-lg border border-border'>
      <Button
        variant='ghost'
        onClick={onToggle}
        className='flex w-full items-center justify-between p-4 font-medium hover:bg-muted'
      >
        <div className='flex items-center space-x-2'>
          {icon}
          <span>{title}</span>
        </div>
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </Button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden'
          >
            <div className='p-4 pt-0'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper function for category icons
const getCategoryIcon = (category: string) => {
  const iconMap = {
    scrum: Users,
    kanban: TrendingUp,
    xp: CheckCircle,
    lean: Target,
    planning: Clock,
    development: Settings,
    testing: AlertTriangle,
    collaboration: Users,
  }
  return iconMap[category as keyof typeof iconMap] || BookOpen
}

export default AgilePracticesLibrary
