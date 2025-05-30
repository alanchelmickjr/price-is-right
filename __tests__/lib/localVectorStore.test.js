const axios = require('axios');
const { API_URL } = process.env;

describe('Local Vector Store', () => {
    test('should perform a valid operation', async () => {
        const response = await axios.post(`${API_URL}/vector-store`, { data: 'test' });
        expect(response.status).toBe(200);
    });
});