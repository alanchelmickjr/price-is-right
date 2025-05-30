const axios = require('axios');
const { API_URL } = require('../../config');

describe('eBay API Integration', () => {
    test('should connect to eBay API and return items', async () => {
        const response = await axios.get(`${API_URL}/items`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('items');
    });
});

const { connectToGun } = require('../../lib/gunDataService');

describe('Gun.js P2P Relay Server', () => {
    test('should connect to Gun.js relay server', async () => {
        const connection = await connectToGun();
        expect(connection).toBeTruthy();
    });
});

const { storeItem } = require('../../lib/localVectorStore');

describe('Local Vector Store', () => {
    test('should store item correctly', async () => {
        const item = { id: 1, name: 'Test Item' };
        const response = await storeItem(item);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id', item.id);
    });
});