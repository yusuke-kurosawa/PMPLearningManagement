import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Progress } from '../ui/progress'
import {
  BookOpen,
  Users,
  Code,
  Users as Handshake,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Target,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Award,
  ArrowRight,
  Filter,
  Grid,
  List,
  Network,
} from 'lucide-react'
import { agileManifestoData } from '../../data/pmbok/agileManifestoData'
import type { AgilePrinciple } from '../../data/schemas/pmbok/agileTypes'

const AgilePrinciplesExplorer: React.FC = () => {
  const [currentPrinciple, setCurrentPrinciple] = useState(0)
  const [viewMode, setViewMode] = useState<'carousel' | 'grid' | 'network'>('carousel')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const principles = agileManifestoData.manifesto.principles

  const categories = useMemo(() => {
    const cats = [...new Set(principles.map((p) => p.category))]
    return [
      { key: 'all', label: 'すべて', icon: Grid },
      { key: 'customer-collaboration', label: '顧客協調', icon: Handshake },
      { key: 'working-software', label: '動くソフトウェア', icon: Code },
      { key: 'team-dynamics', label: 'チームダイナミクス', icon: Users },
      { key: 'process-improvement', label: 'プロセス改善', icon: TrendingUp },
    ]
  }, [])

  const filteredPrinciples = useMemo(() => {
    if (selectedCategory === 'all') {
      return principles
    }
    return principles.filter((p) => p.category === selectedCategory)
  }, [principles, selectedCategory])

  const getCategoryIcon = (category: string) => {
    const categoryMap = {
      'customer-collaboration': Handshake,
      'working-software': Code,
      'team-dynamics': Users,
      'process-improvement': TrendingUp,
    }
    return categoryMap[category as keyof typeof categoryMap] || Target
  }

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'customer-collaboration': 'from-blue-500 to-blue-600',
      'working-software': 'from-green-500 to-green-600',
      'team-dynamics': 'from-purple-500 to-purple-600',
      'process-improvement': 'from-orange-500 to-orange-600',
    }
    return colorMap[category as keyof typeof colorMap] || 'from-gray-500 to-gray-600'
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

  const nextPrinciple = () => {
    setCurrentPrinciple((prev) => (prev + 1) % filteredPrinciples.length)
  }

  const prevPrinciple = () => {
    setCurrentPrinciple(
      (prev) => (prev - 1 + filteredPrinciples.length) % filteredPrinciples.length
    )
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
          <div className='rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 p-3'>
            <BookOpen className='h-8 w-8 text-white' />
          </div>
          <h1 className='bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent'>
            アジャイル12原則
          </h1>
        </div>
        <p className='mx-auto max-w-3xl text-xl text-muted-foreground'>
          アジャイル・マニフェストの背後にある原則を深く理解し、実践に活かす
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'
      >
        {/* View Mode Selector */}
        <div className='flex space-x-1 rounded-lg bg-muted p-1'>
          {[
            { key: 'carousel', label: 'カルーセル', icon: ArrowRight },
            { key: 'grid', label: 'グリッド', icon: Grid },
            { key: 'network', label: 'ネットワーク', icon: Network },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={viewMode === key ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode(key as any)}
              className='flex items-center space-x-2'
            >
              <Icon className='h-4 w-4' />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {/* Category Filter */}
        <div className='flex flex-wrap gap-2'>
          {categories.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedCategory(key)}
              className='flex items-center space-x-2'
            >
              <Icon className='h-4 w-4' />
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode='wait'>
        {/* Carousel View */}
        {viewMode === 'carousel' && (
          <motion.div
            key='carousel'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            {/* Progress Bar */}
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>原則 {filteredPrinciples[currentPrinciple]?.number || 1} / 12</span>
                <span>
                  {Math.round(((currentPrinciple + 1) / filteredPrinciples.length) * 100)}% 完了
                </span>
              </div>
              <Progress value={((currentPrinciple + 1) / filteredPrinciples.length) * 100} />
            </div>

            {/* Navigation */}
            <div className='flex items-center justify-between'>
              <Button
                variant='outline'
                onClick={prevPrinciple}
                disabled={filteredPrinciples.length <= 1}
                className='flex items-center space-x-2'
              >
                <ChevronLeft className='h-4 w-4' />
                <span>前の原則</span>
              </Button>

              <div className='flex space-x-1'>
                {filteredPrinciples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPrinciple(index)}
                    className={`h-3 w-3 rounded-full transition-all ${
                      index === currentPrinciple
                        ? 'scale-125 bg-primary'
                        : 'bg-muted hover:bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant='outline'
                onClick={nextPrinciple}
                disabled={filteredPrinciples.length <= 1}
                className='flex items-center space-x-2'
              >
                <span>次の原則</span>
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>

            {/* Principle Detail */}
            {filteredPrinciples[currentPrinciple] && (
              <PrincipleDetailCard
                principle={filteredPrinciples[currentPrinciple]}
                expandedSections={expandedSections}
                onToggleSection={toggleSection}
              />
            )}
          </motion.div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            key='grid'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
          >
            {filteredPrinciples.map((principle, index) => (
              <motion.div key={principle.id} variants={itemVariants}>
                <PrincipleGridCard principle={principle} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Network View */}
        {viewMode === 'network' && (
          <motion.div
            key='network'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            <PrincipleNetworkView principles={filteredPrinciples} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Principle Detail Card Component
const PrincipleDetailCard: React.FC<{
  principle: AgilePrinciple
  expandedSections: Set<string>
  onToggleSection: (section: string) => void
}> = ({ principle, expandedSections, onToggleSection }) => {
  const CategoryIcon = getCategoryIcon(principle.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className='bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <div className='flex items-center space-x-3'>
                <div
                  className={`rounded-xl bg-gradient-to-r p-3 ${getCategoryColor(principle.category)}`}
                >
                  <CategoryIcon className='h-6 w-6 text-white' />
                </div>
                <div>
                  <CardTitle className='text-2xl'>
                    原則 {principle.number}: {principle.title}
                  </CardTitle>
                  <CardDescription className='text-lg'>{principle.description}</CardDescription>
                </div>
              </div>

              <div className='space-y-2'>
                <Badge variant='secondary' className='text-sm'>
                  {categories.find((c) => c.key === principle.category)?.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Original Text */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950'>
              <h4 className='mb-2 font-medium text-blue-800 dark:text-blue-200'>日本語版</h4>
              <p className='text-sm text-blue-700 dark:text-blue-300'>{principle.japaneseText}</p>
            </div>
            <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
              <h4 className='mb-2 font-medium text-green-800 dark:text-green-200'>English</h4>
              <p className='text-sm italic text-green-700 dark:text-green-300'>
                {principle.englishText}
              </p>
            </div>
          </div>

          <Separator />

          {/* Practical Applications */}
          <CollapsibleSection
            title='実践的応用'
            icon={<Lightbulb className='h-4 w-4' />}
            isExpanded={expandedSections.has(`${principle.id}-applications`)}
            onToggle={() => onToggleSection(`${principle.id}-applications`)}
          >
            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
              {principle.practicalApplications.map((application, index) => (
                <div key={index} className='flex items-start space-x-2'>
                  <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                  <span className='text-sm'>{application}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* PMBOK Alignment */}
          <CollapsibleSection
            title='PMBOK第7版との関連性'
            icon={<Target className='h-4 w-4' />}
            isExpanded={expandedSections.has(`${principle.id}-pmbok`)}
            onToggle={() => onToggleSection(`${principle.id}-pmbok`)}
          >
            <div className='space-y-4'>
              <div>
                <h5 className='mb-2 font-medium'>パフォーマンスドメイン</h5>
                <div className='flex flex-wrap gap-1'>
                  {principle.pmbokAlignment.performanceDomains.map((domain) => (
                    <Badge key={domain} variant='outline' className='text-xs'>
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h5 className='mb-2 font-medium'>PMBOK原則</h5>
                <div className='flex flex-wrap gap-1'>
                  {principle.pmbokAlignment.principles.map((princ) => (
                    <Badge key={princ} variant='secondary' className='text-xs'>
                      {princ}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Implementation Tips */}
          <CollapsibleSection
            title='実装のヒント'
            icon={<Target className='h-4 w-4' />}
            isExpanded={expandedSections.has(`${principle.id}-tips`)}
            onToggle={() => onToggleSection(`${principle.id}-tips`)}
          >
            <ul className='space-y-2'>
              {principle.implementationTips.map((tip, index) => (
                <li key={index} className='flex items-start space-x-2'>
                  <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500' />
                  <span className='text-sm'>{tip}</span>
                </li>
              ))}
            </ul>
          </CollapsibleSection>

          {/* Metrics and Anti-patterns */}
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <CollapsibleSection
              title='測定指標'
              icon={<TrendingUp className='h-4 w-4' />}
              isExpanded={expandedSections.has(`${principle.id}-metrics`)}
              onToggle={() => onToggleSection(`${principle.id}-metrics`)}
            >
              <ul className='space-y-1'>
                {principle.metrics.map((metric, index) => (
                  <li key={index} className='text-sm text-muted-foreground'>
                    • {metric}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            <CollapsibleSection
              title='アンチパターン'
              icon={<AlertTriangle className='h-4 w-4' />}
              isExpanded={expandedSections.has(`${principle.id}-antipatterns`)}
              onToggle={() => onToggleSection(`${principle.id}-antipatterns`)}
            >
              <ul className='space-y-1'>
                {principle.antiPatterns.map((pattern, index) => (
                  <li key={index} className='text-sm text-red-600 dark:text-red-400'>
                    • {pattern}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>

          {/* Success Stories */}
          <CollapsibleSection
            title='成功事例'
            icon={<Award className='h-4 w-4' />}
            isExpanded={expandedSections.has(`${principle.id}-success`)}
            onToggle={() => onToggleSection(`${principle.id}-success`)}
          >
            <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
              {principle.successStories.map((story, index) => (
                <div key={index} className='rounded-lg bg-green-50 p-3 dark:bg-green-950'>
                  <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                    {story}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Grid Card Component
const PrincipleGridCard: React.FC<{ principle: AgilePrinciple }> = ({ principle }) => {
  const CategoryIcon = getCategoryIcon(principle.category)

  return (
    <Card className='group h-full cursor-pointer transition-all duration-300 hover:shadow-lg'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div
            className={`rounded-lg bg-gradient-to-r p-2 ${getCategoryColor(principle.category)}`}
          >
            <CategoryIcon className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1'>
            <CardTitle className='text-lg transition-colors group-hover:text-primary'>
              原則 {principle.number}
            </CardTitle>
            <CardDescription className='text-sm'>{principle.title}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className='mb-4 text-sm text-muted-foreground'>{principle.description}</p>
        <div className='space-y-2'>
          <Badge variant='secondary' className='text-xs'>
            {categories.find((c) => c.key === principle.category)?.label}
          </Badge>
          <div className='flex flex-wrap gap-1'>
            {principle.keyWords.slice(0, 3).map((keyword) => (
              <Badge key={keyword} variant='outline' className='text-xs'>
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Network View Component
const PrincipleNetworkView: React.FC<{ principles: AgilePrinciple[] }> = ({ principles }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          <Network className='h-5 w-5' />
          <span>原則間の関係性マップ</span>
        </CardTitle>
        <CardDescription>アジャイル原則のカテゴリ別分類と相互関係</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {categories.slice(1).map(({ key, label, icon: Icon }) => {
            const categoryPrinciples = principles.filter((p) => p.category === key)
            return (
              <div key={key} className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <div className={`rounded-lg bg-gradient-to-r p-2 ${getCategoryColor(key)}`}>
                    <Icon className='h-4 w-4 text-white' />
                  </div>
                  <span className='text-sm font-medium'>{label}</span>
                </div>
                <div className='space-y-2'>
                  {categoryPrinciples.map((principle) => (
                    <div key={principle.id} className='rounded bg-muted p-2 text-xs'>
                      原則 {principle.number}: {principle.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
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
    <div className='space-y-3'>
      <Button
        variant='ghost'
        onClick={onToggle}
        className='flex h-auto items-center space-x-2 p-0 font-medium hover:bg-transparent'
      >
        {icon}
        <span>{title}</span>
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
            <div className='pl-6'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Helper functions (assuming these exist or need to be created)
const categories = [
  { key: 'all', label: 'すべて', icon: Grid },
  { key: 'customer-collaboration', label: '顧客協調', icon: Handshake },
  { key: 'working-software', label: '動くソフトウェア', icon: Code },
  { key: 'team-dynamics', label: 'チームダイナミクス', icon: Users },
  { key: 'process-improvement', label: 'プロセス改善', icon: TrendingUp },
]

const getCategoryIcon = (category: string) => {
  const categoryMap = {
    'customer-collaboration': Handshake,
    'working-software': Code,
    'team-dynamics': Users,
    'process-improvement': TrendingUp,
  }
  return categoryMap[category as keyof typeof categoryMap] || Target
}

const getCategoryColor = (category: string) => {
  const colorMap = {
    'customer-collaboration': 'from-blue-500 to-blue-600',
    'working-software': 'from-green-500 to-green-600',
    'team-dynamics': 'from-purple-500 to-purple-600',
    'process-improvement': 'from-orange-500 to-orange-600',
  }
  return colorMap[category as keyof typeof colorMap] || 'from-gray-500 to-gray-600'
}

export default AgilePrinciplesExplorer
