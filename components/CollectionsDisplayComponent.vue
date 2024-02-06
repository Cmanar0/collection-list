<template>
  <v-container>
    <div class="row">
      <h3 class="title grey--text text--darken-1">{{ collectionTypeText }} Collections</h3>
      <v-btn color="primary" @click="addNewCollection">
        <v-icon style="margin-right: 5px" left>mdi-plus</v-icon>
        Create Collection
      </v-btn>
    </div>
    <br />
    <v-row>
      <v-divider horizontal></v-divider>
    </v-row>
    <v-row>
      <v-col cols="12" md="8">
        <!-- Collection Type Title -->

        <!-- Collection Cards including New Collection Card -->
        <v-row>
          <v-col v-for="collection in collections" :key="collection.id" cols="12" sm="6" md="4">
            <v-card
              class="elevation-2 collection-card"
              :style="{ backgroundColor: `#${collection.color}` }"
              @mouseover="hover = collection.id"
              @mouseleave="hover = null"
              @click="handleCollectionClick(collection)"
            >
              <v-card-title>{{ collection.name }}</v-card-title>
              <v-card-text>
                <!-- Additional collection data here -->
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios"

export default {
  props: ["collections", "collectionType"],
  computed: {
    collectionTypeText() {
      if (this.collectionType && typeof this.collectionType === "string") {
        return this.collectionType.charAt(0).toUpperCase() + this.collectionType.slice(1)
      }
      return "All" // Default display text if collectionType is not as expected
    }
  },
  methods: {
    handleCollectionClick(collection) {
      this.$router.push({
        path: `/collection`,
        query: { collectionId: collection.id }
      })
    },

    addNewCollection() {
      this.$router.push({
        path: `/collection`,
        query: { collectionId: "NEW" }
      })
    }
  }
}
</script>

<style scoped>
.collection-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-collection {
  cursor: pointer;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 130px;
  border: 1px dashed #ccc;
}
.collection-card {
  margin-bottom: 20px;
  height: 130px;
}
.title {
  margin-left: 10px;
  color: grey;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}
</style>
