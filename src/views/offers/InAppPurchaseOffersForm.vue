<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title"> {{ this.isEdit ? 'Update Offer' : 'Create New Offer' }}</p>

    <div
        style="
        display: grid;
        grid-template-columns: 2fr 1fr;
        grid-column-gap: 20px;
      "
        class="span-2"
    >
      <v-select
          v-model="offer.offer_name"
          outlined
          dense
          label="Offer Reference Name"
          :rules="[required('A name must be provided')]"
          :items="offers">
      </v-select>
      <v-text-field
          v-model="offer.discount_percentage"
          dense
          :rules="[requiredPercentage()]"
          label="Discount %"
          outlined
      />
    </div>
    <v-file-input
        :hint="isEdit ? 'Last file ' + offer.filename + ' uploaded on ' + formatDate(offer.updatedAt) + ' with ' + offer.length + ' codes remaining.' : ''"
        persistent-hint accept=".txt" class="span-2" outlined dense
        prepend-icon="" label="Code File" @change="filePicked" :clearable="false">
      <template v-slot:selection="{ text }">
        <v-chip
            small
            label
            color="primary"
        >
          {{ text }}
        </v-chip>
      </template>
    </v-file-input>
    <v-text-field v-model="offer.expiry" :rules="[required('Expiry Date must be provided')]" class="span-2"
                  type="datetime-local" outlined
                  dense label="Expiry Date"></v-text-field>
    <v-checkbox
        v-model="offer.active"
        dense
        label="Active"
        hide-details
    />

    <loading-dialog v-model="loading" message="Fetching Offer Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import LoadingDialog from '../../components/LoadingDialog';
import {required, requiredPercentage} from '@/utils/validators';
import {IapsOffersService} from "@/services/iaps-offers-service";
import dayjs from "dayjs";


export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    isEdit: false,
    loading: false,
    service: new IapsOffersService(),
    offer: {
      active: true,
    },
    offers: [
      "10p_off",
      "20p_off",
      "30p_off",
      "40p_off",
      "50p_off",
      "60p_off",
      "70p_off"
    ]
  }),

  mounted() {
    this.loadOffer();
  },

  methods: {
    required,
    requiredPercentage,
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },
    async loadOffer() {
      if (!this.$route.query.id) {
        this.offer.product_id = this.$route.query.product
        return;
      }
      this.isEdit = true;
      this.loading = true;
      this.offer = (await this.service.fetchAll(this.$route.query.product)).filter(obj => {
        if (obj.id === this.$route.query.id) {
          return obj
        }
      })[0];
      this.loading = false;
    },
    filePicked(file) {
      const reader = new FileReader()
      reader.onload = e => {
        this.offer.codes = e.target.result.split(',')
        this.offer.length = this.offer.codes.length
        this.offer.filename = file.name
        this.offer.updatedAt = new Date()
      }
      reader.readAsText(file)
    },
    preCheck(context) {
      if (!context.validate()) return false;

      if (!this.isEdit) {
        if (!this.offer.codes || this.offer.codes.length <= 0) {
          context.reportError({
            title: 'Invalid Offer Data',
            description:
                'Selected file is empty or has wrong format'
          });

          return false;
        }
      }

      return true;
    },

    async submit(context) {
      if (this.preCheck(context)) {
        this.offer.discount_percentage = +this.offer.discount_percentage
        if (this.isEdit) {
          context.changeLoadingMessage('Updating Offer');
          try {
            await this.service.update(this.offer);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while updating Offer',
              description: e.toString()
            });
            return false
          }
        } else {
          try {
            context.changeLoadingMessage('Creating A New Offer');
            await this.service.create(this.offer);
            return true
          } catch (e) {
            context.reportError({
              title: 'Error occurred while creating Offer',
              description: e.toString()
            });
            return false
          }
        }
      }
    },
  }
};
</script>

<style scoped>
p {
  font-weight: bold;
  text-align: left;
}
</style>
