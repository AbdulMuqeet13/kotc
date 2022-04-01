<template>
  <div style="display: grid; grid-template-columns: 30% 1fr;gap:20px">
    <v-card class="pa-4">
      <v-select
          v-model="question.type"
          label="Select Type"
          :items="types"
          item-text="text"
          item-value="value"
          filled
          dense
          class="span-2"
          readonly
      />
      <v-textarea
          v-model="question.statement"
          dense
          label="Question Statement"
          class="span-2 modified-message"
          outlined
          readonly
      />
      <v-select
          v-model="question.trial"
          label="Trial"
          item-text="text"
          class="span-2"
          :items="trials"
          outlined
          readonly
          dense
      />
      <v-textarea
          v-model="question.explanation"
          dense
          label="Answer Explanation"
          class="span-2"
          outlined
          readonly
      />
      <div class="d-flex justify-end">
        <v-btn color="primary" elevation="0" target="_blank" :to="'/question?id=' + question.id">Edit Question</v-btn>
      </div>
    </v-card>
    <v-card min-width="70%">
      <v-tabs v-model="tab">
        <v-tab>Comments</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item class="py-4 px-2">
          <div v-if="comments && comments.length > 0">
            <div class="pa-2" v-for="(comment,i) in comments" :key="i">
              <v-card class="d-flex custom-gap" elevation="0" outlined>
                <div class="pt-4 pl-4">
                  <v-avatar class="elevation-1">
                    <p class="ma-0">{{ resolveInitials(comment.username) }}</p>
                  </v-avatar>
                </div>
                <div class="flex-grow-1">
                  <v-card-title>{{ comment.username }}</v-card-title>
                  <v-card-subtitle>{{ formatDate(comment.createdAt) }}</v-card-subtitle>
                  <v-card-text v-if="!comment.isEdit" class="pb-2 mb-2" style="overflow-wrap: anywhere">{{
                      comment.comment
                    }}
                  </v-card-text>
                  <div v-else class="px-4 mb-2">
                    <v-form ref="form">
                      <v-textarea v-model="editedComment" outlined :rules="[required()]"/>
                    </v-form>
                    <v-btn small class="mr-3" elevation="0" color="primary" @click="saveComment(comment)">Save</v-btn>
                    <v-btn small elevation="0" color="red" dark @click="cancelEditing(comment)">Cancel</v-btn>
                  </div>
                  <v-card-actions class="pa-0 pb-2 ml-4" v-if="!comment.isEdit">
                    <v-btn
                        v-if="!(comment.reply && comment.reply.length > 0) && getUser() && getUser().scopes.includes('comments:edit')"
                        color="green" small outlined
                        @click="openReplyEditor(comment)">Reply
                    </v-btn>
                    <v-btn v-if="getUser() && getUser().scopes.includes('comments:edit')" outlined color="primary" small
                           @click="openCommentEditor(comment)">Edit
                    </v-btn>
                    <v-btn v-if="getUser() && getUser().scopes.includes('comments:delete')" outlined color="red" small
                           @click="deleteComment(comment)">Delete
                    </v-btn>
                  </v-card-actions>
                  <v-card color="grey" elevation="0" outlined class="pa-4 ma-2 lighten-4"
                          v-if="comment.reply && comment.reply.length > 0">
                    <div v-for="(reply,i) in comment.reply" :key="i">
                      <div v-if="!reply.newReply">
                        <v-list-item class="pa-0 mb-2">
                          <v-list-item-avatar class="elevation-1" color="white">
                            <p class="ma-0">{{ resolveInitials(reply.admin.displayName) }}</p>
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title>{{ resolveDisplayName(reply.admin) }}</v-list-item-title>
                            <v-list-item-action-text>{{ formatDate(reply.createdAt) }}</v-list-item-action-text>
                          </v-list-item-content>
                        </v-list-item>
                        <v-card-text class="pa-0 ml-14 mb-3" style="overflow-wrap: anywhere">{{
                            reply.comment
                          }}
                        </v-card-text>
                        <v-card-actions class="pa-0 ml-14">
                          <v-btn v-if="getUser() && getUser().scopes.includes('comments:edit')" color="primary" outlined
                                 small @click="openReplyEditor(comment,i)">Edit
                          </v-btn>
                          <v-btn v-if="getUser() && getUser().scopes.includes('comments:delete')" outlined color="red"
                                 small
                                 @click="deleteReply(comment,i)">Delete
                          </v-btn>
                        </v-card-actions>
                      </div>
                      <div v-else class="px-4 mb-2">
                        <v-form ref="form">
                          <v-textarea v-model="newReply" outlined :rules="[required()]"/>
                        </v-form>
                        <v-btn small class="mr-3" elevation="0" color="primary" @click="saveReply(comment,i)">Save
                        </v-btn>
                        <v-btn small elevation="0" color="red" dark @click="cancelReply(comment, i)">Cancel
                        </v-btn>
                      </div>
                    </div>
                  </v-card>
                </div>
              </v-card>
            </div>
          </div>
          <div v-else class="d-flex justify-center align-center flex-column">
            <v-img :src="require('@/assets/no-comments.png')" max-width="250px"/>
            <h3>No Comments Yet</h3>
          </div>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <loading-dialog v-model="loading" message="Loading Data"/>
  </div>
