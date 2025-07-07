export interface AnalysisItem {
  id: string
  fileName: string
  regen: boolean
}

export interface AnalysisData {
  fileName: string
  id: string
  status: 'pending' | 'Success' | 'Error'
  message: string
  result?: Record<string, any>
  regen: boolean
}
