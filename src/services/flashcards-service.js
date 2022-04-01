import axios from 'axios';

export class FlashcardsService {
    async fetchAll() {
        return (await axios.get('/flashcards/admin/all')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/flashcards/' + id)).data;
    }

    async create(notification) {
        return (await axios.post('/flashcards', notification)).data;
    }

    async delete(notification) {
        return (await axios.delete('/flashcards/' + notification.id)).data;
    }

    async update(notification) {
        return (await axios.patch('/flashcards', notification)).data;
    }
}
