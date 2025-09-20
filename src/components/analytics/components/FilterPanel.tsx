/**
 * Filter Panel Component
 * Advanced filtering interface with multiple filter types and presets
 */

import React, { useCallback, useMemo } from 'react'
import {
  X,
  Calendar,
  Users,
  BookOpen,
  Tag,
  Search,
  RotateCcw,
  Save,
  Clock,
  MapPin,
  Smartphone,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Checkbox } from '../../ui/checkbox'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Slider } from '../../ui/slider'
import type { FilterSettings } from '../types/dashboard'

interface FilterPanelProps {
  settings: FilterSettings
  onChange: (filters: Partial<FilterSettings>) => void
  onClose: () => void
  className?: string
}

const DATE_RANGES = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' },
]

const KNOWLEDGE_AREAS = [
  'Integration Management',
  'Scope Management',
  'Schedule Management',
  'Cost Management',
  'Quality Management',
  'Resource Management',
  'Communications Management',
  'Risk Management',
  'Procurement Management',
  'Stakeholder Management',
]

const PERFORMANCE_BANDS = [
  { value: 'excelling', label: 'Excelling (90-100%)', color: 'bg-green-100 text-green-800' },
  { value: 'proficient', label: 'Proficient (80-89%)', color: 'bg-blue-100 text-blue-800' },
  { value: 'developing', label: 'Developing (70-79%)', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'struggling', label: 'Struggling (<70%)', color: 'bg-red-100 text-red-800' },
]

const STUDY_MODES = [
  { value: 'reading', label: 'Reading', icon: BookOpen },
  { value: 'flashcards', label: 'Flashcards', icon: Tag },
  { value: 'quizzes', label: 'Quizzes', icon: Search },
  { value: 'videos', label: 'Videos', icon: Clock },
  { value: 'practice_exams', label: 'Practice Exams', icon: Users },
]

const DEVICE_TYPES = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'mobile', label: 'Mobile' },
]

const FILTER_PRESETS = [
  {
    name: 'At-Risk Students',
    description: 'Students who need intervention',
    filters: {
      performanceBands: ['struggling'],
      dateRange: '30d',
    },
  },
  {
    name: 'High Performers',
    description: 'Top performing students',
    filters: {
      performanceBands: ['excelling'],
      dateRange: '30d',
    },
  },
  {
    name: 'Recent Activity',
    description: 'Last 7 days activity',
    filters: {
      dateRange: '7d',
    },
  },
  {
    name: 'Risk Management Focus',
    description: 'Risk management performance',
    filters: {
      knowledgeAreas: ['Risk Management'],
      dateRange: '30d',
    },
  },
]