</template>

<script>
import {required} from '@/utils/validators';
import {QuestionsService} from '@/services/questions-service';
import LoadingDialog from '../../components/LoadingDialog';
import dayjs from "dayjs";
import {getUser} from "@/utils/local";


export default {
  name: 'QuestionComments',
  components: {LoadingDialog},

  data: () => ({
    tab: null,
    question: {
      options: [],
      selected: null
    },
    comments: [],
    loading: false,
    service: new QuestionsService(),
    editedComment: '',
    newReply: '',
    types: [
      {
        text: 'Multiple Choice Question',
        value: 'choices'
      },
      {
        text: 'Boolean (True/False)',
        value: 'bool'
      }
    ],
    trials: [
      {
        text: 'Yes',
        value: 'true'
      },
      {
        text: 'No',
        value: 'false'
      }
    ],
  }),

  mounted() {
    this.loadQuestion();
  },

  methods: {
    getUser,
    required,
    async loadQuestion() {
      if (!this.$route.query.id) return;
      this.loading = true;
      try {
        this.question = await this.service.fetchOne(this.$route.query.id);
        this.question.trial = this.question.trial === true ? 'true' : 'false'
        if (this.question)
          this.comments = await this.service.fetchComments(this.$route.query.id);
      } catch (e) {
        window.console.log(e)
      }
      this.loading = false;
    },
    formatDate(date) {
      return dayjs(date).format('D MMM YYYY - hh:mm a');
    },
    resolveInitials(name) {
      return name[0].toUpperCase()
    },
    resolveDisplayName(user) {
      if (user.id === this.getUser().id)
        return 'You'
      else
        return user.displayName
    },
    async deleteComment(item) {
      if (confirm('Are you sure? This comment will be deleted')) {
        try {
          await this.service.deleteComment(item);
          const index = this.comments.indexOf(item);
          this.comments.splice(index, 1)
        } catch (e) {
          window.console.log(e)
        }
      }
    },
    openCommentEditor(item) {
      const index = this.comments.indexOf(item);
      this.comments[index].isEdit = true
      this.comments = [...this.comments]
      this.editedComment = item.comment
    },
    cancelEditing(item, flag = false) {
      const index = this.comments.indexOf(item);
      this.comments[index].isEdit = false
      if (flag)
        this.comments[index].comment = this.editedComment
      this.comments = [...this.comments]
    },
    async saveComment(item) {
      this.loading = true
      try {
        item.comment = this.editedComment
        await this.service.updateComment(item)
        this.cancelEditing(item, true)
      } catch (e) {
        window.console.log(e)
      }
      this.loading = false
    },
    openReplyEditor(item, i = -1) {
      const index = this.comments.indexOf(item);
      if (i === -1) {
        this.comments[index].reply = [{
          newReply: true
        }]
      } else {
        this.comments[index].reply[i].newReply = true
        this.comments[index].reply[i].edit = true
        this.newReply = this.comments[index].reply[i].comment
      }
      this.comments = [...this.comments]
    },
    async cancelReply(item, i) {
      const index = this.comments.indexOf(item);
      if (this.comments[index].reply[i].newReply) {
        if (this.comments[index].reply[i].edit) {
          this.comments[index].reply[i].newReply = false
          this.comments[index].reply[i].edit = false
        } else {
          await this.comments[index].reply.splice(i, 1)
          this.newReply = ''
        }
      }
      this.comments[index].reply = [...this.comments[index].reply]
      this.comments = [...this.comments]
    },
    async saveReply(item, i) {
      this.loading = true
      try {
        item.reply[i].comment = this.newReply
        const user = JSON.parse(localStorage.getItem('auth_user'))
        item.reply[i].admin = user.id
        item.reply[i].createdAt = new Date
        await this.service.updateComment(item)
        this.comments = await this.service.fetchComments(this.$route.query.id);
      } catch (e) {
        window.console.log(e)
      }
      this.loading = false
    },
    async deleteReply(item, i) {
      if (confirm('Are you sure? This reply will be deleted')) {
        this.loading = true
        try {
          item.reply.splice(i, 1)
          await this.service.updateComment(item)
          this.comments = await this.service.fetchComments(this.$route.query.id);
        } catch (e) {
          window.console.log(e)
        }
        this.loading = false
      }
    }
  }
};
</script>

<style scoped>

.custom-gap {
  gap: 15px;
}

</style>
