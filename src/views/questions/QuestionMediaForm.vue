<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Question Media' : 'Add New Question Media' }}</p>

    <v-combobox
        v-model="questionMedia.keywords"
        multiple
        label="Keywords"
        class="span-2"
        :delimiters="[',']"
        append-icon=""
        :rules="[requiredArray()]"
        chips
        deletable-chips
        outlined
        :search-input.sync="search"
        @update:search-input="getKeywords"
    />


    <v-divider class="span-2" style="margin-bottom: 20px"/>

    <div class="span-2 file-pickers">
      <file-pond
          allow-multiple
          :instantUpload="false"
          :files="uploadedImages"
          label-idle="Drop or Attach Images"
          accepted-file-types="image/*"
          @removefile="imageRemoved"
          @addfile="imageAdded"
          :server="{ load: loadFile }"
      />
      <file-pond
          allow-multiple
          :instantUpload="false"
          :files="uploadedVideos"
          accepted-file-types="video/*"
          label-idle="Drop or Attach Videos"
          @removefile="videoRemoved"
          @addfile="videoAdded"
          :server="{ load: loadFile }"
      />

      <file-pond
          allow-multiple
          :instantUpload="false"
          :files="uploadedPdfs"
          label-idle="Drop or Attach PDFs"
          accepted-file-types="application/pdf"
          @removefile="pdfRemoved"
          @addfile="pdfAdded"
          :server="{ load: loadFile }"
      />

    </div>
    <v-divider v-if="isEdit && questionMedia.questions" class="span-2" style="margin-bottom: 20px"/>

    <v-combobox
        v-model="questionMedia.questions"
        multiple
        readonly
        v-if="isEdit && questionMedia.questions"
        label="Questions"
        class="span-2"
        append-icon=""
        :rules="[requiredArray()]"
        chips
        outlined

    />

    <loading-dialog v-model="loading" message="Loading Question Media Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';

import vueFilePond from 'vue-filepond';

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginMediaPreview from 'filepond-plugin-media-preview';
import FilePondPluginPdfPreview from "filepond-plugin-pdf-preview";
import {required, requiredArray} from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import {QuestionMediaService} from "@/services/question_media-service";
import {storage} from "@/plugins/firebase";

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginMediaPreview,
    FilePondPluginPdfPreview
);

async function deleteFiles(context, list, message) {
  context.changeLoadingMessage(message + ' ...');
  for (const item of list) {
    context.changeLoadingMessage(message + ': ' + item);
    const fileRef = storage.refFromURL(item);
    fileRef.delete().then(() => {
      window.console.log('file deleted')
    }).catch((e) => {
      window.console.log(e)
    })
  }
}

async function uploadWithMessage(context, list, message, type) {
  context.changeLoadingMessage(message + ' ...');

  const newList = [];
  for (const item of list) {
    const fileName = item.filename + '~' + new Date().getTime() + '' + item.fileExtension
    let reference = storage.ref(type + '/' + fileName);
    let task = reference.put(item.file);
    await task.then(async () => {
      newList.push(await storage.ref(type).child(fileName).getDownloadURL())
    }).catch((e) => window.console.log('uploading image error => ', e));
    context.changeLoadingMessage(message + ': ' + item.filenameWithoutExtension);
  }

  return newList;
}


