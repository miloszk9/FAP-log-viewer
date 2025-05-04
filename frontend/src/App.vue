<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <AppHeader />
  <RouterView />
</template>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import 'bootstrap-icons/font/bootstrap-icons.css';

.navbar-brand {
  padding-top: .75rem;
  padding-bottom: .75rem;
  background-color: rgba(0, 0, 0, .25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
}

.navbar .form-control {
  padding: .75rem 1rem;
}

@media (min-width: 768px) {
  .sidebar .offcanvas-lg {
    position: -webkit-sticky;
    position: sticky;
    top: 48px;
  }
  .navbar-search {
    display: block;
  }
}
</style>
