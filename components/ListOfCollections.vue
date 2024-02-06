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

        <!-- Collection Cards -->
        <!-- <v-row>
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
              </v-card-text>
            </v-card>
          </v-col>
        </v-row> -->

        <v-row>
          <v-col v-for="collection in collections" :key="collection.id" cols="12" sm="6" md="4">
            <CollectionCard :collection="collection" @click="handleCollectionClick" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
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
  data() {
    return {
      chosenFilter: 0
    }
  },
  methods: {
    addNewCollection() {
      this.$router.push({
        path: `/collection-detail`,
        query: { collectionId: "NEW" }
      })
    }
  }
}
</script>

<style scoped>
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.filter-items {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
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
  height: 210px;
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
