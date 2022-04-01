<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Flashcards"
        :allow-add="getUser() ? getUser().scopes.includes('flashcards:new') : false"
        @add-new="addNew"
        @done="$router.back()"
        :delete-handler="getUser() ? getUser().scopes.includes('flashcards:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('flashcards:edit') ? edit : null : null"
    >
      <template #difficulty="{ item }">
        <p v-if="item.difficulty === 0" class="ma-0">Easy</p>
        <p v-else-if="item.difficulty === 1" class="ma-0">Medium</p>
        <p v-else class="ma-0">Hard</p>

      </template>
    </data-table>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {FlashcardsService} from "@/services/flashcards-service";


export default {
  components: {DataTable},

  data: () => ({
    loading: false,
    loadingDialog: false,
    service: new FlashcardsService(),

    headers: [
      {
        text: 'Name',
        value: 'name'
      },
    ]
  }),

  methods: {
    getUser,
    edit(item) {
      this.$router.push(`/flashcard?id=${item.id}`);
    },
    addNew() {
      this.$router.push('/flashcard');
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
