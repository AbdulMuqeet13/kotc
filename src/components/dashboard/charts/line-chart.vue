<template>
  <line-chart
      v-if="!loading"
      class="py-5"
      :chart-data="data"
      :options="options"
      :height="170"
  />
  <div style="height: 100%" class="d-flex justify-center align-center pa-16" v-else>
    <v-progress-circular indeterminate/>
  </div>
</template>

<script>
import {DashboardService} from "@/services/dashboard-service";
import LineChart from "@/utils/charts/line-chart";

export default {
  name: "LineChartComp",
  components: {LineChart},
  data: () => ({
    loading: false,
    service: new DashboardService(),
    data: {
      labels: ['Endless', 'Timed', 'Reviewed', 'qBank', 'Boolean Blitz'],
      datasets: [{
        label: 'Total Games Played',
        data: [],
        fill: false,
        borderColor: '#f5c187',
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Game Modes Analytics',
        fontSize: 18,
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
      this.service.fetch(3).then((item) => {
        this.data.datasets[0].data.push(item.endless)
        this.data.datasets[0].data.push(item.timed)
        this.data.datasets[0].data.push(item.reviewed)
        this.data.datasets[0].data.push(item.qbank)
        this.data.datasets[0].data.push(item.boolean_blitz)
        this.data = {...this.data}
        this.loading = false
      })
    },
  },
}
</script>

<style scoped>

</style>
