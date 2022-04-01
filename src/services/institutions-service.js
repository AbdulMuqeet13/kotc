import axios from 'axios';

export class InstitutionsService {
    async fetchAll() {
        return (await axios.get('/institutions')).data;
    }

    async create(institution) {
        return (await axios.post('/institutions', institution)).data;
    }

    async delete(institution) {
        return (await axios.delete('/institutions/' + institution.id)).data;
    }

    async update(institution) {
        return (await axios.patch('/institutions', institution)).data;
    }
}
