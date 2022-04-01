<template>
  <div>
    <v-app-bar app dark color="primary" elevate-on-scroll>
      <v-app-bar-nav-icon @click="drawer = !drawer"/>

      <v-app-bar-title>King of the Curves</v-app-bar-title>
      <v-spacer/>

      <profile-popup/>
    </v-app-bar>
    <v-main class="main-bg">
      <v-container>
        <router-view/>
      </v-container>
    </v-main>
    <v-navigation-drawer v-model="drawer" app>
      <img src="../assets/logo.png" alt="logo" class="logo" height="70"/>
      <v-divider/>
      <v-switch
          class="ma-0 pa-3"
          hide-details
          v-model="developMode"
          label="Development Mode"
          @change="developModeActive"
      ></v-switch>
      <v-divider/>
      <template v-for="(route, key) in routes">
        <v-list-item
            v-if="route.isVisible"
            :key="key"
            class="route"
            color="#da57a7"
            active-class="route--active"
            exact
            dense
            :to="route.to"
        >
          <v-list-item-icon>
            <v-icon v-text="route.icon"/>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="route.title"/>
          </v-list-item-content>
        </v-list-item>
        <v-divider v-else-if="route.isDivider" :key="key" style="margin: 10px 20px"/>
      </template>
    </v-navigation-drawer>
    <v-dialog width="30%" v-model="developModeDialog" persistent>
      <v-card class="pa-5">
        <v-form ref="developModeForm" v-if="!loading">
          <v-card-title class="text-center">Activate Development Mode</v-card-title>
          <v-textarea v-model="message" outlined label="Message" dense :rules="[required()]"/>
          <div class="d-flex justify-end">
            <v-btn class="mr-2" color="error" @click="cancelDevelopModeForm">Cancel</v-btn>
            <v-btn color="primary" @click="submitDevelopModeForm">Submit</v-btn>
          </div>
        </v-form>
        <div v-else class="py-16 d-flex justify-center align-center">
          <v-progress-circular indeterminate/>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ProfilePopup from "./ProfilePopup";
import {getUser} from "@/utils/local";
import {required} from "@/utils/validators";

