<template>
    <Page>

        <ActionBar>
            <NavigationButton @tap="$navigateBack" android.systemIcon="ic_menu_back"/>
            <Label :text="item.name"></Label>
        </ActionBar>

        <StackLayout>
            <Label col="0" class="m-10 h3" :text="'Id : ' + item.id"></Label>
            <Label col="0" class="m-10 h3" :text="'Adı : ' + item.name"></Label>
            <Label col="0" class="m-10 h3" :text="'Çıkış Tarihi : ' + item.air_date"></Label>
            <Label col="0" class="m-10 h3" :text="'Bölüm : ' + item.episode"></Label>
            <Label col="0" class="m-10 h3" :text="' '"></Label>
            <Label col="0" class="m-10 h3" :text="'Karakterler : '"></Label>

            <ListView for="ch in characterNames" @itemTap="onItemTap">
            <v-template>
                <StackLayout orientation="horizontal">
                    <Label :text="ch" textWrap="true"></Label>
                </StackLayout>
            </v-template>
        </ListView>

        </StackLayout>
    </Page>
</template>

<script>
import * as http from "http";
import CharacterDetails from "./CharacterDetails"
  export default {
    props: ["item"],
  data() {
      return {
          characterNames: []
        };
  },
  mounted() {
      this.characterNames = this.item.characters;
        console.log(this.characterNames);
    },
    methods: {
      onItemTap(args) {
        this.$navigateTo(CharacterDetails, {
          frame: 'items',
          props: {character: args.item},
          animated: true,
          transition: {
            name: "slide",
            duration: 200,
            curve: "ease"
          }
        });
      }
    }
  }
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import "~@nativescript/theme/scss/variables/blue";
    // End custom common variables

    // Custom styles

</style>
