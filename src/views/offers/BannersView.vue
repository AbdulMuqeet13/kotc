<template>
  <div>
    <data-table
        ref="table"
        title="Banners"
        :allow-add="getUser() ? getUser().scopes.includes('banners:new') : false"
        :loader="loadBanners"
        :headers="headers"
        :delete-handler="getUser() ? getUser().scopes.includes('banners:delete') ?  deleteHandler : null : null"
        @add-new="openEditor"
    >
      <template #placementPage="{ item }">
        {{ getBannerPage(item.placementPage) }}
      </template>
      <template #placementPosition="{ item }">
        {{ getBannerPosition(item.placementPosition) }}
      </template>
      <template #action="{ item }">
        {{ getBannerAction(item.action) }}
      </template>
      <template #active="{ item }">
        <v-checkbox hide-details dense v-model="item.active" readonly/>
      </template>
      <template #ios="{ item }">
        <v-checkbox hide-details dense v-model="item.ios" readonly/>
      </template>
      <template #android="{ item }">
        <v-checkbox hide-details dense v-model="item.android" readonly/>
      </template>
      <template #images="{ item }">
        <img
            v-if="item.image"
            :src="`${url}/uploads/${item.image}`"
            alt="Default Image"
            width="50"
            height="50"
            :style="{
              background: 'white',
              border: '2px solid white',
              borderRadius: '50px'
              }"
        />
        <p class="ma-0" v-else>No Image</p>
      </template>
      <template #extra-actions="{ item }">
        <v-icon v-if="!item.active" small color="success" @click="updateBannerStatus(item, 1)">mdi-check</v-icon>
        <v-icon v-if="item.active" small color="error" @click="updateBannerStatus(item, 0)">mdi-close</v-icon>
        <v-icon small color="success" @click="editBanner(item)">mdi-pencil</v-icon>
      </template>
    </data-table>
    <v-dialog v-model="editor" width="400">
      <v-card style="padding: 40px">
        <v-form ref="banner">
          <file-pond
              :instantUpload="false"
              :files="uploadedImages"
              label-idle="Drop or Attach Image"
              accepted-file-types="image/*"
              @removefile="imageRemoved"
              @addfile="imageAdded"
              :server="{ load: loadFile }"
          />
          <img
              v-if="this.images[0] && typeof this.images[0] !== 'object'"
              :src="`${url}/uploads/${this.images[0]}`"
              alt="Default Image"
              :style="{
                width: '100%',
              }"
          />

          <div class="span-2 mb-3">
            <v-checkbox hide-details v-model="active" label="Active"/>
            <v-checkbox
                v-model="android"
                dense
                label="For Android"
                hide-details
            />
            <v-checkbox
                v-model="ios"
                dense
                label="For iOS"
                hide-details
            />
          </div>
          <v-text-field
              v-model="duration"
              outlined
              dense
              label="Duration (Seconds)"
              :rules="[requiredV2]"
              type="number"
          />
          <v-select
              v-model="placementPage"
              outlined
              dense
              label="Placement Page"
              :items="placementPages"
              item-text="label"
              @change="placementPageChanged"
              :rules="[required()]"
          >
          </v-select>
          <v-select
              v-model="placementPosition"
              outlined
              dense
              label="Placement Position"
              :items="placementPositions"
              item-text="label"
              :rules="[required()]"
          >
          </v-select>
          <v-select
              v-model="action"
              outlined
              dense
              label="Action"
              :items="actions"
              item-text="label"
              :rules="[required()]"
          >
          </v-select>
          <v-text-field
              v-if="action === 10"
              v-model="link"
              dense
              outlined
              label="Action Link"
              :rules="[required()]"
          />
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
import {BannersService} from '@/services/banners-service';
import LoadingDialog from '../../components/LoadingDialog';
import axios from 'axios';
import ErrorDialog from '../../components/ErrorDialog';
import {getUser} from '@/utils/local';
import {requiredV2, required} from "@/utils/validators";
import {getBannerPage, getBannerPosition, getBannerAction} from "@/utils/local";


