<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Flashcard' : 'Create New Flashcard' }}</p>
    <v-text-field
        v-model="flashcard.name"
        dense
        :rules="[required('A name must be provided')]"
        label="Name"
        outlined
        class="span-2"
    />
    <v-autocomplete
        v-model="flashcard.deck"
        :items="decks"
        item-text="name"
        item-value="id"
        :rules="[required('Select a Deck')]"
        dense
        label="Deck"
        outlined
        class="span-2"
    ></v-autocomplete>
    <v-select
      v-model="selectedType"
      :items="cardTypes"
      label="Card Type"
      outlined
      dense
      class="span-2"
      required
    ></v-select>
    <div class="span-2">
      <v-slide-y-transition>
      <v-card v-show="selectedType === 'Image'" style="padding:20px">
        <file-pond
          :allow-multiple="false"
          :instantUpload="false"
          :files="uploadedFrontImage"
          label-idle="Drop or Attach Front Image"
          accepted-file-types="image/*"
          @removefile="frontImageRemoved"
          @addfile="frontImageAdded"
          :server="{ load: loadFile }"
        />
        <file-pond
            :allow-multiple="false"
            :instantUpload="false"
            :files="uploadedBackImage"
            label-idle="Drop or Attach Back Image"
            accepted-file-types="image/*"
            @removefile="backImageRemoved"
            @addfile="backImageAdded"
            :server="{ load: loadFile }"
        />
      </v-card>
      </v-slide-y-transition>
    </div>
    <div class="span-2">
      <v-slide-y-reverse-transition>
      <v-card v-show="selectedType === 'Text'" style="padding:20px ">
        <v-select
          v-model="selectedQuestionType"
          :items="questionsTypes"
          label="Question Type"
          outlined
          dense
          class="span-2"
        ></v-select>
        <div class="span-2">
          <v-slide-y-transition>
          <div v-if="selectedQuestionType === 'Plain'">
            <v-text-field
              :rules="[required('A Question must be provided')]"
              dense
              label="Question"
              outlined
              v-model="front_text"
              
            />
            <v-textarea
            :rules="[required('An Answer must be provided')]"
              outlined
              v-model="back_text"
              name="input-7-4"
              label="Answer"
              
            ></v-textarea>
          </div>
          </v-slide-y-transition>
          <v-slide-y-transition>
            <div v-if="selectedQuestionType === 'Dynamic'">
                <div class="d-flex">
                  <v-textarea
                  :rules="[dynamicQuestion('A Question must be provided with atleast one dynamic value') ]"
                  ref="textarea"
                  outlined
                  rows="3"
                  label="Question"
                  auto-grow
                  v-model="dynamicText"
                ></v-textarea>
                <v-btn @click="addDynamicText" icon><v-icon>mdi-database</v-icon></v-btn>
                </div>
                <v-textarea
                  outlined
                  :rules="[required('An Answer must be provided')]"
                  v-model="back_text"
                  rows="2"
                  label="Answer"
                  auto-grow
                ></v-textarea>
            </div>
          </v-slide-y-transition>
        </div>
      </v-card>
      </v-slide-y-reverse-transition>
    </div>
    <loading-dialog v-model="loading" message="Fetching Flashcard Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import LoadingDialog from '../../components/LoadingDialog';
import {required, dynamicQuestion} from '@/utils/validators';
import {getDays} from "@/utils/local";
import {FlashcardsService} from "@/services/flashcards-service";
import {DecksService} from "@/services/deck-service";
import vueFilePond from "vue-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import {storage} from "@/plugins/firebase";

const FilePond = vueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
);


