import axios from 'axios';

export class EventService {
    async fetchAll() {
        return (await axios.get('/flows')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/flows/' + id)).data;
    }

    async create(event) {
        return (await axios.post('/flows', event)).data;
    }

    async update(event) {
        return (await axios.patch('/flows', event)).data;
    }

    async delete(event) {
        return (await axios.delete('/flows/' + event.id)).data;
    }
}
