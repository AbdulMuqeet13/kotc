<template>
  <SimpleForm :onSubmit="submit" @done="$router.back()">
    <p class="span-2 form__title">{{ isEdit ? 'Update Deck' : 'Create New Deck' }}</p>
    <v-text-field
        v-model="deck.name"
        dense
        :rules="[required('A name must be provided')]"
        label="Name"
        outlined
        class="span-2"
    />

    <div class="span-2">
      <v-checkbox
          v-model="deck.is_premium"
          dense
          label="Is Premium"
          hide-details
      />
    </div>

    <loading-dialog v-model="loading" message="Fetching Deck Data"/>
  </SimpleForm>
</template>

<script>
import SimpleForm from '../../components/Form';
import LoadingDialog from '../../components/LoadingDialog';
import {required} from '@/utils/validators';
import {getDays} from "@/utils/local";
import {DecksService} from "@/services/deck-service";

export default {
  name: 'Form',
  components: {LoadingDialog, SimpleForm},

  data: () => ({
    isEdit: false,
    loading: false,
    service: new DecksService(),
    deck: {
      is_premium: false,
      from_admin: true
    },
    errors: []
  }),

  mounted() {
    this.loadDeck();
  },

  methods: {
    required,
    getDays,
    async loadDeck() {
      if (!this.$route.query.id) return;
      this.isEdit = true;
      this.loading = true;
      this.deck = await this.service.fetchOne(this.$route.query.id);
      this.loading = false;
    },
    preCheck(context) {
      if (!context.validate()) return false;

      return true;
    },
    async submit(context) {
      if (this.preCheck(context)) {
        if (this.isEdit) {
          context.changeLoadingMessage('Updating Deck');
          try {
            await this.service.update(this.deck);
            return true
          } catch (e) {
            console.log(e)
            context.reportError({
              title: 'Error occurred while updating Deck',
              description: e?.response?.data?.message || e.toString() || 'Some Error Occured'
            });
            return false
          }
        } else {
          try {
            context.changeLoadingMessage('Creating A New Deck');
            await this.service.create(this.deck);
            return true
          } catch (e) {
            console.log(e)
            context.reportError({
              title: 'Error occurred while creating Deck',
              description: e?.response?.data?.message || e.toString() || 'Some Error Occured'
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
