<template>
  <div style="padding-top: 60px">
    <v-container :key="componentKey">
      <v-row justify="left">
        <v-col cols="12" md="6">
          <!-- Left Card -->
          <v-card class="pa-5 my-card flex" outlined>
            <!-- Content for the left card -->
            <v-btn color="primary" @click="redirect('/')">
              <v-icon style="margin-right: 5px">mdi-arrow-left</v-icon>
            </v-btn>
            <h1>{{ editOrCreate }}</h1>
          </v-card>
        </v-col>
      </v-row>
      <div class="row">
        <h3 class="title grey--text text--darken-1">Edit collection and it's filters or create a new one</h3>
        <v-btn color="primary" @click="toggleEditing">Edit Collection </v-btn>
      </div>
      <br />
      <v-row>
        <v-divider horizontal></v-divider>
      </v-row>
      <br />
      <br />
      <!-- Display Collection Details -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <div v-if="!editCollection">
            <div
              @mouseover="hover = collection.id"
              class="collection-top"
              :style="{
                backgroundColor: `#${collection.color}`,
                color: textColor(collection.color)
              }"
            >
              <h2>{{ collection.name }}</h2>
            </div>
            <br />
            <p>Private: {{ collection.private ? "Yes" : "No" }}</p>
            <br />
            <div class="filets-container">
              <v-col cols="12" md="8">
                <div v-if="!editCollection">
                  <div v-if="collection.filters.length">
                    <p>Filters:</p>
                    <v-row>
                      <v-col
                        v-for="(filter, index) in collection.filters"
                        :key="index"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-card class="filter-card" @click="onFilterClick(filter)">
                          <v-card-text>
                            <div>Prematch: {{ filter.prematch }}</div>
                            <div>Market: {{ filter.market }}</div>
                            <div>For: {{ filter.for }}</div>
                            <div>From: {{ filter.from }}</div>
                            <div>To: {{ filter.to }}</div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </div>
              </v-col>
            </div>
          </div>
        </v-col>
      </v-row>
      <!-- Edit Form -->
      <v-container :key="componentKey">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-form v-if="editCollection" ref="form" v-model="valid">
              <v-text-field
                label="Collection Name"
                v-model="collection.name"
                :rules="[rules.required]"
              ></v-text-field>

              <v-switch
                label="Private"
                :items="['YES', 'NO']"
                color="green"
                v-model="collection.private"
              ></v-switch>

              <v-color-picker
                label="Color"
                v-model="collection.color"
                :rules="[rules.required]"
                elevation="0"
              ></v-color-picker>

              <!-- Dropdown to select filter to edit or create a new one -->
              <div class="filters">
                <div class="create-new-filter">
                  <v-checkbox
                    v-if="!newPost"
                    v-model="newFilter"
                    label="Create a new fitler"
                    color="primary"
                  ></v-checkbox>
                </div>
                <v-select
                  v-if="!newFilter && !newPost"
                  label="Select Filter"
                  :items="listOfFilters"
                  @change="updateFilterIndex"
                  v-model="selectedFilterIndex"
                ></v-select>
              </div>
              <div class="filters">
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
              </div>
              <v-btn :disabled="!valid" color="success" width="100%" @click="submitForm"> Submit </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
  </div>
</template>

<script>
import { eventBus } from "~/services/eventBus"
import axios from "axios"

export default {
  data() {
    return {
      valid: true,
      originalCollection: {},
      loaded: false,
      editCollection: false,
      selectedFilterIndex: null,
      newFilter: false,
      componentKey: new Date().getTime(), // Initialize the key
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
    if (this.$route.query.edit) {
      this.editCollection = true
    }
  },
  computed: {
    listOfFilters() {
      return this.collection.filters.map((filter, index) => {
        return `Filter ${index + 1}`
      })
    },
    editOrCreate() {
      return this.newPost ? "Create a new collection" : "Edit Collection"
    }
  },
  methods: {
    onFilterClick(filter) {
      return window.open(
        `/collection-detail?collectionId=${this.collection.id}&filterIndex=${this.collection.filters.indexOf(
          filter
        )}&edit=true`,
        "_self"
      )
    },
    redirect(path) {
      this.$router.push(path)
    },
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
      if (this.editCollection) {
        // User is canceling editing, revert the changes
        this.collection = JSON.parse(JSON.stringify(this.originalCollection))
      }
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

        // Store a deep copy of the original collection
        this.originalCollection = JSON.parse(JSON.stringify(this.collection))

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
        this.redirectToUpdatedCollection()
      } catch (error) {
        console.error("Error saving collection:", error)
        this.showSnackbar("Error saving collection", "error")
      }
    },
    redirectToUpdatedCollection() {
      console.log("redirectToUpdatedCollection :>> ")
      this.componentKey = new Date().getTime() // Update key to force re-render
      return window.open(
        `/collection-detail?collectionId=${this.collection.id}&filterIndex=${this.filterIndex}`,
        "_self"
      )
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
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
.my-nav-link:hover {
  background-color: #135ba1; /* a darker shade for hover effect */
}

.filters {
  margin-bottom: 30px;
  background-color: #ececec7d;
  padding: 15px;
}

.filter-card {
  cursor: pointer;
  transition: box-shadow 0.3s ease;
}

.filter-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.filets-container {
  background-color: #f5f5f5;
  border-radius: 0 0 5px 5px;
}
.collection-top {
  display: flex;
  direction: row;
  justify-content: space-between;
  padding: 10px;
  color: #fff; /* Default text color */
  border-radius: 5px 5px 0 0;
}
.flex {
  display: flex;
  justify-content: flex-start;
}
</style>