export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm, FilePond},

  computed: {
    uploadedVideos() {
      return (this.questionMedia?.videos || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    },
    uploadedPdfs() {
      return (this.questionMedia?.pdfs || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    },
    uploadedImages() {
      return (this.questionMedia?.images || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    }
  },

  data: () => ({
    videosServer: null,
    isEdit: false,
    search: null,
    questionMedia: {
      keywords: []
    },
    loading: false,
    service: new QuestionMediaService(),
    pdfs: [],
    images: [],
    videos: [],
    pdfsToBeDeleted: [],
    imagesToBeDeleted: [],
    videosToBeDeleted: []
  }),

  mounted() {
    this.loadQuestion()
  },

  methods: {
    required,
    requiredArray,
    getKeywords() {
      if (this.search && this.search.split(",").length > 1) {
        this.questionMedia.keywords = this.questionMedia.keywords.concat(
            this.search.split(",").filter((term) => !this.questionMedia.keywords.includes(term))
        );
        this.search = "";
      }
    },
    async loadQuestion() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.questionMedia = await this.service.fetchOne(this.$route.query.id);
      this.loading = false;
    },
    async submit(context) {
      if (this.isEdit) {
        await deleteFiles(context, this.imagesToBeDeleted, 'Deleting Images');
        await deleteFiles(context, this.pdfsToBeDeleted, 'Deleting Pdfs');
        await deleteFiles(context, this.videosToBeDeleted, 'Deleting Videos');
      }
      if (this.questionMedia.images && this.questionMedia.images.length > 0) {
        this.questionMedia.images = [
          ...this.questionMedia.images,
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      } else {
        this.questionMedia.images = [
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      }
      if (this.questionMedia.pdfs && this.questionMedia.pdfs.length > 0) {
        this.questionMedia.pdfs = [
          ...this.questionMedia.pdfs,
          ...(await uploadWithMessage(context, this.pdfs, 'Uploading Pdfs', 'pdfs'))
        ];
      } else {
        this.questionMedia.pdfs = [
          ...(await uploadWithMessage(context, this.pdfs, 'Uploading Pdfs', 'pdfs'))
        ];
      }
      if (this.questionMedia.videos && this.questionMedia.videos.length > 0) {
        this.questionMedia.videos = [
          ...this.questionMedia.videos,
          ...(await uploadWithMessage(context, this.videos, 'Uploading Videos', 'videos'))
        ];
      } else {
        this.questionMedia.videos = [
          ...(await uploadWithMessage(context, this.videos, 'Uploading Videos', 'videos'))
        ];
      }
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Question Media');
        try {
          await this.service.update(this.questionMedia);
          return true;
        } catch (e) {
          await deleteFiles(context, this.questionMedia.images, 'Deleting Images');
          await deleteFiles(context, this.questionMedia.pdfs, 'Deleting Pdfs');
          await deleteFiles(context, this.questionMedia.videos, 'Deleting Videos');
          return false;
        }
      } else {
        try {
          context.changeLoadingMessage('Creating New Question Media');
          await this.service.create(this.questionMedia);
          return true;
        } catch (e) {
          await deleteFiles(context, this.questionMedia.images, 'Deleting Images');
          await deleteFiles(context, this.questionMedia.pdfs, 'Deleting Pdfs');
          await deleteFiles(context, this.questionMedia.videos, 'Deleting Videos');
          return false;
        }
      }
    },
    pdfRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.pdfsToBeDeleted.push(file.filename);
        this.questionMedia.pdfs.splice(this.questionMedia.pdfs.indexOf(file.filename), 1);
      }
      this.pdfs.splice(
          this.pdfs.findIndex(obj => obj.filename === file.filename),
          1
      );
    },
    videoRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.videosToBeDeleted.push(file.filename);
        this.questionMedia.videos.splice(
            this.questionMedia.videos.indexOf(file.filename),
            1
        );
      }
      this.videos.splice(
          this.videos.findIndex(obj => obj.filename === file.filename),
          1
      );
    },
    imageRemoved(error, file) {

      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.filename);
        this.questionMedia.images.splice(
            this.questionMedia.images.indexOf(file.filename),
            1
        );
      }
      this.images.splice(
          this.images.findIndex(obj => obj.filename === file.filename),
          1
      );
    },
    clearPond() {
      this.$router.go()
    },
    pdfAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.pdfs.push(file);
    },
    videoAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.videos.push(file);
    },
    imageAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.images.push(file);
    },
    async loadFile(source, load) {
      await fetch((source.image_url || source.url || source))
          .then((res) => res.blob()).then(load);
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
