<template>
  <data-table
      :loader="loadData"
      :headers="headers"
      title="Account Deletion Requests"
      @done="$router.back()"
      :allow-add="false"
  >
<!--    <template #extra-actions">-->
<!--      <v-icon small color="accent">mdi-check-decagram</v-icon>-->
<!--    </template>-->
    <template #createdAt="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>

  </data-table>
</template>

<script>
import dayjs from 'dayjs';
import { AccountDeletionService } from "@/services/account_deletion-service";
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';


export default {
  components: { DataTable },

  mounted() {},

  data: () => ({
    items: [],
    loading: false,
    service: new AccountDeletionService(),

    headers: [
      {
        text: 'Email',
        value: 'email',
        sortable: false,
        width: 200
      },
      {
        text: 'Reason',
        value: 'reason',
        sortable: false
      },
      {
        width: 180,
        text: 'Created At',
        value: 'createdAt'
      }
    ]
  }),

  methods: {
    getUser,
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },
    loadData() {
      return this.service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
