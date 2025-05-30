const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const mock = new MockAdapter(axios);

test('eBay API integration', async () => {
    mock.onGet('/api/ebay/items').reply(200, { items: [] });

    const response = await axios.get('/api/ebay/items');
    expect(response.status).toBe(200);
    expect(response.data.items).toBeDefined();
});