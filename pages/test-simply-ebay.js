import { useState } from 'react';
import { useRouter } from 'next/router';

export default function TestSimplyEbay() {
  const router = useRouter();
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      data,
      timestamp: Date.now() 
    }]);
  };

  const testAIServer = async () => {
    addResult('AI Server', 'testing', 'Testing LlamaFile AI server connection...');
    try {
      const response = await fetch('http://localhost:8080/health');
      if (response.ok) {
        addResult('AI Server', 'pass', 'LlamaFile AI server is running on :8080');
      } else {
        addResult('AI Server', 'fail', `Server responded with status: ${response.status}`);
      }
    } catch (error) {
      addResult('AI Server', 'fail', `Connection failed: ${error.message}`);
    }
  };

  const testGunRelay = async () => {
    addResult('Gun.js P2P', 'testing', 'Testing Gun.js relay server...');
    try {
      const response = await fetch('http://localhost:8765/gun');
      addResult('Gun.js P2P', 'pass', 'Gun.js P2P relay is running on :8765');
    } catch (error) {
      addResult('Gun.js P2P', 'fail', `Connection failed: ${error.message}`);
    }
  };

  const testEbayAPI = async () => {
    addResult('eBay API', 'testing', 'Testing eBay API integration...');
    try {
      const response = await fetch('/api/test/ebay-connection');
      const result = await response.json();
      if (result.success) {
        addResult('eBay API', 'pass', 'eBay API connection working');
      } else {
        addResult('eBay API', 'fail', result.error || 'Unknown error');
      }
    } catch (error) {
      addResult('eBay API', 'fail', `API test failed: ${error.message}`);
    }
  };

  const testCameraAPI = async () => {
    addResult('Camera API', 'testing', 'Testing browser camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      addResult('Camera API', 'pass', 'Camera access granted');
    } catch (error) {
      addResult('Camera API', 'fail', `Camera access denied: ${error.message}`);
    }
  };

  const testVectorStore = async () => {
    addResult('Vector Store', 'testing', 'Testing local vector storage...');
    try {
      const response = await fetch('/api/test/vector-store');
      const result = await response.json();
      if (result.success) {
        addResult('Vector Store', 'pass', `Vector store operational: ${result.vectorCount} vectors`);
      } else {
        addResult('Vector Store', 'fail', result.error || 'Vector store error');
      }
    } catch (error) {
      addResult('Vector Store', 'fail', `Test failed: ${error.message}`);
    }
  };

  const runFullTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('System', 'testing', '🚀 Starting Simply eBay system validation...');
    
    await testAIServer();
    await testGunRelay(); 
    await testEbayAPI();
    await testCameraAPI();
    await testVectorStore();
    
    addResult('System', 'pass', '✅ System validation complete!');
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'border-green-200 bg-green-50 text-green-800';
      case 'fail': return 'border-red-200 bg-red-50 text-red-800';
      case 'testing': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📱 Simply eBay System Test
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive validation of all AI-powered mobile selling features
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-sm font-medium">AI Vision</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🔗</div>
                <div className="text-sm font-medium">P2P Sync</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">📸</div>
                <div className="text-sm font-medium">Camera</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl mb-2">🛒</div>
                <div className="text-sm font-medium">eBay API</div>
              </div>
            </div>

            <button
              onClick={runFullTest}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none"
            >
              {loading ? '🔄 Testing System...' : '🚀 Run Full System Test'}
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border-2 shadow-sm ${getStatusColor(result.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(result.status)}</span>
                  <span className="text-lg font-semibold">{result.test}</span>
                </div>
                <span className="text-sm opacity-70">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm">
                {result.message}
              </div>
              {result.data && (
                <pre className="mt-2 text-xs bg-black bg-opacity-10 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {testResults.length > 0 && !loading && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Ready to Test Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium">Test Dashboard</div>
                <div className="text-sm text-gray-600">System overview & stats</div>
              </button>
              
              <button
                onClick={() => router.push('/items/scan')}
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📸</div>
                <div className="font-medium">Test Camera Scan</div>
                <div className="text-sm text-gray-600">AI item recognition</div>
              </button>
              
              <button
                onClick={() => router.push('/items')}
                className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-medium">Test Items List</div>
                <div className="text-sm text-gray-600">P2P synchronized items</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
