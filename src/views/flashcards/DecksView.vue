<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Decks"
        :allow-add="getUser() ? getUser().scopes.includes('decks:new') : false"
        @add-new="addNew"
        @done="$router.back()"
        :delete-handler="getUser() ? getUser().scopes.includes('decks:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('decks:edit') ? edit : null : null"
    >
      <template #is_premium="{ item }">
        <v-checkbox hide-details dense v-model="item.is_premium" readonly/>
      </template>
    </data-table>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {DecksService} from "@/services/deck-service";


export default {
  components: {DataTable},

  data: () => ({
    loading: false,
    loadingDialog: false,
    service: new DecksService(),

    headers: [
      {
        text: 'Name',
        value: 'name'
      },
      {
        width: 100,
        text: 'Is Premium',
        value: 'is_premium',
        sortable: false
      }
    ]
  }),

  methods: {
    getUser,
    edit(item) {
      this.$router.push(`/deck?id=${item.id}`);
    },
    addNew() {
      this.$router.push('/deck');
    },
    loadData() {
      return this.service.fetchAll();
    }
  }
};
</script>

<style lang="sass" scoped>
.chip
  font-weight: 500
  padding: 5px 10px
  border-radius: 50px
  background: lightgray
</style>
