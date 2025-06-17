<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">{{ $t('auth.loginTitle') }}</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">{{ $t('auth.email') }}</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">{{ $t('auth.password') }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">{{ $t('auth.login') }}</button>
                <router-link to="/register" class="btn btn-link">
                  {{ $t('auth.noAccount') }}
                </router-link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await authService.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
    // Here you might want to show an error message to the user
  }
}
</script> 