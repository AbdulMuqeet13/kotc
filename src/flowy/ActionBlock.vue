<template>
  <v-card outlined class="ma-0 pa-3 mb-4"
          :style="'width:' + width">
    <div class="d-flex align-center">
      <flowy-drag-handle class="mr-2" style="cursor: grab">
        <v-icon>mdi-drag-horizontal-variant</v-icon>
      </flowy-drag-handle>
      <v-avatar color="grey lighten-3" size="30" class="pa-1 mr-2">
        <v-icon small>{{ block.preview.icon }}</v-icon>
      </v-avatar>
      <div class="text-subtitle-1">
        {{ block.preview.title }}
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "ActionBlock",
  props: {
    width: {
      default: 320,
    },
    block: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style scoped>

</style>
