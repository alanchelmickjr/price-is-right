import { useState } from 'react';
import Head from 'next/head';
import FreezeFrameOverlay from '../components/camera/FreezeFrameOverlay';

/**
 * Beta Test Page - Freeze Frame Camera Demo
 * Tests the new "smart constraints" approach to camera recognition
 */
export default function BetaTestPage() {
  const [recognitionResults, setRecognitionResults] = useState([]);

  const handleFrameProcessed = (results) => {
    console.log('🎯 Beta test - frame processed:', results);
    setRecognitionResults(prev => [results, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  return (
    <>
      <Head>
        <title>Beta Test - Freeze Frame Camera | Simply eBay</title>
        <meta name="description" content="Testing the new freeze-frame recognition system" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        {/* Header */}
        <div className="bg-gray-800 bg-opacity-50 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-2">
              🚀 Beta Test: Freeze Frame Magic
            </h1>
            <p className="text-gray-300 text-center text-sm">
              Testing smart constraints approach - reticles on captured images, not live video
            </p>
          </div>
        </div>

        {/* Main Camera Interface */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">
              📸 Smart Freeze-Frame Camera
            </h2>
            
            {/* Camera Container */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <FreezeFrameOverlay
                onFrameProcessed={handleFrameProcessed}
                apiBaseUrl="http://localhost:8080"
                instruction="Identify items for eBay listing with estimated prices and categories."
                showPrices={true}
                showConfidence={true}
              />
            </div>

            {/* Instructions */}
            <div className="mt-4 text-sm text-gray-400">
              <p>📋 <strong>How it works:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Camera automatically captures frames every 3 seconds</li>
                <li>AI processes the frozen frame (not live video)</li>
                <li>Reticles appear smoothly on the captured image</li>
                <li>Manual capture available with the green button</li>
              </ul>
            </div>
          </div>

          {/* Results Panel */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              📊 Recognition Results
            </h3>

            {recognitionResults.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">🤖</div>
                <p>Waiting for AI recognition results...</p>
                <p className="text-sm mt-1">Point camera at items to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recognitionResults.map((frameResult, frameIndex) => (
                  <div 
                    key={frameResult.frameId || frameIndex}
                    className="bg-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-emerald-400 font-medium">
                        Frame {frameResult.frameId}
                      </h4>
                      <div className="text-xs text-gray-400">
                        ⚡ {frameResult.processingTime}ms
                      </div>
                    </div>

                    {frameResult.items && frameResult.items.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {frameResult.items.map((item, itemIndex) => (
                          <div 
                            key={itemIndex}
                            className="bg-gray-600 rounded p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-white">
                                {item.name || 'Unknown Item'}
                              </h5>
                              <span className={`text-xs px-2 py-1 rounded ${
                                (item.confidence || 0) >= 0.8 ? 'bg-emerald-600' :
                                (item.confidence || 0) >= 0.6 ? 'bg-amber-600' : 'bg-red-600'
                              }`}>
                                {Math.round((item.confidence || 0) * 100)}%
                              </span>
                            </div>
                            
                            {item.estimatedPrice && (
                              <div className="text-emerald-300 font-bold mb-1">
                                💰 {item.estimatedPrice}
                              </div>
                            )}
                            
                            {item.category && (
                              <div className="text-blue-300 text-sm mb-1">
                                📂 {item.category}
                              </div>
                            )}
                            
                            {item.description && (
                              <div className="text-gray-300 text-sm">
                                {item.description}
                              </div>
                            )}

                            {/* Position data for debugging */}
                            <div className="text-xs text-gray-400 mt-2">
                              📍 x:{item.x}% y:{item.y}% ({item.width}×{item.height}px)
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">
                        No items detected in this frame
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Beta Status */}
          <div className="mt-6 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg p-4 text-center">
            <h3 className="text-lg font-bold mb-2">🎯 Beta Status: Freeze-Frame Magic</h3>
            <p className="text-sm opacity-90">
              Working WITH AI constraints, not against them. Real-time lag becomes freeze-frame feature!
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Don't use the default layout
BetaTestPage.getLayout = function getLayout(page) {
  return page;
};
