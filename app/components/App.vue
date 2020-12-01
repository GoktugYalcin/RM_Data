<template lang="html">
    <BottomNavigation>
        <TabContentItem>
            <Frame id="items">
                <Items/>
            </Frame>
        </TabContentItem>
    </BottomNavigation>
</template>

<script>
  import Items from "./Items.vue";

  export default {
    components: {
      Items
    }
  };
</script>

<style lang="scss">
    // Start custom common variables
    @import "~@nativescript/theme/scss/variables/forest";
    // End custom common variables

    // Custom styles

</style>
