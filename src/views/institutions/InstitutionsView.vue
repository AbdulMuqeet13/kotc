<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Institutions"
        :allow-add="getUser() ? getUser().scopes.includes('institutions:new') : false"
        @add-new="openEditor"
        @done="$router.back()"
        :delete-handler="getUser() ? getUser().scopes.includes('institutions:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('institutions:edit') ? openEditor : null : null"
    >
      <template #primary-action>
        <v-checkbox class="mr-3" hide-details label="Show Unverified" dense v-model="unverified"
                    @change="getUnverified"/>
      </template>
      <template #extra-actions="{item}">
        <v-icon v-if="!item.is_verified && (getUser() && getUser().scopes.includes('institutions:edit'))"
                @click="verifyInstitution(item)" color="success" small>mdi-check
        </v-icon>
        <v-icon @click="getInstituteUsers(item)" color="success" small>mdi-account-multiple</v-icon>
      </template>
      <template #isVerified="{ item }">
        <v-checkbox hide-details dense v-model="item.is_verified" readonly/>
      </template>
      <template #domains="{ item }">
        {{ item.domains.length }}
      </template>
    </data-table>

    <loading-dialog v-model="loadingDialog" message="Loading ..."/>
    <InstitutionForm v-model="editor" :institution="institution" :is-edit="isEdit" @value="closeEditor"/>
    <v-dialog v-model="usersDialog" width="50%">
      <v-card class="pa-4">
        <h3>Users associated with {{ instituteName }}</h3>
        <v-data-table :items="users" :headers="userHeaders" dense>
          <template v-slot:item.isPremium="{ item }">
            <v-checkbox hide-details dense v-model="item.is_premium" readonly/>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import LoadingDialog from "../../components/LoadingDialog";
import {getUser} from '@/utils/local';
import {InstitutionsService} from "@/services/institutions-service";
import InstitutionForm from "@/views/institutions/InstitutionsForm";
import {users} from "@/plugins/firebase";


export default {
  components: {InstitutionForm, LoadingDialog, DataTable},

  data: () => ({
    loading: false,
    loadingDialog: false,
    usersDialog: false,

    service: new InstitutionsService(),

    unverified: false,
    editor: false,
    isEdit: false,
    institution: {
      domains: {},
      web_pages: {}
    },
    headers: [
      {
        text: 'Name',
        value: 'name',
        sortable: false
      },
      {
        text: 'Domains',
        value: 'domains'
      },
      {
        width: 120,
        text: 'Is Verified',
        value: 'isVerified'
      }
    ],
    users: [],
    userHeaders: [
      {
        text: 'Name',
        value: 'name',
        sortable: false
      },
      {
        text: 'Email',
        value: 'email'
      },
      {
        width: 120,
        text: 'Is Premium',
        value: 'isPremium'
      }
    ],
    instituteName: ''
  }),

  methods: {
    getUser,
    edit(item) {
      this.$router.push(`/institution?id=${item.id}`);
    },
    addNew() {
      this.$router.push('/institution');
    },
    getUnverified() {
      document.getElementById('refresh').click()
    },
    async loadData() {
      const data = await this.service.fetchAll()
      if (this.unverified) {
        return data.filter(function (institution) {
              return institution.is_verified === false;
            }
        );
      } else {
        return data.filter(function (institution) {
              return institution.is_verified === true;
            }
        );
      }
    },
    async verifyInstitution(item) {
      if (confirm('This Institution will be verified')) {
        try {
          this.loading = true
          item.is_verified = true
          await this.service.update(item)
          this.loading = false
        } catch (e) {
          window.console.log(e);
          this.loading = false
        }
      }
    },
    openEditor(item) {
      if (item) {
        const domains = []
        const web_pages = []
        item.domains.forEach((item) => {
          const obj = {
            name: item
          }
          domains.push(obj)
        })
        item.web_pages.forEach((item) => {
          const obj = {
            name: item
          }
          web_pages.push(obj)
        })
        this.institution = item
        this.institution.domains = domains
        this.institution.web_pages = web_pages
        this.institution.oldName = item.name
        this.isEdit = true
      } else {
        this.institution = {
          domains: [{}],
          web_pages: [{}]
        }
        this.isEdit = false
      }
      this.editor = true
    },
    closeEditor() {
      document.getElementById('refresh').click()
    },
    async getInstituteUsers(item) {
      this.loading = true
      const snapshot = await users.where('institute_name', '==', item.name).get()
      const data = []
      snapshot.docs.map(doc => {
            data.push({id: doc.id, ...doc.data()})
          }
      )
      this.users = data
      this.instituteName = item.name
      this.loading = false
      this.usersDialog = true
    }
  }
};
</script>

<style lang="sass" scoped>
.chip
  font-weight: 500
  padding: 5px 10px
  border-radius: 50px
  background: lightgray
</style>
