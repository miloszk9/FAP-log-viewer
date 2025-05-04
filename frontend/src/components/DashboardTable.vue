<template>
  <div class="table-responsive small">
    <table class="table table-striped table-sm">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Header</th>
          <th scope="col">Header</th>
          <th scope="col">Header</th>
          <th scope="col">Header</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in 10" :key="i">
          <td>{{ 1000 + i }}</td>
          <td>random</td>
          <td>data</td>
          <td>placeholder</td>
          <td>text</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// No logic needed
</script> 