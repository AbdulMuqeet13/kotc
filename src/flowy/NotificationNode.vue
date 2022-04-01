<template>
  <v-card outlined flat bordered class="my-card bg-white pa-4" style="min-width: 200px; max-width: 300px">
    <div class="row items-center no-wrap">
      <div class="col">
        <div class="text-h6">{{ title }}</div>
      </div>
    </div>
    <div class="py-3"> Notification will be sent!</div>
    <div>
      <v-autocomplete
          v-model="node.notification"
          outlined
          dense
          :rules="[required('Select Notification')]"
          label="Notification Template"
          :items="notifications"
          item-text="title"
          :value-comparator="(a, b) => a && b && a === b"
          :item-value="(notification) => notification.id"
          @change="(item) => itemChanged(item)"
      >
      </v-autocomplete>
<!--      <v-select :rules="[required('Select Notification')]" v-model="node.notification"-->
<!--                :value-comparator="(a, b) => a && b && a.id === b.id" label="Notification Template" outlined dense-->
<!--                :items="notifications" item-text="title" item-value="id"             @change="(item) => itemChanged(item)"/>-->
    </div>
    <v-btn v-if="node.id !== '1'" color="primary" class="pa-0" no-caps @click="remove()">Remove</v-btn>
  </v-card>
</template>

<script>
import {required} from '@/utils/validators';
import {NotificationsService} from "@/services/notifications-service";

export default {
  name: "NotificationNode", data: () => ({
    notificationService: new NotificationsService(),
    notifications: [{
      label: 'Notification 1',
      value: 'n1'
    },
      {
        label: 'Notification 2',
        value: 'n2'
      },
      {
        label: 'Notification 3',
        value: 'n3'
      }]
  }),
  props: ['remove', 'node', 'title', 'description'],
  mounted() {
    this.getNotification()
  },
  methods: {
    required,
    itemChanged(item) {
      window.console.log(item)
    },
    async getNotification() {
      this.notifications = await this.notificationService.fetchAll()
    },
  }
}
</script>

<style scoped>

</style>
