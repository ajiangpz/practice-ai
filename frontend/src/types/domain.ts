export type SkillType = 'background_control'

export type PracticeStatus =
  | 'ready'
  | 'in_progress'
  | 'analyzing'
  | 'retry'
  | 'passed'
  | 'needs_practice'
  | 'completed'

export interface Practice {
  id: string
  templateId: 'BG-01'
  title: string
  skill: SkillType
  objective: string
  instruction: string
  maxAttempts: number
  attemptCount: number
  status: PracticeStatus
}

export interface Submission {
  id: string
  practiceId: string
  attempt: number
  imageUrl: string
}

export type CoachState = 'retry' | 'pass' | 'compare' | 'uncertain'

export interface CoachResult {
  state: CoachState
  positiveObservation?: string
  primaryIssue?: {
    type: string
    description: string
  }
  action?: {
    type: string
    instruction: string
  }
  comparison?: {
    beforeUrl: string
    afterUrl: string
    summary: string
  }
}

export type Attempt = 1 | 2
