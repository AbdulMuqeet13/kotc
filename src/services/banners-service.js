import axios from "axios";

export class BannersService {
  async fetchAll() {
    return (await axios.get('/banners')).data;
  }
}