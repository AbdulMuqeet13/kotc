import axios from 'axios';

export class AccountDeletionService {
    async fetchAll() {
        return (await axios.get('/account-deletion-requests')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/account-deletion-requests/' + id)).data;
    }
}
