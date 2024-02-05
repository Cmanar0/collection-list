<template>
  <v-container class="my-container">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <!-- Left Card -->
        <v-card class="pa-5 my-card" outlined>
          <!-- Content for the left card -->
          <h1>Home Page</h1>
          <v-btn @click="simulateBadRequest">Simulate Bad Request</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Import the Axios instance and mitt event emitter
import apiClient from '~/services/apiService'
import { eventBus } from '~/services/eventBus'

export default {
  data() {
    return {
      collections: []
    }
  },
  methods: {
    async fetchData() {
      eventBus.emit('loading-true')
      try {
        // Fetch data from the API
        const response = await apiClient.get('/collections')
        this.collections = response.data
      } catch (error) {
        // Emit an "api-error" event using mitt to handle the error
        eventBus.emit('api-error', error)
        console.error('API Error:', error)
        this.collections = []
      }
      eventBus.emit('loading-false')
    },
    async simulateBadRequest() {
      try {
        // Simulate a bad request (e.g., by making an invalid API call)
        const response = await apiClient.get('/nonexistent_endpoint')
        this.collections = response.data
      } catch (error) {
        // Emit an "api-error" event using mitt to simulate an API error
        eventBus.emit('api-error', error)
        console.error('Simulated API Error:', error)
        this.collections = []
      }
    }
  },
  async mounted() {
    this.fetchData()
  }
}
</script>

<style></style>
