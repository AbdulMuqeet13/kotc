<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Passage Question' : 'Add a new Passage Question' }}</p>

    <v-text-field
        v-model="passageQuestion.heading"
        dense
        label="Question Title"
        :rules="[required('You must write a question title')]"
        class="span-2"
        outlined
    />

    <v-textarea
        v-model="passageQuestion.passage"
        dense
        label="Question Passage"
        :rules="[required('You must write a question passage')]"
        class="span-2 modified-message"
        outlined
    />

    <div class="span-2 mb-3">
      <v-checkbox
          v-model="passageQuestion.premium"
          dense
          label="Premium"
          hide-details
      />
      <v-checkbox
          v-model="passageQuestion.active"
          dense
          label="Active"
          hide-details
      />
    </div>

    <div class="d-flex justify-space-between span-2">
      <h4>Questions</h4>
      <v-btn
          v-if="passageQuestion.questions.length < 5"
          elevation="0"
          color="primary"
          @click="addQuestion()"
      >
        <v-icon small>mdi-plus</v-icon>
        Add
      </v-btn>
    </div>
    <div class="span-2 my-3">
      <div v-for="(question, i) of passageQuestion.questions" :key="i" class="span-2">
        <v-autocomplete
            v-model="question.question"
            :label="'Select Question # ' + (i + 1)"
            item-text="statement"
            item-value="id"
            return-object
            :items="questions"
            :loading="loadingQuestions"
            class="span-2"
            :rules="[required('Select a question'), passageQuestionsValidator(question, passageQuestion.questions)]"
            outlined
            dense
            @click:append-outer="removeQuestion(i)"
        >
          <template v-slot:item="data">
            <template v-if="typeof data.item !== 'object'">
              <v-list-item-content style="max-width: 400px" v-text="data.item"></v-list-item-content>
            </template>
            <template v-else>
              <v-list-item-content style="max-width: 400px">
                <v-list-item-title>{{ data.item.statement }}</v-list-item-title>
              </v-list-item-content>
            </template>
          </template>
          <template v-slot:append-outer>
            <v-icon @click="removeQuestion(i)" v-if="passageQuestion.questions.length > 1" color="red">mdi-delete
            </v-icon>
          </template>
        </v-autocomplete>
      </div>
    </div>

    <!--    <v-autocomplete-->
    <!--        v-model="passageQuestion.question"-->
    <!--        label="Select Question"-->
    <!--        item-text="statement"-->
    <!--        item-value="id"-->
    <!--        return-object-->
    <!--        :items="questions"-->
    <!--        :loading="loadingQuestions"-->
    <!--        class="span-2"-->
    <!--        :rules="[required('Select a question')]"-->
    <!--        outlined-->
    <!--        dense-->
    <!--    >-->
    <!--      <template v-slot:item="data">-->
    <!--        <template v-if="typeof data.item !== 'object'">-->
    <!--          <v-list-item-content style="max-width: 400px" v-text="data.item"></v-list-item-content>-->
    <!--        </template>-->
    <!--        <template v-else>-->
    <!--          <v-list-item-content style="max-width: 400px">-->
    <!--            <v-list-item-title>{{ data.item.statement }}</v-list-item-title>-->
    <!--          </v-list-item-content>-->
    <!--        </template>-->
    <!--      </template>-->
    <!--    </v-autocomplete>-->

    <file-pond
        class="span-2 mt-4"
        allow-multiple
        :instantUpload="false"
        :files="uploadedImages"
        label-idle="Drop or Attach Images"
        accepted-file-types="image/*"
        @addfile="imageAdded"
        @removefile="imageRemoved"
        :server="{ load: loadFile }"
    />


    <loading-dialog v-model="loading" message="Loading Passage Question Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';

import {required, passageQuestionsValidator} from '@/utils/validators';
import {QuestionsService} from '@/services/questions-service';
import LoadingDialog from '../../components/LoadingDialog';
import {PassageQuestionsService} from "@/services/passage_questions-service";
import {storage} from "@/plugins/firebase";
import vueFilePond from "vue-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
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
    uploadedImages() {
      return (this.passageQuestion?.images || []).map((image) => {
        return {
          source: image,
          options: {type: 'local', metadata: {uploaded: true}}
        };
      });
    }
  },
  data: () => ({
    isEdit: false,
    passageQuestion: {
      questions: [{}]
    },
    loading: false,
    questions: [],

    service: new PassageQuestionsService(),
    questionsService: new QuestionsService(),
    loadingQuestions: false,

    images: [],

    imagesToBeDeleted: [],
  }),

  mounted() {
    this.loadPassageQuestion().then(() => {
      this.loadQuestions();
    });
  },

  methods: {
    required,
    passageQuestionsValidator,
    async loadQuestions() {
      this.loadingQuestions = true;
      try {
        this.questions = await this.questionsService.getPassageQuestions();
      } catch (e) {
        window.console.log(e)
      }
      this.loadingQuestions = false;
    },
    async loadPassageQuestion() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.passageQuestion = await this.service.fetchOne(this.$route.query.id);
      const questions = []
      this.passageQuestion.questions.forEach((item) => {
        const obj = {
          question: {
            id: item
          }
        }
        questions.push(obj)
      })
      this.passageQuestion.questions = questions
      this.loading = false;
    },
    async submit(context) {
      const question = {...this.passageQuestion}
      if (this.isEdit) {
        await deleteFiles(context, this.imagesToBeDeleted, 'Deleting Images');
      }

      if (this.passageQuestion.images && this.passageQuestion.images.length > 0) {
        question.images = [
          ...this.passageQuestion.images,
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      } else {
        question.images = [
          ...(await uploadWithMessage(context, this.images, 'Uploading Images', 'images'))
        ];
      }

      const questions = []
      question.questions.forEach((question) => {
        questions.push(question.question.id)
      })

      question.questions = questions

      if (this.isEdit) {
        context.changeLoadingMessage('Updating Passage Question');
        try {
          await this.service.update(question);
          return true;
        } catch (e) {
          return false;
        }
      } else {
        context.changeLoadingMessage('Creating A New Passage Question');
        try {
          await this.service.create(question);
          return true;
        } catch (e) {
          window.console.log(e)
          return false;
        }
      }
    },
    imageRemoved(error, file) {
      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.source);
        this.passageQuestion.images.splice(
            this.passageQuestion.images.indexOf(file.source),
            1
        );
      }
      this.images.splice(this.images.indexOf(file))
    },
    imageAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.images.push(file);
    },
    async loadFile(source, load) {
      await fetch((source.image_url || source.url || source))
          .then((res) => res.blob()).then(load);
    },
    removeQuestion(i) {
      if (this.passageQuestion.questions.length > 1) {
        this.passageQuestion.questions.splice(i, 1)
      }
    },
    addQuestion() {
      if (this.passageQuestion.questions.length > 0) {
        this.passageQuestion.questions.push({})
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
