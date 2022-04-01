import axios from 'axios';

export class SubCategoryService {
    async fetchAll() {
        return (await axios.get('/subcategories')).data;
    }

    async fetchOne(id) {
        return (await axios.get('/subcategories/' + id)).data;
    }

    async create(category) {
        return (await axios.post('/subcategories', category)).data;
    }

    async update(category) {
        return (await axios.patch('/subcategories', category)).data;
    }

    async delete(user) {
        return (await axios.delete('/subcategories/' + user.id)).data;
    }
}
