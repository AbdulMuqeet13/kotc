<template>
  <bar-chart
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
import BarChart from "@/utils/charts/bar-chart";

export default {
  name: "BarChartUsers",
  components: {BarChart},
  data: () => ({
    loading: false,
    service: new DashboardService(),
    data: {
      labels: ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      datasets: [{
        label: 'Weekly Active Users',
        backgroundColor: [
          '#495db6',
          '#495db6',
          '#495db6',
          '#495db6',
          '#495db6',
          '#495db6',
          '#495db6',
        ],
        data: [],
        fill: true,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Weekly User Analytics',
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
      this.service.fetch(4).then((item) => {
        this.data.datasets[0].data.push(item.sunday)
        this.data.datasets[0].data.push(item.monday)
        this.data.datasets[0].data.push(item.tuesday)
        this.data.datasets[0].data.push(item.wednesday)
        this.data.datasets[0].data.push(item.thursday)
        this.data.datasets[0].data.push(item.friday)
        this.data.datasets[0].data.push(item.saturday)
        this.data = {...this.data}
        this.loading = false
      })
    },
  },
}
</script>

<style scoped>

</style>
