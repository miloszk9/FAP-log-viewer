import ApiService from './api.service'
import { ref } from 'vue'

const AUTH_URL = '/auth'

export interface LoginResponse {
  access_token: string
}

export interface RegisterData {
  email: string
  password: string
}

class AuthService extends ApiService {
  private _isAuthenticated = ref(false)

  constructor() {
    super()
    // Initialize authentication state
    this._isAuthenticated.value = !!this.getCurrentToken()
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(`${AUTH_URL}/login`, { email, password })
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      this._isAuthenticated.value = true
    }
    return response.data
  }

  async register(email: string, password: string): Promise<void> {
    await this.post(`${AUTH_URL}/register`, { email, password })
  }

  async logout(): Promise<void> {
    try {
      await this.post(`${AUTH_URL}/logout`)
    } finally {
      localStorage.removeItem('access_token')
      this._isAuthenticated.value = false
    }
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('access_token')
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated.value
  }

  getAuthState() {
    return this._isAuthenticated
  }
}

export default new AuthService()
