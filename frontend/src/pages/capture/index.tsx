import { Button, Image, Text, View } from '@tarojs/components'
import Taro, { useDidShow, useLoad } from '@tarojs/taro'
import { useRef, useState } from 'react'

import { getAttempt, getImage, getPractice, saveAttempt, saveImage, savePractice } from '@/services/storage'
import type { Attempt } from '@/types/domain'

import './index.scss'

function parseAttempt(value?: string): Attempt | undefined {
  if (value === '1' || value === '2') return Number(value) as Attempt
  return undefined
}

export default function CapturePage() {
  const [attempt, setAttempt] = useState<Attempt>(1)
  const [imagePath, setImagePath] = useState('')
  const isChoosingMedia = useRef(false)

  useLoad((options) => {
    const nextAttempt = parseAttempt(options.attempt) || getAttempt()
    setAttempt(nextAttempt)
    saveAttempt(nextAttempt)
    setImagePath(getImage(nextAttempt))
  })

  useDidShow(() => {
    if (isChoosingMedia.current) return

    const currentAttempt = getAttempt()
    setAttempt(currentAttempt)
    setImagePath(getImage(currentAttempt))
  })

  const chooseImage = async () => {
    isChoosingMedia.current = true
    try {
      const result = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['camera', 'album']
      })
      const selectedPath = result.tempFiles[0]?.tempFilePath
      if (selectedPath) {
        saveImage(attempt, selectedPath)
        setImagePath(selectedPath)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (!message.includes('cancel')) {
        Taro.showToast({ title: '选择图片失败，请重试', icon: 'none' })
      }
    } finally {
      isChoosingMedia.current = false
    }
  }

  const submitImage = () => {
    if (!imagePath) {
      Taro.showToast({ title: '请先拍摄或选择一张照片', icon: 'none' })
      return
    }

    const practice = getPractice()
    saveImage(attempt, imagePath)
    savePractice({
      ...practice,
      attemptCount: attempt,
      status: 'analyzing'
    })
    Taro.redirectTo({ url: `/pages/coach/index?attempt=${attempt}` })
  }

  return (
    <View className='page capture-page'>
      <View className='capture-heading'>
        <Text className='eyebrow'>第 {attempt} 次拍摄</Text>
        <Text className='capture-title'>保持主体不动，只改变拍摄位置</Text>
      </View>

      <View className={`photo-frame ${imagePath ? 'has-photo' : ''}`} onClick={chooseImage}>
        {imagePath ? (
          <Image className='photo-preview' src={imagePath} mode='aspectFill' />
        ) : (
          <View className='empty-photo'>
            <Text className='camera-mark'>＋</Text>
            <Text className='empty-title'>拍一张练习照片</Text>
            <Text className='empty-hint'>可使用相机或从相册选择</Text>
          </View>
        )}
      </View>

      {imagePath && (
        <Button className='retake-button' onClick={chooseImage}>重新拍</Button>
      )}

      <Button className='primary-button' onClick={submitImage}>提交给 AI 教练</Button>
    </View>
  )
}
