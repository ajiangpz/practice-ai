import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { initialPractice } from '@/data/practice'
import { createPractice } from '@/services/api'
import { getPractice, startPractice } from '@/services/storage'
import type { Practice } from '@/types/domain'

import './index.scss'

export default function PracticePage() {
  const [practice, setPractice] = useState<Practice>(initialPractice)
  const [starting, setStarting] = useState(false)
  const [networkError, setNetworkError] = useState('')

  useDidShow(() => {
    setPractice(getPractice())
  })

  const handleStart = async () => {
    setStarting(true)
    setNetworkError('')
    try {
      const serverPractice = await createPractice()
      startPractice({
        ...initialPractice,
        ...serverPractice,
        attemptCount: 1,
        status: 'in_progress'
      })
      Taro.navigateTo({ url: '/pages/capture/index?attempt=1' })
    } catch (error) {
      setNetworkError(error instanceof Error ? error.message : '无法开始练习，请重试')
    } finally {
      setStarting(false)
    }
  }

  return (
    <View className='page practice-page'>
      <View className='eyebrow'>DAY 1</View>
      <View className='practice-card'>
        <Text className='focus-label'>今天只练一件事</Text>
        <Text className='practice-title'>{initialPractice.title}</Text>
        <Text className='objective'>{initialPractice.objective}</Text>

        <View className='divider' />

        <Text className='section-label'>练习任务</Text>
        <Text className='instruction'>{initialPractice.instruction}</Text>

        <Text className='section-label subject-label'>建议主体</Text>
        <View className='subjects'>
          {['杯子', '植物', '电脑'].map((subject) => (
            <Text className='subject' key={subject}>{subject}</Text>
          ))}
        </View>
      </View>

      {practice.status === 'completed' && (
        <View className='completed-note'>✓ 上一次练习已完成，可以再练一次</View>
      )}

      {networkError && <View className='network-error'>{networkError}</View>}

      <Button className='primary-button' disabled={starting} loading={starting} onClick={handleStart}>
        {starting ? '正在连接教练…' : networkError ? '重试开始练习' : '开始拍摄'}
      </Button>
    </View>
  )
}
