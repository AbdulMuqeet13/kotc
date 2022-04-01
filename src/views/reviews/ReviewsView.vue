<template>
  <data-table title="Reviews" :headers="headers" :allow-add="false" :loader="loadReviews">
    <template #type="{ item }">
      <v-chip>{{ item.type }}</v-chip>
    </template>

    <template #stepsToReproduce="{ item }">
      <span
        v-if="!item.stepsToReproduce"
        style="color: grey; font-style: italic; font-size: 10px"
      >
        None
      </span>
      <span v-else>{{ item.stepsToReproduce }}</span>
    </template>
  </data-table>
</template>

<script>
import axios from 'axios';
import DataTable from '../../components/DataTable';

export default {
  name: 'ReviewsView',
  components: { DataTable },

  data: () => ({
    headers: [
      {
        text: 'Type',
        value: 'type'
      },
      {
        text: 'Email',
        value: 'email'
      },
      {
        text: 'Details',
        value: 'feedback'
      },
      {
        text: 'Steps To Reproduce',
        value: 'stepsToReproduce'
      },
      {
        text: 'Created At',
        value: 'createdAt'
      }
    ]
  }),

  methods: {
    async loadReviews() {
      return (await axios.get('/reviews')).data;
    }
  }
};
</script>

<style scoped></style>
