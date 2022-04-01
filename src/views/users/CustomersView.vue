<template>
  <div>
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Customers"
        :allow-add="false"
    >
      <template #primary-action>
        <v-btn v-if="getUser() ? getUser().scopes.includes('customers:export') : false" @click="exportCustomers"
               elevation="0" color="primary" class="mr-3">Export
        </v-btn>
      </template>
      <template #is_premium="{ item }">
        <v-checkbox hide-details dense readonly v-model="item.is_premium"/>
      </template>
      <template #premium_trial="{ item }">
        <v-checkbox hide-details dense readonly v-model="item.premium_trial"/>
      </template>
      <template #actions="{ item }">
        <v-icon v-if="!item.is_premium" small color="success" @click="openPremiumEditor(item)">mdi-check-circle</v-icon>
        <v-icon v-if="item.is_premium && item.premium_trial" small color="error" @click="toNotPremium(item)">
          mdi-close-circle
        </v-icon>
      </template>
    </data-table>
    <v-dialog v-model="toPremium" width="400">
      <v-card style="padding: 40px">
        <v-form ref="makePremium">
          <p class="span-2 form__title mb-0">Premium Trial</p>
          <p class="span-2 mb-6">This will set the user's premium status to true till expiry date.</p>
          <v-text-field v-model="premium_trial_expiry" type="date" label="Expiry Date" outlined dense
                        :rules="[required(),dateValidation]"/>
          <v-btn
              style="width: 100%"
              elevation="0"
              color="primary"
              @click="makePremium"
          >Submit
          </v-btn>
        </v-form>
      </v-card>
    </v-dialog>

    <loading-dialog v-model="loading" message="Loading..."/>
  </div>
</template>

<script>
import DataTable from '../../components/DataTable';
import {getUser} from '@/utils/local';
import {users} from "@/plugins/firebase";
import {required, dateValidation} from "@/utils/validators";
import LoadingDialog from "@/components/LoadingDialog";
import moment from 'moment'

export default {
  components: {LoadingDialog, DataTable},

  mounted() {
  },

  data: () => ({
    items: [],
    loading: false,

    toPremium: false,
    premium_trial_expiry: null,
    user: null,

    headers: [
      {
        text: 'Display Name',
        value: 'name',
      },
      {
        text: 'Email',
        value: 'email',
      },
      {
        width: 120,
        text: 'Is Premium',
        value: 'is_premium',
        sortable: false
      },
      {
        width: 120,
        text: 'Premium Trial',
        value: 'premium_trial',
        sortable: false
      },
      {
        width: 120,
        text: 'Actions',
        value: 'actions',
        sortable: false
      },
    ]
  }),

  methods: {
    getUser,
    required,
    dateValidation,
    async loadData() {
      const snapshot = await users.get()
      const data = []
      snapshot.docs.map(doc => {
            data.push({id: doc.id, ...doc.data()})
          }
      )
      this.items = data
      return data
    },
    exportCustomers() {
      this.loading = true
      const csv = this.toCSV(this.items)
      const name = 'customers.csv'
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
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
      this.loading = false
    },
    toCSV(items) {
      const array = typeof items != 'object' ? JSON.parse(items) : items;
      let str = 'Name,Email\r\n';

      for (let i = 0; i < array.length; i++) {
        let line = '';
        if (array[i].name) {
          array[i].name = array[i].name.replaceAll(',', ' ')
          line += array[i].name
        }
        line += ',' + array[i].email
        line += '\r\n'


        str += line + '\r\n'

      }

      return str
    },
    openPremiumEditor(item) {
      this.user = item
      this.toPremium = true
    },
    async makePremium() {
      if (this.$refs.makePremium.validate()) {
        this.loading = true
        let data = {
          is_premium: true,
          premium_trial: true,
          premium_trial_expiry: moment(this.premium_trial_expiry).format('YYYY-MM-DDT00:00')
        }


        await users.doc(this.user.id).update(data).then(() => {}).catch((e) => {
          window.console.log(e)
        })
        this.toPremium = false
        this.premium_trial_expiry = null
        this.user = null
        this.$refs.makePremium.reset()
        document.getElementById('refresh').click()
        this.loading = false
      }
    },
    async toNotPremium(item) {
        if (confirm('Are you sure? This will end premium trial.')) {
        this.loading = true;
        let data = {
          is_premium: false,
          premium_trial: false,
          premium_trial_expiry: null
        }


        await users.doc(item.id).update(data).then(() => {}).catch((e) => {
          window.console.log(e)
        })
        document.getElementById('refresh').click()
        this.loading = false;
      }
    }
  }
};
</script>

<style>
.v-input--selection-controls__input:hover .v-input--selection-controls__ripple:before {
  background: transparent !important;
  transform: none;
  transition: none;
}

.v-ripple__container {
  display: none !important;
}

.v-input--selection-controls__ripple, .v-input--selection-controls .v-input__slot, .v-input--selection-controls .v-radio {
  cursor: default;
}
</style>
