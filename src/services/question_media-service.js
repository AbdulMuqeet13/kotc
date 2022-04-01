import axios from 'axios';

export class QuestionMediaService {
    async fetchAll() {
        return (await axios.get('/question-media')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/question-media/' + id)).data;
    }

    async create(media) {
        return (await axios.post('/question-media', media)).data;
    }

    async update(media) {
        return (await axios.patch('/question-media', media)).data;
    }

    async delete(media) {
        return (await axios.delete('/question-media/' + media.id)).data;
    }
}
