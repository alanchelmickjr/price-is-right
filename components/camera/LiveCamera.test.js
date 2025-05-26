import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import LiveCamera from './LiveCamera';

// Mocks for external dependencies
jest.mock('../../lib/gunDataService', () => ({
  getCurrentUser: jest.fn(),
  createItem: jest.fn(),
  storeRecognition: jest.fn()
}));
jest.mock('../../lib/localVectorStore', () => ({
  initialize: jest.fn(),
  generateImageEmbedding: jest.fn(),
  storeVector: jest.fn(),
  findSimilar: jest.fn(),
  saveToStorage: jest.fn()
}));

// Mock for navigator.mediaDevices
beforeAll(() => {
  if (!global.navigator) {
    global.navigator = {};
  }
  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn()
    },
    configurable: true
  });
});

describe('LiveCamera TDD (London School)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOM mocks if needed
  });

  it('Given camera access fails, When component mounts, Then error message is shown', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    const { findByText } = render(<LiveCamera />);
    expect(await findByText(/Camera error/i)).toBeInTheDocument();
  });

  it('Given camera access succeeds, When user starts scanning, Then processFrame pipeline is triggered', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    const { getByText, findByText } = render(<LiveCamera />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    // Expect some AI response or status to appear
    expect(await findByText(/Processing started/i)).toBeInTheDocument();
  });

  it('Given AI API returns valid JSON, When processFrame runs, Then detected item is processed and callbacks fire', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    // Mock fetch for AI API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: JSON.stringify({
          itemName: 'Test Item',
          category: 'Electronics',
          condition: 'new',
          suggestedPrice: '$42',
          description: 'A test item',
          confidence: 0.99
        })
      })
    });
    const onRecognitionResult = jest.fn();
    const { getByText } = render(<LiveCamera onRecognitionResult={onRecognitionResult} />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    await waitFor(() => expect(onRecognitionResult).toHaveBeenCalled());
    expect(onRecognitionResult.mock.calls[0][0]).toMatchObject({
      itemName: 'Test Item',
      suggestedPrice: '$42',
      category: 'Electronics',
      condition: 'new',
      description: 'A test item',
      confidence: 0.99
    });
  });

  it('Given vector embedding fails, When handleVectorProcessing runs, Then error is handled gracefully', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    require('../../lib/localVectorStore').generateImageEmbedding.mockRejectedValueOnce(new Error('Embedding error'));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: JSON.stringify({
          itemName: 'Test Item',
          category: 'Electronics',
          condition: 'new',
          suggestedPrice: '$42',
          description: 'A test item',
          confidence: 0.99
        })
      })
    });
    const { getByText } = render(<LiveCamera />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    // No crash, error handled
    await waitFor(() => expect(getByText(/AI Response/i)).toBeInTheDocument());
  });

  it('Given Gun.js sync fails, When handleGunSync runs, Then error is handled gracefully', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    require('../../lib/gunDataService').getCurrentUser.mockReturnValue(true);
    require('../../lib/gunDataService').createItem.mockImplementation(() => { throw new Error('Gun error'); });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: JSON.stringify({
          itemName: 'Test Item',
          category: 'Electronics',
          condition: 'new',
          suggestedPrice: '$42',
          description: 'A test item',
          confidence: 0.99
        })
      })
    });
    const { getByText } = render(<LiveCamera />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    // No crash, error handled
    await waitFor(() => expect(getByText(/AI Response/i)).toBeInTheDocument());
  });

  it('Given AI API returns malformed response, When processFrame runs, Then fallback parsing and error handling occur', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: 'nonsense response'
      })
    });
    const { getByText } = render(<LiveCamera />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    await waitFor(() => expect(getByText(/AI Response/i)).toBeInTheDocument());
  });

  it('Given user stops scanning, When Stop Scanning is clicked, Then processing halts and state resets', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    const { getByText } = render(<LiveCamera />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    await waitFor(() => expect(getByText(/Stop Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Stop Scanning/i));
    await waitFor(() => expect(getByText(/Processing stopped/i)).toBeInTheDocument());
  });

  // Edge: Similar items found
  it('Given similar items exist, When processFrame completes, Then similarItems are included in callback', async () => {
    navigator.mediaDevices.getUserMedia.mockResolvedValueOnce({
      getTracks: () => [{ stop: jest.fn() }]
    });
    require('../../lib/localVectorStore').findSimilar.mockReturnValue([
      { id: '1', itemName: 'Similar 1' },
      { id: '2', itemName: 'Similar 2' }
    ]);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: JSON.stringify({
          itemName: 'Test Item',
          category: 'Electronics',
          condition: 'new',
          suggestedPrice: '$42',
          description: 'A test item',
          confidence: 0.99
        })
      })
    });
    const onRecognitionResult = jest.fn();
    const { getByText } = render(<LiveCamera onRecognitionResult={onRecognitionResult} />);
    await waitFor(() => expect(getByText(/Start Scanning/i)).toBeEnabled());
    fireEvent.click(getByText(/Start Scanning/i));
    await waitFor(() => expect(onRecognitionResult).toHaveBeenCalled());
    expect(onRecognitionResult.mock.calls[0][0].similarItems).toHaveLength(2);
  });
});


