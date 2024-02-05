<template>
  <v-app>
    <!-- Your navigation or header here -->

    <!-- Main content -->
    <div>
      <slot />
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading"></div>
    <v-progress-circular
      class="center"
      v-if="loading"
      indeterminate
      color="primary"
      model-value="20"
      :size="80"
      :width="8"
    ></v-progress-circular>

    <!-- Error Dialog -->
    <v-dialog v-model="errorDialog" max-width="400">
      <v-card>
        <v-card-title>Error</v-card-title>
        <v-card-text>
          {{ errorMessage }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeErrorDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { eventBus } from '~/services/eventBus'

export default {
  data() {
    return {
      loading: false,
      errorDialog: false,
      errorMessage: ''
    }
  },
  created() {
    // Listen for "api-error" event using eventBus
    eventBus.on('api-error', this.handleApiError)
    eventBus.on('loading-true', () => {
      this.loading = true
    })
    eventBus.on('loading-false', () => {
      this.loading = false
    })
  },
  beforeDestroy() {
    // Remove event listener when the component is destroyed
    eventBus.off('api-error', this.handleApiError)
  },
  methods: {
    handleApiError(error) {
      console.log('blabla :>> ')
      // Handle API errors globally
      this.errorMessage = error.message || 'An error occurred.'
      this.errorDialog = true
    },
    closeErrorDialog() {
      // Close the error dialog
      this.errorDialog = false
    }
  }
}
</script>

<style scoped>
.loading {
  position: fixed;
  min-height: 100%;
  min-width: 100%;
  z-index: 9998;
  background-color: rgba(100, 100, 100, 0.301);
}
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
