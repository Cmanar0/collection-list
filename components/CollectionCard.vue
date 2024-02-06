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
export default {
  mounted() {
    if (this.filterOptions[0]) {
      this.selectedFilter = this.filterOptions[0]
    }
  },
  props: ["collection"],
  data() {
    return {
      selectedFilter: ""
    }
  },
  methods: {
    handleCollectionClick(collection) {
      this.$router.push({
        path: `/collection-detail`,
        query: { collectionId: collection.id, filterIndex: this.filterOptions.indexOf(this.selectedFilter) }
      })
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
  padding: 10px;
  color: #fff; /* Default text color */
}

.collection-bottom {
  padding: 10px;
  background-color: #fff;
  color: #000;
}
</style>
