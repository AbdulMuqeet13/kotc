<template>
  <div class="span-2">
    <div
        class="span-2"
        style="
      border-left: 2px dotted rgba(0, 0, 0, 0.2);
      margin-bottom: 30px;
      padding-top: 30px;
    "
    >
      <div v-for="(subcategory, key) in subcategories" :key="key" class="flex-row">
        <div class="h-dots"/>
        <v-autocomplete
            v-model="subcategories[key]"
            :label="'Sub Category ' + (key + 1)"
            outlined
            auto-grow
            rows="1"
            :rules="[required()]"
            placeholder="Select Sub Category"
            persistent-placeholder
            :items="items"
            :search-input.sync="searchSubCategory[key]"
            return-object
            item-text="name"
            dense>
          <template v-slot:no-data>
            <div class="d-flex justify-space-between mx-2 align-center">
              <span>No Matching Sub Category Found</span>
              <v-btn small color="primary" elevation="0" @click="saveSubCategory(key)">Add New</v-btn>
            </div>
          </template>
        </v-autocomplete>
        <!--            <v-textarea-->
        <!--                v-model="subcategory.name"-->
        <!--                :label="'Sub Category ' + (key + 1)"-->
        <!--                outlined-->
        <!--                auto-grow-->
        <!--                rows="1"-->
        <!--                placeholder="Write name of sub category"-->
        <!--                persistent-placeholder-->
        <!--                dense-->
        <!--            />-->
        <v-btn icon color="red" @click="removeAnswer(key)">
          <v-icon>mdi-minus-circle</v-icon>
        </v-btn>
      </div>

      <div class="flex-row" style="position: relative">
        <div class="h-dots"/>
        <v-btn
            text
            class="add-btn"
            color="primary"
            @click="addAnswer"
        >
          <v-icon style="margin-right: 10px">mdi-plus-circle</v-icon>
          Add Sub Category
        </v-btn>
      </div>
    </div>
    <LoadingDialog v-model="subLoading"/>
  </div>
</template>

<script>
import {SubCategoryService} from "@/services/subCategory-service";
import {required} from '@/utils/validators';
import LoadingDialog from "@/components/LoadingDialog";

export default {
  name: 'SubCategoryPicker',
  components: {LoadingDialog},
  model: {
    prop: 'subcategories',
    event: 'subcategories'
  },

  props: {
    subcategories: {
      type: Array,
      default: () => []
    },
  },
  data: () => ({
    service: new SubCategoryService(),
    items: [],
    searchSubCategory: [],
    subLoading: false
  }),

  mounted() {
    this.getSubCategories()
  },

  methods: {
    required,
    addAnswer() {
      const answers = [...this.subcategories, {}];
      this.$emit('subcategories', answers);
    },
    removeAnswer(index) {
      this.subcategories.splice(index, 1);
      this.$emit('subcategories', this.subcategories);
    },
    async getSubCategories() {
      this.items = await this.service.fetchAll()
    },
    async saveSubCategory(key) {
      this.subLoading = true
      try {
        const data = {
          name: this.searchSubCategory[key]
        }
        const subcategory = await this.service.create(data);
        subcategory.name = this.searchSubCategory[key]
        await this.getSubCategories()
        this.subcategories[key] = subcategory
        this.subLoading = false
      } catch (e) {
        this.subLoading = false
      }
    }
  }
};
</script>

<style lang="sass" scoped>
.add-btn
  position: absolute

.flex-row
  display: flex
  align-items: flex-start

.h-dots
  border-top: 2px dotted rgba(0, 0, 0, .2)
  width: 15px
  margin-top: 18px
</style>

<style lang="sass">
.add-btn
  position: absolute

.flex-row
  display: flex
  align-items: flex-start

.h-dots
  border-top: 2px dotted rgba(0, 0, 0, .2)
  width: 15px
  margin-top: 18px
</style>
