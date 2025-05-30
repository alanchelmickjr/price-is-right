const axios = require('axios');
const mockAxios = require('jest-mock-axios');

afterEach(() => {
    mockAxios.reset();
});

test('should fetch eBay items successfully', async () => {
    const items = [{ id: 1, title: 'Item 1', price: 100 }];
    mockAxios.get.mockResolvedValueOnce({ data: items });

    const response = await axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search?q=example');
    expect(response.data).toEqual(items);
});

test('should handle eBay API errors', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Method not allowed'));

    await expect(axios.get('https://api.ebay.com/buy/browse/v1/item_summary/search?q=example')).rejects.toThrow('Method not allowed');
});