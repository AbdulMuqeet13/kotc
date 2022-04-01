<template>
  <div>
    <data-table
        ref="table"
        title="Popups"
        :loader="loadBanners"
        :headers="headers"
        :allow-add="getUser() ? getUser().scopes.includes('popups:new') : false"
        :edit-handler="getUser() ? getUser().scopes.includes('popups:edit') ? editHandler : null : null"
        :delete-handler="getUser() ? getUser().scopes.includes('popups:delete') ?  deleteHandler : null : null"
        @add-new="openEditor"
    >
      <template #endingTime="{ item }">
        {{ formatDate(item.endingTime) }}
      </template>
    </data-table>
    <v-dialog v-model="editor" width="400">
      <v-card style="padding: 40px">
        <v-form ref="offer">
          <p class="span-2 form__title">{{ isEdit ? 'Update Popup' : 'Create New Popup' }}</p>

          <v-text-field
              v-model="title"
              dense
              :rules="[required()]"
              outlined
              label="Title"
          />

          <v-menu
              ref="menu"
              :close-on-content-click="false"
              :return-value.sync="endingTime"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="endingTime"
                  :value="formatDate(endingTime)"
                  label="Picker in menu"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  dense
                  outlined
                  v-bind="attrs"
                  v-on="on"
              />
            </template>
            <v-date-picker v-model="endingTime" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menu = false"> Cancel</v-btn>
              <v-btn text color="primary" @click="$refs.menu.save(endingTime)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>

          <v-btn
              style="width: 100%"
              elevation="0"
              color="primary"
              @click="saveBanner"
          >Submit
          </v-btn>
        </v-form>
      </v-card>
    </v-dialog>

    <loading-dialog v-model="loading" :message="loadingMessage"/>
    <error-dialog v-model="error" :error="errorValue"/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import LoadingDialog from '../../components/LoadingDialog';
import axios from 'axios';
import ErrorDialog from '../../components/ErrorDialog';
import {PopupsService} from '@/services/popups-service';
import {required} from '@/utils/validators';
import dayjs from 'dayjs';
import {getUser} from '@/utils/local';

export default {
  name: 'PopupsView',
  components: {ErrorDialog, LoadingDialog, DataTable},

  data: () => ({
    editor: false,
    headers: [
      {
        value: 'title',
        text: 'Title'
      },
      {
        value: 'endingTime',
        text: 'Ending Time'
      }
    ],

    error: false,
    errorValue: {},

    isEdit: false,

    title: '',
    endingTime: new Date(),

    id: '',
    loading: false,
    loadingMessage: '',
    uploadedImages: [],
    imagesToBeDeleted: [],
    service: new PopupsService()
  }),

  computed: {
    url() {
      return axios.defaults.baseURL;
    }
  },

  methods: {
    getUser,
    required,
    loadBanners() {
      return this.service.fetchAll();
    },

    async saveBanner() {
      if (!this.$refs.offer.validate()) return;

      try {
        this.loading = true;
        this.loadingMessage = 'Creating New Offer'
        const obj = {
          title: this.title,
          endingTime: new Date(Date.parse(this.endingTime)).toISOString()
        };

        if (this.isEdit) {
          obj['id'] = this.id
          await this.service.update(obj);
        } else {
          await this.service.create(obj);
        }
        this.$refs.offer.reset()
        document.getElementsByClassName('refresh').forEach((item) => {
          item.click()
        })

        this.editor = false;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.errorValue = {
          title: `Error while ${this.isEdit ? 'Updating' : 'Creating'} Popups`,
          description: e?.response?.data?.error ?? 'Some error occurred'
        };
      }
    },

    imageAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.images.push(file);
    },

    editHandler(item) {
      this.id = item.id;
      this.editor = true;
      this.isEdit = true;
      this.title = item.title;
      this.endingTime = this.formatDate2(item.endingTime);
    },

    openEditor() {
      this.id = null;
      this.isEdit = false;
      this.editor = true;
      this.title = '';
      this.endingTime = '';
    },

    formatDate(date) {
      if (date)
        return dayjs(date).format('D MMM YYYY');
    },

    formatDate2(date) {
      return dayjs(date).format('YYYY-MM-DD');
    },

    async deleteHandler(item) {
      return this.service.delete(item);
    }
  }
};
</script>

<style scoped></style>
