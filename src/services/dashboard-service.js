import axios from 'axios';

export class DashboardService {
    async fetch(mode) {
        return (await axios.get('/user-stats/dashboard?mode=' + mode)).data;
    }
}
