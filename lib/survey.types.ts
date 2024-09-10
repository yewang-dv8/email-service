import { ObjectId } from 'mongodb'

export interface SurveyQuestion {
  question_id: string
  question_text: string
  type: 'multiple_choice' | 'text'
  options?: string[]
}

export interface Survey {
  _id?: ObjectId
  title: string
  created_date: Date
  questions: SurveyQuestion[]
}
