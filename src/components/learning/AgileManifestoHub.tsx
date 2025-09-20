import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  BookOpen,
  Users,
  Code,
  Users as Handshake,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Calendar,
  MapPin,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { agileManifestoData } from '../../data/pmbok/agileManifestoData'
import type { AgileValue } from '../../data/schemas/pmbok/agileTypes'

const AgileManifestoHub: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState<AgileValue | null>(null)
  const [activeSection, setActiveSection] = useState<'values' | 'background' | 'details'>('values')

  const getValueIcon = (index: number) => {
    const icons = [Users, Code, Handshake, TrendingUp]
    const IconComponent = icons[index]
    return <IconComponent className='h-6 w-6' />
  }

  const getValueColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
    ]
    return colors[index]
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
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='space-y-4 text-center'
      >
        <div className='flex items-center justify-center space-x-3'>
          <div className='rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-3'>
            <BookOpen className='h-8 w-8 text-white' />
          </div>
          <h1 className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent'>
            アジャイル・マニフェスト
          </h1>
        </div>
        <p className='mx-auto max-w-3xl text-xl text-muted-foreground'>
          ソフトウェア開発のより良い方法を発見するための価値観と原則
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mx-auto flex w-fit justify-center space-x-1 rounded-lg bg-muted p-1'
      >
        {[
          { key: 'values', label: '4つの価値', icon: Target },
          { key: 'background', label: '歴史的背景', icon: Calendar },
          { key: 'details', label: '詳細分析', icon: Lightbulb },
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeSection === key ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setActiveSection(key as any)}
            className='flex items-center space-x-2'
          >
            <Icon className='h-4 w-4' />
            <span>{label}</span>
          </Button>
        ))}
      </motion.div>

      <AnimatePresence mode='wait'>
        {activeSection === 'values' && (
          <motion.div
            key='values'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-8'
          >
            {/* Agile Manifesto Declaration */}
            <motion.div variants={itemVariants}>
              <Card className='border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950 dark:to-purple-950'>
                <CardHeader className='text-center'>
                  <CardTitle className='text-2xl'>アジャイル・ソフトウェア開発宣言</CardTitle>
                  <CardDescription className='text-lg'>
                    私たちは、ソフトウェア開発の実践と他の人々の支援を通じて、
                    <br />
                    より良い開発方法を見つけ出そうとしている。
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {/* Four Values */}
            <motion.div variants={itemVariants} className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {agileManifestoData.manifesto.values.map((value, index) => (
                <motion.div
                  key={value.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='cursor-pointer'
                  onClick={() => setSelectedValue(value)}
                >
                  <Card className='h-full border-2 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-blue-300 dark:from-gray-900 dark:to-gray-800 dark:hover:border-blue-700'>
                    <CardHeader>
                      <div className='flex items-center space-x-3'>
                        <div className={`rounded-xl bg-gradient-to-r p-3 ${getValueColor(index)}`}>
                          {getValueIcon(index)}
                          <span className='sr-only'>価値 {index + 1}</span>
                        </div>
                        <div className='flex-1'>
                          <CardTitle className='text-xl'>{value.title}</CardTitle>
                          <CardDescription className='text-sm text-muted-foreground'>
                            {value.subtitle}
                          </CardDescription>
                        </div>
                        <ChevronRight className='h-5 w-5 text-muted-foreground' />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        <p className='text-sm text-muted-foreground'>{value.description}</p>

                        {/* Value Comparison */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950'>
                            <div className='flex-1'>
                              <div className='font-semibold text-green-800 dark:text-green-200'>
                                {value.leftSide.value}
                              </div>
                              <div className='text-xs text-green-600 dark:text-green-400'>
                                重視する価値
                              </div>
                            </div>
                            <ArrowRight className='mx-2 h-4 w-4 text-green-600' />
                            <div className='flex-1 text-right'>
                              <div className='font-medium text-gray-600 dark:text-gray-400'>
                                {value.rightSide.value}
                              </div>
                              <div className='text-xs text-gray-500'>従来のアプローチ</div>
                            </div>
                          </div>
                        </div>

                        {/* PMBOK Connection */}
                        <div className='flex flex-wrap gap-1'>
                          {value.pmbokConnection.performanceDomains.map((domain) => (
                            <Badge key={domain} variant='secondary' className='text-xs'>
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div variants={itemVariants} className='text-center'>
              <Card className='border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950 dark:to-orange-950'>
                <CardContent className='pt-6'>
                  <p className='text-lg font-medium text-amber-800 dark:text-amber-200'>
                    これらの価値は、右側の項目にも価値があることを認めながら、
                    <br />
                    左側の項目により価値を置くことを表明しています。
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeSection === 'background' && (
          <motion.div
            key='background'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <Calendar className='h-5 w-5' />
                    <span>歴史的背景</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <p className='text-muted-foreground'>
                    {agileManifestoData.manifesto.background.history}
                  </p>

                  <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm font-medium'>
                        <Calendar className='h-4 w-4' />
                        <span>日程</span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {agileManifestoData.manifesto.background.date}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm font-medium'>
                        <MapPin className='h-4 w-4' />
                        <span>場所</span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {agileManifestoData.manifesto.background.location}
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2 text-sm font-medium'>
                        <Users className='h-4 w-4' />
                        <span>署名者</span>
                      </div>
                      <p className='text-sm text-muted-foreground'>17名の開発者</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className='mb-2 font-medium'>背景と動機</h4>
                    <p className='text-sm text-muted-foreground'>
                      {agileManifestoData.manifesto.background.context}
                    </p>
                  </div>

                  <div>
                    <h4 className='mb-3 font-medium'>署名者（Agile Alliance 創設メンバー）</h4>
                    <div className='grid grid-cols-2 gap-2 md:grid-cols-3'>
                      {agileManifestoData.manifesto.background.authors.map((author, index) => (
                        <div key={index} className='flex items-center space-x-2 text-sm'>
                          <div className='h-2 w-2 rounded-full bg-blue-500' />
                          <span>{author}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeSection === 'details' && selectedValue && (
          <motion.div
            key='details'
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            className='space-y-6'
          >
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-3'>
                    {getValueIcon(
                      agileManifestoData.manifesto.values.findIndex(
                        (v) => v.id === selectedValue.id
                      )
                    )}
                    <span>{selectedValue.title}</span>
                  </CardTitle>
                  <CardDescription>{selectedValue.description}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Key Points */}
                  <div>
                    <h4 className='mb-3 flex items-center space-x-2 font-medium'>
                      <Target className='h-4 w-4' />
                      <span>重要なポイント</span>
                    </h4>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      {selectedValue.keyPoints.map((point, index) => (
                        <div key={index} className='flex items-start space-x-2'>
                          <CheckCircle className='mt-1 h-4 w-4 flex-shrink-0 text-green-500' />
                          <span className='text-sm'>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Practical Examples */}
                  <div>
                    <h4 className='mb-3 flex items-center space-x-2 font-medium'>
                      <Lightbulb className='h-4 w-4' />
                      <span>実践例</span>
                    </h4>
                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
                      {selectedValue.practicalExamples.map((example, index) => (
                        <div key={index} className='rounded-lg bg-blue-50 p-3 dark:bg-blue-950'>
                          <span className='text-sm'>{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Benefits and Challenges */}
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div>
                      <h4 className='mb-3 flex items-center space-x-2 font-medium text-green-600'>
                        <CheckCircle className='h-4 w-4' />
                        <span>利点</span>
                      </h4>
                      <ul className='space-y-2'>
                        {selectedValue.benefits.map((benefit, index) => (
                          <li key={index} className='flex items-start space-x-2'>
                            <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500' />
                            <span className='text-sm'>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className='mb-3 flex items-center space-x-2 font-medium text-orange-600'>
                        <AlertTriangle className='h-4 w-4' />
                        <span>課題</span>
                      </h4>
                      <ul className='space-y-2'>
                        {selectedValue.challenges.map((challenge, index) => (
                          <li key={index} className='flex items-start space-x-2'>
                            <div className='mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500' />
                            <span className='text-sm'>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  {/* Common Misunderstandings */}
                  <div>
                    <h4 className='mb-3 flex items-center space-x-2 font-medium text-red-600'>
                      <AlertTriangle className='h-4 w-4' />
                      <span>よくある誤解</span>
                    </h4>
                    <div className='space-y-2'>
                      {selectedValue.commonMisunderstandings.map((misunderstanding, index) => (
                        <div
                          key={index}
                          className='rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950'
                        >
                          <span className='text-sm text-red-800 dark:text-red-200'>
                            {misunderstanding}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Value Details Modal/Panel for mobile */}
      <AnimatePresence>
        {selectedValue && activeSection === 'values' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 md:hidden'
            onClick={() => setSelectedValue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='max-h-96 max-w-lg overflow-y-auto rounded-lg bg-background p-6'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-semibold'>{selectedValue.title}</h3>
                <Button variant='ghost' size='sm' onClick={() => setSelectedValue(null)}>
                  ×
                </Button>
              </div>
              <p className='mb-4 text-sm text-muted-foreground'>{selectedValue.description}</p>
              <Button size='sm' onClick={() => setActiveSection('details')} className='w-full'>
                詳細を見る
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AgileManifestoHub
