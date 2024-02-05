<template>
  <v-container class="my-container">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <!-- Left Card -->
        <v-card class="pa-5 my-card" outlined>
          <!-- Content for the left card -->
          Home Page
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// Import the Axios instance
import apiClient from "~/services/apiService";

export default {
  data() {
    return {
      collections: [],
    };
  },
  async mounted() {
    try {
      // Call the API endpoint using Axios in the mounted hook
      const response = await apiClient.get("/collections");
      this.collections = response.data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      this.collections = [];
    }
  },
};
</script>

<style></style>
