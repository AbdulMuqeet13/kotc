<template>
  <data-table
      :loader="loadData"
      :headers="headers"
      title="Events"
      :allow-add="getUser() ? getUser().scopes.includes('events:new') : false"
      @add-new="addNew"
      @done="$router.back()"
      :delete-handler="getUser() ? getUser().scopes.includes('events:delete') ?  service.delete : null : null"
      :edit-handler="getUser() ? getUser().scopes.includes('events:edit') ? edit : null : null"
  >
  </data-table>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {EventService} from "@/services/events-service";
export default {
  name: 'EventsViewTemporary',
  components: {DataTable},

  mounted() {
  },

  data: () => ({
    loading: false,
    service: new EventService(),

    headers: [
      {
        text: 'Event Name',
        value: 'name',
      }
    ]
  }),

  methods: {
    getUser,
    addNew() {
      this.$router.push('/event');
    },
    edit(item) {
      this.$router.push(`/event?id=${item.id}`);
    },
    async loadData() {
      return this.service.fetchAll();
    },
  }
};
</script>

<style scoped></style>
