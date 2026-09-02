import Taro from '@tarojs/taro'

import type { Attempt, PracticeStatus } from '@/types/domain'

declare const PRACTICE_API_BASE_URL: string

const API_BASE_URL = PRACTICE_API_BASE_URL.replace(/\/$/, '')

export interface PracticeApiResponse {
  id: string
  templateId: 'BG-01'
  skill: 'background_control'
  title: '背景做减法'
  maxAttempts: 3
  attemptCount: number
  status: PracticeStatus
}

export interface SubmissionApiResponse {
  submissionId: string
  practiceId: string
  attempt: Attempt
  status: 'completed'
}

interface RetryCoachResult {
  state: 'retry'
  positiveObservation: string
  primaryIssue: {
    type: 'background_distraction'
    description: string
  }
  action: {
    type: 'move_left'
    instruction: string
  }
}

interface CompareCoachResult {
  state: 'compare'
  comparison: {
    summary: string
  }
}

export type CoachApiResult = RetryCoachResult | CompareCoachResult

export interface PracticeCompleteApiResponse {
  practiceId: string
  status: 'completed'
}

export class ApiError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST',
  data?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await Taro.request<T>({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      timeout: 10000,
      header: { 'content-type': 'application/json' }
    })

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const body = response.data as { detail?: string }
      throw new ApiError(body?.detail || `请求失败（${response.statusCode}）`, response.statusCode)
    }
    return response.data
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('无法连接教练服务，请检查网络后重试')
  }
}

export function createPractice(): Promise<PracticeApiResponse> {
  return request('/api/v1/practices', 'POST', { templateId: 'BG-01' })
}

export function createSubmission(
  practiceId: string,
  attempt: Attempt,
  imageClientRef: string
): Promise<SubmissionApiResponse> {
  return request(`/api/v1/practices/${practiceId}/submissions`, 'POST', {
    attempt,
    imageClientRef
  })
}

export function getCoachResult(submissionId: string): Promise<CoachApiResult> {
  return request(`/api/v1/submissions/${submissionId}/result`, 'GET')
}

export function completePractice(practiceId: string): Promise<PracticeCompleteApiResponse> {
  return request(`/api/v1/practices/${practiceId}/complete`, 'POST')
}
