<template>
  <div>
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
        <a class="nav-link d-flex align-items-center gap-2" href="#" @click.prevent="$emit('logout')">
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
        <a class="link-secondary" href="#" aria-label="Refresh reports" @click.prevent="$emit('refresh')">
          <i class="bi bi-arrow-clockwise"></i>
        </a>
      </h6>
      <ul class="nav flex-column mb-auto">
        <li class="nav-item" v-for="report in reports" :key="report.id">
          <router-link class="nav-link d-flex align-items-center gap-2" :to="`/analyse/${report.id}`">
            <i class="bi bi-file-earmark-text"></i>
            {{ report.fileName }}
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AllAnalysisResponse } from '../services/analyse.service'

defineProps<{
  isAuthenticated: boolean
  reports: AllAnalysisResponse[]
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'logout'): void
}>()
</script> 