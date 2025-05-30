const axios = require('axios');
const mockAxios = require('jest-mock-axios');

afterEach(() => {
    mockAxios.reset();
});

test('eBay API integration', async () => {
    const responseData = { items: [{ id: 1, title: 'Item 1', price: 100 }] };
    mockAxios.post.mockResolvedValueOnce({ data: responseData });

    const response = await axios.post('https://api.ebay.com/sell/inventory/v1/inventory_item', {
        item: { title: 'Item 1', price: 100 }
    });

    expect(response.data).toEqual(responseData);
    expect(mockAxios.post).toHaveBeenCalledWith('https://api.ebay.com/sell/inventory/v1/inventory_item', expect.any(Object));
});