export default {
  name: 'BannersView',
  components: {ErrorDialog, LoadingDialog, DataTable},

  data: () => ({
    editor: false,
    headers: [
      {
        value: 'images',
        text: 'Images'
      },
      {
        value: 'placementPage',
        text: 'Placement Page'
      },
      {
        value: 'placementPosition',
        text: 'Placement Position'
      },
      {
        value: 'action',
        text: 'Placement Action'
      },
      {
        value: 'duration',
        text: 'Duration'
      },
      {
        value: 'click_count',
        text: 'Click Count'
      },
      {
        value: 'active',
        text: 'Active'
      }, {
        width: 100,
        text: 'For iOS',
        value: 'ios'
      },
      {
        width: 120,
        text: 'For Android',
        value: 'android'
      }
    ],

    error: false,
    errorValue: {},

    images: [],
    isEdit: false,
    duration: 0,
    placementPage: '',
    placementPosition: '',
    action: '',
    link: '',
    active: true,
    ios: true,
    android: true,
    count: 0,
    placementPages: [
      {
        label: 'Friends',
        value: 1
      },
      {
        label: 'Matches',
        value: 2
      },
      {
        label: 'Question Page',
        value: 3
      },
      {
        label: 'Multiplayer Menu',
        value: 4
      },
      {
        label: 'Single Player Menu',
        value: 5
      },
      {
        label: 'My Stats',
        value: 6
      },
      {
        label: 'Your Answer',
        value: 7
      },
      {
        label: 'Endless Menu',
        value: 8
      },
      {
        label: 'Home Page',
        value: 9
      },
      {
        label: 'Adaptive bank Menu',
        value: 10
      },
      {
        label: 'Game over',
        value: 11
      },
      {
        label: 'Review Mode Menu',
        value: 12
      }
    ],
    actions: [
      {
        label: 'Show Subscription Packages',
        value: 1
      },
      {
        label: 'Play Endless Mode',
        value: 2
      },
      {
        label: 'Play Adaptive Qbank',
        value: 3
      },
      {
        label: 'Spin to get Random Discount',
        value: 4
      },
      {
        label: 'Play Multiplayer',
        value: 5
      },
      {
        label: 'Play Review Mode',
        value: 6
      },
      {
        label: 'Link Institution',
        value: 7
      },
      {
        label: 'Play Timed Mode',
        value: 8
      },
      {
        label: 'Share Feedback',
        value: 9
      },
      {
        label: 'Open Link',
        value: 10
      }
    ],
    placementPositions: [
      {
        label: 'Top',
        value: 1
      },
      {
        label: 'Bottom',
        value: 2
      }
    ],
    positions: [],
    loading: false,
    loadingMessage: '',
    imagesToBeDeleted: [],
    service: new BannersService(),
    uploadedImages: [],
    id: '',
  }),

  computed: {
    url() {
      return axios.defaults.baseURL;
    },
  },

  methods: {
    getUser,
    requiredV2,
    required,
    getBannerPage,
    getBannerPosition,
    getBannerAction,
    placementPageChanged(item) {
      this.positions = [...this.placementPositions]
      if (item === 1 || item === 2 || item === 4 || item === 6) {
        this.positions.splice(1, 1)
      } else if (item === 3 || item === 8 || item === 9 || item === 10 || item === 11 || item === 12) {
        this.positions.splice(0, 1)
      }
    },
    loadBanners() {
      return this.service.fetchAll();
    },
    imageRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.filename);
        this.uploadedImages.splice(
            this.uploadedImages.indexOf(file.filename),
            1
        );
      }
    },
    async saveBanner() {
      if (this.$refs.banner.validate()) {
        let image;

        if (this.images.length === 0 && !this.isEdit) {
          this.error = true;
          this.errorValue = {
            title: `Error while ${this.isEdit ? 'Updating' : 'Creating'} Banner`,
            description: 'Please provide at least one image'
          };
          return
        }

        try {
          this.loading = true;
          if (!this.isEdit) {
            this.loadingMessage = 'Creating New Banner'
          } else {
            this.loadingMessage = 'Updating Banner'
          }

          if (this.images.length > 0 && this.images[0].file) {
            const formData = new FormData();
            formData.append('file', this.images[0].file);

            image = (await this.$axios.put('/uploads', formData)).data.id;
          }

          const obj = {
            click_count: this.count,
            placementPage: this.placementPage,
            placementPosition: this.placementPosition,
            action: this.action,
            link: this.link,
            active: this.active,
            ios: this.ios,
            android: this.android,
            duration: parseInt(this.duration)
          };
          obj.image = image ? image : this.images[0]
          if (this.isEdit) {
            obj.id = this.id
            await this.$axios.patch('/banners', obj);
          } else {
            await this.$axios.post('/banners', obj);
          }
          this.$refs.banner.reset()

          document.getElementById('refresh').click()

          this.editor = false;
          this.loading = false;
          this.isEdit = false
        } catch (e) {
          this.loading = false;
          this.error = true;
          this.errorValue = {
            title: `Error while ${this.isEdit ? 'Updating' : 'Creating'} Banner`,
            description: e?.data?.error ?? 'Some error occurred'
          };
        }
      }
    },
    imageAdded(error, file) {
      this.images = []
      if (!error && !file.getMetadata().uploaded) this.images.push(file);
    },
    openEditor() {
      this.id = null
      this.count = 0
      this.images = [];
      this.editor = true;
      this.placementPage = null;
      this.uploadedImages = [];
      this.placementPosition = null;
      this.action = null;
      this.duration = 0;
      this.link = null;
      this.isEdit = false
    },
    loadFile(source, load) {
      axios
          .get('/uploads/' + source, {responseType: 'blob'})
          .then((res) => res.data)
          .then(load);
    },
    async deleteHandler(item) {
      if (item.image)
        await axios.delete('/uploads/' + item.image);
      return axios.delete('/banners/' + item.id);
    },
    editBanner(item) {
      this.count = item.click_count
      this.images = [item.image]
      this.uploadedImages = []
      this.placementPage = item.placementPage
      this.placementPosition = item.placementPosition
      this.action = item.action
      this.active = item.active
      this.ios = item.ios
      this.android = item.android
      this.duration = item.duration
      this.link = item.link
      this.id = item.id
      this.editor = true
      this.isEdit = true
    },
    async updateBannerStatus(item, option) {
      if (option === 0) {
        item.active = false
        await this.$axios.patch('/banners', item);
      } else if (option === 1) {
        item.active = true
        await this.$axios.patch('/banners', item);
      }
      document.getElementById('refresh').click()
    }
  }
};
</script>

<style scoped></style>
