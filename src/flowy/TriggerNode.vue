<template>
  <v-card outlined class="pa-4" :style="node.data.selected ? 'min-width: 100px; max-width: 300px;border-color: red' : 'min-width: 100px; max-width: 300px;'">
    <div class="flex">
      <v-avatar class="grey lighten-2 mr-2">
        <v-icon>mdi-lightning-bolt</v-icon>
      </v-avatar>
      <div>
        <div class="font-bold text-subtitle-1 text-gray-800">
          {{ title }}
        </div>
        <div class="text-caption text-gray-600">
          {{ description }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "TriggerNode",
  props: ['remove', 'node', 'title', 'description', 'configure'],
}
</script>

<style scoped>

</style>
