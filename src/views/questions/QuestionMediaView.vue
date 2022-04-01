<template>
  <data-table
      :loader="loadData"
      :headers="headers"
      title="Question Media"
      :allow-add="getUser() ? getUser().scopes.includes('question-media:new') : false"
      @add-new="addNew"
      @done="$router.back()"
      :delete-handler="getUser() ? getUser().scopes.includes('question-media:delete') ?  service.delete : null : null"
      :edit-handler="getUser() ? getUser().scopes.includes('question-media:edit') ? edit : null : null"
  >
    <template #images="{ item }">
      <span v-if="item.images && item.images.length > 0">{{ fetchImage(item.images[0]) }}</span>
    </template>
    <template #keywords="{ item }">
      <v-chip class="ma-1" v-for="(keyword, i) of item.keywords.slice(0,5)" :key="i" small>{{ keyword }}</v-chip>
    </template>
    <template #questions="{ item }">
      <span v-if="item.questions">
              <v-chip class="ma-1" v-for="(question, i) of item.questions.slice(0,3)" :key="i"
                      small>{{ question.substring(0, 75) }} ...</v-chip>
      </span>
    </template>
  </data-table>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {QuestionMediaService} from "@/services/question_media-service";
import {storage} from "@/plugins/firebase";

export default {
  components: {DataTable},

  mounted() {
  },

  data: () => ({
    loading: false,
    service: new QuestionMediaService(),

    headers: [
      {
        text: 'Image',
        value: 'images',
        width: 120
      },
      {
        text: 'Keywords',
        value: 'keywords',
        sortable: false,
        width: '30%'
      },
      {
        text: 'Questions',
        value: 'questions',
        sortable: false,
        width: '30%'
      }
    ]
  }),

  methods: {
    getUser,
    addNew() {
      this.$router.push('/question-media');
    },
    edit(item) {
      this.$router.push(`/question-media?id=${item.id}`);
    },
    loadData() {
      return this.service.fetchAll();
    },
    fetchImage(img) {
      const name = storage.refFromURL(img).name
      return name.substring(0 , name.indexOf('~') !== -1 ? name.indexOf('~') : name.length );
    }
  }
};
</script>

<style scoped></style>
