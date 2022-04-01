<template>
  <v-form v-model="valid">
    <data-table
        :loader="loadData"
        :headers="headers"
        title="Offers"
        :allow-add="getUser().scopes.includes('iaps-offers:new')"
        @add-new="addNew"
        :delete-handler="getUser() ? getUser().scopes.includes('iaps-offers:delete') ? service.delete : null : null"
        :edit-handler="getUser() ? getUser().scopes.includes('iaps-offers:edit') ? edit : null : null"
        @done="$router.back()"
    >
      <template #active="{ item }">
        <v-checkbox dense hide-details v-model="item.active" readonly/>
      </template>
      <template #expiry="{ item }">
        {{ formatDate(item.expiry) }}
      </template>
    </data-table>

    <loading-dialog v-model="editLoading" message="Updating Products"/>
  </v-form>
</template>

<script>
import DataTable from '../../components/DataTable';
import LoadingDialog from '../../components/LoadingDialog';
import {getUser} from '@/utils/local';
import {requiredPercentage, required} from '@/utils/validators';
import {IapsOffersService} from "@/services/iaps-offers-service";
import dayjs from "dayjs";

export default {
  components: {LoadingDialog, DataTable},

  data: () => ({
    editLoading: false,
    valid: false,
    loading: false,
    service: new IapsOffersService(),

    items: [],
    headers: [
      {
        text: 'Offer',
        value: 'offer_name'
      },
      {
        text: 'Discount Percentage',
        value: 'discount_percentage'
      },
      {
        text: 'Expiry',
        value: 'expiry'
      },
      {
        text: 'File',
        value: 'filename'
      },
      {
        text: 'Codes Remaining',
        value: 'length'
      },
      {
        text: 'Active',
        value: 'active',
        sortable: false
      }
    ]
  }),

  methods: {
    getUser,
    requiredPercentage,
    required,
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },
    addNew() {
      this.$router.push(`/iaps/offer?product=${this.$route.query.id}`);
    },
    checkLess(discount, price) {
      //eslint-disable-next-line no-extra-boolean-cast
      if (!!discount) {
        //eslint-disable-next-line no-extra-boolean-cast
        return parseInt(discount) < parseInt(!!price ? price : '0');
      } else {
        return true;
      }
    },
    edit(item) {
      this.$router.push(`/iaps/offer?id=${item.id}&product=${this.$route.query.id}`);
    },
    async loadData() {
      this.items = Object.values(await this.service.fetchAll(this.$route.query.id));
      return this.items
    }
  }
};
</script>

<style scoped></style>
