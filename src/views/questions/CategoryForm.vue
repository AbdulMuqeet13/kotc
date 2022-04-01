<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title"> {{ isEdit ? 'Update Category' : 'Add a new Category' }}</p>

    <v-text-field
        v-model="category.name"
        dense
        label="Category Name"
        :rules="[required('You must write a name')]"
        class="span-2"
        outlined
    />

    <sub-category-picker
        v-model="category.subCategories"
        style="margin-top: -25px; margin-left: 25px"
    />

    <loading-dialog v-model="loading" message="Loading..."/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';

import {required} from '@/utils/validators';
import SubCategoryPicker from '../../components/questions/SubCategoryPicker';
import {CategoryService} from '@/services/category-service';
import LoadingDialog from '../../components/LoadingDialog';

export default {
  components: {LoadingDialog, SubCategoryPicker, SimpleForm},

  data: () => ({
    isEdit: false,
    loading: false,
    service: new CategoryService(),

    category: {
      subCategories: []
    }
  }),

  mounted() {
    this.loadCategory();
  },

  methods: {
    required,
    async loadCategory() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.category = await this.service.fetchOne(this.$route.query.id);
      this.loading = false;
    },

    preCheck(context) {
      if (!context.validate()) return false;
      let count = 0
      if (this.category.subCategories && this.category.subCategories.length > 0) {
        this.category.subCategories.forEach((item) => {
          if (!item.id || !item.name) {
            count++
          }
        })
      }
      if (count > 0) {
        context.reportError({
          title: 'Invalid Category Data',
          description:
              'One or more subcategory is not selected.'
        });
        return false;
      }

      return true;
    },

    async submit(context) {
      if (this.preCheck(context)) {
        if (this.isEdit) {
          context.changeLoadingMessage('Updating Category');
          try {
            await this.service.update(this.category);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error while updating Category',
              description: e.response?.data?.error
            })

            return false
          }
        } else {
          context.changeLoadingMessage('Creating A New Category');
          try {
            await this.service.create(this.category);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error while creating Category',
              description: e.response?.data?.error
            })

            return false
          }
        }
      }
    }
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
