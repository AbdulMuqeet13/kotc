<template>
  <div>
    <v-tabs v-model="tab">
      <v-tab>Pending</v-tab>
      <v-tab>Approved</v-tab>
      <v-tab>Rejected</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <UserContributionTable :status="0"/>
      </v-tab-item>
      <v-tab-item>
        <UserContributionTable :status="1"/>
      </v-tab-item>
      <v-tab-item>
        <UserContributionTable :status="2"/>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import UserContributionTable from "@/components/questions/UserContributionDataTable";


export default {
  components: {UserContributionTable},

  data: () => ({
    tab: null,
  }),

  methods: {}
};
</script>

<style lang="sass" scoped>
.chip
  font-weight: 500
  padding: 5px 10px
  border-radius: 50px
  background: lightgray
</style>


<!--<template>-->
<!--  <div>-->
<!--    <data-table-->
<!--        :loader="loadData"-->
<!--        :headers="headers"-->
<!--        title="User Contributions"-->
<!--        :allow-add="false"-->
<!--        @done="$router.back()"-->
<!--        :delete-handler="null"-->
<!--        :edit-handler="getUser() ? getUser().scopes.includes('user-contributions:edit') ? edit : null : null"-->
<!--    >-->
<!--      <template v-slot:extra-actions="item">-->
<!--        <v-icon v-if="getUser() && getUser().scopes.includes('user-contributions:edit')" small color="success" @click="approve(item)">mdi-check</v-icon>-->
<!--        <v-icon v-if="getUser() && getUser().scopes.includes('user-contributions:edit')" small color="error" @click="reject(item)">mdi-close</v-icon>-->
<!--      </template>-->
<!--      <template v-slot:category="{ item }">-->
<!--        {{ getCategoryName(item.category) }}-->
<!--      </template>-->
<!--      <template v-slot:type="{ item }">-->
<!--        {{ getType(item.type) }}-->
<!--      </template>-->
<!--      <template v-slot:user_id="{ item }">-->
<!--        {{ item.username }}-->
<!--      </template>-->
<!--    </data-table>-->
<!--    <LoadingDialog v-model="loading" message="Loading..."/>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import DataTable from '../../components/DataTable';-->
<!--import LoadingDialog from "@/components/LoadingDialog";-->
<!--import {questionsOld, userContributionQuestions, users} from "@/plugins/firebase";-->
<!--import {getUser} from '@/utils/local';-->
<!--import {required} from '@/utils/validators';-->

<!--export default {-->
<!--  name: 'QuestionsTemporaryView',-->
<!--  components: {LoadingDialog, DataTable},-->

<!--  methods: {-->
<!--    getUser,-->
<!--    required,-->
<!--    edit(item) {-->
<!--      this.$router.push(`/user-contribution?id=${item.id}`);-->
<!--    },-->
<!--    async loadData() {-->
<!--      const snapshot = await userContributionQuestions.get()-->
<!--      const data = []-->
<!--      snapshot.docs.map(async (doc) => {-->
<!--        const userRef = users.doc(doc.data().user_id)-->
<!--        const user = await userRef.get().then((item) => {-->
<!--          return item.data()-->
<!--        })-->
<!--        data.push({id: doc.id, ...doc.data(), username: user.email})-->
<!--      })-->
<!--      return data-->
<!--    },-->

<!--    getCategoryName(id) {-->
<!--      if (id === '23a1987c-3f61-445a-93eb-ae51f9295c61') {-->
<!--        return 'Biology'-->
<!--      } else if (id === '5cbb35e6-3c8f-4f0c-80e9-1750038b636b') {-->
<!--        return 'Physics'-->
<!--      } else if (id === 'b25477b7-5bd9-42b9-98f3-3c3bf4b4f494') {-->
<!--        return 'Organic Chemistry'-->
<!--      } else if (id === 'b6274519-21a0-432a-82f0-7a998e33baa5') {-->
<!--        return 'Behavioral Science'-->
<!--      } else if (id === 'baf6c412-c8b3-4bc2-b461-7b7920d4eb89') {-->
<!--        return 'General Chemistry'-->
<!--      } else if (id === 'c711d753-f826-4009-a30a-05aa8e81d51e') {-->
<!--        return 'Biochemistry'-->
<!--      } else {-->
<!--        return '&#45;&#45;&#45;&#45;'-->
<!--      }-->
<!--    },-->
<!--    async delete(item) {-->
<!--      await userContributionQuestions.doc(item.id).delete().then(() => {-->
<!--        window.console.log('deleted')-->
<!--      }).catch((e) => {-->
<!--        window.console.log(e)-->
<!--      })-->
<!--    },-->
<!--    getType(type) {-->
<!--      if (type === 'bool') {-->
<!--        return 'True False'-->
<!--      } else {-->
<!--        return 'Multiple Choice'-->
<!--      }-->
<!--    },-->
<!--    async approve(item) {-->
<!--      if (confirm('This Question will be approved')) {-->
<!--        this.loading = true-->
<!--        const data = {}-->

<!--        data.question = item.item.question-->
<!--        data.type = item.item.type-->
<!--        data.trial = item.item.trial-->
<!--        data.category = item.item.category-->
<!--        data.subcategory = item.item.subcategory-->
<!--        data.explanation = item.item.explanation-->
<!--        if (item.item.choices)-->
<!--          data.choices = item.item.choices-->
<!--        data.answer = item.item.answer-->
<!--        data.createdBy = item.item.username-->
<!--        data.created = new Date()-->
<!--        if (item.item.question_images)-->
<!--          data.question_images = item.item.question_images-->
<!--        if (item.item.question_pdfs)-->
<!--          data.question_pdfs = item.item.question_pdfs-->
<!--        if (item.item.question_videos)-->
<!--          data.question_videos = item.item.question_videos-->


<!--        try {-->
<!--          await questionsOld.add(data).then(() => {-->
<!--            this.delete(item.item)-->
<!--          }).catch((e) => {-->
<!--            window.console.log(e)-->
<!--          })-->
<!--        } catch (e) {-->
<!--          window.console.log(e)-->
<!--        }-->
<!--        document.getElementById('refresh').click()-->
<!--        this.loading = false-->
<!--      }-->
<!--    },-->
<!--    reject(item) {-->
<!--      if (confirm('This Question will be deleted!')) {-->
<!--        this.delete(item.item)-->
<!--        document.getElementById('refresh').click()-->
<!--      }-->
<!--    }-->
<!--  },-->

<!--  data: () => ({-->
<!--    loading: false,-->

<!--    headers: [-->
<!--      {-->
<!--        text: 'Question Statement',-->
<!--        value: 'question',-->
<!--        sortable: false-->
<!--      },-->
<!--      {-->
<!--        text: 'Category',-->
<!--        value: 'category',-->
<!--        sortable: false-->
<!--      },-->
<!--      {-->
<!--        text: 'Type',-->
<!--        value: 'type'-->
<!--      },-->
<!--      {-->
<!--        text: 'User',-->
<!--        value: 'user_id'-->
<!--      },-->
<!--    ]-->
<!--  })-->
<!--}-->
<!--;-->
<!--</script>-->

<!--<style scoped></style>-->
