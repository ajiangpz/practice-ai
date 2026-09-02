import Taro from '@tarojs/taro'

import { initialPractice } from '@/data/practice'
import type { Attempt, Practice } from '@/types/domain'

export const STORAGE_KEYS = {
  practice: 'practice_state',
  beforeImage: 'before_image_path',
  afterImage: 'after_image_path',
  attempt: 'attempt'
} as const

export function getPractice(): Practice {
  return Taro.getStorageSync<Practice>(STORAGE_KEYS.practice) || initialPractice
}

export function savePractice(practice: Practice): void {
  Taro.setStorageSync(STORAGE_KEYS.practice, practice)
}

export function getAttempt(): Attempt {
  return Taro.getStorageSync<number>(STORAGE_KEYS.attempt) === 2 ? 2 : 1
}

export function saveAttempt(attempt: Attempt): void {
  Taro.setStorageSync(STORAGE_KEYS.attempt, attempt)
}

export function getImage(attempt: Attempt): string {
  const key = attempt === 1 ? STORAGE_KEYS.beforeImage : STORAGE_KEYS.afterImage
  return Taro.getStorageSync<string>(key) || ''
}

export function saveImage(attempt: Attempt, imagePath: string): void {
  const key = attempt === 1 ? STORAGE_KEYS.beforeImage : STORAGE_KEYS.afterImage
  Taro.setStorageSync(key, imagePath)
}

export function startPractice(practice: Practice): void {
  saveAttempt(1)
  savePractice(practice)
  Taro.removeStorageSync(STORAGE_KEYS.beforeImage)
  Taro.removeStorageSync(STORAGE_KEYS.afterImage)
}
