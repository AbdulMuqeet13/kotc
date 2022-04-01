import axios from 'axios';

export class CategoryService {
  async fetchAll() {
    return (await axios.get('/categories')).data;
  }

  async fetchOne(id) {
    return (await axios.get('/categories/' + id)).data;
  }

  async create(category) {
    return (await axios.post('/categories', category)).data;
  }

  async update(category) {
    return (await axios.patch('/categories', category)).data;
  }

  async delete(user) {
    return (await axios.delete('/categories/' + user.id)).data;
  }
}
