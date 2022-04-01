<template>
  <data-table
    :loader="loadData"
    :headers="headers"
    title="Categories"
    :allow-add="getUser() ? getUser().scopes.includes('categories:new') : false"
    @add-new="addNew"
    @done="$router.back()"
    :delete-handler="getUser() ? getUser().scopes.includes('categories:delete') ?  service.delete : null : null"
    :edit-handler="getUser() ? getUser().scopes.includes('categories:edit') ? edit : null : null"
  >
    <template v-slot:subCategories="{ item }">
      <span v-if="item.subCategories && item.subCategories.length > 0">
        {{ item.subCategories.map((e) => e.name).join(', ') }}
      </span>
      <span v-else style="color: #aaa; font-style: italic">
        No Sub Categories
      </span>
    </template>
  </data-table>
</template>

<script>
import DataTable from '../../components/DataTable';
import { CategoryService } from '@/services/category-service';
import {getUser} from '@/utils/local';

export default {
  components: { DataTable },

  mounted() {},

  data: () => ({
    loading: false,
    service: new CategoryService(),

    headers: [
      {
        text: 'Name',
        value: 'name',
        sortable: false
      },
      {
        text: 'Sub Categories',
        value: 'subCategories',
        sortable: false
      }
    ]
  }),

  methods: {
    getUser,
    addNew() {
      this.$router.push('/category');
    },
    edit(item) {
      this.$router.push(`/category?id=${item.id}`);
    },
    loadData() {
      return this.service.fetchAll();
    }
  }
};
</script>

<style scoped></style>
