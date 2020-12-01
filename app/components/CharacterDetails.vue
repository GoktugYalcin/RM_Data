<template>
    <Page>

        <ActionBar>
            <NavigationButton @tap="$navigateBack" android.systemIcon="ic_menu_back"/>
            <Label :text="this.details.name"></Label>
        </ActionBar>

        <ScrollView>
            <StackLayout>
            <Image v-bind:src="this.details.image" stretch="center" class="image" />
            <Label col="0" class="m-10 h3" :text="'Id : '+this.details.id"></Label>
            <Label col="0" class="m-10 h3" :text="'Adı : '+this.details.name"></Label>
            <Label col="0" class="m-10 h3" :text="'Durumu : '+this.details.status"></Label>
            <Label col="0" class="m-10 h3" :text="'Türü : '+this.details.species"></Label>
            <Label col="0" class="m-10 h3" :text="'Alt-türü(varsa) : '+this.details.type"></Label>
            <Label col="0" class="m-10 h3" :text="'Cinsiyeti : '+this.details.gender"></Label>
            <Label col="0" class="m-10 h3" :text="'Uyruğu : '+this.ori"></Label>
            <Label col="0" class="m-10 h3" :text="'Lokasyonu : '+this.loc"></Label>
            <Label col="0" class="m-10 h3" :text="' '"></Label>
            <Label col="0" class="m-10 h3" :text="'Oynadığı Bölümler : '"></Label>
            <ListView for="link in this.details.episode">
            <v-template>
                <StackLayout orientation="horizontal">
                    <Label :text="link" textWrap="true"></Label>
                </StackLayout>
            </v-template>
            </ListView>
        </StackLayout>
        </ScrollView>
    </Page>
</template>

<script>
 import * as http from "http";
   import ItemDetails from "./ItemDetails";

  export default {
    props: ["character"],
  data() {
      return {
          details: [],
          ori: "",
          loc: ""
      };
    },
  mounted() {
      http.getJSON(this.character).then(result => {
        this.details = result;
        this.ori = result.origin.name;
        this.loc = result.location.name;
      }, error => {
            console.log(error);
         });
    },
  }
</script>

<style scoped lang="scss">
    // Start custom common variables
    @import "~@nativescript/theme/scss/variables/blue";
    // End custom common variables
.image{
 vertical-align: center;
}

</style>
