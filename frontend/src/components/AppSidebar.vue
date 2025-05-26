<template>
  <div class="sidebar border border-right col-md-3 col-lg-2 p-0 bg-body-tertiary">
    <div class="offcanvas-md offcanvas-end bg-body-tertiary" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="sidebarMenuLabel">FAP log viewer</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body d-md-flex flex-column p-0 pt-lg-3 overflow-y-auto">
        <ul class="nav flex-column">
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link d-flex align-items-center gap-2" to="/login">
              <i class="bi bi-box-arrow-in-right"></i>
              Sign in
            </router-link>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link d-flex align-items-center gap-2" to="/register">
              <i class="bi bi-person-plus"></i>
              Register
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link d-flex align-items-center gap-2" to="/summary">
              <i class="bi bi-graph-up"></i>
              Summary
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <router-link class="nav-link d-flex align-items-center gap-2" to="/upload">
              <i class="bi bi-file-earmark"></i>
              Upload log file
            </router-link>
          </li>
          <li class="nav-item" v-if="isAuthenticated">
            <a class="nav-link d-flex align-items-center gap-2" href="#" @click.prevent="handleLogout">
              <i class="bi bi-door-closed"></i>
              Sign out
            </a>
          </li>
          <li class="nav-item" v-if="!isAuthenticated">
            <router-link class="nav-link d-flex align-items-center gap-2" to="/upload">
              <i class="bi bi-file-earmark"></i>
              Single log analysis
            </router-link>
          </li>
        </ul>
        <div v-if="isAuthenticated" class="reports-section">
          <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-body-secondary text-uppercase">
            <span>Saved reports</span>
            <a class="link-secondary" href="#" aria-label="Refresh reports" @click.prevent="fetchReports">
              <i class="bi bi-arrow-clockwise"></i>
            </a>
          </h6>
          <ul class="nav flex-column mb-auto">
            <li class="nav-item" v-for="report in sortedReports" :key="report.id">
              <router-link class="nav-link d-flex align-items-center gap-2" :to="`/analyse/${report.id}`">
                <i class="bi bi-file-earmark-text"></i>
                {{ report.fileName }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import authService from '../services/auth.service'
import analyseService, { type AllAnalysisResponse } from '../services/analyse.service'

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