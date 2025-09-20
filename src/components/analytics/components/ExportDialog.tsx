/**
 * Export Dialog Component
 * Comprehensive export functionality with format selection, scheduling, and customization
 */

import React, { useState, useCallback } from 'react'
import {
  Download,
  Calendar,
  FileText,
  Image,
  Database,
  Mail,
  Clock,
  Settings,
  CheckCircle,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Checkbox } from '../../ui/checkbox'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from '../../ui/switch'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { useToast } from '../../../hooks/use-toast'
import type { ExportSettings } from '../types/dashboard'

interface ExportDialogProps {
  onExport: (settings: ExportSettings) => void
  onClose: () => void
  defaultSettings?: Partial<ExportSettings>
}

const EXPORT_FORMATS = [
  {
    value: 'pdf',
    label: 'PDF Report',
    icon: FileText,
    description: 'Professional report with charts and analysis',
  },
  {
    value: 'xlsx',
    label: 'Excel Spreadsheet',
    icon: Database,
    description: 'Structured data with multiple sheets',
  },
  {
    value: 'csv',
    label: 'CSV Data',
    icon: Database,
    description: 'Raw data in comma-separated format',
  },
  {
    value: 'json',
    label: 'JSON Data',
    icon: Database,
    description: 'Structured data in JSON format',
  },
]

const TIME_RANGES = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom date range' },
]

const DASHBOARD_SECTIONS = [
  { id: 'executive', label: 'Executive Overview', description: 'High-level KPIs and trends' },
  { id: 'learning', label: 'Learning Analytics', description: 'Detailed performance metrics' },
  { id: 'students', label: 'Student Insights', description: 'Individual learner profiles' },
  { id: 'content', label: 'Content Analytics', description: 'Content effectiveness data' },
  { id: 'behavior', label: 'Behavioral Analytics', description: 'Learning patterns and behavior' },
  { id: 'predictive', label: 'Predictive Analytics', description: 'AI insights and predictions' },
]

const SCHEDULE_FREQUENCIES = [
  { value: 'daily', label: 'Daily', description: 'Every day at specified time' },
  { value: 'weekly', label: 'Weekly', description: 'Every week on specified day' },
  { value: 'monthly', label: 'Monthly', description: 'Every month on specified date' },
]

