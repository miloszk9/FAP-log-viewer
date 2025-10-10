<template>
  <div>
    <ul class="nav flex-column">
      <li class="nav-item" v-if="!isAuthenticated">
        <router-link class="nav-link d-flex align-items-center gap-2" to="/login" @click="closeSidebar">
          <i class="bi bi-box-arrow-in-right"></i>
          {{ $t('sidebar.signIn') }}
        </router-link>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <router-link class="nav-link d-flex align-items-center gap-2" to="/register" @click="closeSidebar">
          <i class="bi bi-person-plus"></i>
          {{ $t('sidebar.register') }}
        </router-link>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <router-link class="nav-link d-flex align-items-center gap-2" to="/summary" @click="closeSidebar">
          <i class="bi bi-graph-up"></i>
          {{ $t('sidebar.summary') }}
        </router-link>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <router-link class="nav-link d-flex align-items-center gap-2" to="/upload" @click="closeSidebar">
          <i class="bi bi-file-earmark"></i>
          {{ $t('sidebar.uploadLogFile') }}
        </router-link>
      </li>
      <li class="nav-item" v-if="isAuthenticated">
        <a class="nav-link d-flex align-items-center gap-2" href="#" @click.prevent="handleLogout">
          <i class="bi bi-door-closed"></i>
          {{ $t('sidebar.signOut') }}
        </a>
      </li>
      <li class="nav-item" v-if="!isAuthenticated">
        <router-link class="nav-link d-flex align-items-center gap-2" to="/upload" @click="closeSidebar">
          <i class="bi bi-file-earmark"></i>
          {{ $t('sidebar.singleLogAnalysis') }}
        </router-link>
      </li>
    </ul>
    <div v-if="isAuthenticated" class="reports-section">
      <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
        <span>{{ $t('sidebar.savedReports') }}</span>
        <a class="link-secondary" href="#" :aria-label="$t('sidebar.refreshReports')" @click.prevent="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i>
        </a>
      </h6>
      <ul class="nav flex-column mb-auto">
        <li class="nav-item" v-for="report in reports" :key="report.id">
          <router-link class="nav-link d-flex align-items-center justify-content-between gap-2" :to="`/analyse/${report.id}`" @click="closeSidebar">
            <span class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-text"></i>
              {{ report.fileName }}
            </span>
            <span v-if="report.regen" class="ms-1" title="FAP Regeneration">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle;">
                <rect x="1" y="1" width="30" height="18" rx="8" stroke="#2470dc" stroke-width="1" fill="none"/>
                <text x="16" y="14" text-anchor="middle" font-size="13" fill="#2470dc" font-weight="900">FAP</text>
              </svg>
            </span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AllAnalysisResponse } from '../services/analyse.service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isAuthenticated: boolean
  reports: AllAnalysisResponse[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'logout'): void
}>()

const closeSidebar = () => {
  const closeButton = document.querySelector('[data-bs-dismiss="offcanvas"]')
  if (closeButton instanceof HTMLElement) {
    closeButton.click()
  }
}

const handleLogout = () => {
  closeSidebar()
  emit('logout')
}
</script> 