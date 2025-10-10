<template>
  <section class="my-4">
    <FileUploader @analysis-complete="onAnalysisComplete" />
    <div v-if="analysis" class="mt-4">
      <h4>Analysis Result</h4>
      <pre class="bg-light p-3 rounded border"><code>{{ analysis }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FileUploader from '../components/FileUploader.vue'

const analysis = ref<string | null>(null)

function onAnalysisComplete(data: any) {
  analysis.value = JSON.stringify(data, null, 2)
}
</script>

<style scoped>
.bi {
  display: inline-block;
  width: 1rem;
  height: 1rem;
}

.sidebar .nav-link {
  font-size: .875rem;
  font-weight: 500;
}

.sidebar .nav-link.active {
  color: #2470dc;
}

.sidebar-heading {
  font-size: .75rem;
}
</style>
