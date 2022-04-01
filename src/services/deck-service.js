import axios from 'axios';

export class DecksService {
    async fetchAll() {
        return (await axios.get('/decks/admin')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/decks/' + id)).data;
    }

    async create(notification) {
        return (await axios.post('/decks', notification)).data;
    }

    async delete(notification) {
        return (await axios.delete('/decks/' + notification.id)).data;
    }

    async update(notification) {
        return (await axios.patch('/decks', notification)).data;
    }
}
