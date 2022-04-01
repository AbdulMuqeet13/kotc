<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Passage Questions"
        :allow-add="getUser() ? getUser().scopes.includes('passage-questions:new') : false"
        @add-new="addNew"
        @done="$router.back()"
        :delete-handler="getUser() ? getUser().scopes.includes('passage-questions:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('passage-questions:edit') ?  edit : null : null"
    >
      <template v-slot:createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template v-slot:passage="{ item }">
        {{ item.passage.substring(0, 100) }}
      </template>
      <template #premium="{ item }">
        <v-checkbox dense v-model="item.premium" readonly hide-details/>
      </template>
      <template #active="{ item }">
        <v-checkbox dense v-model="item.active" readonly hide-details/>
      </template>
    </data-table>
    <loading-dialog v-model="loading" message="Loading..."/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {required} from "@/utils/validators";
import LoadingDialog from "@/components/LoadingDialog";
import moment from "moment";
import {PassageQuestionsService} from "@/services/passage_questions-service";

export default {
  components: {LoadingDialog, DataTable},

  data: () => ({
    loading: false,
    service: new PassageQuestionsService(),

    headers: [
      {
        text: 'Passage Title',
        value: 'heading',
      },
      {
        text: 'Question Passage',
        value: 'passage',
        sortable: false
      },
      {
        text: 'Created At',
        value: 'createdAt'
      },
      {
        width: 100,
        text: 'Premium',
        value: 'premium'
      },
      {
        width: 120,
        text: 'Active',
        value: 'active'
      }
    ],


    items: [],
  }),

  methods: {
    getUser,
    required,
    addNew() {
      this.$router.push('/passage-question');
    },
    edit(item) {
      this.$router.push(`/passage-question?id=${item.id}`);
    },
    loadData() {
      return this.service.fetchAll();
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY - H:M")
    },
  }
};
</script>

<style scoped></style>
