<template>
  <v-card>
    <v-tabs v-model="tab">
      <v-tab v-if="getUser() ? getUser().scopes.includes('banners:view') : false">Banners</v-tab>
      <v-tab v-if="getUser() ? getUser().scopes.includes('popups:view') : false">Popups</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item v-if="getUser() ? getUser().scopes.includes('banners:view') : false">
        <banners-view />
      </v-tab-item>
      <v-tab-item v-if="getUser() ? getUser().scopes.includes('popups:view') : false">
        <popups-view />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import BannersView from "./BannersView";
import PopupsView from "./PopupsView";
import {getUser} from "@/utils/local";

export default {
  name: 'OffersView',
  components: {PopupsView, BannersView},
  data: () => ({
    tab: 0
  }),
  methods: {
    getUser
  }
};
</script>

<style scoped></style>
