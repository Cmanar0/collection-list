<template>
  <v-container>
    <v-row justify="left">
      <v-col cols="12" md="6">
        <!-- Left Card -->

        <v-card class="pa-5 my-card" outlined>
          <!-- Content for the left card -->
          <h1>Collection detail</h1>
          <router-link to="/" class="my-nav-link">
            <v-icon style="margin-right: 5px">mdi-arrow-left</v-icon>
            Go back to collections
          </router-link>
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
      <v-text-field
        label="Collection Name"
        v-model="collection.name"
        :rules="[rules.required]"
      ></v-text-field>

      <v-color-picker
        label="Color"
        v-model="collection.color"
        :rules="[rules.required]"
        elevation="0"
      ></v-color-picker>

      <v-switch label="Private" :items="['YES', 'NO']" color="green" v-model="collection.private"></v-switch>

      <!-- Dropdown to select filter to edit or create a new one -->
      <v-checkbox
        v-if="!newPost"
        v-model="newFilter"
        label="Create a new fitler"
        color="primary"
      ></v-checkbox>
      <v-select
        v-if="!newFilter"
        label="Select Filter"
        :items="listOfFilters"
        @change="updateFilterIndex"
        v-model="selectedFilterIndex"
      ></v-select>

      <v-select
        label="Prematch"
        :items="['YES', 'NO']"
        v-model="collection.filters[filterIndex].prematch"
      ></v-select>

      <v-select
        label="Market"
        :items="['FT', 'GOAL_LINE']"
        v-model="collection.filters[filterIndex].market"
      ></v-select>

      <v-select
        label="For"
        :items="['HOME', 'DRAW', 'AWAY', 'UNDER', 'OVER']"
        v-model="collection.filters[filterIndex].for"
      ></v-select>

      <v-text-field label="From" v-model="collection.filters[filterIndex].from"></v-text-field>

      <v-text-field label="To" v-model="collection.filters[filterIndex].to"></v-text-field>

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
      selectedFilterIndex: null,
      newFilter: false,
      newPost: this.$route.query.collectionId === "NEW",
      collectionId: this.$route.query.collectionId || "NEW",
      filterIndex: this.$route.query.filterIndex ? parseInt(this.$route.query.filterIndex) : 0,
      fetchedData: {},
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
      }
    }
  },
  watch: {
    selectedFilterIndex(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.updateFilterIndex()
      }
    },
    newFilter(newVal) {
      if (newVal) {
        // When checked, add a new filter to fetchedData and point collection's filterIndex to it
        this.fetchedData.filters.push(this.getDefaultFilter())
        this.filterIndex = this.fetchedData.filters.length - 1
        this.collection.filters[this.filterIndex] = this.getDefaultFilter()
      } else {
        // When unchecked, remove the last filter from fetchedData
        if (this.fetchedData.filters.length > 0) {
          this.fetchedData.filters.pop()
        }
        // Reset filterIndex to point to the last filter or null if no filters left
        this.filterIndex = this.fetchedData.filters.length > 0 ? this.fetchedData.filters.length - 1 : null
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
  mounted() {
    if (this.filterIndex !== null) {
      this.selectedFilterIndex = `Filter ${this.filterIndex + 1}`
    }
  },
  computed: {
    listOfFilters() {
      return this.collection.filters.map((filter, index) => {
        return `Filter ${index + 1}`
      })
    }
  },
  methods: {
    updateFilterIndex() {
      if (this.newFilter) {
        // Set filterIndex to the index of the new filter
        this.collection.filters = this.getDefaultFilter()
      } else {
        // Extract the numeric part from the selected filter option and adjust for zero-based indexing
        const filterNumber = parseInt(this.selectedFilterIndex.replace("Filter ", ""), 10)
        this.filterIndex = filterNumber - 1
      }

      // Update chosenFilterOptions based on the new filterIndex
      if (this.filterIndex >= 0 && this.filterIndex < this.collection.filters.length) {
        this.chosenFilterOptions = { ...this.collection.filters[this.filterIndex] }
      } else {
        // Reset chosenFilterOptions if index is out of bounds
        this.chosenFilterOptions = this.getDefaultFilter()
      }
    },
    getDefaultFilter() {
      // Return a default filter object structure
      return {
        type: "",
        prematch: "",
        market: "",
        for: "",
        from: null,
        to: null
      }
    },
    toggleEditing() {
      this.editCollection = !this.editCollection
    },
    generateId() {
      return Math.random().toString(36).substr(2, 9)
    },
    goToCollections() {
      this.$router.push("/") // Navigate to the home page
    },
    textColor(bgColor) {
      if (!bgColor) return "#000" // Default to black if no color is provided

      const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor
      const r = parseInt(color.substring(0, 2), 16) // Hex to R
      const g = parseInt(color.substring(2, 4), 16) // Hex to G
      const b = parseInt(color.substring(4, 6), 16) // Hex to B
      const uicolors = [r / 255, g / 255, b / 255]
      const c = uicolors.map(col => {
        if (col <= 0.03928) {
          return col / 12.92
        }
        return Math.pow((col + 0.055) / 1.055, 2.4)
      })
      const l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
      return l > 0.179 ? "#000" : "#FFF" // Light or dark text
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
        this.fetchedData = response.data
        // Update each property of this.collection with the data from the API
        this.collection.id = data.id
        this.collection.name = data.name
        this.collection.color = data.color
        this.collection.private = data.private

        // Check if filters are provided in the response and update accordingly
        if (data.filters && Array.isArray(data.filters)) {
          this.collection.filters = data.filters
        } else {
          // If no filters are provided, reset to default
          this.collection.filters = [
            {
              type: "",
              prematch: "",
              market: "",
              for: "",
              from: null,
              to: null
            }
          ]
        }
        this.collection.id = this.collectionId
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
            path: `/collection-detail`,
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

<style scoped>
.my-nav-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  text-decoration: none;
  color: #fff; /* or your preferred text color */
  background-color: #1976d2; /* or your preferred background color */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.my-nav-link:hover {
  background-color: #135ba1; /* a darker shade for hover effect */
}
</style>
