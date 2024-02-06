<template>
  <v-container>
    <v-row justify="left">
      <v-col cols="12" md="6">
        <!-- Left Card -->
        <v-card class="pa-5 my-card" outlined>
          <!-- Content for the left card -->
          <h1>Collections</h1>
          <v-btn @click="goToCollections">
            <v-icon style="margin-right: 5px" left>mdi-arrow-left</v-icon>
            Go back to collections
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <!-- Display Collection Details -->
    <div v-if="!editCollection">
      <h2>{{ collection.name }}</h2>
      <p>Color: {{ collection.color }}</p>
      <p>Private: {{ collection.private ? "Yes" : "No" }}</p>
      <!-- Displaying filters and other properties -->
      <v-btn color="primary" @click="toggleEditing">Edit Collection</v-btn>
    </div>

    <!-- Edit Form -->
    <v-form v-if="editCollection" ref="form" v-model="valid">
      <v-btn v-if="!newPost" color="primary" @click="toggleEditing">Cancel editting</v-btn>

      <v-text-field label="Collection Name" v-model="collection.name" :rules="[rules.required]"></v-text-field>

      <v-color-picker label="Color" v-model="collection.color" :rules="[rules.required]" elevation="0"></v-color-picker>

      <v-switch label="Private" :items="['YES', 'NO']" color="green" v-model="collection.private"></v-switch>

      <!-- Assuming each collection has only one filter for simplicity -->
      <v-select label="Prematch" :items="['YES', 'NO']" v-model="collection.filters[0].prematch"></v-select>

      <v-select label="Market" :items="['FT', 'GOAL_LINE']" v-model="collection.filters[0].market"></v-select>

      <v-select label="For" :items="['HOME', 'DRAW', 'AWAY', 'UNDER', 'OVER']" v-model="collection.filters[0].for"></v-select>

      <v-text-field label="From" v-model="collection.filters[0].from"></v-text-field>

      <v-text-field label="To" v-model="collection.filters[0].to"></v-text-field>

      <v-btn :disabled="!valid" color="success" @click="submitForm"> Submit </v-btn>
    </v-form>
  </v-container>
</template>

<script>
import { eventBus } from "~/services/eventBus"
import axios from "axios"

export default {
  data() {
    return {
      valid: true,
      loaded: false,
      editCollection: false,
      newPost: this.$route.query.collectionId === "NEW",
      collectionId: this.$route.query.collectionId || "NEW",
      collection: {
        id: "",
        name: "",
        color: "",
        private: false,
        filters: [
          {
            type: "",
            prematch: "",
            market: "",
            for: "",
            from: null,
            to: null
          }
        ]
      },
      rules: {
        required: value => !!value || "Required."
        // Add other validation rules here...
      }
    }
  },
  async created() {
    if (this.newPost) {
      this.editCollection = true
    }
    if (this.collectionId !== "NEW") {
      await this.fetchCollectionData(this.collectionId)
    }
    if (this.collectionId === "NEW") {
      this.collection.id = this.generateId()
      this.collectionId = this.collection.id
    }
    this.loaded = true
  },
  methods: {
    toggleEditing() {
      this.editCollection = !this.editCollection
    },
    generateId() {
      return Math.random().toString(36).substr(2, 9)
    },
    goToCollections() {
      this.$router.push("/") // Navigate to the home page
    },
    async fetchCollectionData() {
      // Ensure collectionId is defined
      if (!this.collectionId) {
        return
      }

      eventBus.emit("loading-true")

      try {
        const response = await axios.get(`http://localhost:3108/collection/${this.collectionId}`)
        this.collection = response.data

        // Initialize filters array if it's missing or empty
        if (!this.collection.filters || this.collection.filters.length === 0) {
          this.collection.filters = [
            {
              prematch: "",
              market: "",
              for: "",
              from: "",
              to: ""
            }
          ]
        }
        console.log("this.collection.id :>> ", this.collection.id)
        console.log("this.collectionId :>> ", this.collectionId)
        this.collection.id = this.collectionId
        console.log("this.collection.id :>> ", this.collection.id)
        console.log("this.collectionId :>> ", this.collectionId)
      } catch (error) {
        console.error("Error fetching collection data:", error)
        // Handle error (e.g., show notification or redirect)
      }

      eventBus.emit("loading-false")
    },
    async submitForm() {
      const collectionUrl = `http://localhost:3108/collection`
      // Format the color to remove the '#' prefix
      if (this.collection.color.startsWith("#")) {
        this.collection.color = this.collection.color.slice(1)
      }
      try {
        let response
        if (this.$route.query.collectionId === "NEW") {
          // Add a new collection
          response = await axios.post(`${collectionUrl}`, this.collection)
          console.log("New collection added:", response.data)
        } else {
          // Update an existing collection
          response = await axios.post(`${collectionUrl}/${this.collectionId}`, this.collection)
          console.log("Collection updated:", response.data)
        }

        // Show success message and perform post-operation actions
        this.showSnackbar("Collection saved successfully", "success")
        setTimeout(() => {
          this.$router.push({
            path: `/collection`,
            query: { collectionId: this.collectionId }
          })
        }, 1000)
      } catch (error) {
        console.error("Error saving collection:", error)
        this.showSnackbar("Error saving collection", "error")
      }
    },

    showSnackbar(message, color) {
      // Emitting an event to show snackbar with the message and color
      eventBus.emit("show-snackbar", { text: message, color: color })
    }
  }
}
</script>
