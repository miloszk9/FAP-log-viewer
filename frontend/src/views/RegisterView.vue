<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h3 class="text-center">{{ $t('auth.registerTitle') }}</h3>
          </div>
          <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <form @submit.prevent="handleRegister">
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
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  required
                />
              </div>
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">{{ $t('auth.register') }}</button>
                <router-link to="/login" class="btn btn-link">
                  {{ $t('auth.haveAccount') }}
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
import { useI18n } from 'vue-i18n'
import authService from '@/services/auth.service'

const router = useRouter()
const { t } = useI18n()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = t('auth.passwordsDoNotMatch')
    return
  }

  try {
    await authService.register({
      email: email.value,
      password: password.value,
    })
    
    // Redirect to login page after successful registration
    router.push('/login')
    errorMessage.value = ''
  } catch (error) {
    console.error('Registration failed:', error)
    errorMessage.value = t('auth.registerError')
  }
}
</script> 