<template>
  <v-dialog :value="flag" @input="$emit('value', false)" width="470">
    <SimpleForm :onSubmit="submit" @done="$emit('value', false)" class="my-0">
      <p class="span-2 form__title">{{ isEdit ? 'Update Institution' : 'Add a new Institution' }}</p>

      <v-text-field
          v-model="institution.name"
          dense
          label="Institution Statement"
          :rules="[required('You must write institution name')]"
          class="span-2 modified-message"
          outlined
      />

      <v-select
          v-model="institution.alpha_two_code"
          label="Country Code"
          outlined
          :items="alpha_two_code"
          item-text="text"
          item-value="value"
          :rules="[required('You must select a institution country code')]"
          dense
          class="span-2"
      />

      <div class="span-2">
        <div class="d-flex align-center justify-space-between my-3">
          <h4>Domains</h4>
          <v-btn
              color="primary"
              @click="addDomain()"
          >Add Domain
          </v-btn>
        </div>
        <v-text-field
            v-for="(domain, i) of institution.domains" :key="i"
            v-model="domain.name"
            :rules="[required()]"
            :label="'Domain ' + (i + 1)"
            outlined
            dense
            :append-icon="institution.domains.length > 1 ? 'mdi-close' : ''"
            @click:append="removeDomain(i)"
        />
      </div>

      <div class="span-2">
        <div class="d-flex align-center justify-space-between my-3">
          <h4>Web Pages</h4>
          <v-btn
              color="primary"
              @click="addWebpage()"
          >Add Web Page
          </v-btn>
        </div>
        <v-text-field
            v-for="(webPage, i) of institution.web_pages" :key="i"
            v-model="webPage.name"
            :rules="[required()]"
            :label="'Web Page ' + (i + 1)"
            outlined
            dense
            :append-icon="institution.web_pages.length > 1 ? 'mdi-close' : ''"
            @click:append="removeWebpage(i)"
        />
      </div>


      <loading-dialog v-model="loading" message="Loading Institution Data"/>
    </SimpleForm>
  </v-dialog>
</template>

<script>
import SimpleForm from '../../components/Form';

import {required} from '@/utils/validators';
import LoadingDialog from '../../components/LoadingDialog';
import {getUser} from "@/utils/local";
import {InstitutionsService} from "@/services/institutions-service";

export default {
  name: 'InstitutionForm',
  components: {LoadingDialog, SimpleForm},

  model: {
    prop: 'flag',
    event: 'value'
  },


  props: {
    flag: {
      type: Boolean,
      default: false
    },
    institution: {
      type: Object,
      default: () => ({
        domains: [{}],
        web_pages: [{}]
      })
    },
    isEdit: {
      type: Boolean,
      default: false,
    }
  },

  data: () => ({
    loading: false,
    service: new InstitutionsService(),

    alpha_two_code: [
      {
        text: 'US',
        value: 'US'
      },
      {
        text: 'CA',
        value: 'CA'
      }
    ],

  }),

  mounted() {
    // this.loadInstitution();
  },

  methods: {
    getUser,
    required,
    async submit(context) {
      if (this.preCheck(context)) {
        const data = {...this.institution}
        data.domains = []
        data.web_pages = []
        this.institution.domains.forEach((item) => {
          data.domains.push(item.name)
        })
        this.institution.web_pages.forEach((item) => {
          data.web_pages.push(item.name)
        })
        data.is_verified = true

        if (this.isEdit) {
          context.changeLoadingMessage('Updating Institution');
          try {
            await this.service.update(data);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while updating Institution',
              description: e.toString()
            });
            return false
          }
        } else {
          try {
            context.changeLoadingMessage('Creating A New Institution');
            await this.service.create(data);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while creating Institution',
              description: e.toString()
            });
            return false
          }
        }
      }
    },
    preCheck(context) {
      if (!context.validate()) return false;

      return true;
    },
    removeDomain(i) {
      if (this.institution.domains.length > 1) {
        this.institution.domains.splice(i, 1)
      }
    },
    addDomain() {
      if (this.institution.domains.length > 0) {
        this.institution.domains.push({})
      }
    },
    removeWebpage(i) {
      if (this.institution.web_pages.length > 1) {
        this.institution.web_pages.splice(i, 1)
      }
    },
    addWebpage() {
      if (this.institution.web_pages.length > 0) {
        this.institution.web_pages.push({})
      }
    },
  }
};
</script>

<style scoped>
</style>
