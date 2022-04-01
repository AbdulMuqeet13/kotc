<template>
  <data-table
      :loader="loadData"
      :headers="headers"
      title="Flagged Questions"
      @done="$router.back()"
      :allow-add="false"
      :delete-handler="getUser() ? getUser().scopes.includes('flagged-questions:delete') ?  deleteItem : null : null"
      :edit-handler="getUser() ? getUser().scopes.includes('flagged-questions:edit') ?  editQuestion : null : null"
  >
    <template v-slot:username="{ item }">
      {{ item.user.name }}
    </template>
    <template v-slot:email="{ item }">
      {{ item.user.email }}
    </template>
    <template #timestamp="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>
  </data-table>
</template>

<script>
import DataTable from '../../components/DataTable';
import axios from 'axios';
import {getUser} from '@/utils/local';
import dayjs from "dayjs";


export default {
  components: {DataTable},

  data: () => ({
    loading: false,

    headers: [
      {
        text: 'User Name',
        value: 'username',
        sortable: false
      },
      {
        text: 'User Email',
        value: 'email',
        sortable: false
      },
      {
        text: 'Reason',
        value: 'reason',
        sortable: false
      },
      {
        text: 'Question',
        value: 'question_id',
        sortable: false
      },
      {
        width: 180,
        text: 'Timestamp',
        value: 'timestamp'
      }
    ]
  }),

  methods: {
    getUser,
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },
    async editQuestion(item) {
      if (item.user.token) {
        await this.$router.push(`/question?id=${item.question_id}&token=${item.user.token}`)
      } else {
        await this.$router.push(`/question?id=${item.question_id}`)
      }
    },
    async deleteItem(item) {
      return await axios.delete(`/flagged-questions/${item.id}`);
    },
    async loadData() {
      return (await axios.get('/flagged-questions')).data;
    }
  }
};
</script>
