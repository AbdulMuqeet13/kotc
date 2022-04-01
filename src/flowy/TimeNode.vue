<template>
  <v-card outlined flat bordered class="my-card bg-white pa-4" style="min-width: 200px; max-width: 300px">
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="text-h6">{{ title }}</div>
      </div>
    </div>
    <div class="py-3">Wait for {{ node.timeDelay }} {{ node.timeType.label }}</div>
    <div class="d-flex">
      <v-text-field v-model="node.timeDelay" dense outlined type="number" label="Time Delay"/>
      <div class="mx-2"></div>
      <v-select
          v-model="node.timeType"
          label="Type"
          outlined
          dense
          :items="types"
          item-text="label"
          :value-comparator="(a, b) => a && b && a === b"
          :item-value="(item) => item.value"
      />
    </div>
    <v-btn v-if="node.id !== '1'" color="primary" class="pa-0" no-caps @click="remove()">Remove</v-btn>
  </v-card>
</template>

<script>

export default {
  name: "TimeNode",
  data: () => ({
    types: [{
      label: 'Day(s)',
      value: 'day'
    },
      {
        label: 'Hour(s)',
        value: 'hour'
      },
      {
        label: 'Minute(s)',
        value: 'minute'
      }]
  }),
  props: ['remove', 'node', 'title', 'description']
}
</script>

<style scoped>

</style>
