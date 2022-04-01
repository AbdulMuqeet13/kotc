<template>
  <div>
    <div class="dashboard-cards">
      <stat-card title="Total Games" :value="dashboardCards.games" color="secondary" :loading="loading"/>
      <stat-card title="Total Multiplayer Games" :value="dashboardCards.multiplayer_games" color="purple"
                 :loading="loading"/>
      <stat-card title="Multiplayer Games Won" :value="dashboardCards.win" color="green" :loading="loading"/>
      <stat-card title="Multiplayer Games Lost" :value="dashboardCards.lost" color="pink" :loading="loading"/>
    </div>
    <div class="dashboard-graphs">
      <v-card class="dashboard-graph">
        <PieChartComp />
      </v-card>
      <v-card class="dashboard-graph">
        <bar-chart-games />
      </v-card>
    </div>
    <div class="dashboard-graphs-one">
      <v-card class="dashboard-graph">
        <bar-chart-users />
      </v-card>
      <v-card class="dashboard-graph">
        <LineChartComp />
      </v-card>
    </div>
  </div>
</template>

<script>

import StatCard from "@/components/dashboard/StatCard";
import {DashboardService} from "@/services/dashboard-service";
import PieChartComp from "@/components/dashboard/charts/pie-chart";
import BarChartGames from "@/components/dashboard/charts/bar-chart-games";
import BarChartUsers from "@/components/dashboard/charts/bar-chart-users";
import LineChartComp from "@/components/dashboard/charts/line-chart";

export default {
  name: 'Home',
  components: {LineChartComp, BarChartUsers, BarChartGames, PieChartComp, StatCard},
  data: () => ({
    loading: false,
    loadingDialog: false,
    dashboardCards: {},
    service: new DashboardService(),
  }),
  mounted() {
    this.getDashboardData()
  },
  methods: {
    delay(ms) {
      return new Promise(res => setTimeout(res, ms))
    },
    async getDashboardData() {
      this.loading = true
      // await this.delay(1000)
      this.service.fetch(0).then((item) => {
        this.dashboardCards = item
        this.loading = false
      })
    },
  },

};
</script>

<style scoped>
.dashboard-cards {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

.dashboard-graphs {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

.dashboard-graphs-one {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  margin-bottom: 30px;
}

@media screen and (min-width: 580px) {
  .dashboard-cards {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-graphs {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-graphs-one {
    grid-template-columns: 1fr 1fr;
  }
}

@media screen and (min-width: 1000px) {
  .dashboard-cards {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  .dashboard-graphs {
    grid-template-columns: 1fr 2fr;
  }

  /*.dashboard-graphs-one {*/
  /*  grid-template-columns: 2fr 1fr;*/
  /*}*/
}

</style>