jest.mock('./LiveCamera'); // For dependency injection/mocking if needed

describe('LiveCamera module', () => {
  describe('processFrame', () => {
    let mockHandleVectorProcessing, mockHandleGunSync, mockSetState, frameData;

    beforeEach(() => {
      mockHandleVectorProcessing = jest.fn();
      mockHandleGunSync = jest.fn();
      mockSetState = jest.fn();
      frameData = { image: 'fakeImageData', timestamp: Date.now() };
      LiveCamera.handleVectorProcessing = mockHandleVectorProcessing;
      LiveCamera.handleGunSync = mockHandleGunSync;
    });

    it('Given valid frame data, When processFrame is called, Then it should call handleVectorProcessing and handleGunSync with correct arguments', async () => {
      await LiveCamera.processFrame(frameData, mockSetState);
      expect(mockHandleVectorProcessing).toHaveBeenCalledWith(frameData, mockSetState);
      expect(mockHandleGunSync).toHaveBeenCalledWith(frameData, mockSetState);
    });

    it('Given missing frame data, When processFrame is called, Then it should not call processing functions and should handle error gracefully', async () => {
      await expect(LiveCamera.processFrame(null, mockSetState)).resolves.not.toThrow();
      expect(mockHandleVectorProcessing).not.toHaveBeenCalled();
      expect(mockHandleGunSync).not.toHaveBeenCalled();
    });

    it('Given handleVectorProcessing throws, When processFrame is called, Then it should catch and report the error', async () => {
      mockHandleVectorProcessing.mockImplementation(() => { throw new Error('Vector error'); });
      await expect(LiveCamera.processFrame(frameData, mockSetState)).resolves.not.toThrow();
      // Optionally: check for error reporting/logging if implemented
    });
  });

  describe('handleVectorProcessing', () => {
    let frameData, mockSetState, mockVectorService;

    beforeEach(() => {
      frameData = { image: 'img', timestamp: 123 };
      mockSetState = jest.fn();
      mockVectorService = { process: jest.fn() };
      // Dependency injection if possible
    });

    it('Given valid frame data, When handleVectorProcessing is called, Then it should process the frame and update state', async () => {
      mockVectorService.process.mockResolvedValue({ vectors: [1, 2, 3] });
      // Assume handleVectorProcessing accepts a vectorService param for testability
      await LiveCamera.handleVectorProcessing(frameData, mockSetState, mockVectorService);
      expect(mockVectorService.process).toHaveBeenCalledWith(frameData.image);
      expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({ vectors: [1, 2, 3] }));
    });

    it('Given vectorService throws, When handleVectorProcessing is called, Then it should handle the error gracefully', async () => {
      mockVectorService.process.mockRejectedValue(new Error('Vector fail'));
      await expect(LiveCamera.handleVectorProcessing(frameData, mockSetState, mockVectorService)).resolves.not.toThrow();
      // Optionally: check for error reporting/logging if implemented
    });

    it('Given missing frame data, When handleVectorProcessing is called, Then it should not call vectorService and should handle error', async () => {
      await expect(LiveCamera.handleVectorProcessing(null, mockSetState, mockVectorService)).resolves.not.toThrow();
      expect(mockVectorService.process).not.toHaveBeenCalled();
    });
  });

  describe('handleGunSync', () => {
    let frameData, mockSetState, mockGunService;

    beforeEach(() => {
      frameData = { image: 'img', timestamp: 123 };
      mockSetState = jest.fn();
      mockGunService = { sync: jest.fn() };
      // Dependency injection if possible
    });

    it('Given valid frame data, When handleGunSync is called, Then it should sync data and update state', async () => {
      mockGunService.sync.mockResolvedValue({ synced: true });
      await LiveCamera.handleGunSync(frameData, mockSetState, mockGunService);
      expect(mockGunService.sync).toHaveBeenCalledWith(frameData);
      expect(mockSetState).toHaveBeenCalledWith(expect.objectContaining({ gunSynced: true }));
    });

    it('Given gunService throws, When handleGunSync is called, Then it should handle the error gracefully', async () => {
      mockGunService.sync.mockRejectedValue(new Error('Gun fail'));
      await expect(LiveCamera.handleGunSync(frameData, mockSetState, mockGunService)).resolves.not.toThrow();
      // Optionally: check for error reporting/logging if implemented
    });

    it('Given missing frame data, When handleGunSync is called, Then it should not call gunService and should handle error', async () => {
      await expect(LiveCamera.handleGunSync(null, mockSetState, mockGunService)).resolves.not.toThrow();
      expect(mockGunService.sync).not.toHaveBeenCalled();
    });
  });
});