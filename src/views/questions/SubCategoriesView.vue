<template>
  <data-table
      :loader="loadData"
      :headers="headers"
      title="Sub-Categories"
      :allow-add="getUser() ? getUser().scopes.includes('sub-categories:new') : false"
      @add-new="addNew"
      @done="$router.back()"
      :delete-handler="getUser() ? getUser().scopes.includes('sub-categories:delete') ?  service.delete : null : null"
      :edit-handler="getUser() ? getUser().scopes.includes('sub-categories:edit') ? edit : null : null"
  >
  </data-table>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {SubCategoryService} from "@/services/subCategory-service";

export default {
  components: { DataTable },

  mounted() {},

  data: () => ({
    loading: false,
    service: new SubCategoryService(),

    headers: [
      {
        text: 'Name',
        value: 'name',
        sortable: false
      }
    ]
  }),

  methods: {
    getUser,
    addNew() {
      this.$router.push('/sub-category');
    },
    edit(item) {
      this.$router.push(`/sub-category?id=${item.id}`);
    },
    loadData() {
      return this.service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
