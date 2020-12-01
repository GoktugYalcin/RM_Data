<template lang="html">
    <Page>
        <ActionBar>
            <Label text="Rick and Morty'nin Tüm Bölümleri"></Label>
        </ActionBar>
        <TabView id="tabViewContainer">
    <TabViewItem title="1. Sezon">
      <StackLayout>
        <ListView for="item in items" @itemTap="onItemTap">
            <v-template>
                <StackLayout orientation="horizontal">
                    <Label :text="item.name" textWrap="true"></Label>
                </StackLayout>
            </v-template>
        </ListView>
        </StackLayout>
    </TabViewItem>
    <TabViewItem title="2. Sezon">
      <StackLayout>
        <ListView for="item in items2" @itemTap="onItemTap">
            <v-template>
                <StackLayout orientation="horizontal">
                    <Label :text="item.name" textWrap="true"></Label>
                </StackLayout>
            </v-template>
        </ListView>
        </StackLayout>
    </TabViewItem>
    <TabViewItem title="3. Sezon">
      <StackLayout>
        <ListView for="item in items3" @itemTap="onItemTap">
            <v-template>
                <StackLayout orientation="horizontal">
                    <Label :text="item.name" textWrap="true"></Label>
                </StackLayout>
            </v-template>
        </ListView>
        </StackLayout>
    </TabViewItem>
</TabView>
    </Page>
</template>

<script>
  import ItemDetails from "./ItemDetails";
  import * as http from "http";
  export default {
    data() {
      return {
        items: [],
        items2: [],
        items3: []
      };
    },
    mounted() {
      http.getJSON("https://rickandmortyapi.com/api/episode").then(result => {
      this.items = result.results;
      }, error => {
        console.log(error);
      });
      http.getJSON("https://rickandmortyapi.com/api/episode?page=2").then(result => {
      this.items2 = result.results;
      }, error => {
        console.log(error);
      });
      http.getJSON("https://rickandmortyapi.com/api/episode?page=3").then(result => {
      this.items3 = result.results;
      }, error => {
        console.log(error);
      });
      for (var id in this.items2) {
        this.items[id] = this.items2[id];
      }
    },
    methods: {
      onItemTap(args) {
        this.$navigateTo(ItemDetails, {
          frame: 'items',
          props: {item: args.item},
          animated: true,
          transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
          }
        });
      }
    }
  };
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import "~@nativescript/theme/scss/variables/forest";
    // End custom common variables
    .fas {
    font-family: "Font Awesome 5 Free", "fa-solid-900";
    font-weight: 900;
}
    // Custom styles

</style>
