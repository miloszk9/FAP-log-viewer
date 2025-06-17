<template>
  <header class="navbar sticky-top bg-dark flex-md-nowrap p-0 shadow" data-bs-theme="dark">
    <a class="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6 text-white" href="/">{{ $t('header.title') }}</a>
    <ul class="navbar-nav flex-row d-md-none">
      <li class="nav-item text-nowrap">
        <button class="nav-link px-3 text-white" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
          <i class="bi bi-list"></i>
        </button>
      </li>
    </ul>
    <div id="navbarSearch" class="navbar-search w-100 collapse">
      <input class="form-control w-100 rounded-0 border-0" type="text" :placeholder="$t('header.searchPlaceholder')" aria-label="Search">
    </div>
    <div class="navbar-nav px-3">
      <div class="nav-item text-nowrap">
        <select 
          class="form-select form-select-sm bg-dark text-white border-secondary" 
          :value="locale" 
          @change="changeLanguage"
        >
          <option value="en">{{ $t('common.english') }}</option>
          <option value="pl">{{ $t('common.polish') }}</option>
        </select>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const changeLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  locale.value = target.value
  localStorage.setItem('locale', target.value)
}
</script>

<style scoped>
.form-select {
  padding: 0.25rem 2rem 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.form-select:focus {
  border-color: #6c757d;
  box-shadow: none;
}

.form-select option {
  background-color: #343a40;
}
</style> 