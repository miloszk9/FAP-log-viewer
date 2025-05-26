import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

const BASE_URL = 'http://localhost:3000'

class ApiService {
  protected api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
    })

    // Add request interceptor to add auth header
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  protected get<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config)
  }

  protected post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config)
  }

  protected put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config)
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config)
  }
}

export default ApiService