export default {
  name: 'Dashboard',
  components: {ProfilePopup},
  data: () => ({
    drawer: true,
    user: {},
    developMode: false,
    developModeDialog: false,
    message: null,
    developModeData: null,
    loading: false,
  }),
  mounted() {
    this.getDevelopMode()
  },
  methods: {
    getUser,
    required,
    async getDevelopMode() {
      this.developModeData = (await this.$axios.get('/app-status')).data
      if (this.developModeData) {
        this.developMode = this.developModeData.status === 1
      }
    },
    async developModeActive() {
      if (this.developModeData) {
        if (this.developMode) {
          this.developModeDialog = true
        } else {
          const data = {
            'id': this.developModeData.id,
            'status': 0
          }
          await this.$axios.patch('/app-status', data)
        }
      }
    },
    async submitDevelopModeForm() {
      if (this.$refs.developModeForm.validate()) {
        this.loading = true
        const data = {
          'id': this.developModeData.id,
          'message': this.message,
          'status': 1
        }
        await this.$axios.patch('/app-status', data)
        this.loading = false
        this.developModeDialog = false
      }
    },
    cancelDevelopModeForm() {
      this.loading = false
      this.developMode = false
      this.developModeDialog = false
      this.$refs.developModeForm.reset()
    },
  },
  computed: {
    routes() {
      return [
        {
          to: '/',
          title: 'Dashboard',
          icon: 'mdi-view-dashboard-variant',
          isVisible: true
        },
        (this.getUser()?.scopes?.includes('events:view') || this.getUser()?.scopes?.includes('notifications:view')) ? {isDivider: true} : {isDivider: false},
        {
          to: '/events',
          title: 'Events',
          icon: 'mdi-gesture-tap',
          isVisible: this.getUser()?.scopes?.includes('events:view')
        },
        {
          to: '/notifications',
          title: 'Notifications',
          icon: 'mdi-bell',
          isVisible: this.getUser()?.scopes?.includes('notifications:view')
        },
        (this.getUser()?.scopes?.includes('offers:view') || this.getUser()?.scopes?.includes('iaps:view')) ? {isDivider: true} : {isDivider: false},
        {
          to: '/offers',
          title: 'Offers (Ads)',
          icon: 'mdi-tag',
          isVisible: (this.getUser()?.scopes?.includes('banners:view') || this.getUser()?.scopes?.includes('popups:view'))
        },
        {
          to: '/iaps',
          title: 'In App Purchase',
          icon: 'mdi-cash',
          isVisible: this.getUser()?.scopes?.includes('iaps:view')
        },
        (this.getUser()?.scopes?.includes('questions:view') || this.getUser()?.scopes?.includes('questions-old:view') || this.getUser()?.scopes?.includes('flagged-questions:view') || this.getUser()?.scopes?.includes('categories:view')) ? {isDivider: true} : {isDivider: false},
        {
          to: '/institutions',
          title: 'Institutions',
          icon: 'mdi-town-hall',
          isVisible: this.getUser()?.scopes?.includes('institutions:view')
        },
        {
          to: '/questions',
          title: 'Questions',
          icon: 'mdi-head-question',
          isVisible: this.getUser()?.scopes?.includes('questions:view')
        },
        {
          to: '/comments',
          title: 'Comments',
          icon: 'mdi-message',
          isVisible: this.getUser()?.scopes?.includes('comments:view')
        },
        {
          to: '/flagged-questions',
          title: 'Flagged Questions',
          icon: 'mdi-flag',
          isVisible: this.getUser()?.scopes?.includes('flagged-questions:view')
        },
        {
          to: '/passage-questions',
          title: 'Passage Questions',
          icon: 'mdi-format-paragraph',
          isVisible: this.getUser()?.scopes?.includes('passage-questions:view')
        },
        {
          to: '/categories',
          title: 'Categories',
          icon: 'mdi-format-list-bulleted',
          isVisible: this.getUser()?.scopes?.includes('categories:view')
        },
        {
          to: '/sub-categories',
          title: 'Sub Categories',
          icon: 'mdi-format-list-bulleted',
          isVisible: this.getUser()?.scopes?.includes('sub-categories:view')
        },
        {
          to: '/question-medias',
          title: 'Question Media',
          icon: 'mdi-image',
          isVisible: this.getUser()?.scopes?.includes('question-media:view')
        },
        {
          to: '/user-contributions',
          title: 'User Contributions',
          icon: 'mdi-head-question',
          isVisible: this.getUser()?.scopes?.includes('user-contributions:view')
        },

        (this.getUser()?.scopes?.includes('decks:view') || this.getUser()?.scopes?.includes('flashcards:view')) ? {isDivider: true} : {isDivider: false},
        {
          to: '/decks',
          title: 'Decks',
          icon: 'mdi-cards',
          isVisible: this.getUser()?.scopes?.includes('decks:view')
        },
        {
          to: '/flashcards',
          title: 'Flashcards',
          icon: 'mdi-lightning-bolt-circle',
          isVisible: this.getUser()?.scopes?.includes('flashcards:view')
        },
        (this.getUser()?.scopes?.includes('users:view') || this.getUser()?.scopes?.includes('reviews:view')) ? {isDivider: true} : {isDivider: false},
        {
          to: '/users',
          title: 'Users',
          icon: 'mdi-account-group',
          isVisible: this.getUser()?.scopes?.includes('users:view')
        },
        {
          to: '/account-deletion-requests',
          title: 'Account Deletion Requests',
          icon: 'mdi-account-group',
          isVisible: this.getUser()?.scopes?.includes('account-deletion:view')
        },
        {
          to: '/customers',
          title: 'Customers',
          icon: 'mdi-account-group',
          isVisible: this.getUser()?.scopes?.includes('customers:view')
        },
        {
          to: '/reviews',
          title: 'Reviews',
          icon: 'mdi-message-draw',
          isVisible: this.getUser()?.scopes?.includes('reviews:view')
        }
      ];
    }
  }
};
</script>

<style lang="sass" scoped>
.logo
  display: block
  margin: 5px auto
  border-radius: 10px

.route
  margin: 5px
  text-align: left
  overflow: hidden
  border-radius: 4px
  font-size: 20px !important
  font-family: "Roboto", sans-serif

  i
    font-size: 20px

  &--active i
    color: inherit

  &--active
    color: #495db7

.main-bg
  background: linear-gradient(to bottom, #1976d2 300px, white 300px)
</style>
