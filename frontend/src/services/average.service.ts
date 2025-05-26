import ApiService from './api.service'

const AVERAGE_URL = '/average'

export interface AverageData {
  // Add your average data interface here based on backend response
  // This is a placeholder - adjust according to your actual API response
  average: number
  count: number
  // ... other fields
}

class AverageService extends ApiService {
  async getAverage(): Promise<AverageData> {
    const response = await this.get<AverageData>(AVERAGE_URL)
    return response.data
  }
}

export default new AverageService()
