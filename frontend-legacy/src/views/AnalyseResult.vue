<template>
  <DataCard
    :loading="loading"
    :error="error"
    :data="analysis"
    :title="analysis?.fileName || 'Analysis'"
    :status="analysis?.status"
    :message="analysis?.message"
    :result="analysis?.result"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import analyseService from '../services/analyse.service'
import { type AnalysisData } from '../types/analysis'
import DataCard from '../components/DataCard.vue'

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const analysis = ref<AnalysisData | null>(null)

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

.text-muted {
  font-size: 0.875rem;
}
</style> 