<template>
  <v-container>
    <div class="row">
      <h3 class="title grey--text text--darken-1">{{ collectionTypeText }} Collections</h3>
      <v-btn color="primary" class="create" @click="addNewCollection">
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
        <v-row style="padding-right: 10px; padding-top: 10px">
          <v-col v-for="collection in collections" :key="collection.id" cols="12" sm="6" md="4">
            <CollectionCard :collection="collection" @click="handleCollectionClick" />
          </v-col>
        </v-row>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col cols="12" sm="4">
        <v-fade-transition>
          <div class="notification" v-if="showNotification">
            <h3>Collections</h3>
            <p>Now you can create new collections</p>
            <v-text color="primary" class="pointer" @click="closeNotification">Dismiss</v-text>
          </div>
        </v-fade-transition>
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
      chosenFilter: 0,
      showNotification: false // Initially false, set to true on mounted
    }
  },
  mounted() {
    // Show notification with a delay after mounting
    setTimeout(() => {
      this.showNotification = true
    }, 600)
  },
  methods: {
    addNewCollection() {
      this.$router.push({
        path: `/collection-detail`,
        query: { collectionId: "NEW" }
      })
    },
    closeNotification() {
      this.showNotification = false
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
.pointer {
  cursor: pointer;
  text-decoration: underline;
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
@media screen and (max-width: 720px) {
  .row {
    flex-direction: column;
  }
  .create {
    margin-top: 10px;
    width: 100%;
  }
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
.notification {
  padding: 15px;
  background-color: #f4f4f4; /* Light grey background */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  margin-left: 10px;
  margin-top: 10px;
}
</style>
