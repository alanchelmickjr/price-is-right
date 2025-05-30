const axios = require('axios');
const { API_URL } = process.env;

describe('Vector Store API', () => {
    test('should create a new vector', async () => {
        const response = await axios.post(`${API_URL}/vectors`, { data: 'sample vector' });
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
    });

    test('should retrieve a vector', async () => {
        const response = await axios.get(`${API_URL}/vectors/1`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('data');
    });

    test('should update a vector', async () => {
        const response = await axios.put(`${API_URL}/vectors/1`, { data: 'updated vector' });
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('data', 'updated vector');
    });

    test('should delete a vector', async () => {
        const response = await axios.delete(`${API_URL}/vectors/1`);
        expect(response.status).toBe(204);
    });
});