<template>
  <div class="container-fluid">
    <div class="row">
      <AppSidebar />
      <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">Dashboard</h1>
          <div class="btn-toolbar mb-2 mb-md-0">
            <div class="btn-group me-2">
              <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
              <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1">
              <i class="bi bi-calendar3"></i>
              This week
            </button>
          </div>
        </div>
        <DashboardChart />
        <h2>Section title</h2>
        <DashboardTable />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '../components/AppSidebar.vue'
import DashboardChart from '../components/DashboardChart.vue'
import DashboardTable from '../components/DashboardTable.vue'
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