<template>
  <div class="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary d-none d-md-block">
    <div class="position-sticky h-100">
      <div class="d-flex flex-column h-100">
        <div class="p-3">
          <h5>FAP log viewer</h5>
        </div>
        <div class="flex-grow-1 overflow-y-auto">
          <SidebarContent :is-authenticated="isAuthenticated" :reports="sortedReports" @refresh="fetchReports" @logout="handleLogout" />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Offcanvas -->
  <div class="offcanvas offcanvas-end d-md-none" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="sidebarMenuLabel">FAP log viewer</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <SidebarContent :is-authenticated="isAuthenticated" :reports="sortedReports" @refresh="fetchReports" @logout="handleLogout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import authService from '../services/auth.service'
import analyseService, { type AllAnalysisResponse } from '../services/analyse.service'
import SidebarContent from './SidebarContent.vue'

const router = useRouter()
const isAuthenticated = authService.getAuthState()
const reports = ref<AllAnalysisResponse[]>([])

const sortedReports = computed(() => {
  return [...reports.value].sort((a, b) => -a.fileName.localeCompare(b.fileName))
})

const handleLogout = async () => {
  try {
    await authService.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const fetchReports = async () => {
  try {
    reports.value = await analyseService.getAll()
  } catch (error) {
    console.error('Failed to fetch reports:', error)
  }
}

onMounted(() => {
  if (isAuthenticated) {
    fetchReports()
  }
})
</script> 