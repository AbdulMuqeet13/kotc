<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
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
        class="span-2"
    />
    <v-textarea
        v-model="question.statement"
        dense
        label="Question Statement"
        :rules="[required('You must write a question statement')]"
        class="span-2 modified-message"
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
        return-object
        :items="subCategories"
        :rules="[required('Select a sub-category')]"
        outlined
        dense
    />

    <v-divider class="span-2" style="margin-bottom: 20px"/>

    <v-select
        v-model="question.trial"
        label="Trial"
        item-text="text"
        :items="trials"
        :rules="[required('Select Trial')]"
        outlined
        dense
    />

    <v-select
        v-model="question.for_passage"
        label="Passage"
        item-text="text"
        :items="trials"
        :rules="[required('Select Passage')]"
        outlined
        dense
    />


    <v-textarea
        v-model="question.explanation"
        dense
        :rules="[required()]"
        label="Answer Explanation"
        class="span-2"
        outlined
    />

    <div class="span-2 file-pickers">
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
    </div>

    <loading-dialog v-model="loading" message="Loading Question Data"/>
    <ErrorDialog v-model="error" :error="errorVal" @value="$router.back()"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import AnswersPicker from '../../components/questions/AnswersPicker';

import vueFilePond from 'vue-filepond';

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginMediaPreview from 'filepond-plugin-media-preview';
import FilePondPluginPdfPreview from "filepond-plugin-pdf-preview";
import {required} from '@/utils/validators';
import {CategoryService} from '@/services/category-service';
import {QuestionsService} from '@/services/questions-service';
import LoadingDialog from '../../components/LoadingDialog';
import {storage} from "@/plugins/firebase";
import axios from "axios";
import ErrorDialog from "@/components/ErrorDialog";

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
  components: {ErrorDialog, LoadingDialog, AnswersPicker, SimpleForm, FilePond},

  computed: {
    uploadedVideos() {
      return (this.question?.videos || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    },
    uploadedPdfs() {
      return (this.question?.pdfs || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    },
    uploadedImages() {
      return (this.question?.images || []).map((image) => {
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

    error: false,
    errorVal: {},

    question: {
      options: [],
      selected: null
    },
    loading: false,
    categories: [],

    subCategories: [],
    service: new QuestionsService(),
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
    trials: [
      {
        text: 'Yes',
        value: 'true'
      },
      {
        text: 'No',
        value: 'false'
      }
    ],

    pdfs: [],
    images: [],
    videos: [],

    pdfsToBeDeleted: [],
    imagesToBeDeleted: [],
    videosToBeDeleted: []
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
      try {
        if (!this.$route.query.id) return;
        this.isEdit = true;
        this.loading = true;
        this.question = await this.service.fetchOne(this.$route.query.id);
        this.question.trial = this.question.trial === true ? 'true' : 'false'
        this.question.for_passage = this.question.for_passage === true ? 'true' : 'false'
        this.loading = false;
      } catch (e) {
        console.log(e)
        this.loading = false;
        this.error = true
        this.errorVal = {
          title: 'Question does not exist anymore',
          description: 'This question has been deleted by someone.'
        };
      }
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
        await deleteFiles(context, this.imagesToBeDeleted, 'Deleting Images');
        await deleteFiles(context, this.pdfsToBeDeleted, 'Deleting Pdfs');
        await deleteFiles(context, this.videosToBeDeleted, 'Deleting Videos');
      }
      if (this.question.images && this.question.images.length > 0) {
        this.question.images = [
          ...this.question.images,
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      } else {
        this.question.images = [
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      }
      if (this.question.pdfs && this.question.pdfs.length > 0) {
        this.question.pdfs = [
          ...this.question.pdfs,
          ...(await uploadWithMessage(context, this.pdfs, 'Uploading Pdfs', 'pdfs'))
        ];
      } else {
        this.question.pdfs = [
          ...(await uploadWithMessage(context, this.pdfs, 'Uploading Pdfs', 'pdfs'))
        ];
      }
      if (this.question.videos && this.question.videos.length > 0) {
        this.question.videos = [
          ...this.question.videos,
          ...(await uploadWithMessage(context, this.videos, 'Uploading Videos', 'videos'))
        ];
      } else {
        this.question.videos = [
          ...(await uploadWithMessage(context, this.videos, 'Uploading Videos', 'videos'))
        ];
      }
      this.question.trial = this.question.trial === 'true'
      this.question.for_passage = this.question.for_passage === 'true'
      if (this.isEdit) {
        context.changeLoadingMessage('Updating Question');
        try {
          await this.service.update(this.question);
          if (this.$route.query.token) {
            const notification = {
              title: 'Flagged Question Updated',
              description: 'The question you flagged has been rectified. Thank you for your feedback!',
              isForIOS: true,
              isForAndroid: true,
              channel: this.$route.query.token
            }
            await axios.post('/notifications/send-to-user', notification).then(() => {
              return true
            }).catch(() => {
              return false
            })
          }
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
    pdfRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.pdfsToBeDeleted.push(file.source);
        this.question.pdfs.splice(this.question.pdfs.indexOf(file.source), 1);
      }
      this.pdfs.splice(this.pdfs.indexOf(file))
    },
    videoRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.videosToBeDeleted.push(file.source);
        this.question.videos.splice(
            this.question.videos.indexOf(file.source),
            1
        );
      }
      this.videos.splice(this.videos.indexOf(file))
    },
    imageRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.source);
        this.question.images.splice(
            this.question.images.indexOf(file.source),
            1
        );
      }
      this.images.splice(this.images.indexOf(file))
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
