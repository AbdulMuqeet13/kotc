<template>
  <v-card :class="loading ? 'pa-5 text-center white--text  white' : 'pa-5 text-center white--text  ' + color">
    <v-skeleton-loader
        :loading="loading"
        type="card-heading, card-heading"
    >
      <h1>{{ value || 0 }}</h1>
      <p>{{ title }}</p>
    </v-skeleton-loader>
  </v-card>
</template>

<script>
export default {
  name: "StatCard",
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    color: {
      type: String,
      default: 'black'
    },
    loading: {
      type: Boolean
    }
  }
}
</script>

<style scoped>

</style>
