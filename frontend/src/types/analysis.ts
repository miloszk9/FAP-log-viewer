export interface AnalysisItem {
  id: string
  fileName: string
}

export interface AnalysisData {
  fileName: string
  id: string
  status: 'pending' | 'Success' | 'Error'
  message: string
  result?: {}
}
