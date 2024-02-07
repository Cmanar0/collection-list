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
      v-if="loading"
      class="center"
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
    <!-- General Dialog -->
    <v-dialog v-model="dialog.show" max-width="400">
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text>
          {{ dialog.message }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="green" @click="dialog.onConfirm" v-if="dialog.dialogType === 'confirm'">Yes</v-btn>
          <v-btn color="primary" @click="closeDialog" v-if="dialog.dialogType === 'alert'">OK</v-btn>
          <v-btn color="red" @click="closeDialog" v-if="dialog.dialogType === 'confirm'">No</v-btn>
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
        message: "",
        onConfirm: null, // Function to be executed on confirming the dialog
        dialogType: "alert" // Default to 'confirm', can be 'alert' for OK-only
      }
    }
  },
  created() {
    // Listen for "api-error" event using eventBus
    eventBus.on("api-error", this.handleApiError)
    eventBus.on("show-dialog", this.showDialog)
    eventBus.on("close-dialog", this.closeDialog)
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
    eventBus.on("close-dialog", this.closeDialog)
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
    showDialog({ title, message, onConfirm, dialogType }) {
      this.dialog.title = title
      this.dialog.message = message
      this.dialog.onConfirm = onConfirm || (() => {})
      this.dialog.dialogType = dialogType
      this.dialog.show = true
    },
    closeDialog() {
      this.dialog.show = false
      this.dialog.onConfirm = null // Reset the onConfirm function
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  background-color: rgba(100, 100, 100, 0.301);
}

.center {
  z-index: 1000;
  position: fixed;
  top: 50%;
  left: 50%;
}
</style>
