<template>
  <div class="container-fluid py-4">
    <div v-if="loading" class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="analysis" class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Analysis Results</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <h6>Status: <span :class="statusClass">{{ analysis.status }}</span></h6>
        </div>

        <div v-if="analysis.message" class="alert alert-info">
          {{ analysis }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import analyseService from '../services/analyse.service'
import { type AnalysisData } from '../types/analysis'

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const analysis = ref<AnalysisData | null>(null)

const statusClass = computed(() => {
  if (!analysis.value) return ''
  
  switch (analysis.value.status.toLowerCase()) {
    case 'success':
      return 'text-success'
    case 'error':
      return 'text-danger'
    case 'pending':
      return 'text-warning'
    default:
      return ''
  }
})

const fetchAnalysis = async () => {
  const id = route.params.id as string
  if (!id) {
    error.value = 'No analysis ID provided'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null
  analysis.value = null

  try {
    analysis.value = await analyseService.getAnalysis(id)
  } catch (err) {
    error.value = 'Failed to fetch analysis data'
    console.error('Error fetching analysis:', err)
  } finally {
    loading.value = false
  }
}

// Watch for route parameter changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchAnalysis()
    }
  }
)

onMounted(() => {
  fetchAnalysis()
})
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style> 