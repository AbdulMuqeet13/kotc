import axios from 'axios';

export class UserContributionService {
    async fetchAll(status) {
        return (await axios.get('/contributed-questions/status/' + status)).data;
    }
    async fetchOne(id) {
        return (await axios.get('/contributed-questions/' + id)).data;
    }
    async update(question) {
        return (await axios.patch('/contributed-questions', question)).data;
    }
    async updateStatus(status, id) {
        return (await axios.patch('/contributed-questions/'+ id + '/status/' + status)).data;
    }
}
