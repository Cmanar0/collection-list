<template>
  <v-app>
    <!-- Your navigation or header here -->

    <!-- Main content -->
    <div>
      <slot />
    </div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading"></div>
    <v-progress-circular class="center" v-if="loading" indeterminate color="primary" model-value="20" :size="80" :width="8"></v-progress-circular>

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
    <!-- General Dialog -->
    <v-dialog v-model="dialog.show" max-width="400">
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text>
          {{ dialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="closeDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Error Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="6000">
      {{ snackbar.text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="white" text v-bind="attrs" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import { eventBus } from "~/services/eventBus"

export default {
  data() {
    return {
      loading: false,
      errorDialog: false,
      errorMessage: "",
      snackbar: {
        show: false,
        text: "",
        color: "info",
        timeout: 6000
      },
      dialog: {
        show: false,
        title: "",
        message: ""
      }
    }
  },
  created() {
    // Listen for "api-error" event using eventBus
    eventBus.on("api-error", this.handleApiError)
    eventBus.on("show-dialog", this.showDialog)
    eventBus.on("loading-true", () => {
      this.loading = true
    })
    eventBus.on("loading-false", () => {
      this.loading = false
    })
    eventBus.on("show-snackbar", this.showSnackbar)
  },
  beforeDestroy() {
    // Remove event listener when the component is destroyed
    eventBus.off("api-error", this.handleApiError)
    eventBus.on("show-dialog", this.showDialog)

    eventBus.on("loading-true", () => {
      this.loading = true
    })
    eventBus.on("loading-false", () => {
      this.loading = false
    })
    eventBus.on("show-snackbar", this.showSnackbar)
  },
  methods: {
    showSnackbar({ text, color }) {
      this.snackbar.text = text
      this.snackbar.color = color || "info"
      this.snackbar.show = true
    },
    showDialog({ title, message }) {
      this.dialog.title = title
      this.dialog.message = message
      this.dialog.show = true
    },
    closeDialog() {
      this.dialog.show = false
    },
    handleApiError(error) {
      console.log("blabla :>> ")
      // Handle API errors globally
      this.errorMessage = error.message || "An error occurred."
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
