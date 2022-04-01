<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title"> {{ isEdit ? 'Update Sub Category' : 'Add a new Sub Category' }}</p>

    <v-text-field
        v-model="subCategory.name"
        dense
        label="Sub Category Name"
        :rules="[required('You must write a name')]"
        class="span-2"
        outlined
    />

    <loading-dialog v-model="loading" />
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';

import { required } from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import {SubCategoryService} from "@/services/subCategory-service";

export default {
  components: { LoadingDialog, SimpleForm },

  data: () => ({
    isEdit: false,
    loading: false,
    service: new SubCategoryService(),

    subCategory: {}
  }),

  mounted() {
    this.loadSubCategory();
  },

  methods: {
    required,
    async loadSubCategory() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.subCategory = await this.service.fetchOne(this.$route.query.id);
      this.loading = false;
    },

    async submit(context) {
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Sub Category');
        try {
          await this.service.update(this.subCategory);
          return true
        } catch (e) {
          context.reportError({
            title: 'Error while updating Sub Category',
            description: e.response?.data?.error
          })

          return false
        }
      } else {
        context.changeLoadingMessage('Creating A New Sub Category');
        try {
          await this.service.create(this.subCategory);
          return true
        } catch (e) {
          context.reportError({
            title: 'Error while creating Sub Category',
            description: e.response?.data?.error
          })

          return false
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
