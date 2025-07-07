import ApiService from './api.service'
import type { AnalysisData, AnalysisItem } from '@/types/analysis'

const ANALYSE_URL = '/analyse'

export interface AllAnalysisResponse {
  id: string
  fileName: string
  regen: boolean
}

class AnalyseService extends ApiService {
  async uploadFile(file: File): Promise<{ ids: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.post<{ ids: string[] }>(ANALYSE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (!response.data.ids) {
      throw new Error('No analysis ID received')
    }

    return response.data
  }

  async getAnalysis(id: string): Promise<AnalysisData> {
    const response = await this.get<AnalysisData>(`${ANALYSE_URL}/${id}`)
    return response.data
  }

  async getAll(): Promise<AnalysisItem[]> {
    const response = await this.get<AnalysisItem[]>(ANALYSE_URL)
    return response.data
  }
}

export default new AnalyseService()
