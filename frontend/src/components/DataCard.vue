<template>
  <div class="container-fluid py-4">
    <div v-if="loading" class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">{{ $t('dataCard.loading') }}</span>
      </div>
    </div>
    
    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="data" class="row">
      <div class="col-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">{{ title }}</h5>
          </div>
          <div v-if="status && status.toLowerCase() !== 'success'" class="card-body">
            <h6>{{ $t('dataCard.status') }}: <span :class="statusClass">{{ status }}</span></h6>
            <div v-if="message" class="alert alert-danger mt-3">
              {{ message }}
            </div>
          </div>
        </div>
      </div>

      <template v-if="sortedResult">
        <div v-for="(section, sectionKey) in sortedResult" :key="sectionKey" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">{{ formatSectionTitle(sectionKey) }}</h5>
            </div>
            <div class="card-body">
              <template v-for="(value, key) in section" :key="key">
                <div v-if="value !== null && (
                  (typeof value === 'object' && Object.values(value).some(v => v !== null)) ||
                  (typeof value !== 'object')
                )" class="mb-2">
                  <template v-if="typeof value === 'object' && value !== null">
                    <h6 class="mb-2">{{ formatKey(key) }}</h6>
                    <template v-for="(subValue, subKey) in value" :key="subKey">
                      <div v-if="subValue !== null" class="ms-3 mb-1">
                        <small class="text-muted">{{ formatKey(subKey) }}:</small>
                        <span class="ms-1">{{ formatValue(subValue, subKey) }}</span>
                      </div>
                    </template>
                  </template>
                  <template v-else>
                    <small class="text-muted">{{ formatKey(key) }}:</small>
                    <span class="ms-1">{{ formatValue(value, key) }}</span>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

type AnalysisValue = number | string | null
type AnalysisSection = {
  [key: string]: AnalysisValue | AnalysisSection
}

type AnalysisResult = {
  [key: string]: AnalysisSection
}

const props = defineProps<{
  loading: boolean
  error: string | null
  data: any | null
  title: string
  status?: string
  message?: string
  result?: AnalysisResult
}>()

const { t } = useI18n()

const sortedResult = computed(() => {
  if (!props.result) return undefined

  const sortObject = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') return obj

    if (Array.isArray(obj)) {
      return obj.map(item => sortObject(item))
    }

    return Object.entries(obj)
      .filter(([_, value]) => value !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((sorted: any, [key, value]) => {
        const sortedValue = sortObject(value)
        if (sortedValue !== null) {
          sorted[key] = sortedValue
        }
        return sorted
      }, {})
  }

  return sortObject(props.result)
})

const statusClass = computed(() => {
  if (!props.status) return ''
  
  switch (props.status.toLowerCase()) {
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

const formatSectionTitle = (key: string | number): string => {
  const keyStr = String(key)
  const translation = t(`dataCard.sections.${keyStr}`)
  if (translation !== `dataCard.sections.${keyStr}`) {
    return translation
  }
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
}

const formatKey = (key: string | number): string => {
  const keyStr = String(key)
  // Remove unit suffix if it exists
  const keyWithoutUnit = keyStr.replace(/_(km|kmh|sec|c|v|mbar|l|l100km|ml|gl|perc|gram)$/, '')

  // Try to translate the key
  const translation = t(`dataCard.keys.${keyWithoutUnit}`)
  if (translation !== `dataCard.keys.${keyWithoutUnit}`) {
    return translation
  }

  // Fallback: prettify the key
  return keyWithoutUnit
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim()
}

const isAnalysisValue = (value: unknown): value is AnalysisValue => {
  return value === null || typeof value === 'number' || typeof value === 'string'
}

const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

  return parts.join(' ')
}

const formatValue = (value: unknown, key: string | number): string => {
  if (!isAnalysisValue(value)) return ''
  if (value === null) return ''
  if (typeof value !== 'number') return String(value)

  const keyStr = String(key)
  const parts = keyStr.split('_')
  const unit = parts.length > 1 ? parts[parts.length - 1] : undefined
  if (!unit) return value.toString()

  const translatedUnit = t(`dataCard.units.${unit}`)
  return `${value.toFixed(1)} ${translatedUnit}`
}
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.text-muted {
  font-size: 0.875rem;
}
</style> 