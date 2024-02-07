<template>
  <v-card
    @click="handleCollectionClick(collection)"
    class="elevation-2 collection-card"
    @mouseover="hover = collection.id"
    @mouseleave="hover = null"
  >
    <div
      @mouseover="hover = collection.id"
      class="collection-top"
      :style="{
        backgroundColor: `#${collection.color}`,
        color: textColor(collection.color)
      }"
    >
      <h3>{{ collection.name }}</h3>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            @click.stop
            class="dots"
            v-bind="props"
            :style="{
              backgroundColor: `#${collection.color}`,
              color: textColor(collection.color)
            }"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(item, i) in items" :key="i" @click="item.action(collection)">
            <v-list-item-title class="menu-item">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div class="collection-bottom">
      <v-select
        @click.stop
        v-model="selectedFilter"
        :items="filterOptions"
        item-text="text"
        item-value="value"
      ></v-select>

      <!-- Display data based on the selected filter -->

      <div v-if="collection.filters.length !== 0" class="filter-items">
        <p v-if="chosenFilter.prematch">{{ `Prematch: ${chosenFilter.prematch}` }}</p>
        <p v-if="chosenFilter.market">{{ `Market: ${chosenFilter.market}` }}</p>
        <p v-if="chosenFilter.for">{{ `For: ${chosenFilter.for}` }}</p>
        <p v-if="chosenFilter.from">{{ `From: ${chosenFilter.from}` }}</p>
        <p v-if="chosenFilter.to">{{ `To: ${chosenFilter.to}` }}</p>
      </div>
    </div>
  </v-card>
</template>
<script>
import axios from "axios"
import { eventBus } from "~/services/eventBus"

export default {
  mounted() {
    if (this.filterOptions[0]) {
      this.selectedFilter = this.filterOptions[0]
    }
  },
  props: ["collection"],
  data() {
    return {
      selectedFilter: "",
      items: [
        { title: "Edit", action: this.editCollection },
        { title: "Delete", action: this.confirmDelete }
      ]
    }
  },
  methods: {
    editCollection(collection) {
      this.$router.push({
        path: `/collection-detail`,
        query: {
          collectionId: collection.id,
          filterIndex: this.filterOptions.indexOf(this.selectedFilter),
          edit: true
        }
      })
    },
    confirmDelete() {
      eventBus.emit("show-dialog", {
        title: "Delete collection",
        message: "Do you really want to delete this collection?",
        dialogType: "confirm",
        onConfirm: () => {
          this.deleteCollection()
          eventBus.emit("close-dialog")
        }
      })
    },
    async deleteCollection() {
      try {
        await axios.delete(`http://localhost:3108/collection/${this.collection.id}`)
        this.showSnackbar("Collection deleted successfully", "success")
        window.open("/", "_self")
      } catch (error) {
        console.error("Error deleting collection:", error)
        this.showSnackbar("Error deleting collection", "error")
      }
    },
    handleCollectionClick(collection) {
      this.$router.push({
        path: `/collection-detail`,
        query: { collectionId: collection.id, filterIndex: this.filterOptions.indexOf(this.selectedFilter) }
      })
    },
    showSnackbar(message, color) {
      // Emitting an event to show snackbar with the message and color
      eventBus.emit("show-snackbar", { text: message, color: color })
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
    }
  },
  computed: {
    chosenFilter() {
      // Get the selected filter group based on the selected filter
      if (this.selectedFilter) {
        return this.collection.filters[this.filterOptions.indexOf(this.selectedFilter)]
      }
      return {}
    },
    filterOptions() {
      // Generate select options based on the number of filters
      let options = []
      for (let i = 0; i < this.collection.filters.length; i++) {
        options.push(`Filter n. ${i + 1}`)
      }
      return options
    }
  }
}
</script>

<style scoped>
.collection-card {
  cursor: pointer;
  min-height: 250px;
  transition: transform 0.3s ease;
}

.collection-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
}
.filter-items {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}
.collection-top {
  display: flex;
  direction: row;
  justify-content: space-between;
  padding: 10px;
  color: #fff; /* Default text color */
}

.collection-bottom {
  padding: 10px;
  background-color: #fff;
  color: #000;
}
.dots {
  max-width: 30px;
  max-height: 30px;
  background-color: transparent;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}
</style>
