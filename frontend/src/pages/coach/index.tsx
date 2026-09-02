import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useState } from 'react'

import { initialPractice } from '@/data/practice'
import {
  ApiError,
  completePractice as completePracticeApi,
  createPractice,
  createSubmission,
  getCoachResult,
  type CoachApiResult
} from '@/services/api'
import { getAttempt, getImage, getPractice, saveAttempt, savePractice } from '@/services/storage'
import type { Attempt, Practice } from '@/types/domain'

import './index.scss'

function parseAttempt(value?: string): Attempt | undefined {
  if (value === '1' || value === '2') return Number(value) as Attempt
  return undefined
}

function mergeServerPractice(localPractice: Practice, serverPractice: Awaited<ReturnType<typeof createPractice>>): Practice {
  return {
    ...initialPractice,
    ...localPractice,
    ...serverPractice,
    attemptCount: localPractice.attemptCount,
    status: localPractice.status
  }
}

export default function CoachPage() {
  const [attempt, setAttempt] = useState<Attempt>(1)
  const [beforeUrl, setBeforeUrl] = useState('')
  const [afterUrl, setAfterUrl] = useState('')
  const [result, setResult] = useState<CoachApiResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [networkError, setNetworkError] = useState('')
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  const ensureServerPractice = async (practice: Practice): Promise<Practice> => {
    const serverPractice = await createPractice()
    const recoveredPractice = mergeServerPractice(practice, serverPractice)
    savePractice(recoveredPractice)
    return recoveredPractice
  }

  const requestResult = async (currentAttempt: Attempt) => {
    setLoading(true)
    setNetworkError('')
    setResult(null)
    const imageClientRef = getImage(currentAttempt)

    if (!imageClientRef) {
      setNetworkError('没有找到本次拍摄的照片，请返回重新拍摄')
      setLoading(false)
      return
    }

    try {
      let practice = getPractice()
      let submission
      try {
        submission = await createSubmission(practice.id, currentAttempt, imageClientRef)
      } catch (error) {
        if (!(error instanceof ApiError) || error.statusCode !== 404) throw error
        practice = await ensureServerPractice(practice)
        submission = await createSubmission(practice.id, currentAttempt, imageClientRef)
      }

      const coachResult = await getCoachResult(submission.submissionId)
      savePractice({
        ...practice,
        attemptCount: currentAttempt,
        status: coachResult.state === 'retry' ? 'retry' : 'passed'
      })
      setResult(coachResult)
    } catch (error) {
      setNetworkError(error instanceof Error ? error.message : '获取教练反馈失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  useLoad((options) => {
    const currentAttempt = parseAttempt(options.attempt) || getAttempt()
    setAttempt(currentAttempt)
    setBeforeUrl(getImage(1))
    setAfterUrl(getImage(2))
    setCompleted(getPractice().status === 'completed')
    void requestResult(currentAttempt)
  })

  const retryCapture = () => {
    const practice = getPractice()
    saveAttempt(2)
    savePractice({ ...practice, attemptCount: 1, status: 'retry' })
    Taro.redirectTo({ url: '/pages/capture/index?attempt=2' })
  }

  const complete = async () => {
    setCompleting(true)
    setNetworkError('')
    try {
      let practice = getPractice()
      try {
        await completePracticeApi(practice.id)
      } catch (error) {
        if (!(error instanceof ApiError) || error.statusCode !== 404) throw error
        practice = await ensureServerPractice(practice)
        await completePracticeApi(practice.id)
      }
      savePractice({ ...practice, attemptCount: 2, status: 'completed' })
      setCompleted(true)
    } catch (error) {
      setNetworkError(error instanceof Error ? error.message : '完成练习失败，请重试')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <View className='page coach-page status-page'>
        <View className='status-mark'>···</View>
        <Text className='status-title'>AI 教练正在反馈</Text>
        <Text className='status-hint'>只检查这次练习的背景控制</Text>
      </View>
    )
  }

  if (!result) {
    return (
      <View className='page coach-page status-page'>
        <View className='status-mark error-mark'>!</View>
        <Text className='status-title'>暂时无法获取反馈</Text>
        <Text className='status-hint'>{networkError}</Text>
        <Button className='primary-button' onClick={() => void requestResult(attempt)}>重试</Button>
      </View>
    )
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
          <Text className='feedback-main'>{result.primaryIssue.description}。</Text>
        </View>

        <View className='feedback-section action-section'>
          <Text className='section-kicker'>下一步</Text>
          <Text className='feedback-main'>{result.action.instruction}</Text>
        </View>

        <Button className='primary-button' onClick={retryCapture}>再拍一次</Button>
      </View>
    )
  }

  return (
    <View className='page coach-page compare-page'>
      <View className='eyebrow'>明显改善</View>
      <Text className='compare-title'>Before → After</Text>

      <View className='comparison'>
        <View className='comparison-item'>
          <Image className='comparison-photo' src={beforeUrl} mode='aspectFill' />
          <Text className='photo-label'>Before</Text>
        </View>
        <Text className='comparison-arrow'>→</Text>
        <View className='comparison-item'>
          <Image className='comparison-photo' src={afterUrl} mode='aspectFill' />
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
        <Text className='summary'>{result.comparison.summary}</Text>
      </View>

      {networkError && <View className='inline-error'>{networkError}</View>}

      {completed ? (
        <View className='completion-state'>
          <Text className='completion-check'>✓</Text>
          <Text className='completion-title'>今天的练习已完成</Text>
          <Button className='secondary-button' onClick={() => Taro.reLaunch({ url: '/pages/practice/index' })}>返回练习</Button>
        </View>
      ) : (
        <Button className='primary-button' disabled={completing} loading={completing} onClick={complete}>
          {completing ? '正在完成…' : networkError ? '重试完成练习' : '完成今天的练习'}
        </Button>
      )}
    </View>
  )
}
