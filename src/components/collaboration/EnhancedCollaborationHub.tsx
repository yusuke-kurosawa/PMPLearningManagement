/**
 * Enhanced Collaboration Hub with Real-time Features
 * Developer 5: Collaboration Features Developer Implementation
 */

import React, { useState, useEffect } from 'react'
import {
  Users,
  MessageSquare,
  Share2,
  Settings,
  Plus,
  Search,
  Bell,
  Pin,
  ThumbsUp,
  Reply,
  Edit3,
  Trash2,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Eye,
  Clock,
  BookOpen,
  Activity,
  AtSign,
  Paperclip,
  Send,
  Smile,
  Image,
  AlertCircle,
  ScreenShareOff,
  RefreshCw,
} from 'lucide-react'
import { api } from '../../lib/api/client'
import { useToast } from '../../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Avatar, AvatarContent, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import { format, formatDistanceToNow } from 'date-fns'

interface StudyGroup {
  id: string
  name: string
  description: string
  avatar?: string
  isPrivate: boolean
  memberCount: number
  maxMembers: number
  createdBy: string
  createdAt: Date
  lastActivity: Date
  tags: string[]
  studySchedule?: {
    timezone: string
    sessions: Array<{
      dayOfWeek: number
      startTime: string
      duration: number
      topic?: string
    }>
  }
  settings: {
    allowInvites: boolean
    requireApproval: boolean
    allowFileSharing: boolean
    allowVoiceChat: boolean
  }
}

interface GroupMember {
  userId: string
  username: string
  displayName: string
  avatar?: string
  role: 'owner' | 'moderator' | 'member'
  joinedAt: Date
  lastActive: Date
  studyStreak: number
  contributionScore: number
}

interface DiscussionThread {
  id: string
  groupId: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  isLocked: boolean
  tags: string[]
  category: 'general' | 'study' | 'exam' | 'help' | 'resource'
  replyCount: number
  likeCount: number
  viewCount: number
  lastReplyAt?: Date
  lastReplyBy?: string
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
}

interface DiscussionReply {
  id: string
  threadId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: Date
  updatedAt?: Date
  parentReplyId?: string
  likeCount: number
  isEdited: boolean
  attachments: Array<{
    id: string
    name: string
    url: string
    type: string
    size: number
  }>
}

interface SharedNote {
  id: string
  groupId: string
  title: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  collaborators: string[]
  tags: string[]
  category: string
  version: number
  changeHistory: Array<{
    id: string
    authorId: string
    authorName: string
    timestamp: Date
    changes: string
  }>
}

