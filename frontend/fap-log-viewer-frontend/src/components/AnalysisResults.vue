<template>
  <div class="mt-4">
    <h3 class="mb-4">Analysis Results</h3>
    <div class="row g-4">
      <div v-for="(content, section) in data" :key="section" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title mb-0">{{ formatSectionTitle(section) }}</h5>
          </div>
          <div class="card-body">
            <div class="analysis-content">
              <template v-for="(value, key) in content" :key="key">
                <template v-if="value !== null && value !== undefined">
                  <div v-if="typeof value === 'object'" class="mb-3">
                    <h6 class="text-muted">{{ formatKey(key) }}</h6>
                    <div class="ps-3">
                      <template v-for="(nestedValue, nestedKey) in value" :key="nestedKey">
                        <div v-if="nestedValue !== null" class="mb-1">
                          <span class="text-muted">{{ formatKey(nestedKey) }}:</span>
                          <span class="ms-2">{{ formatValue(nestedValue, nestedKey) }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                  <div v-else class="mb-2">
                    <span class="text-muted">{{ formatKey(key) }}:</span>
                    <span class="ms-2">{{ formatValue(value, key) }}</span>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnalysisData } from '@/types/analysis'

defineProps<{
  data: AnalysisData
}>()

const formatSectionTitle = (title: string | number): string => {
  return String(title).charAt(0).toUpperCase() + String(title).slice(1)
}

const formatKey = (key: string | number): string => {
  return String(key)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatValue = (value: string | number | boolean | null, key: string | number): string => {
  if (typeof value === 'number') {
    // Format numbers with appropriate units
    const keyStr = String(key)
    if (keyStr.includes('temp')) return `${value}°C`
    if (keyStr.includes('pressure')) return `${value} bar`
    if (keyStr.includes('speed')) return `${value} km/h`
    if (keyStr.includes('distance')) return `${value} km`
    if (keyStr.includes('consumption')) return `${value} L/100km`
    if (keyStr.includes('percentage')) return `${value}%`
    if (keyStr.includes('weight')) return `${value} g`
    if (keyStr.includes('vol')) return `${value} L`
    return value.toFixed(2)
  }
  return String(value)
}
</script>

<style scoped>
.analysis-content {
  font-size: 0.9rem;
}
</style>
