<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        :title="getTitle(this.status) +  ' User Contributions'"
        :allow-add="false"
        @done="$router.back()"
        :delete-handler="null"
        :edit-handler="getUser() ? getUser().scopes.includes('user-contributions:edit') ? edit : null : null"
    >
      <template #extra-actions="{ item }">
        <v-icon v-if="getUser() && getUser().scopes.includes('user-contributions:edit') && status === 0" color="green" small @click="changeStatus(1, item)">mdi-check-circle</v-icon>
        <v-icon v-if="getUser() && getUser().scopes.includes('user-contributions:edit') && status === 0" color="red" small @click="changeStatus(2, item)">mdi-close-circle</v-icon>
      </template>
      <template v-slot:category="{ item }">
        {{ item.category.name }}
      </template>
      <template v-slot:type="{ item }">
        {{ getType(item.type) }}
      </template>
      <template v-slot:user_id="{ item }">
        {{ item.username }}
      </template>
    </data-table>
    <loading-dialog v-model="loadingDialog" message="Loading..."/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import LoadingDialog from "../../components/LoadingDialog";
import {getUser} from '@/utils/local';
import {UserContributionService} from "@/services/user_contribution-service";
import {QuestionsService} from "@/services/questions-service";

export default {
  name: "UserContributionTable",
  components: {LoadingDialog, DataTable},
  props: {
    status: {
      type: Number,
      default: 0,
    }
  },
  data: () => ({
    loading: false,
    loadingDialog: false,
    service: new UserContributionService(),
    questionService: new QuestionsService(),
    headers: [
      {
        text: 'Question Statement',
        value: 'statement',
        sortable: false
      },
      {
        text: 'Category',
        value: 'category',
        sortable: false
      },
      {
        text: 'Type',
        value: 'type'
      },
      {
        text: 'User',
        value: 'email'
      },
    ]
  }),
  methods: {
    getUser,
    edit(item) {
      this.$router.push(`/user-contribution?id=${item.id}`);
    },
    loadData() {
      return this.service.fetchAll(this.status);
    },
    getType(type) {
      if (type === 'bool') {
        return 'True False'
      } else {
        return 'Multiple Choice'
      }
    },
    getTitle(status) {
      switch (status) {
        case 0:
          return 'Pending'
        case 1:
          return 'Approved'
        case 2:
          return 'Rejected'
        default:
          return 'Invalid'
      }
    },
    changeStatus(status,item) {
      if (confirm('Are You Sure? This Contribution will be ' + this.getTitle(status))) {
        this.loading = true
        if (status === 1) {
          const data = {...item}
          delete data.id
          delete data.status
          delete data.user
          delete data.email
          delete data.createdAt
          delete data.updatedAt
          this.questionService.create(data)
        }
        this.service.updateStatus(status, item.id);
        document.querySelectorAll(".refresh").forEach(function(item) {
          item.click()
        })
        this.loading = false
      }
    }
  }

}
</script>
<style lang="sass" scoped>
.chip
  font-weight: 500
  padding: 5px 10px
  border-radius: 50px
  background: lightgray
</style>