async function deleteFiles(context, list, message) {
  context.changeLoadingMessage(message + ' ...');
  for (const item of list) {
    context.changeLoadingMessage(message + ': ' + item);
    console.log(item)
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
    // eslint-disable-next-line vue/return-in-computed-property
    uploadedFrontImage() {
      if (this.flashcard?.front_image) {
        return [{
          source: this.flashcard?.front_image,
          options: {type: 'local', metadata: {uploaded: true}}
        }];
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    uploadedBackImage() {
      if (this.flashcard?.back_image) {
        return [{
          source: this.flashcard?.back_image,
          options: {type: 'local', metadata: {uploaded: true}}
        }];
      }
    }
  },

  data: () => ({
    isEdit: false,
    loading: false,
    service: new FlashcardsService(),
    deckService: new DecksService(),
    flashcard: {
      from_admin: true,
      front_image: null,
      back_image: null,
    },
    decks: [],
    frontImage: null,
    backImage: null,
    imagesToBeDeleted: [],
    question: '',
    answer: '',
    cardTypes: ['Text', 'Image'],
    selectedType: '',
    questionsTypes: ['Plain', 'Dynamic'],
    selectedQuestionType: '',
    insertText: '{}',
    dynamicText: '',
    dynamicValueNumber: 1,
    front_text: null,
    back_text: null,
  }),

  mounted() {
    this.loadFlashcard();
    this.getDecks();
  },

  methods: {
    required,
    getDays,
    dynamicQuestion,
    addDynamicText(){
      let txt = ''
      if (window.getSelection) {
        txt = window.getSelection();
      } else if (window.document.getSelection) {
          txt =window.document.getSelection();
      } else if (window.document.selection) {
          txt = window.document.selection.createRange().text;
      }
      if (this.dynamicText.includes('{c'+this.dynamicValueNumber)) {
        ++this.dynamicValueNumber
      }
      this.insertText = '{{c' + (this.dynamicValueNumber) +  '::' + txt + '}}'
      const insertText = this.insertText
      const textarea = this.$refs.textarea.$refs.input
      const sentence = textarea.value
      const len = sentence.length
      let pos = textarea.selectionStart

      const before = sentence.substr(0, pos)
      var after = sentence.substr(pos, len)
      if (txt != '' && txt != null && txt ) {
        after = after.substr(before.length-1, txt.length-1)
        this.dynamicText = before + insertText + after
      }
      else{
        this.dynamicText = before + insertText + after
      }
    },

    async loadFlashcard() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.flashcard = await this.service.fetchOne(this.$route.query.id);
      this.front_text = this.flashcard.frontText
      this.back_text = this.flashcard.backText
      if (this.flashcard.ISClosedDeletion) {
        this.selectedType = 'Text'
        this.selectedQuestionType = 'Dynamic'
        this.dynamicText = this.flashcard.frontText
      }
      else if (this.flashcard.frontText) {
        this.selectedType = 'Text'
        this.selectedQuestionType = 'Plain'
      }
      else{
        this.selectedType = 'Image'
      }
      this.loading = false;
    },
    async getDecks() {
      this.decks = await this.deckService.fetchAll()
    },
    preCheck(context) {
      if (!context.validate()) return false;
      if (this.selectedType === 'Image') {
        if ((this.flashcard.front_image === null || this.flashcard.front_image === '') && this.frontImage === null) {
          context.reportError({
            title: 'Invalid Flashcard Data',
            description:
                'Front image is required'
          });

          return false;
        }
        if ((this.flashcard.back_image === null || this.flashcard.back_image === '') && this.backImage === null) {
          context.reportError({
            title: 'Invalid Flashcard Data',
            description:
                'Back image is required'
          });
      }

        return false;
      }

      return true;
    },
    async submit(context) {
      if (this.preCheck(context)) {
        if (this.isEdit) {
          await deleteFiles(context, this.imagesToBeDeleted, 'Deleting Images');
        }
        if (this.selectedType === 'Image') {
          if (this.flashcard.front_image === null || this.flashcard.front_image === '') {
            console.log('no front image')
            this.flashcard.front_image =
                [...(await uploadWithMessage(context, [this.frontImage], 'Uploading Front Image', 'flashcards'))][0]
          }
          if ((this.flashcard.back_image === null || this.flashcard.back_image === '')) {
            console.log('no back image')
            this.flashcard.back_image =
                [...(await uploadWithMessage(context, [this.backImage], 'Uploading Back Image', 'flashcards'))][0]
          }
        }

        if (this.selectedType === 'Text') {
          this.flashcard.frontText = this.front_text
          this.flashcard.backText = this.back_text
          if( this.selectedQuestionType === 'Dynamic'){
            this.flashcard.ISClosedDeletion = true
            this.flashcard.frontText = this.dynamicText
          } 
        }

        if (this.isEdit) {
          context.changeLoadingMessage('Updating Flashcard');
          try {
            await this.service.update(this.flashcard);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while updating Flashcard',
              description: e.toString()
            });
            return false
          }
        } else {
          try {
            context.changeLoadingMessage('Creating A New Flashcard');
            console.log(this.flashcard)
            await this.service.create(this.flashcard);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while creating Flashcard',
              description: e?.data?.error
            });
            return false
          }
        }
      }
    },
    frontImageAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.frontImage = file;
    },
    frontImageRemoved(error, file) {
      console.log('front rem')
      console.log(file)
      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.source);
        this.flashcard.front_image = null
      }
      this.frontImage = null
    },
    backImageAdded(error, file) {
      if (!error && !file.getMetadata().uploaded) this.backImage = file;
    },
    backImageRemoved(error, file) {
      console.log('back rem')
      if (!error && file.getMetadata().uploaded) {
        this.imagesToBeDeleted.push(file.source);
        this.flashcard.back_image = null
      }
      this.backImage = null
    },

    async loadFile(source, load) {
      await fetch(source.image_url || source.url || source)
          .then((res) => res.blob().then(load));
    }
  }
};
</script>

<style scoped>
p {
  font-weight: bold;
  text-align: left;
}
</style>
