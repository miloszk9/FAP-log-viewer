<template>
  <div class="card">
    <div class="card-body">
      <div
        class="upload-container"
        :class="{ dragover: isDragging }"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <i class="bi bi-cloud-upload upload-icon"></i>
        <h5 class="mb-3">{{ t('fileUploader.dragAndDrop') }}</h5>
        <p class="text-muted mb-3">{{ t('fileUploader.or') }}</p>
        <button class="btn btn-primary" @click="triggerFileInput">
          <i class="bi bi-file-earmark-arrow-up me-2"></i>{{ t('fileUploader.chooseFile') }}
        </button>
        <input type="file" ref="fileInput" accept=".csv,.zip" @change="handleFileSelect" class="d-none" />
      </div>
      <div class="alert" :class="statusClass" v-if="statusMessage" role="alert">
        {{ statusMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalysisData } from '@/types/analysis'
import analyseService from '@/services/analyse.service'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'analysis-complete', data: AnalysisData): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const statusMessage = ref('')
const statusClass = ref('')

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    handleFiles(files)
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
  }
}

const handleFiles = (files: FileList) => {
  if (files.length > 0) {
    const file = files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.csv') || 
        file.type === 'application/zip' || file.name.endsWith('.zip')) {
      uploadFile(file)
    } else {
      showStatus(t('fileUploader.invalidFile'), 'danger')
    }
  }
}

const uploadFile = async (file: File) => {
  showStatus(t('fileUploader.uploading'), 'info')

  try {
    const { ids } = await analyseService.uploadFile(file)
    showStatus(t('fileUploader.uploadSuccess'), 'success')
    await pollAnalysis(ids[0])
  } catch (error) {
    showStatus(
      t('fileUploader.uploadError', { error: error instanceof Error ? error.message : t('fileUploader.unknownError') }),
      'danger',
    )
  }
}

const pollAnalysis = async (id: string, retryCount = 0): Promise<void> => {
  const maxRetries = 5
  const retryDelay = 2000

  try {
    const data = await analyseService.getAnalysis(id)

    if (data.status === 'Success' && data.result) {
      showStatus(t('fileUploader.analysisSuccess'), 'success')
      emit('analysis-complete', data)
    } else if (data.status === 'pending' && retryCount < maxRetries) {
      showStatus(t('fileUploader.analysisInProgress', { attempt: retryCount + 1, max: maxRetries }), 'info')
      setTimeout(() => pollAnalysis(id, retryCount + 1), retryDelay)
    } else {
      throw new Error(t('fileUploader.analysisFailed', { message: data.message || t('fileUploader.unknownStatus') }))
    }
  } catch (error) {
    if (retryCount >= maxRetries) {
      showStatus(
        t('fileUploader.analysisError', { error: error instanceof Error ? error.message : t('fileUploader.unknownError') }),
        'danger',
      )
    }
  }
}

const showStatus = (message: string, type: string) => {
  statusMessage.value = message
  statusClass.value = `alert-${type}`
}
</script>

<style scoped>
.upload-container {
  border: 2px dashed #dee2e6;
  padding: 2rem;
  text-align: center;
  margin: 2rem 0;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.upload-container.dragover {
  background-color: #e9ecef;
  border-color: #0d6efd;
}

.upload-icon {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}

.card-body {
  padding: 2rem;
}
</style>
