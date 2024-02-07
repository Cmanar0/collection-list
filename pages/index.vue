<template>
  <v-container class="my-container">
    <div class="flex">
      <v-btn @click="simulateBadRequest">Simulate Bad Request</v-btn>
      <v-btn @click="fetchData">Simulate Correct Request</v-btn>
      <v-btn @click="openDialog">Open Dialog</v-btn>
    </div>
    <br />
    <v-row justify="left">
      <v-col cols="12" md="6">
        <!-- Left Card -->
        <v-card class="pa-5 my-card" outlined>
          <!-- Content for the left card -->
          <h1>Collections</h1>
          <v-btn-toggle v-model="selectedCollection" mandatory>
            <v-btn value="all">All collections</v-btn>
            <v-btn value="private">Private</v-btn>
            <v-btn value="public">Public</v-btn>
          </v-btn-toggle>
        </v-card>
      </v-col>
    </v-row>
    <!-- Collections Display Component -->
    <ListOfCollections :collections="displayedCollections" :collectionType="selectedCollectionType" />
  </v-container>
</template>

<script>
// Import the Axios instance and mitt event emitter
import apiClient from "~/services/apiService"
import { eventBus } from "~/services/eventBus"

export default {
  data() {
    return {
      allCollections: [],
      privateCollections: [],
      publicCollections: [],
      selectedCollection: "all",
      collections: []
    }
  },
  computed: {
    selectedCollectionType() {
      // Determine the selected collection type based on the selected value
      if (this.selectedCollection === "private") {
        return "private"
      } else if (this.selectedCollection === "public") {
        return "public"
      }
      return "all"
    },
    displayedCollections() {
      // Determine which collections to display based on the selected type
      if (this.selectedCollectionType === "private") {
        return this.privateCollections
      } else if (this.selectedCollectionType === "public") {
        return this.publicCollections
      }
      return this.allCollections
    }
  },
  methods: {
    async fetchData() {
      eventBus.emit("loading-true")
      try {
        const response = await apiClient.get("/collections")
        this.allCollections = response.data

        // Filter collections into private and public
        this.privateCollections = this.allCollections.filter(c => c.private)
        this.publicCollections = this.allCollections.filter(c => !c.private)
      } catch (error) {
        eventBus.emit("api-error", error)
        console.error("API Error:", error)
        this.allCollections = []
        this.privateCollections = []
        this.publicCollections = []
      }
      eventBus.emit("loading-false")
    },
    async simulateBadRequest() {
      try {
        // Simulate a bad request (e.g., by making an invalid API call)
        const response = await apiClient.get("/nonexistent_endpoint")
        this.collections = response.data
      } catch (error) {
        // Emit an "api-error" event using mitt to simulate an API error
        eventBus.emit("api-error", error)
        console.error("Simulated API Error:", error)
        this.collections = []
      }
    },
    openDialog() {
      // Emit a "show-dialog" event using mitt to open a dialog
      eventBus.emit("show-dialog", { message: "This is a general message", title: "General dialog" })
    }
  },
  async mounted() {
    this.fetchData()
  }
}
</script>

<style>
.flex {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}
</style>