export const FilterPanel: React.FC<FilterPanelProps> = ({
  settings,
  onChange,
  onClose,
  className = '',
}) => {
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (settings.dateRange !== '30d') {
      count++
    }
    if (settings.cohorts.length > 0) {
      count++
    }
    if (settings.knowledgeAreas.length > 0) {
      count++
    }
    if (settings.performanceBands.length > 0) {
      count++
    }
    if (settings.studyModes.length > 0) {
      count++
    }
    if (settings.deviceTypes && settings.deviceTypes.length > 0) {
      count++
    }
    if (settings.locations && settings.locations.length > 0) {
      count++
    }
    return count
  }, [settings])

  const handleArrayFilterChange = useCallback(
    (key: keyof FilterSettings, value: string, checked: boolean) => {
      const currentArray = (settings[key] as string[]) || []
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item) => item !== value)

      onChange({ [key]: newArray })
    },
    [settings, onChange]
  )

  const handlePresetApply = useCallback(
    (preset: any) => {
      onChange(preset.filters)
    },
    [onChange]
  )

  const handleReset = useCallback(() => {
    onChange({
      dateRange: '30d',
      cohorts: [],
      knowledgeAreas: [],
      performanceBands: [],
      studyModes: [],
      deviceTypes: [],
      locations: [],
    })
  }, [onChange])

  return (
    <Card className={`${className}`}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Search className='h-5 w-5' />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {activeFilterCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Customize your dashboard view with advanced filtering options
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={handleReset}>
              <RotateCcw className='mr-1 h-4 w-4' />
              Reset
            </Button>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Quick Presets */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <Save className='h-4 w-4' />
            Quick Presets
          </h4>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            {FILTER_PRESETS.map((preset, index) => (
              <Button
                key={index}
                variant='outline'
                size='sm'
                onClick={() => handlePresetApply(preset)}
                className='h-auto justify-start p-3 text-left'
              >
                <div>
                  <div className='text-sm font-medium'>{preset.name}</div>
                  <div className='text-xs text-muted-foreground'>{preset.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <Calendar className='h-4 w-4' />
            Date Range
          </h4>
          <Select
            value={settings.dateRange}
            onValueChange={(value) => onChange({ dateRange: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {settings.dateRange === 'custom' && (
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label className='text-xs'>Start Date</Label>
                <Input
                  type='date'
                  value={settings.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({ startDate: new Date(e.target.value) })}
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs'>End Date</Label>
                <Input
                  type='date'
                  value={settings.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => onChange({ endDate: new Date(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Knowledge Areas */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <BookOpen className='h-4 w-4' />
            Knowledge Areas
            {settings.knowledgeAreas.length > 0 && (
              <Badge variant='outline' className='ml-2'>
                {settings.knowledgeAreas.length}
              </Badge>
            )}
          </h4>
          <div className='grid max-h-40 grid-cols-2 gap-2 overflow-y-auto'>
            {KNOWLEDGE_AREAS.map((area) => (
              <div key={area} className='flex items-center space-x-2'>
                <Checkbox
                  id={`ka-${area}`}
                  checked={settings.knowledgeAreas.includes(area)}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('knowledgeAreas', area, checked as boolean)
                  }
                />
                <Label htmlFor={`ka-${area}`} className='cursor-pointer text-xs'>
                  {area}
                </Label>
              </div>
            ))}
          </div>

          {settings.knowledgeAreas.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {settings.knowledgeAreas.map((area) => (
                <Badge key={area} variant='secondary' className='flex items-center gap-1 text-xs'>
                  {area}
                  <button
                    onClick={() => handleArrayFilterChange('knowledgeAreas', area, false)}
                    className='hover:text-destructive'
                  >
                    <X className='h-2 w-2' />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Performance Bands */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <Users className='h-4 w-4' />
            Performance Bands
            {settings.performanceBands.length > 0 && (
              <Badge variant='outline' className='ml-2'>
                {settings.performanceBands.length}
              </Badge>
            )}
          </h4>
          <div className='space-y-2'>
            {PERFORMANCE_BANDS.map((band) => (
              <div key={band.value} className='flex items-center space-x-2'>
                <Checkbox
                  id={`pb-${band.value}`}
                  checked={settings.performanceBands.includes(band.value)}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('performanceBands', band.value, checked as boolean)
                  }
                />
                <Label htmlFor={`pb-${band.value}`} className='flex-1 cursor-pointer'>
                  <Badge className={`${band.color} text-xs`}>{band.label}</Badge>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Study Modes */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <Tag className='h-4 w-4' />
            Study Modes
            {settings.studyModes.length > 0 && (
              <Badge variant='outline' className='ml-2'>
                {settings.studyModes.length}
              </Badge>
            )}
          </h4>
          <div className='grid grid-cols-2 gap-2'>
            {STUDY_MODES.map((mode) => {
              const IconComponent = mode.icon
              return (
                <div key={mode.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`sm-${mode.value}`}
                    checked={settings.studyModes.includes(mode.value)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange('studyModes', mode.value, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`sm-${mode.value}`}
                    className='flex cursor-pointer items-center gap-1 text-xs'
                  >
                    <IconComponent className='h-3 w-3' />
                    {mode.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Device Types */}
        <div className='space-y-3'>
          <h4 className='flex items-center gap-2 font-medium'>
            <Smartphone className='h-4 w-4' />
            Device Types
            {(settings.deviceTypes?.length || 0) > 0 && (
              <Badge variant='outline' className='ml-2'>
                {settings.deviceTypes?.length}
              </Badge>
            )}
          </h4>
          <div className='flex gap-2'>
            {DEVICE_TYPES.map((device) => (
              <div key={device.value} className='flex items-center space-x-2'>
                <Checkbox
                  id={`dt-${device.value}`}
                  checked={settings.deviceTypes?.includes(device.value) || false}
                  onCheckedChange={(checked) =>
                    handleArrayFilterChange('deviceTypes', device.value, checked as boolean)
                  }
                />
                <Label htmlFor={`dt-${device.value}`} className='cursor-pointer text-xs'>
                  {device.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className='space-y-2 rounded-lg bg-muted/50 p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>Active Filters ({activeFilterCount})</span>
              <Button variant='ghost' size='sm' onClick={handleReset}>
                Clear All
              </Button>
            </div>
            <div className='text-xs text-muted-foreground'>
              {settings.dateRange !== '30d' && (
                <span>Time: {DATE_RANGES.find((r) => r.value === settings.dateRange)?.label}</span>
              )}
              {settings.knowledgeAreas.length > 0 && (
                <span className='block'>
                  Knowledge Areas: {settings.knowledgeAreas.length} selected
                </span>
              )}
              {settings.performanceBands.length > 0 && (
                <span className='block'>Performance: {settings.performanceBands.length} bands</span>
              )}
              {settings.studyModes.length > 0 && (
                <span className='block'>Study Modes: {settings.studyModes.length} selected</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FilterPanel
