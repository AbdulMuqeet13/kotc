import axios from 'axios';

export class IapsOffersService {
    async fetchAll(id) {
        return (await axios.get('/subscription-offer/product/' + id)).data;
    }

    async create(iapsOffers) {
        return (await axios.post('/subscription-offer', iapsOffers)).data;
    }

    async delete(iapsOffers) {
        return (await axios.delete('/subscription-offer/' + iapsOffers.id)).data;
    }

    async update(iapsOffers) {
        return (await axios.patch('/subscription-offer', iapsOffers)).data;
    }
}
