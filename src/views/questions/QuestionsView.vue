<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Questions"
        :allow-add="getUser() ? getUser().scopes.includes('questions:new') : false"
        allow-filters
        @add-new="addNew"
        @filter="openFilter"
        @done="$router.back()"
        :delete-handler="getUser() ? getUser().scopes.includes('questions:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('questions:edit') ?  edit : null : null"
    >
      <template #primary-action>
        <v-btn @click="openUploadQuestions" elevation="0" class="mr-3">Import</v-btn>
      </template>
      <template #extra-actions="{item}">
        <v-icon v-if="getUser() && getUser().scopes.includes('comments:view')" small color="green"
                @click="openComments(item)">mdi-message
        </v-icon>
      </template>
      <template v-slot:category="{ item }">
        {{ item.category.name }}
      </template>
      <template v-slot:subCategory="{ item }">
        {{ item.subCategory.name }}
      </template>
      <template v-slot:createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template v-slot:type="{ item }">
        {{ getType(item.type) }}
      </template>
      <template #trial="{ item }">
        <v-checkbox hide-details dense v-model="item.trial" @change="toggleTrial($event, item)"/>
      </template>
      <template #for_passage="{ item }">
        <v-checkbox hide-details dense v-model="item.for_passage" readonly/>
      </template>
    </data-table>
    <v-dialog persistent width="40%" v-model="showFilter">
      <v-card>
        <div v-if="!loading">
          <v-card-title>Filter By Field</v-card-title>
          <v-form class="pa-5" ref="filter">
            <v-select v-model="filter.field" outlined dense label="Field" :items="fields"
                      item-text="label" clearable></v-select>
            <div style="display: flex;gap: 20px">
              <v-select :rules="[required()]" :items="categories" return-object item-text="name"
                        @change="getSubCategories"
                        v-if="filter && filter.field && (filter.field === 'category' || filter.field === 'subcategory')"
                        v-model="filter.category" outlined dense label="Category"></v-select>
              <v-select :rules="[required()]" :items="subCategories" return-object item-text="name"
                        v-if="filter && filter.field && filter.field === 'subcategory'" v-model="filter.subcategory"
                        outlined dense label="Sub Category"></v-select>
            </div>
            <div style="display: flex;gap: 20px">
              <v-select :rules="[required()]" v-if="filter && filter.field && filter.field === 'trial'"
                        v-model="filter.trial" outlined dense label="Trail" :items="trials"
                        item-text="label"></v-select>
              <v-select :rules="[required()]" v-if="filter && filter.field && filter.field === 'type'"
                        v-model="filter.type" outlined dense label="Type" :items="types" item-text="label"></v-select>
            </div>
            <v-select :rules="[required()]" v-if="filter && filter.field && filter.field === 'passage'"
                      v-model="filter.passage" outlined dense label="Passage" :items="trials"
                      item-text="label"></v-select>
            <v-select :rules="[required()]" v-if="filter && filter.field && filter.field === 'user'"
                      v-model="filter.user" outlined dense label="User" :items="users" item-text="username"></v-select>
            <v-text-field :rules="[required()]" v-if="filter && filter.field && filter.field === 'date'"
                          v-model="filter.created" outlined dense type="date" label="Created At"></v-text-field>
            <v-select :rules="[required()]" v-if="filter"
                      v-model="filter.sort" outlined dense label="Sort" :items="orders" item-text="label"></v-select>
            <div class="d-flex justify-space-between">
              <v-btn @click="cancelFilter" class="mr-2">Cancel</v-btn>
              <div>
                <v-btn @click="filterClear" class="mr-2">Clear</v-btn>
                <v-btn @click="applyFilter" class="ml-2" color="primary">Apply</v-btn>
              </div>
            </div>
          </v-form>
        </div>
        <div v-else class="pa-16 d-flex justify-center align-center">
          <v-progress-circular indeterminate/>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog persistent width="50%" v-model="showFileUpload">
      <v-card class="px-5 py-7">
        <div v-if="!isUploading">
          <v-card-title class="px-0">{{ isUploaded ? 'Questions Imported' : 'Import Questions By CSV' }}</v-card-title>
          <v-form ref="import">
            <div v-if="isUploaded">
              <div class="d-flex py-5">
                <v-chip class="mr-2" color="primary">Total: {{ this.questions.length }}</v-chip>
                <v-chip class="mr-2" color="success">Completed: {{ this.added }}
                </v-chip>
                <v-chip class="mr-2" color="error">Rejected: {{ this.questions.length - this.added }}</v-chip>
              </div>
              <div class="mb-2">
                <ul style="color: red" v-for="(error,i) of importErrors" :key="i">
                  <li>{{ error.text }} at entry # {{ error.item }}</li>
                </ul>
              </div>
              <div class="d-flex justify-end">
                <v-btn @click="cancelUpload" class="mr-2">OK</v-btn>
                <v-btn @click="newImport" class="ml-2" color="primary">New Import</v-btn>
              </div>
            </div>
            <div v-else>
              <p>Download a <a href="/question_template.csv" download="question_template.csv">sample CSV template</a> to
                see an example of the format required.</p>
              <p>Download <a href="javascript:void(0)" @click="download">Categories & Sub-Categories</a> reference sheet
                to refer to their ids.</p>
              <v-file-input :rules="[required()]" v-model="uploadFile" outlined dense label="Upload CSV" prepend-icon=""
                            accept=".csv"
                            @change="bulkUpload"/>
              <div class="d-flex justify-end">
                <div>
                  <v-btn @click="cancelUpload" class="mr-2">Cancel</v-btn>
                  <v-btn @click="uploadQuestions" class="ml-2" color="primary">Upload</v-btn>
                </div>
              </div>
            </div>
          </v-form>
        </div>
        <div v-else class="pa-16 d-flex justify-center align-center">
          <v-progress-circular indeterminate class="mr-3"/>
          <p class="ma-0">Importing Questions...</p>
        </div>
      </v-card>
    </v-dialog>
    <loading-dialog v-model="loading" message="Loading..."/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {QuestionsService} from '@/services/questions-service';
