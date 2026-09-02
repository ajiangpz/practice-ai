import { Button, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { initialPractice } from '@/data/practice'
import { getPractice, startPractice } from '@/services/storage'
import type { Practice } from '@/types/domain'

import './index.scss'

export default function PracticePage() {
  const [practice, setPractice] = useState<Practice>(initialPractice)

  useDidShow(() => {
    setPractice(getPractice())
  })

  const handleStart = () => {
    startPractice()
    Taro.navigateTo({ url: '/pages/capture/index?attempt=1' })
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

      <Button className='primary-button' onClick={handleStart}>开始拍摄</Button>
    </View>
  )
}
