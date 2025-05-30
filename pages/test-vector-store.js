import { useState, useEffect } from 'react';
import localVectorStore from '../lib/localVectorStore';

export default function TestVectorStore() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAllMethods();
  }, []);

  const addResult = (test, status, message) => {
    setResults(prev => [...prev, { test, status, message, timestamp: Date.now() }]);
  };

  const testAllMethods = async () => {
    setLoading(true);
    setResults([]);

    try {
      // Test 1: Initialize
      addResult('Initialize', 'testing', 'Initializing vector store...');
      const initResult = await localVectorStore.initialize();
      addResult('Initialize', initResult ? 'pass' : 'fail', `Initialization: ${initResult}`);

      // Test 2: Generate Embedding
      addResult('Generate Embedding', 'testing', 'Testing text embedding generation...');
      const embedding = await localVectorStore.generateEmbedding('test item description');
      addResult('Generate Embedding', Array.isArray(embedding) ? 'pass' : 'fail', 
        `Generated embedding with ${embedding?.length || 0} dimensions`);

      // Test 3: Store Vector
      addResult('Store Vector', 'testing', 'Testing vector storage...');
      localVectorStore.storeVector('test-item-1', embedding, { 
        name: 'Test Item', 
        category: 'Electronics' 
      });
      addResult('Store Vector', 'pass', 'Vector stored successfully');

      // Test 4: Get All Vectors
      addResult('Get All Vectors', 'testing', 'Testing getAllVectors method...');
      const allVectors = localVectorStore.getAllVectors();
      addResult('Get All Vectors', Array.isArray(allVectors) ? 'pass' : 'fail', 
        `Found ${allVectors.length} vectors`);

      // Test 5: Get Vector Count
      addResult('Get Vector Count', 'testing', 'Testing getVectorCount method...');
      const count = localVectorStore.getVectorCount();
      addResult('Get Vector Count', typeof count === 'number' ? 'pass' : 'fail', 
        `Vector count: ${count}`);

      // Test 6: Find Similar
      addResult('Find Similar', 'testing', 'Testing similarity search...');
      const similar = localVectorStore.findSimilar(embedding, 5, 0.5);
      addResult('Find Similar', Array.isArray(similar) ? 'pass' : 'fail', 
        `Found ${similar.length} similar vectors`);

      // Test 7: Get Vector by ID
      addResult('Get Vector', 'testing', 'Testing getVector method...');
      const vector = localVectorStore.getVector('test-item-1');
      addResult('Get Vector', vector !== null ? 'pass' : 'fail', 
        `Retrieved vector: ${vector ? 'found' : 'not found'}`);

      // Test 8: Save to Storage
      addResult('Save to Storage', 'testing', 'Testing saveToStorage method...');
      localVectorStore.saveToStorage();
      addResult('Save to Storage', 'pass', 'Saved to localStorage');

      // Test 9: Remove Vector (alias test)
      addResult('Remove Vector', 'testing', 'Testing removeVector method...');
      const removed = localVectorStore.removeVector('test-item-1');
      addResult('Remove Vector', removed ? 'pass' : 'fail', 
        `Remove result: ${removed}`);

      // Test 10: Clear (alias test)
      addResult('Clear', 'testing', 'Testing clear method...');
      localVectorStore.clear();
      const countAfterClear = localVectorStore.getVectorCount();
      addResult('Clear', countAfterClear === 0 ? 'pass' : 'fail', 
        `Count after clear: ${countAfterClear}`);

      // Test 11: Get Stats
      addResult('Get Stats', 'testing', 'Testing getStats method...');
      const stats = localVectorStore.getStats();
      addResult('Get Stats', typeof stats === 'object' ? 'pass' : 'fail', 
        `Stats: ${JSON.stringify(stats)}`);

    } catch (error) {
      addResult('Error', 'fail', `Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'testing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'testing': return '⏳';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Vector Store Test Suite
          </h1>
          <p className="text-gray-600 mb-4">
            Testing all localVectorStore methods to ensure compatibility with Simply eBay dashboard
          </p>
          
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-500">
              {results.length} tests {loading ? 'running' : 'completed'}
            </div>
            <button
              onClick={testAllMethods}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run Tests Again'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <span className="font-medium">{result.test}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-2 text-sm">
                {result.message}
              </div>
            </div>
          ))}
        </div>

        {!loading && results.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-3">📊 Test Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'pass').length}
                </div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.status === 'fail').length}
                </div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.status === 'testing').length}
                </div>
                <div className="text-sm text-yellow-600">Testing</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
