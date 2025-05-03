export interface AnalysisData {
  [key: string]: {
    [key: string]:
      | string
      | number
      | boolean
      | null
      | {
          [key: string]: string | number | boolean | null
        }
  }
}

export interface AnalysisResponse {
  id: string
  status: 'pending' | 'Success' | 'Error'
  message?: string
  analysis?: AnalysisData
}
