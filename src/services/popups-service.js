import axios from "axios";

export class PopupsService {
  async fetchAll() {
    return (await axios.get('/offers')).data;
  }

  async create(offer) {
    return (await axios.post('/offers', offer)).data;
  }

  async update(offer) {
    return (await axios.patch('/offers', offer)).data;
  }

  async delete(offer) {
    return (await axios.delete('/offers/' + offer.id)).data;
  }
}