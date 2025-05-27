<template>
  <DataCard
    :loading="loading"
    :error="error"
    :data="averageData"
    title="Summary"
    :status="averageData?.status"
    :message="averageData?.message"
    :result="averageData?.average"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import averageService, { type AverageData } from '../services/average.service'
import DataCard from '../components/DataCard.vue'

const route = useRoute()
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

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchData()
    }
  }
)

onMounted(fetchData)
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.text-muted {
  font-size: 0.875rem;
}
</style> 