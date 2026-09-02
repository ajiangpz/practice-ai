import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useState } from 'react'

import { retryResult } from '@/data/practice'
import { getAttempt, getImage, getPractice, saveAttempt, savePractice } from '@/services/storage'
import type { Attempt, CoachResult } from '@/types/domain'

import './index.scss'

function parseAttempt(value?: string): Attempt | undefined {
  if (value === '1' || value === '2') return Number(value) as Attempt
  return undefined
}

export default function CoachPage() {
  const [attempt, setAttempt] = useState<Attempt>(1)
  const [beforeUrl, setBeforeUrl] = useState('')
  const [afterUrl, setAfterUrl] = useState('')
  const [completed, setCompleted] = useState(false)

  const restoreState = (routeAttempt?: Attempt) => {
    const currentAttempt = routeAttempt || getAttempt()
    setAttempt(currentAttempt)
    setBeforeUrl(getImage(1))
    setAfterUrl(getImage(2))
    setCompleted(getPractice().status === 'completed')
  }

  useLoad((options) => restoreState(parseAttempt(options.attempt)))
  useDidShow(() => restoreState())

  const result: CoachResult = attempt === 1
    ? retryResult
    : {
        state: 'compare',
        comparison: {
          beforeUrl,
          afterUrl,
          summary: '改变机位后，主体后方的干扰减少了。'
        }
      }

  const retry = () => {
    const practice = getPractice()
    saveAttempt(2)
    savePractice({ ...practice, attemptCount: 1, status: 'retry' })
    Taro.redirectTo({ url: '/pages/capture/index?attempt=2' })
  }

  const complete = () => {
    const practice = getPractice()
    savePractice({ ...practice, attemptCount: 2, status: 'completed' })
    setCompleted(true)
  }

  if (result.state === 'retry') {
    return (
      <View className='page coach-page retry-page'>
        <View className='eyebrow'>方向对了</View>
        <View className='feedback-card positive-card'>
          <Text className='check'>✓</Text>
          <Text>{result.positiveObservation}</Text>
        </View>

        <View className='feedback-section'>
          <Text className='section-kicker'>先只改这一点</Text>
          <Text className='feedback-main'>{result.primaryIssue?.description}。</Text>
        </View>

        <View className='feedback-section action-section'>
          <Text className='section-kicker'>下一步</Text>
          <Text className='feedback-main'>{result.action?.instruction}</Text>
        </View>

        <Button className='primary-button' onClick={retry}>再拍一次</Button>
      </View>
    )
  }

  return (
    <View className='page coach-page compare-page'>
      <View className='eyebrow'>明显改善</View>
      <Text className='compare-title'>Before → After</Text>

      <View className='comparison'>
        <View className='comparison-item'>
          <Image className='comparison-photo' src={result.comparison?.beforeUrl || ''} mode='aspectFill' />
          <Text className='photo-label'>Before</Text>
        </View>
        <Text className='comparison-arrow'>→</Text>
        <View className='comparison-item'>
          <Image className='comparison-photo' src={result.comparison?.afterUrl || ''} mode='aspectFill' />
          <Text className='photo-label'>After</Text>
        </View>
      </View>

      <View className='result-card'>
        <Text className='result-label'>背景控制</Text>
        <View className='mastery-row'>
          <Text className='old-level'>需要练习</Text>
          <Text className='level-arrow'>→</Text>
          <Text className='new-level'>通过</Text>
        </View>
        <Text className='summary'>{result.comparison?.summary}</Text>
      </View>

      {completed ? (
        <View className='completion-state'>
          <Text className='completion-check'>✓</Text>
          <Text className='completion-title'>今天的练习已完成</Text>
          <Button className='secondary-button' onClick={() => Taro.reLaunch({ url: '/pages/practice/index' })}>返回练习</Button>
        </View>
      ) : (
        <Button className='primary-button' onClick={complete}>完成今天的练习</Button>
      )}
    </View>
  )
}
