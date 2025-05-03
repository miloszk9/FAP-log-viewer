<script setup lang="ts">
import { ref } from 'vue'
import FileUploader from './components/FileUploader.vue'
import AnalysisResults from './components/AnalysisResults.vue'
import type { AnalysisData } from './types/analysis'

const analysisData = ref<AnalysisData | null>(null)

const handleAnalysisComplete = (data: AnalysisData) => {
  analysisData.value = data
}
</script>

<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">FAP Log Viewer</h1>
    <FileUploader @analysis-complete="handleAnalysisComplete" />
    <AnalysisResults v-if="analysisData" :data="analysisData" />
  </div>
</template>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
</style>