export const ExportDialog: React.FC<ExportDialogProps> = ({
  onExport,
  onClose,
  defaultSettings = {},
}) => {
  const { toast } = useToast()

  const [settings, setSettings] = useState<ExportSettings>({
    format: 'pdf',
    timeRange: '7d',
    includeCharts: true,
    includeRawData: false,
    sections: ['executive', 'learning'],
    schedule: {
      enabled: false,
      frequency: 'weekly',
      recipients: [],
    },
    ...defaultSettings,
  })

  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleSettingChange = useCallback((key: keyof ExportSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const handleSectionToggle = useCallback((sectionId: string) => {
    setSettings((prev) => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter((id) => id !== sectionId)
        : [...prev.sections, sectionId],
    }))
  }, [])

  const handleAddRecipient = useCallback(() => {
    if (recipientEmail && recipientEmail.includes('@')) {
      setSettings((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule!,
          recipients: [...(prev.schedule?.recipients || []), recipientEmail],
        },
      }))
      setRecipientEmail('')
    }
  }, [recipientEmail])

  const handleRemoveRecipient = useCallback((email: string) => {
    setSettings((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        recipients: prev.schedule?.recipients?.filter((e) => e !== email) || [],
      },
    }))
  }, [])

  const handleExport = useCallback(async () => {
    setIsExporting(true)

    try {
      const finalSettings: ExportSettings = {
        ...settings,
        ...(settings.timeRange === 'custom' && {
          startDate: new Date(customStartDate),
          endDate: new Date(customEndDate),
        }),
      }

      await onExport(finalSettings)

      toast({
        title: 'Export Started',
        description: `Your ${settings.format.toUpperCase()} export is being prepared.`,
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error preparing your export.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }, [settings, customStartDate, customEndDate, onExport, onClose, toast])

  const selectedFormat = EXPORT_FORMATS.find((f) => f.value === settings.format)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Export Dashboard Data
          </DialogTitle>
          <DialogDescription>
            Configure your export settings and download comprehensive analytics data.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Export Format</CardTitle>
              <CardDescription>Choose the format for your exported data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {EXPORT_FORMATS.map((format) => {
                  const IconComponent = format.icon
                  const isSelected = settings.format === format.value

                  return (
                    <div
                      key={format.value}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => handleSettingChange('format', format.value)}
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className={`rounded-md p-2 ${
                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}
                        >
                          <IconComponent className='h-4 w-4' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>{format.label}</h4>
                          <p className='text-sm text-muted-foreground'>{format.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Range */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Time Range</CardTitle>
              <CardDescription>Select the date range for your export</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Select
                value={settings.timeRange}
                onValueChange={(value) => handleSettingChange('timeRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {settings.timeRange === 'custom' && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Start Date</Label>
                    <Input
                      type='date'
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>End Date</Label>
                    <Input
                      type='date'
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Sections */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Content Sections</CardTitle>
              <CardDescription>Choose which dashboard sections to include</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {DASHBOARD_SECTIONS.map((section) => (
                  <div
                    key={section.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center space-x-3'>
                      <Checkbox
                        id={section.id}
                        checked={settings.sections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                      />
                      <div>
                        <Label htmlFor={section.id} className='cursor-pointer font-medium'>
                          {section.label}
                        </Label>
                        <p className='text-sm text-muted-foreground'>{section.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Export Options</CardTitle>
              <CardDescription>Configure additional export settings</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='font-medium'>Include Charts</Label>
                  <p className='text-sm text-muted-foreground'>
                    Include visual charts and graphs in the export
                  </p>
                </div>
                <Switch
                  checked={settings.includeCharts}
                  onCheckedChange={(checked) => handleSettingChange('includeCharts', checked)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label className='font-medium'>Include Raw Data</Label>
                  <p className='text-sm text-muted-foreground'>Include detailed raw data tables</p>
                </div>
                <Switch
                  checked={settings.includeRawData}
                  onCheckedChange={(checked) => handleSettingChange('includeRawData', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Export */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Clock className='h-5 w-5' />
                Scheduled Export
              </CardTitle>
              <CardDescription>Set up automatic recurring exports</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='font-medium'>Enable Scheduled Export</Label>
                  <p className='text-sm text-muted-foreground'>
                    Automatically generate and send reports
                  </p>
                </div>
                <Switch
                  checked={settings.schedule?.enabled || false}
                  onCheckedChange={(checked) =>
                    handleSettingChange('schedule', { ...settings.schedule, enabled: checked })
                  }
                />
              </div>

              {settings.schedule?.enabled && (
                <div className='space-y-4 border-t pt-4'>
                  <div className='space-y-2'>
                    <Label>Frequency</Label>
                    <Select
                      value={settings.schedule?.frequency}
                      onValueChange={(value) =>
                        handleSettingChange('schedule', { ...settings.schedule, frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHEDULE_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            <div>
                              <div className='font-medium'>{freq.label}</div>
                              <div className='text-sm text-muted-foreground'>
                                {freq.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label>Recipients</Label>
                    <div className='flex gap-2'>
                      <Input
                        placeholder='Enter email address'
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      />
                      <Button variant='outline' onClick={handleAddRecipient}>
                        Add
                      </Button>
                    </div>

                    {(settings.schedule?.recipients?.length || 0) > 0 && (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {settings.schedule?.recipients?.map((email, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='flex items-center gap-1'
                          >
                            <Mail className='h-3 w-3' />
                            {email}
                            <button
                              onClick={() => handleRemoveRecipient(email)}
                              className='ml-1 hover:text-destructive'
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Export Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2 rounded-lg bg-muted p-4'>
                <div className='flex items-center gap-2'>
                  <selectedFormat.icon className='h-4 w-4' />
                  <span className='font-medium'>
                    {selectedFormat.label} -{' '}
                    {TIME_RANGES.find((r) => r.value === settings.timeRange)?.label}
                  </span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {settings.sections.length} section{settings.sections.length !== 1 ? 's' : ''} •
                  Charts: {settings.includeCharts ? 'Yes' : 'No'} • Raw Data:{' '}
                  {settings.includeRawData ? 'Yes' : 'No'}
                </p>
                {settings.schedule?.enabled && (
                  <div className='flex items-center gap-1 text-sm text-blue-600'>
                    <Clock className='h-3 w-3' />
                    <span>
                      Scheduled {settings.schedule.frequency} to{' '}
                      {settings.schedule.recipients?.length || 0} recipient(s)
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || settings.sections.length === 0}
            className='min-w-32'
          >
            {isExporting ? (
              <>
                <Settings className='mr-2 h-4 w-4 animate-spin' />
                Exporting...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Export Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportDialog
