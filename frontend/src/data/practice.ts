import type { CoachResult, Practice } from '@/types/domain'

export const initialPractice: Practice = {
  id: 'practice-bg-01',
  templateId: 'BG-01',
  title: '背景做减法',
  skill: 'background_control',
  objective: '让主体后面的背景更干净',
  instruction: '找一个不会移动的东西，比如杯子、植物或电脑。不要移动主体，只改变自己的拍摄位置，让背景里少一个明显干扰物。',
  maxAttempts: 3,
  attemptCount: 0,
  status: 'ready'
}

export const retryResult: CoachResult = {
  state: 'retry',
  positiveObservation: '主体已经比较明确',
  primaryIssue: {
    type: 'background_distraction',
    description: '右后方的干扰物比较抢眼'
  },
  action: {
    type: 'move_left',
    instruction: '不要移动主体，向左移动一步，再拍一次。'
  }
}
