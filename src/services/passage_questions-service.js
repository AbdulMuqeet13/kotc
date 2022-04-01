import axios from 'axios';

export class PassageQuestionsService {
    async fetchAll() {
        return (await axios.get('/passages')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/passages/' + id)).data;
    }

    async create(passage) {
        return (await axios.post('/passages', passage)).data;
    }

    async delete(passage) {
        return (await axios.delete('/passages/' + passage.id)).data;
    }

    async update(passage) {
        return (await axios.patch('/passages', passage)).data;
    }
}