import {getUser} from '@/utils/local';
import {required} from "@/utils/validators";
import {CategoryService} from "@/services/category-service";
import {UsersService} from "@/services/users-service";
import LoadingDialog from "@/components/LoadingDialog";
import moment from "moment";
import Papa from 'papaparse'

export default {
  components: {LoadingDialog, DataTable},

  data: () => ({
    loading: false,
    service: new QuestionsService(),
    categoryService: new CategoryService(),
    userService: new UsersService(),

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
        text: 'Sub Category',
        value: 'subCategory'
      },
      {
        width: 100,
        text: 'Type',
        value: 'type'
      },
      {
        width: 100,
        text: 'Trial',
        value: 'trial'
      },      {
        width: 100,
        text: 'Passage',
        value: 'for_passage'
      },
      // {
      //   text: 'Created At',
      //   value: 'createdAt'
      // }
    ],

    isFilter: false,

    showFilter: false,

    items: [],
    filter: {
      sort: 'true'
    },
    fields: [
      {
        label: 'Category',
        value: 'category'
      },
      {
        label: 'Sub-Category',
        value: 'subcategory'
      },
      {
        label: 'Trial',
        value: 'trial'
      },
      {
        label: 'Type',
        value: 'type'
      },
      {
        label: 'Passage',
        value: 'passage'
      },
      {
        label: 'Date',
        value: 'date'
      }
    ],
    types: [
      {
        label: 'True / False',
        value: 'bool'
      },
      {
        label: 'Multiple Choice',
        value: 'choices'
      }
    ],
    trials: [
      {
        label: 'Yes',
        value: "true"
      },
      {
        label: 'No',
        value: "false"
      }
    ],
    orders: [
      {
        label: 'Ascending',
        value: 'true'
      },
      {
        label: 'Descending',
        value: 'false'
      }
    ],

    categories: [],
    subCategories: [],
    users: [],

    showFileUpload: false,
    allSubs: [],
    uploadFile: null,
    isUploaded: false,
    isUploading: false,
    questions: [],
    importErrors: [],
    importHeaders: [
      {
        text: 'Question',
        value: 'question',
      },
      {
        text: 'Type',
        value: 'type',
      },
      {
        text: 'Choices',
        value: 'choices',
      },
      {
        text: 'Answer',
        value: 'answer',
      },
      {
        text: 'Trial',
        value: 'trial',
      },
      {
        text: 'Category',
        value: 'category',
      },
      {
        text: 'Sub Category',
        value: 'subcategory',
      },
      {
        text: 'Explanation',
        value: 'explanation',
      }
    ],
    added: 0,

  }),

  mounted() {
    this.getCategories()
    // this.getUsers()
  },

  methods: {
    getUser,
    required,
    async getUsers() {
      this.users = await this.userService.fetchAll()
    },
    async toggleTrial(value, item) {
      this.loading = true
      try {
        const data = {
          trial: value,
          id: item.id
        }
        await this.service.update(data)
      } catch (e) {
        window.console.log(e)
      }
      this.loading = false
    },
    getType(type) {
      if (type === 'bool') {
        return 'True False'
      } else {
        return 'Multiple Choice'
      }
    },
    addNew() {
      this.$router.push('/question');
    },
    edit(item) {
      this.$router.push(`/question?id=${item.id}`);
    },
    loadData() {
      if (!this.isFilter) {
        return this.service.fetchAll();
      } else {
        this.filterData();
        return this.items;
      }
    },
    openFilter() {
      this.showFilter = true
    },
    applyFilter() {
      if (this.$refs.filter.validate()) {
        this.isFilter = true
        document.getElementById('refresh').click()
      }
    },
    filterData() {
      let query
      if (this.$refs.filter.validate()) {
        this.loading = true
        if (this.filter.field === 'category') {
          query = 'type=0&sort=' + this.filter.sort + '&' + 'category=' + this.filter.category.id
        } else if (this.filter.field === 'subcategory') {
          query = 'type=1&sort=' + this.filter.sort + '&' + 'subcategory=' + this.filter.subcategory.id
        } else if (this.filter.field === 'trial') {
          query = 'type=2&sort=' + this.filter.sort + '&' + 'trial=' + (this.filter.trial === "true")
        } else if (this.filter.field === 'type') {
          query = 'type=3&sort=' + this.filter.sort + '&' + 'question-type=' + this.filter.type
        } else if (this.filter.field === 'date') {
          const day = new Date(this.filter.created);
          const startDate = moment(new Date(day)).format('YYYY-MM-DD');
          const nextDay = new Date(day);
          nextDay.setDate(day.getDate() + 1);
          const endDate = moment(new Date(nextDay)).format('YYYY-MM-DD');
          query = 'type=4&sort=' + this.filter.sort + '&' + 'from=' + startDate + '&to=' + endDate
        } else if (this.filter.field === 'passage') {
          query = 'type=5&sort=' + this.filter.sort + '&' + 'passage=' + (this.filter.passage === "true")
        } else {
          query = 'type=10&sort=' + this.filter.sort
        }
        this.items = this.service.filter(query)

        this.isFilter = true
        this.loading = false
        this.showFilter = false
      }
    },
    filterClear() {
      this.$refs.filter.reset()
      this.filter = {
        sort: 'true'
      }
      this.isFilter = false
      this.showFilter = false
      document.getElementById('refresh').click()
    },
    cancelFilter() {
      this.showFilter = false
    },
    async getCategories() {
      this.categories = await this.categoryService.fetchAll()
    },
    getSubCategories(item) {
      this.subCategories = item.subCategories
    },
    formatDate(date) {
      return moment(date).format("DD/MM/YYYY - H:M")
    },
    openUploadQuestions() {
      this.showFileUpload = true
    },
    bulkUpload(item) {
      if (item) {
        const reader = new FileReader()
        reader.onload = e => {
          const data = e.target.result
          const result = Papa.parse(data.toString(), {
            header: true,
            transformHeader: function (header) {
              return header.toLowerCase()
            },
            skipEmptyLines: true
          })
          this.questions = result.data
        }
        reader.readAsText(item)
      }
    },
    async uploadQuestions() {
      if (this.$refs.import.validate()) {
        this.added = 0
        this.isUploading = true
        this.isUploaded = false
        this.importErrors = []
        for (let i = 0; i < this.questions.length; i++) {
          let item = this.questions[i];
          let error = false
          const index = this.questions.indexOf(item);
          const question = {}
          if (item.statement) {
            question.statement = item.statement
          } else {
            this.importErrors.push({
              item: index + 2,
              text: 'Question Statement is missing'
            })
            error = true
          }
          if (item.type && (item.type === 'choices' || item.type === 'bool')) {
            question.type = item.type
          } else {
            this.importErrors.push({
              item: index + 2,
              text: 'Question Type is missing or wrong'
            })
            error = true
          }
          if (item.category) {
            const category = this.categories.find(x => x.id === item.category)
            if (category) {
              this.subCategories = category.subCategories
              question.category = {
                id: category.id,
                name: category.name
              }
            } else {
              this.importErrors.push({
                item: index + 2,
                text: 'Question Category is wrong'
              })
              error = true
            }
          } else {
            this.importErrors.push({
              item: index + 2,
              text: 'Question Category is missing'
            })
            error = true
          }
          if (item.subcategory) {
            const subCategory = this.subCategories.find(x => x.id === item.subcategory)
            if (subCategory) {
              question.subcategory = {
                id: subCategory.id,
                name: subCategory.name
              }
            } else {
              this.importErrors.push({
                item: index + 2,
                text: 'Question Sub-Category is wrong'
              })
              error = true
            }
          } else {
            this.importErrors.push({
              item: index + 2,
              text: 'Question Subcategory is missing'
            })
            error = true
          }
          if (item.explanation) {
            question.explanation = item.explanation
          } else {
            this.importErrors.push({
              item: index + 2,
              text: 'Question Explanation is missing'
            })
            error = true
          }
          if (item.type === 'choices') {
            if (item.a && item.b && item.c && item.d) {
              question.options = [
                item.a, item.b, item.c, item.d
              ]
              if (item.answer && (item.answer === 'a' || item.answer === 'b' || item.answer === 'c' || item.answer === 'd')) {
                switch (item.answer) {
                  case 'a':
                    question.answer = 0
                    break
                  case 'b':
                    question.answer = 1
                    break
                  case 'c':
                    question.answer = 2
                    break
                  case 'd':
                    question.answer = 3
                    break
                  default:
                    this.importErrors.push({
                      item: index + 1,
                      text: 'Question Answer is missing or wrong'
                    })
                    error = true
                }
              } else {
                this.importErrors.push({
                  item: index + 2,
                  text: 'Question Answer is missing or wrong'
                })
                error = true
              }
            } else {
              this.importErrors.push({
                item: index + 2,
                text: 'Question Choices are missing'
              })
              error = true
            }
          } else {
            if (item.a && item.b) {
              question.options = [
                item.a, item.b
              ]
              if (item.answer && (item.answer === 'a' || item.answer === 'b')) {
                switch (item.answer) {
                  case 'a':
                    question.answer = 0
                    break
                  case 'b':
                    question.answer = 1
                    break
                  default:
                    this.importErrors.push({
                      item: index + 2,
                      text: 'Question Answer is missing or wrong'
                    })
                    error = true
                }
              } else {
                this.importErrors.push({
                  item: index + 2,
                  text: 'Question Answer is missing or wrong'
                })
                error = true
              }
            } else {
              this.importErrors.push({
                item: index + 2,
                text: 'Question Answer is missing or wrong'
              })
              error = true
            }
          }
          question.trial = false
          question.createdAt = new Date()
          if (!error) {
            await this.service.create(question).then(() => {
              this.added += 1
              return true;
            }).catch((e) => {
              this.importErrors.push({
                item: index + 2,
                text: e
              })
            })
          }
        }
        this.isUploading = false
        this.isUploaded = true
      }
    },
    cancelUpload() {
      if (this.isUploaded) {
        document.getElementById('refresh').click()
      }
      this.uploadFile = null
      this.isUploaded = false
      this.isUploading = false
      this.showFileUpload = false
    },
    newImport() {
      this.questions = []
      this.uploadFile = null
      this.importErrors = []
      this.isUploading = false
      this.isUploaded = false
    },
    async download() {
      let name, blob;
      const csv = this.toCSV(this.categories)
      name = 'categories-subCategories.csv'
      blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", name);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    toCSV(items) {
      const array = typeof items != 'object' ? JSON.parse(items) : items;
      let str = 'Category Name,Category ID,Sub-Category Name,Sub-Category ID\r\n';

      for (let i = 0; i < array.length; i++) {
        let line = '';
        array[i].name = array[i].name.replaceAll(',', ' ')
        line += array[i].name + ',' + array[i].id
        line += '\r\n'

        for (let j = 0; j < array[i].subCategories.length; j++) {
          array[i].subCategories[j].name = array[i].subCategories[j].name.replaceAll(',', ' ')
          line += ',,' + array[i].subCategories[j].name + ',' + array[i].subCategories[j].id
          line += '\r\n'
        }


        str += line + '\r\n'

      }

      return str
    },
    openComments(item) {
      this.$router.push(`/question/comment?id=${item.id}`);
    }
  }
};
</script>

<style scoped></style>
