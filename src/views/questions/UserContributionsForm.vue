<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()" :disabled="isReadOnly">
    <p class="span-2 form__title">{{ isEdit ? 'Update Question' : 'Add a new Question' }}</p>

    <v-select
        v-model="question.type"
        label="Select Type"
        :items="types"
        item-text="text"
        item-value="value"
        :rules="[required('You must select a question type')]"
        filled
        dense
        :readonly="isReadOnly"
        class="span-2"
    />
    <v-textarea
        v-model="question.statement"
        dense
        label="Question Statement"
        :rules="[required('You must write a question statement')]"
        class="span-2 modified-message"
        :readonly="isReadOnly"
        outlined
    />

    <answers-picker
        v-model="question.options"
        :selected="question.answer"
        @selected="question.answer = $event"
        :picker-type="question.type"
        style="margin-top: -25px; margin-left: 25px"
    />

    <v-select
        v-model="question.category"
        label="Select Category"
        item-text="name"
        item-value="id"
        :readonly="isReadOnly"
        return-object
        :items="categories"
        :loading="loadingCategories"
        :rules="[required('Select a category')]"
        outlined
        dense
        @change="subCategories = question.category.subCategories"
    />
    <v-select
        v-model="question.subCategory"
        :disabled="!question.category"
        label="Select Subcategory"
        item-text="name"
        :readonly="isReadOnly"
        return-object
        :items="subCategories"
        :rules="[required('Select a sub-category')]"
        outlined
        dense
    />

    <v-divider class="span-2" style="margin-bottom: 20px"/>

    <v-textarea
        v-model="question.explanation"
        dense
        :rules="[required()]"
        label="Answer Explanation"
        :readonly="isReadOnly"
        class="span-2"
        outlined
    />

    <loading-dialog v-model="loading" message="Loading Question Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import AnswersPicker from '../../components/questions/AnswersPicker';


import {required} from '@/utils/validators';
import {CategoryService} from '@/services/category-service';
import LoadingDialog from '../../components/LoadingDialog';
import {UserContributionService} from "@/services/user_contribution-service";

export default {
  name: 'Form',
  components: {LoadingDialog, AnswersPicker, SimpleForm},

  data: () => ({
    isEdit: false,
    isReadOnly: false,
    question: {
      options: [],
      selected: null
    },
    loading: false,
    categories: [],

    subCategories: [],
    service: new UserContributionService(),
    categoriesService: new CategoryService(),
    loadingCategories: false,

    types: [
      {
        text: 'Multiple Choice Question',
        value: 'choices'
      },
      {
        text: 'Boolean (True/False)',
        value: 'bool'
      }
    ],
  }),

  mounted() {
    this.loadQuestion().then(() => {
      this.loadCategories();
    });
  },

  methods: {
    required,
    async loadCategories() {
      this.loadingCategories = true;
      this.categories = await this.categoriesService.fetchAll();
      for (const item of this.categories) {
        if (this.question.category?.id === item.id) {
          this.subCategories = item.subCategories;
          break;
        }
      }
      this.loadingCategories = false;
    },
    async loadQuestion() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.question = await this.service.fetchOne(this.$route.query.id);
      this.isReadOnly = this.question.status !== 0
      this.loading = false;
    },
    async submit(context) {
      if (this.question.type === 'choices') {
        if (this.question.options.length < 4) {
          context.reportError({
            title: 'Invalid Question Data',
            description: 'Provided Question does not have enough answer choices, A Multiple Choice question must have at least 4 options'
          });
          return false
        }
      }

      if (this.isEdit) {
        context.changeLoadingMessage('Updating Question');
        try {
          await this.service.update(this.question);
          return true;
        } catch (e) {
          return false;
        }
      } else {
        context.changeLoadingMessage('Creating A New Question');
        try {
          await this.service.create(this.question);
          return true;
        } catch (e) {
          return false;
        }
      }
    },
  }
};
</script>

<style scoped>
.modified-message >>> div {
  text-align: center;
}

p {
  font-weight: bold;
  text-align: left;
}

.file-pickers {
  display: grid;
  grid-column-gap: 20px;
  grid-template-columns: auto;
}
</style>
