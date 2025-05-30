const axios = require('axios');
const { serverUrl } = require('../../config');

test('Gun.js P2P relay server connection', async () => {
    const response = await axios.get(`${serverUrl}/gun`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Gun.js P2P relay is running');
});