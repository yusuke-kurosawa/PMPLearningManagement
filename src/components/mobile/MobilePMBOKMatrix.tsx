import React, { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, ChevronRight, BookOpen, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { useTouchGestures, useHapticFeedback } from '@/hooks/useTouchGestures'

interface Process {
  id: string
  name: string
  knowledgeArea: string
  processGroup: string
  inputs: string[]
  tools: string[]
  outputs: string[]
  description?: string
}

interface MobilePMBOKMatrixProps {
  processes: Process[]
  onProcessSelect?: (process: Process) => void
}

const knowledgeAreas = [
  '統合管理',
  'スコープ管理',
  'スケジュール管理',
  'コスト管理',
  '品質管理',
  '資源管理',
  'コミュニケーション管理',
  'リスク管理',
  '調達管理',
  'ステークホルダー管理',
]

const processGroups = ['立ち上げ', '計画', '実行', '監視・コントロール', '終結']

export function MobilePMBOKMatrix({ processes, onProcessSelect }: MobilePMBOKMatrixProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKnowledgeAreas, setSelectedKnowledgeAreas] = useState<string[]>(knowledgeAreas)
  const [selectedProcessGroups, setSelectedProcessGroups] = useState<string[]>(processGroups)
  const [expandedKnowledgeAreas, setExpandedKnowledgeAreas] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const haptic = useHapticFeedback()

  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      const matchesSearch =
        process.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        process.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesKnowledgeArea = selectedKnowledgeAreas.includes(process.knowledgeArea)
      const matchesProcessGroup = selectedProcessGroups.includes(process.processGroup)

      return matchesSearch && matchesKnowledgeArea && matchesProcessGroup
    })
  }, [processes, searchQuery, selectedKnowledgeAreas, selectedProcessGroups])

  const groupedProcesses = useMemo(() => {
    const grouped: Record<string, Process[]> = {}

    filteredProcesses.forEach((process) => {
      if (!grouped[process.knowledgeArea]) {
        grouped[process.knowledgeArea] = []
      }
      grouped[process.knowledgeArea].push(process)
    })

    return grouped
  }, [filteredProcesses])

  const toggleKnowledgeArea = (area: string) => {
    setExpandedKnowledgeAreas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(area)) {
        newSet.delete(area)
      } else {
        newSet.add(area)
      }
      haptic.light()
      return newSet
    })
  }

  const handleProcessSelect = (process: Process) => {
    setSelectedProcess(process)
    onProcessSelect?.(process)
    haptic.medium()
  }

  const handleFilterChange = (
    type: 'knowledgeArea' | 'processGroup',
    value: string,
    checked: boolean
  ) => {
    if (type === 'knowledgeArea') {
      setSelectedKnowledgeAreas((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      )
    } else {
      setSelectedProcessGroups((prev) =>
        checked ? [...prev, value] : prev.filter((item) => item !== value)
      )
    }
    haptic.light()
  }

  const getProcessGroupColor = (processGroup: string) => {
    const colors = {
      立ち上げ: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      計画: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      実行: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      '監視・コントロール':
        'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      終結: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
    }
    return colors[processGroup as keyof typeof colors] || colors['計画']
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search and Filter Bar */}
      <div className="space-y-3 border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="プロセスを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>フィルター</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="mb-3 font-medium">知識エリア</h3>
                  <div className="space-y-2">
                    {knowledgeAreas.map((area) => (
                      <div key={area} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ka-${area}`}
                          checked={selectedKnowledgeAreas.includes(area)}
                          onCheckedChange={(checked) =>
                            handleFilterChange('knowledgeArea', area, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`ka-${area}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {area}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-medium">プロセス群</h3>
                  <div className="space-y-2">
                    {processGroups.map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox
                          id={`pg-${group}`}
                          checked={selectedProcessGroups.includes(group)}
                          onCheckedChange={(checked) =>
                            handleFilterChange('processGroup', group, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`pg-${group}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {group}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{filteredProcesses.length} プロセスが見つかりました</span>
          {(selectedKnowledgeAreas.length < knowledgeAreas.length ||
            selectedProcessGroups.length < processGroups.length) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedKnowledgeAreas(knowledgeAreas)
                setSelectedProcessGroups(processGroups)
              }}
            >
              フィルターをリセット
            </Button>
          )}
        </div>
      </div>

      {/* Process List */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {knowledgeAreas.map((area) => {
          const areaProcesses = groupedProcesses[area] || []
          if (areaProcesses.length === 0) return null

          return (
            <Card key={area}>
              <Collapsible
                open={expandedKnowledgeAreas.has(area)}
                onOpenChange={() => toggleKnowledgeArea(area)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{area}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {areaProcesses.length}
                        </Badge>
                        {expandedKnowledgeAreas.has(area) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    {areaProcesses.map((process) => (
                      <div
                        key={process.id}
                        className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                        onClick={() => handleProcessSelect(process)}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="flex-1 text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                            {process.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-6 w-6 flex-shrink-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>

                        <Badge
                          className={`text-xs ${getProcessGroupColor(process.processGroup)}`}
                          variant="secondary"
                        >
                          {process.processGroup}
                        </Badge>

                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            I:{process.inputs.length} T:{process.tools.length} O:
                            {process.outputs.length}
                          </span>
                          <BookOpen className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Process Detail Sheet */}
      <Sheet open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
        <SheetContent side="bottom" className="h-[80vh]">
          {selectedProcess && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selectedProcess.name}</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedProcess.knowledgeArea}</Badge>
                  <Badge
                    className={getProcessGroupColor(selectedProcess.processGroup)}
                    variant="secondary"
                  >
                    {selectedProcess.processGroup}
                  </Badge>
                </div>

                {selectedProcess.description && (
                  <div>
                    <h3 className="mb-2 font-medium">概要</h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {selectedProcess.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-2 font-medium text-blue-600 dark:text-blue-400">
                    インプット ({selectedProcess.inputs.length})
                  </h3>
                  <div className="space-y-1">
                    {selectedProcess.inputs.map((input, idx) => (
                      <div
                        key={idx}
                        className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mr-2 text-blue-600 dark:text-blue-400">•</span>
                        <span className="flex-1">{input}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-green-600 dark:text-green-400">
                    ツールと技法 ({selectedProcess.tools.length})
                  </h3>
                  <div className="space-y-1">
                    {selectedProcess.tools.map((tool, idx) => (
                      <div
                        key={idx}
                        className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mr-2 text-green-600 dark:text-green-400">•</span>
                        <span className="flex-1">{tool}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-purple-600 dark:text-purple-400">
                    アウトプット ({selectedProcess.outputs.length})
                  </h3>
                  <div className="space-y-1">
                    {selectedProcess.outputs.map((output, idx) => (
                      <div
                        key={idx}
                        className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mr-2 text-purple-600 dark:text-purple-400">•</span>
                        <span className="flex-1">{output}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobilePMBOKMatrix
