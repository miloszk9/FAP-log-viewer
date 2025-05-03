<template>
  <div>
    <div
      class="upload-container"
      :class="{ dragover: isDragging }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <i class="bi bi-cloud-upload upload-icon"></i>
      <h5 class="mb-3">Drag and drop your CSV file here</h5>
      <p class="text-muted mb-3">or</p>
      <button class="btn btn-primary" @click="triggerFileInput">
        <i class="bi bi-file-earmark-arrow-up me-2"></i>Choose File
      </button>
      <input type="file" ref="fileInput" accept=".csv" @change="handleFileSelect" class="d-none" />
    </div>
    <div class="alert" :class="statusClass" v-if="statusMessage" role="alert">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AnalysisData } from '@/types/analysis'

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
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      uploadFile(file)
    } else {
      showStatus('Please upload a CSV file', 'danger')
    }
  }
}

const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  showStatus('Uploading file...', 'info')

  try {
    const response = await fetch('/api', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Upload response:', data)
    if (!data.id) {
      throw new Error('No analysis ID received')
    }

    showStatus('File uploaded successfully! Starting analysis...', 'success')
    await pollAnalysis(data.id)
  } catch (error) {
    showStatus(
      `Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'danger',
    )
  }
}

const pollAnalysis = async (id: string, retryCount = 0): Promise<void> => {
  const maxRetries = 5
  const retryDelay = 2000

  try {
    const response = await fetch(`/api/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      if (retryCount < maxRetries) {
        showStatus(`Analysis in progress... (Attempt ${retryCount + 1}/${maxRetries})`, 'info')
        setTimeout(() => pollAnalysis(id, retryCount + 1), retryDelay)
        return
      }
      throw new Error('Analysis failed after maximum retries')
    }

    const data = await response.json()
    console.log('Analysis response:', data)
    if (data.status === 'Success' && data.analysis) {
      showStatus('Analysis completed successfully!', 'success')
      console.log('Emitting analysis data:', data.analysis)
      emit('analysis-complete', data.analysis)
    } else if (data.status === 'pending' && retryCount < maxRetries) {
      showStatus(`Analysis in progress... (Attempt ${retryCount + 1}/${maxRetries})`, 'info')
      setTimeout(() => pollAnalysis(id, retryCount + 1), retryDelay)
    } else {
      throw new Error(`Analysis failed: ${data.message || 'unknown status'}`)
    }
  } catch (error) {
    if (retryCount >= maxRetries) {
      showStatus(
        `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
</style>
