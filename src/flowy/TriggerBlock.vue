<template>
  <v-card style="cursor: pointer" outlined class="ma-0 pa-3 mb-4"
          :style="'width:' + width">
    <div @click="onTrigger(block)"  class="d-flex">
      <v-avatar color="grey lighten-3" size="40" class="flex-grow pa-1 mr-2">
        <v-icon>{{ block.preview.icon }}</v-icon>
      </v-avatar>
      <div>
        <div class="font-bold text-subtitle-1 text-gray-800">
          {{ block.preview.title }}
        </div>
        <div class="text-caption text-gray-600">
          {{ block.preview.description }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "TriggerBlock",
  props: {
    width: {
      default: 320,
    },
    block: {
      type: Object,
      required: true
    },
  },
  methods: {
    onTrigger(data) {
      this.$emit('setup-trigger', data);
    },
  },
}
</script>

<style scoped>

</style>
