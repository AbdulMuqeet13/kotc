<template>
  <v-form v-model="valid">
    <data-table
        :loader="loadData"
        :headers="headers"
        :allow-add="false"
        title="In App Products"
        @done="$router.back()"
    >
      <template #primary-action>
        <v-btn :disabled="!valid || !getUser().scopes.includes('iaps:edit')" color="primary" elevation="0"
               @click="save">
          <v-icon>mdi-disk</v-icon>
          Save
        </v-btn>
      </template>
      <template #sku="{ item }">
        {{ item.product.sku }}
      </template>
      <template #title="{ item }">
        {{ item.product.listings['en-US'].title }}
      </template>
      <template #description="{ item }">
        {{ item.product.listings['en-US'].description }}
      </template>
      <template #price="{ item }">
        <v-text-field
            v-model="item.price"
            :rules="[(v) => (!!v && +v > 0) || 'Price must be provided']"
            dense
            outlined
            suffix="USD"
            type="number"
        />
      </template>
      <template #discount="{ item }">
        <v-text-field
            v-model="item.discountPrice"
            :rules="[
            (v) =>
              checkLess(v, item.price) || 'Discount must be less than Price'
          ]"
            dense
            outlined
            suffix="USD"
            type="number"
        />
      </template>

      <template #discountMode="{ item }">
        <v-checkbox hide-details v-model="item.discountMode"/>
      </template>
      <template #action="{ item }">
        <v-icon v-if="!(item.sku === 'lifetime') && getUser().scopes.includes('iaps-offers:view')" color="green" small
                @click="edit(item)">mdi-pencil
        </v-icon>
      </template>
    </data-table>

    <loading-dialog v-model="editLoading" message="Updating Products"/>
  </v-form>
</template>

<script>
import DataTable from '../../components/DataTable';
import LoadingDialog from '../../components/LoadingDialog';
import {IapService} from '@/services/iap-service';
import {getUser} from '@/utils/local';

export default {
  components: {LoadingDialog, DataTable},

  data: () => ({
    editLoading: false,
    editDialog: false,

    valid: false,
    loading: false,
    service: new IapService(),

    items: [],
    headers: [
      {
        text: 'SKU',
        value: 'sku',
        sortable: false
      },
      {
        text: 'Title',
        value: 'title',
        sortable: false
      },
      {
        text: 'Description',
        value: 'description',
        sortable: false
      },
      {
        text: 'Price',
        value: 'price'
      },
      {
        text: 'Discount',
        value: 'discount'
      },
      {
        width: 100,
        text: 'Discount Active',
        value: 'discountMode'
      },
      {
        text: 'Action',
        value: 'action',
        sortable: false
      }
    ],
  }),

  methods: {
    getUser,
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
      this.$router.push(`/iaps/offers?id=${item.sku}`);
    },
    async save() {
      this.editLoading = true
      for (const item of this.items) {
        item.price = +item.price
        item.discountPrice = +item.discountPrice

        if (!item.offers) {
          item.offers = []
        }

        await this.service.update(item)
      }
      this.editLoading = false
    },
    async loadData() {
      this.items = Object.values(await this.service.fetchAll());
      return this.items
    }
  }
};
</script>

<style scoped></style>