interface Notification {
  id: string
  type:
    | 'group_invite'
    | 'thread_reply'
    | 'mention'
    | 'note_share'
    | 'group_activity'
    | 'study_reminder'
  title: string
  message: string
  data: Record<string, any>
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

const EnhancedCollaborationHub: React.FC = () => {
  const { toast } = useToast()

  // Core state
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [activeGroup, setActiveGroup] = useState<StudyGroup | null>(null)
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([])
  const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null)
  const [replies, setReplies] = useState<DiscussionReply[]>([])
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [activeView, setActiveView] = useState<
    'groups' | 'discussions' | 'notes' | 'notifications'
  >('groups')
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [showCreateThreadDialog, setShowCreateThreadDialog] = useState(false)
  const [showCreateNoteDialog, setShowCreateNoteDialog] = useState(false)
  const [showGroupSettingsDialog, setShowGroupSettingsDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent')

  // Real-time state
  const [isOnline, setIsOnline] = useState(true)
  const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // Form state
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 50,
    tags: '',
  })

  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: '',
  })

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPublic: false,
  })

  const [replyContent, setReplyContent] = useState('')

  // Load data
  useEffect(() => {
    loadInitialData()

    // Set up real-time connection
    // This would normally connect to WebSocket or Server-Sent Events
    // setupRealtimeConnection();

    return () => {
      // Cleanup real-time connection
      // cleanupRealtimeConnection();
    }
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [groupsData, notificationsData] = await Promise.all([
        api.collaboration.getStudyGroups.query(),
        api.collaboration.getNotifications.query({ limit: 50 }),
      ])

      setStudyGroups(groupsData)
      setNotifications(notificationsData)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load collaboration data'
      setError(message)
      toast({
        title: 'Failed to Load Data',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadGroupData = async (groupId: string) => {
    try {
      const [membersData, discussionsData, notesData] = await Promise.all([
        api.collaboration.getGroupMembers.query({ groupId }),
        api.collaboration.getDiscussions.query({ groupId }),
        api.collaboration.getSharedNotes.query({ groupId }),
      ])

      setGroupMembers(membersData)
      setDiscussions(discussionsData)
      setSharedNotes(notesData)
    } catch (error) {
      toast({
        title: 'Failed to Load Group Data',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleCreateGroup = async () => {
    try {
      const group = await api.collaboration.createStudyGroup.mutate({
        name: newGroup.name,
        description: newGroup.description,
        isPrivate: newGroup.isPrivate,
        maxMembers: newGroup.maxMembers,
        tags: newGroup.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        settings: {
          allowInvites: true,
          requireApproval: newGroup.isPrivate,
          allowFileSharing: true,
          allowVoiceChat: true,
        },
      })

      setStudyGroups((prev) => [group, ...prev])
      setNewGroup({ name: '', description: '', isPrivate: false, maxMembers: 50, tags: '' })
      setShowCreateGroupDialog(false)

      toast({
        title: 'Study Group Created',
        description: `${group.name} has been created successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Failed to Create Group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.collaboration.joinStudyGroup.mutate({ groupId })

      // Update group member count
      setStudyGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, memberCount: group.memberCount + 1 } : group
        )
      )

      toast({
        title: 'Joined Study Group',
        description: 'You have successfully joined the study group.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Join Group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await api.collaboration.leaveStudyGroup.mutate({ groupId })

      setStudyGroups((prev) =>
        prev.map((group) =>
          group.id === groupId ? { ...group, memberCount: group.memberCount - 1 } : group
        )
      )

      if (activeGroup?.id === groupId) {
        setActiveGroup(null)
      }

      toast({
        title: 'Left Study Group',
        description: 'You have left the study group.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Leave Group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleCreateThread = async () => {
    if (!activeGroup) return

    try {
      const thread = await api.collaboration.createDiscussion.mutate({
        groupId: activeGroup.id,
        title: newThread.title,
        content: newThread.content,
        category: newThread.category,
        tags: newThread.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      })

      setDiscussions((prev) => [thread, ...prev])
      setNewThread({ title: '', content: '', category: 'general', tags: '' })
      setShowCreateThreadDialog(false)

      toast({
        title: 'Discussion Created',
        description: 'Your discussion thread has been created.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Create Discussion',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleCreateNote = async () => {
    if (!activeGroup) return

    try {
      const note = await api.collaboration.createSharedNote.mutate({
        groupId: activeGroup.id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isPublic: newNote.isPublic,
      })

      setSharedNotes((prev) => [note, ...prev])
      setNewNote({ title: '', content: '', category: '', tags: '', isPublic: false })
      setShowCreateNoteDialog(false)

      toast({
        title: 'Note Created',
        description: 'Your shared note has been created.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Create Note',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleReplyToThread = async () => {
    if (!activeThread || !replyContent.trim()) return

    try {
      const reply = await api.collaboration.replyToDiscussion.mutate({
        threadId: activeThread.id,
        content: replyContent.trim(),
      })

      setReplies((prev) => [...prev, reply])
      setReplyContent('')

      // Update thread reply count
      setDiscussions((prev) =>
        prev.map((thread) =>
          thread.id === activeThread.id
            ? {
                ...thread,
                replyCount: thread.replyCount + 1,
                lastReplyAt: new Date(),
                lastReplyBy: 'You',
              }
            : thread
        )
      )

      toast({
        title: 'Reply Posted',
        description: 'Your reply has been posted.',
      })
    } catch (error) {
      toast({
        title: 'Failed to Post Reply',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const handleSelectGroup = async (group: StudyGroup) => {
    setActiveGroup(group)
    setActiveView('discussions')
    await loadGroupData(group.id)
  }

  const handleOpenThread = async (thread: DiscussionThread) => {
    setActiveThread(thread)

    try {
      const repliesData = await api.collaboration.getDiscussionReplies.query({
        threadId: thread.id,
      })
      setReplies(repliesData)

      // Mark as viewed
      await api.collaboration.markDiscussionAsViewed.mutate({
        threadId: thread.id,
      })
    } catch (error) {
      toast({
        title: 'Failed to Load Discussion',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  const filteredGroups = studyGroups.filter((group) => {
    const matchesSearch =
      !searchQuery ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch =
      !searchQuery ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const filteredNotes = sharedNotes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const unreadNotifications = notifications.filter((n) => !n.isRead)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <h3 className="mb-2 text-lg font-semibold">Loading Collaboration Hub</h3>
            <p className="text-gray-600">Setting up your collaborative workspace...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Collaboration Hub</h1>
              <Badge
                variant={isOnline ? 'default' : 'secondary'}
                className="flex items-center gap-1"
              >
                <div
                  className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}
                />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveView('notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {unreadNotifications.length > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
              <Button size="sm" onClick={() => setShowCreateGroupDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Study Groups</p>
                    <p className="text-2xl font-bold text-gray-900">{studyGroups.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Discussions</p>
                    <p className="text-2xl font-bold text-gray-900">{discussions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-2">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shared Notes</p>
                    <p className="text-2xl font-bold text-gray-900">{sharedNotes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Online Members</p>
                    <p className="text-2xl font-bold text-gray-900">{onlineMembers.size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView as any} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="groups">Study Groups</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="notes">Shared Notes</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {unreadNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Study Groups Tab */}
          <TabsContent value="groups" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search study groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy as any}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="transition-all duration-200 hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={group.avatar} />
                          <AvatarFallback>
                            {group.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant={group.isPrivate ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {group.isPrivate ? 'Private' : 'Public'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {group.memberCount}/{group.maxMembers} members
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSelectGroup(group)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Group
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJoinGroup(group.id)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Join Group
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleLeaveGroup(group.id)}>
                            <UserMinus className="mr-2 h-4 w-4" />
                            Leave Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">{group.description}</p>

                    <div className="mb-4 flex flex-wrap gap-1">
                      {group.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {group.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{group.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
                      <span>Created {formatDistanceToNow(group.createdAt)} ago</span>
                      <span>Active {formatDistanceToNow(group.lastActivity)} ago</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleSelectGroup(group)}
                      disabled={group.memberCount >= group.maxMembers}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {group.memberCount >= group.maxMembers ? 'Full' : 'Join & View'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            {activeGroup ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeGroup.name} Discussions
                    </h2>
                    <p className="text-gray-600">{discussions.length} discussions</p>
                  </div>
                  <Button onClick={() => setShowCreateThreadDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Discussion
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="help">Help</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredDiscussions.map((thread) => (
                    <Card
                      key={thread.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => handleOpenThread(thread)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              {thread.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                              <h3 className="truncate font-semibold text-gray-900">
                                {thread.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {thread.category}
                              </Badge>
                              {thread.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                              {thread.content}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={thread.authorAvatar} />
                                  <AvatarFallback className="text-xs">
                                    {thread.authorName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{thread.authorName}</span>
                              </div>
                              <span>{formatDistanceToNow(thread.createdAt)} ago</span>
                              <span>{thread.replyCount} replies</span>
                              <span>{thread.likeCount} likes</span>
                              <span>{thread.viewCount} views</span>
                            </div>
                          </div>

                          <div className="ml-4 flex flex-col items-end gap-2">
                            {thread.lastReplyAt && (
                              <div className="text-right text-xs text-gray-500">
                                <div>Last reply by {thread.lastReplyBy}</div>
                                <div>{formatDistanceToNow(thread.lastReplyAt)} ago</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Select a Study Group</h3>
                <p className="mb-4 text-gray-600">
                  Choose a study group to view and participate in discussions.
                </p>
                <Button onClick={() => setActiveView('groups')}>Browse Study Groups</Button>
              </div>
            )}
          </TabsContent>

          {/* Shared Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            {activeGroup ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {activeGroup.name} Notes
                    </h2>
                    <p className="text-gray-600">{sharedNotes.length} shared notes</p>
                  </div>
                  <Button onClick={() => setShowCreateNoteDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredNotes.map((note) => (
                    <Card key={note.id} className="transition-shadow hover:shadow-lg">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="line-clamp-2 text-lg">{note.title}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit Note
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Note
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Note
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <p className="mb-4 line-clamp-4 text-sm text-gray-600">{note.content}</p>

                        <div className="mb-4 flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                          <span>By {note.authorName}</span>
                          <span>v{note.version}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge
                            variant={note.isPublic ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {note.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(note.updatedAt)} ago
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Select a Study Group</h3>
                <p className="mb-4 text-gray-600">
                  Choose a study group to view and create shared notes.
                </p>
                <Button onClick={() => setActiveView('groups')}>Browse Study Groups</Button>
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`${!notification.isRead ? 'border-blue-200 bg-blue-50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {notification.type === 'group_invite' && (
                            <UserPlus className="h-5 w-5 text-blue-600" />
                          )}
                          {notification.type === 'thread_reply' && (
                            <MessageSquare className="h-5 w-5 text-green-600" />
                          )}
                          {notification.type === 'mention' && (
                            <AtSign className="h-5 w-5 text-purple-600" />
                          )}
                          {notification.type === 'note_share' && (
                            <BookOpen className="h-5 w-5 text-yellow-600" />
                          )}
                          {notification.type === 'group_activity' && (
                            <Activity className="h-5 w-5 text-gray-600" />
                          )}
                          {notification.type === 'study_reminder' && (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {formatDistanceToNow(notification.createdAt)} ago
                          </p>
                        </div>

                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">No Notifications</h3>
                  <p className="text-gray-600">
                    You&apos;re all caught up! Notifications will appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Group Dialog */}
        <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Create a new study group to collaborate with other PMP learners.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Group Name</label>
                <Input
                  placeholder="Enter group name..."
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  placeholder="Describe the purpose and goals of your study group..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Maximum Members
                  </label>
                  <Input
                    type="number"
                    min="5"
                    max="100"
                    value={newGroup.maxMembers}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <Input
                    placeholder="PMP, Study, Exam..."
                    value={newGroup.tags}
                    onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={newGroup.isPrivate}
                  onCheckedChange={(checked) => setNewGroup({ ...newGroup, isPrivate: checked })}
                />
                <label className="text-sm text-gray-700">Make group private (invite-only)</label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateGroupDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={!newGroup.name || !newGroup.description}
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Thread Dialog */}
        <Dialog open={showCreateThreadDialog} onOpenChange={setShowCreateThreadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Discussion Thread</DialogTitle>
              <DialogDescription>Start a new discussion in {activeGroup?.name}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Thread Title</label>
                <Input
                  placeholder="Enter discussion title..."
                  value={newThread.title}
                  onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  placeholder="Start the discussion..."
                  value={newThread.content}
                  onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={newThread.category}
                    onValueChange={(value: any) => setNewThread({ ...newThread, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="help">Help</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
                  <Input
                    placeholder="question, help, chapter5..."
                    value={newThread.tags}
                    onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateThreadDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateThread}
                disabled={!newThread.title || !newThread.content}
              >
                Create Discussion
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Note Dialog */}
        <Dialog open={showCreateNoteDialog} onOpenChange={setShowCreateNoteDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Shared Note</DialogTitle>
              <DialogDescription>Create a shared note for {activeGroup?.name}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Note Title</label>
                <Input
                  placeholder="Enter note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  placeholder="Write your note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <Input
                    placeholder="Study Notes, Summary, etc."
                    value={newNote.category}
                    onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
                  <Input
                    placeholder="pmbok, chapter1, formulas..."
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={newNote.isPublic}
                  onCheckedChange={(checked) => setNewNote({ ...newNote, isPublic: checked })}
                />
                <label className="text-sm text-gray-700">Make note publicly visible</label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNote} disabled={!newNote.title || !newNote.content}>
                Create Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Thread Details Dialog */}
        {activeThread && (
          <Dialog open={!!activeThread} onOpenChange={() => setActiveThread(null)}>
            <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {activeThread.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                  {activeThread.title}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeThread.category}</Badge>
                  {activeThread.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4">
                {/* Original Thread */}
                <div className="mb-4 border-b border-gray-200 pb-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={activeThread.authorAvatar} />
                      <AvatarFallback>
                        {activeThread.authorName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium">{activeThread.authorName}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(activeThread.createdAt)} ago
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">{activeThread.content}</div>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                <div className="space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.authorAvatar} />
                        <AvatarFallback className="text-xs">
                          {reply.authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium">{reply.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(reply.createdAt)} ago
                          </span>
                          {reply.isEdited && (
                            <Badge variant="outline" className="text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        <div className="prose prose-sm max-w-none">{reply.content}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {reply.likeCount}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Reply className="mr-1 h-3 w-3" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Input */}
              <div className="mt-4 border-t pt-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleReplyToThread}
                        disabled={!replyContent.trim()}
                        size="sm"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

export default EnhancedCollaborationHub
