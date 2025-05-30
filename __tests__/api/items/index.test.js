const axios = require('axios');
const { API_URL } = require('../../../config');

describe('eBay API Integration', () => {
    test('should fetch items successfully', async () => {
        const response = await axios.get(`${API_URL}/items`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
    });

    test('should handle method not allowed', async () => {
        try {
            await axios.post(`${API_URL}/items`);
        } catch (error) {
            expect(error.response.status).toBe(405);
        }
    });
});