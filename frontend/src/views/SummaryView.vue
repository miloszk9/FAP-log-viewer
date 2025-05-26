<template>
  <div class="container mt-4">
    <h2>Summary</h2>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-else class="card">
      <div class="card-body">
        <h5 class="card-title">Average Analysis</h5>
        <div class="row">
          <div class="col-md-6">
            <p><strong>Average:</strong> {{ averageData?.average }}</p>
            <p><strong>Count:</strong> {{ averageData?.count }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import averageService, { type AverageData } from '../services/average.service'

const averageData = ref<AverageData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    averageData.value = await averageService.getAverage()
  } catch (err) {
    error.value = 'Failed to load summary data'
    console.error('Error fetching summary:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script> 