import ApiService from './api.service'

const AVERAGE_URL = '/average'

export interface AverageData {
  average: {
    [key: string]: any
  }
  count: number
  status: string
  message?: string
}

class AverageService extends ApiService {
  async getAverage(): Promise<AverageData> {
    const response = await this.get<AverageData>(AVERAGE_URL)
    return response.data
  }
}

export default new AverageService()
