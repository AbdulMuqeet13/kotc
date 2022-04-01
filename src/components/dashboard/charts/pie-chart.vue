<template>
  <pieChart
      v-if="!loading"
      class="py-5"
      :chart-data="data"
      :options="options"
      :height="230"
  />
  <div style="height: 100%" class="d-flex justify-center align-center pa-16" v-else>
    <v-progress-circular indeterminate/>
  </div>
</template>

<script>
import PieChart from '@/utils/charts/pie-chart'
import {DashboardService} from "@/services/dashboard-service";

export default {
  name: "PieChartComp",
  components: {PieChart},
  data: () => ({
    loading: false,
    service: new DashboardService(),
    data: {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          backgroundColor: ['#80d7b5', '#ee8782'],
          data: [],
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Questions Analytics',
        fontSize: 22,
        fontColor: '#6b7280',
      },
    },
  }),
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.loading = true
      this.service.fetch(1).then((item) => {
        this.data.datasets[0].data.push(item.correct)
        this.data.datasets[0].data.push(item.incorrect)
        this.data = {...this.data}
        this.loading = false
      })
    },
  },
}
</script>

<style scoped>

</style>
