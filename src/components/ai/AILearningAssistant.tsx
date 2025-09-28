/**
 * AI Learning Assistant Component
 * Main interface for AI-powered personalized learning
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  Loader2,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useProgress } from '../../hooks/useProgressV2'
import { AILearningService } from '../../services/ai/aiLearningService'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { ScrollArea } from '../ui/scroll-area'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { useToast } from '../../hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    type?: 'text' | 'recommendation' | 'plan' | 'analysis' | 'quiz'
    data?: Record<string, unknown>
  }
}

interface Recommendation {
  type: 'flashcard' | 'mock_exam' | 'reading' | 'video' | 'practice'
  topic: string
  difficulty: string
  estimatedTime: number
  priority: string
  reason: string
}

export const AILearningAssistant: React.FC = () => {
  const { user } = useAuth()
  const { progress, weakAreas, strongAreas } = useProgress()
  const { toast } = useToast()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [studyPlan, setStudyPlan] = useState<Record<string, unknown> | null>(null)
  const [learningInsights, setLearningInsights] = useState<Record<string, unknown> | null>(null)
  const [streamingMessage, setStreamingMessage] = useState('')

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const aiService = useRef<AILearningService | null>(null)

  useEffect(() => {
    // Initialize AI service
    aiService.current = new AILearningService({
      modelProvider: 'openai',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      streaming: true,
    })

    // Load conversation history
    loadConversationHistory()

    // Initial greeting
    addMessage({
      role: 'assistant',
      content: `Hello! I'm your AI PMP Learning Assistant. I'm here to help you prepare for your PMP certification exam. 

Based on your current progress (${progress?.overall || 0}%), I can:
- Answer questions about PMBOK concepts
- Create personalized study plans
- Identify and help improve weak areas
- Generate practice questions
- Track your learning progress

What would you like to work on today?`,
    })

    return () => {
      aiService.current?.cleanup()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streamingMessage])

  const loadConversationHistory = async () => {
    if (!user?.id || !aiService.current) {
      return
    }

    try {
      const history = await aiService.current.getConversationHistory(user.id)
      if (history.length > 0) {
        setMessages(history.slice(-10)) // Load last 10 messages
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error)
    }
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !aiService.current || isLoading) {
      return
    }

    addMessage({
      role: 'user',
      content: input,
    })

    setInput('')
    setIsLoading(true)
    setStreamingMessage('')

    try {
      // Prepare learning context
      const context = {
        userId: user?.id || 'anonymous',
        currentProgress: {
          overall: progress?.overall || 0,
          knowledgeAreas: progress?.byKnowledgeArea || [],
          processGroups: progress?.byProcessGroup || [],
          weakAreas: weakAreas || [],
          strongAreas: strongAreas || [],
        },
        examDate: user?.examDate,
        learningStyle: user?.learningStyle || 'mixed',
        availableTimePerDay: user?.studyTimePerDay || 60,
        targetScore: user?.targetScore || 75,
      }

      // Check if this is a special command
      const command = detectCommand(input)

      if (command) {
        await handleCommand(command, context)
      } else {
        // Regular conversation with streaming
        const stream = aiService.current.streamResponse(input, context)

        let fullResponse = ''
        for await (const chunk of stream) {
          fullResponse += chunk
          setStreamingMessage(fullResponse)
        }

        // Add complete message
        addMessage({
          role: 'assistant',
          content: fullResponse,
        })
        setStreamingMessage('')

        // Get recommendations if applicable
        const response = await aiService.current.getRecommendations(context)
        if (response.recommendations) {
          setRecommendations(response.recommendations)
        }
      }
    } catch (error) {
      console.error('Error processing message:', error)
      addMessage({
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your request. Please try again.',
      })
      toast({
        title: 'Error',
        description: 'Failed to process your message',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const detectCommand = (text: string): string | null => {
    const commands = {
      '/plan': 'study_plan',
      '/analyze': 'progress_analysis',
      '/quiz': 'generate_quiz',
      '/recommend': 'recommendations',
      '/insights': 'learning_insights',
      '/weak': 'weakness_analysis',
      '/help': 'help',
    }

    const lowerText = text.toLowerCase()
    for (const [cmd, action] of Object.entries(commands)) {
      if (lowerText.startsWith(cmd)) {
        return action
      }
    }

    // Detect intent from natural language
    if (lowerText.includes('study plan') || lowerText.includes('schedule')) {
      return 'study_plan'
    }
    if (lowerText.includes('progress') || lowerText.includes('how am i doing')) {
      return 'progress_analysis'
    }
    if (lowerText.includes('quiz') || lowerText.includes('test me')) {
      return 'generate_quiz'
    }
    if (lowerText.includes('recommend') || lowerText.includes('suggest')) {
      return 'recommendations'
    }

    return null
  }

  const handleCommand = async (command: string, context: Record<string, unknown>) => {
    switch (command) {
      case 'study_plan':
        await generateStudyPlan(context)
        break
      case 'progress_analysis':
        await analyzeProgress(context)
        break
      case 'generate_quiz':
        await generateQuiz(context)
        break
      case 'recommendations':
        await getRecommendations(context)
        break
      case 'learning_insights':
        await getLearningInsights(context)
        break
      case 'weakness_analysis':
        await analyzeWeaknesses(context)
        break
      case 'help':
        showHelp()
        break
    }
  }

  const generateStudyPlan = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const plan = await aiService.current.generateStudyPlan(context)
      setStudyPlan(plan)
      setActiveTab('plan')

      addMessage({
        role: 'assistant',
        content:
          'I\'ve created a personalized study plan for you. Check the "Study Plan" tab to view the details.',
        metadata: { type: 'plan', data: plan },
      })
    } catch (error) {
      console.error('Error generating study plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate study plan',
        variant: 'destructive',
      })
    }
  }

  const analyzeProgress = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const analysis = await aiService.current.analyzeProgress(context)

      addMessage({
        role: 'assistant',
        content: analysis.summary,
        metadata: { type: 'analysis', data: analysis },
      })

      setLearningInsights(analysis)
      setActiveTab('insights')
    } catch (error) {
      console.error('Error analyzing progress:', error)
    }
  }

  const generateQuiz = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const quiz = await aiService.current.generateAdaptiveQuiz(context, 5)

      addMessage({
        role: 'assistant',
        content:
          "I've generated a practice quiz based on your weak areas. Let's test your knowledge!",
        metadata: { type: 'quiz', data: quiz },
      })

      // Render quiz in chat
      setActiveTab('chat')
    } catch (error) {
      console.error('Error generating quiz:', error)
    }
  }

  const getRecommendations = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const response = await aiService.current.getRecommendations(context)
      setRecommendations(response.recommendations)
      setActiveTab('recommendations')

      addMessage({
        role: 'assistant',
        content: `I've prepared ${response.recommendations.length} personalized recommendations for you. Check the "Recommendations" tab.`,
      })
    } catch (error) {
      console.error('Error getting recommendations:', error)
    }
  }

  const getLearningInsights = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const insights = await aiService.current.getLearningInsights(context)
      setLearningInsights(insights)
      setActiveTab('insights')

      addMessage({
        role: 'assistant',
        content:
          'I\'ve analyzed your learning patterns and generated insights. Check the "Insights" tab.',
        metadata: { type: 'analysis', data: insights },
      })
    } catch (error) {
      console.error('Error getting insights:', error)
    }
  }

  const analyzeWeaknesses = async (context: Record<string, unknown>) => {
    if (!aiService.current) {
      return
    }

    try {
      const analysis = await aiService.current.analyzeWeaknesses(context)

      addMessage({
        role: 'assistant',
        content: analysis.summary,
        metadata: { type: 'analysis', data: analysis },
      })
    } catch (error) {
      console.error('Error analyzing weaknesses:', error)
    }
  }

  const showHelp = () => {
    addMessage({
      role: 'assistant',
      content: `Here are the available commands:

**Chat Commands:**
- \`/plan\` - Generate a personalized study plan
- \`/analyze\` - Analyze your learning progress
- \`/quiz\` - Generate practice questions
- \`/recommend\` - Get study recommendations
- \`/insights\` - View learning insights
- \`/weak\` - Analyze weak areas
- \`/help\` - Show this help message

**Natural Language:**
You can also ask questions naturally:
- "What is earned value management?"
- "Explain the difference between risk and issue"
- "Help me understand critical path"
- "Create a study plan for next month"
- "What should I focus on today?"

**Tips:**
- Be specific in your questions for better answers
- Mention your weak areas for targeted help
- Ask for examples to understand concepts better`,
    })
  }

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user'

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-primary'>
              <Bot className='h-4 w-4' />
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
          <Card className={isUser ? 'bg-primary text-primary-foreground' : ''}>
            <CardContent className='p-3'>
              <div className='prose prose-sm dark:prose-invert'>
                {message.content.split('\n').map((line, i) => (
                  <p key={i} className='mb-2 last:mb-0'>
                    {line}
                  </p>
                ))}
              </div>

              {message.metadata?.type === 'quiz' && <QuizDisplay quiz={message.metadata.data} />}
            </CardContent>
          </Card>

          <div className='mt-1 px-1 text-xs text-muted-foreground'>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>

        {isUser && (
          <Avatar className='h-8 w-8'>
            <AvatarFallback>
              <User className='h-4 w-4' />
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    )
  }

  const QuizDisplay: React.FC<{ quiz: Array<Record<string, unknown>> }> = ({ quiz }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
    const [showResults, setShowResults] = useState(false)

    const handleAnswer = (questionIndex: number, answerIndex: number) => {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionIndex]: answerIndex,
      }))
    }

    const checkAnswers = () => {
      setShowResults(true)
    }

    return (
      <div className='mt-4 space-y-4'>
        {quiz.map((question: Record<string, unknown>, qIndex: number) => (
          <Card key={qIndex}>
            <CardContent className='p-4'>
              <p className='mb-3 font-medium'>{question.question}</p>
              <div className='space-y-2'>
                {question.options.map((option: string, oIndex: number) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, oIndex)}
                    className={`w-full rounded-lg border p-2 text-left transition-colors ${
                      selectedAnswers[qIndex] === oIndex
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    } ${
                      showResults && oIndex === question.correctAnswer
                        ? 'border-green-500 bg-green-500/20'
                        : ''
                    } ${
                      showResults &&
                      selectedAnswers[qIndex] === oIndex &&
                      oIndex !== question.correctAnswer
                        ? 'border-red-500 bg-red-500/20'
                        : ''
                    }`}
                    disabled={showResults}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {showResults && (
                <p className='mt-3 text-sm text-muted-foreground'>{question.explanation}</p>
              )}
            </CardContent>
          </Card>
        ))}

        {!showResults && (
          <Button onClick={checkAnswers} className='w-full'>
            Check Answers
          </Button>
        )}

        {showResults && (
          <div className='text-center'>
            <p className='text-lg font-semibold'>
              Score:{' '}
              {
                Object.entries(selectedAnswers).filter(
                  ([qIndex, aIndex]) => quiz[parseInt(qIndex)].correctAnswer === aIndex
                ).length
              }{' '}
              / {quiz.length}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${
        isExpanded ? 'inset-4' : 'bottom-4 right-4 h-[600px] w-96'
      } z-50 transition-all duration-300`}
    >
      <Card className='flex h-full flex-col shadow-2xl'>
        <CardHeader className='flex-shrink-0 border-b'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='rounded-lg bg-primary/10 p-2'>
                <Sparkles className='h-5 w-5 text-primary' />
              </div>
              <div>
                <CardTitle className='text-lg'>AI Learning Assistant</CardTitle>
                <p className='text-xs text-muted-foreground'>Powered by Advanced AI</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button variant='ghost' size='icon' onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className='h-4 w-4' /> : <Maximize2 className='h-4 w-4' />}
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  /* Close handler */
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex flex-1 flex-col'>
          <TabsList className='w-full flex-shrink-0 justify-start px-4'>
            <TabsTrigger value='chat'>Chat</TabsTrigger>
            <TabsTrigger value='recommendations'>
              Recommendations
              {recommendations.length > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {recommendations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value='plan'>Study Plan</TabsTrigger>
            <TabsTrigger value='insights'>Insights</TabsTrigger>
          </TabsList>

          <TabsContent value='chat' className='flex flex-1 flex-col p-0'>
            <ScrollArea className='flex-1 p-4' ref={scrollRef}>
              <div className='space-y-4'>
                <AnimatePresence>
                  {messages.map(renderMessage)}

                  {streamingMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='flex gap-3'
                    >
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-primary'>
                          <Bot className='h-4 w-4' />
                        </AvatarFallback>
                      </Avatar>
                      <Card className='max-w-[70%]'>
                        <CardContent className='p-3'>
                          <p>{streamingMessage}</p>
                          <span className='ml-1 inline-block h-4 w-1 animate-pulse bg-primary' />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <div className='border-t p-4'>
              <div className='flex gap-2'>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder='Ask me anything about PMP...'
                  disabled={isLoading}
                  className='flex-1'
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size='icon'
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                </Button>
              </div>

              <div className='mt-2 flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setInput('/plan')}
                  className='text-xs'
                >
                  <Calendar className='mr-1 h-3 w-3' />
                  Study Plan
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setInput('/analyze')}
                  className='text-xs'
                >
                  <TrendingUp className='mr-1 h-3 w-3' />
                  Progress
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setInput('/quiz')}
                  className='text-xs'
                >
                  <Target className='mr-1 h-3 w-3' />
                  Quiz Me
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='recommendations' className='flex-1 p-4'>
            <ScrollArea className='h-full'>
              <div className='space-y-4'>
                {recommendations.length === 0 ? (
                  <p className='text-center text-muted-foreground'>
                    No recommendations yet. Ask for study suggestions!
                  </p>
                ) : (
                  recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className='p-4'>
                        <div className='mb-2 flex items-start justify-between'>
                          <Badge
                            variant={
                              rec.priority === 'high'
                                ? 'destructive'
                                : rec.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {rec.priority} priority
                          </Badge>
                          <span className='text-sm text-muted-foreground'>
                            {rec.estimatedTime} min
                          </span>
                        </div>

                        <h4 className='mb-1 font-semibold'>{rec.topic}</h4>
                        <p className='mb-2 text-sm text-muted-foreground'>{rec.reason}</p>

                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>{rec.type}</Badge>
                          <Badge variant='outline'>{rec.difficulty}</Badge>
                        </div>

                        <Button className='mt-3 w-full' size='sm'>
                          Start Learning
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value='plan' className='flex-1 p-4'>
            <ScrollArea className='h-full'>
              {studyPlan ? (
                <StudyPlanDisplay plan={studyPlan} />
              ) : (
                <div className='py-8 text-center'>
                  <Calendar className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-muted-foreground'>No study plan generated yet.</p>
                  <Button onClick={() => setInput('/plan')} className='mt-4'>
                    Generate Study Plan
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value='insights' className='flex-1 p-4'>
            <ScrollArea className='h-full'>
              {learningInsights ? (
                <InsightsDisplay insights={learningInsights} />
              ) : (
                <div className='py-8 text-center'>
                  <TrendingUp className='mx-auto mb-4 h-12 w-12 text-muted-foreground' />
                  <p className='text-muted-foreground'>No insights available yet.</p>
                  <Button onClick={() => setInput('/insights')} className='mt-4'>
                    Generate Insights
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  )
}

// Sub-components for displaying complex data

const StudyPlanDisplay: React.FC<{ plan: Record<string, unknown> }> = ({ plan }) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-3 font-semibold'>Study Plan Overview</h3>
        <div className='grid grid-cols-2 gap-4'>
          <Card>
            <CardContent className='p-3'>
              <p className='text-sm text-muted-foreground'>Days until exam</p>
              <p className='text-2xl font-bold'>{plan.daysUntilExam}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-3'>
              <p className='text-sm text-muted-foreground'>Total hours</p>
              <p className='text-2xl font-bold'>{plan.totalHours}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className='mb-3 font-semibold'>Weekly Schedule</h3>
        {(plan.dailySchedule as Array<Record<string, unknown>>)
          ?.slice(0, 7)
          .map((day: Record<string, unknown>, index: number) => (
            <Card key={index} className='mb-2'>
              <CardContent className='p-3'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Day {day.day}</span>
                  <Badge variant='outline'>{day.duration} min</Badge>
                </div>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Topics: {day.topics.join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>

      <div>
        <h3 className='mb-3 font-semibold'>Milestones</h3>
        {(plan.milestones as Array<Record<string, unknown>>)?.map(
          (milestone: Record<string, unknown>, index: number) => (
            <div key={index} className='mb-3 flex items-center gap-3'>
              <div className='h-2 w-2 rounded-full bg-primary' />
              <div className='flex-1'>
                <p className='text-sm font-medium'>Week {milestone.week}</p>
                <p className='text-xs text-muted-foreground'>Target: {milestone.targetScore}%</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

const InsightsDisplay: React.FC<{ insights: Record<string, unknown> }> = ({ insights }) => {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-3 font-semibold'>Learning Patterns</h3>
        {insights.patterns?.map((pattern: string, index: number) => (
          <Card key={index} className='mb-2'>
            <CardContent className='p-3'>
              <p className='text-sm'>{pattern}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className='mb-3 font-semibold'>Key Insights</h3>
        {insights.insights?.map((insight: string, index: number) => (
          <div key={index} className='mb-2 flex items-start gap-2'>
            <Sparkles className='mt-0.5 h-4 w-4 text-primary' />
            <p className='text-sm'>{insight}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className='mb-3 font-semibold'>Recommendations</h3>
        {insights.recommendations?.map((rec: string, index: number) => (
          <Card key={index} className='mb-2'>
            <CardContent className='p-3'>
              <p className='text-sm'>{rec}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AILearningAssistant
