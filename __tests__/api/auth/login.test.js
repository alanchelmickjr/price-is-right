const axios = require('axios');
const { API_URL } = require('../../../config');

describe('eBay API Integration', () => {
    test('should connect to eBay API and return items', async () => {
        const response = await axios.get(`${API_URL}/items`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('items');
    });
});