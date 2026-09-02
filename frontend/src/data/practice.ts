import type { Practice } from '@/types/domain'

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
