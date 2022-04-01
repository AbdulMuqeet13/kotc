<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Comments"
        :allow-add="false"
        @done="$router.back()"
    >
      <template v-slot:actions="{item}">
        <v-icon small color="green" @click="openComments(item)">mdi-clipboard</v-icon>
      </template>
      <template v-slot:createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
    </data-table>
    <loading-dialog v-model="loading" message="Loading..."/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {QuestionsService} from '@/services/questions-service';
import LoadingDialog from "@/components/LoadingDialog";
import moment from "moment";

export default {
  components: {LoadingDialog, DataTable},

  data: () => ({
    loading: false,
    service: new QuestionsService(),
    headers: [
      {
        text: 'User Name',
        value: 'username',
        sortable: false
      },
      {
        text: 'Comment',
        value: 'comment',
        sortable: false
      },
      {
        text: 'Created At',
        value: 'createdAt'
      },
      {
        width: 120,
        text: 'Actions',
        value: 'actions'
      },
    ],
  }),

  methods: {
    loadData() {
      return this.service.fetchAllComments();
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY - H:M A")
    },
    openComments(item) {
      this.$router.push(`/question/comment?id=${item.question_id}`);
    }
  }
};
</script>

<style scoped></style>
