import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import MobileCameraInterface from '../../components/camera/MobileCameraInterface';
import Layout from '../../components/layout/Layout';
import AuthGuard from '../../components/auth/AuthGuard';
import mobileDataPipeline from '../../lib/mobileDataPipeline';

/**
 * Camera Scan Page - Real-time AI item recognition with mobile-first data pipeline
 * Converts camera feed to eBay listings with AI-powered price suggestions and P2P sync
 */
export default function ScanPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [lastRecognition, setLastRecognition] = useState(null);
  const [pipelineStats, setPipelineStats] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);

  useEffect(() => {
    // Initialize the mobile data pipeline
    initializePipeline();
  }, []);

  const initializePipeline = async () => {
    try {
      const result = await mobileDataPipeline.initialize();
      if (result.success) {
        console.log('✅ Mobile data pipeline initialized');
        updateStats();
      }
    } catch (error) {
      console.error('❌ Pipeline initialization failed:', error);
    }
  };

  const updateStats = () => {
    const stats = mobileDataPipeline.getSyncStats();
    setPipelineStats(stats);
  };

  // Handle AI recognition results with enhanced pipeline processing
  const handleRecognitionResult = async (result) => {
    console.log('🔍 Processing recognition result:', result);
    setLastRecognition(result);
    setIsProcessing(true);
    
    try {
      // Process through mobile data pipeline
      const pipelineResult = await mobileDataPipeline.processRecognitionResult(result);
      
      if (pipelineResult.success) {
        // Update UI with enhanced data
        const enhancedResult = {
          ...result,
          timestamp: new Date(),
          item: pipelineResult.item,
          similarItems: pipelineResult.similarItems || [],
          priceInsights: pipelineResult.priceInsights,
          optimizedCategory: pipelineResult.optimizedCategory,
          pipelineStats: pipelineResult.stats
        };

        setLastRecognition(enhancedResult);
        setSimilarItems(pipelineResult.similarItems || []);
        
        // Add to results history
        setRecognitionResults(prev => [
          enhancedResult,
          ...prev.slice(0, 9) // Keep last 10 results
        ]);

        // Update stats
        updateStats();

        // Auto-navigate to item details if high confidence
        if (result.confidence && result.confidence > 0.85 && pipelineResult.item) {
          setTimeout(() => {
            router.push(`/items/${pipelineResult.item.id}?fromScan=true&confidence=${result.confidence}`);
          }, 2000); // Give user time to see the result
        }
      }
    } catch (error) {
      console.error('❌ Pipeline processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Manual listing creation from current recognition
  const handleCreateListing = () => {
    if (lastRecognition?.item) {
      router.push(`/items/${lastRecognition.item.id}?fromScan=true`);
    } else if (lastRecognition) {
      // Fallback to manual creation
      router.push(`/items/new?recognition=${encodeURIComponent(JSON.stringify(lastRecognition))}`);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <Head>
          <title>Scan Items - Simply eBay</title>
          <meta name="description" content="Use AI to scan and recognize items for eBay listing" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>

        <div className="min-h-screen bg-gray-900">
          {/* Mobile Camera Interface */}
          <MobileCameraInterface
            onRecognitionResult={handleRecognitionResult}
            isProcessing={isProcessing}
            apiBaseUrl="http://localhost:8080"
          />

          {/* Recognition History - Mobile Optimized */}
          {recognitionResults.length > 0 && (
            <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur rounded-lg p-4 max-h-32 overflow-y-auto">
              <h4 className="text-sm font-medium text-white mb-2">Recent Scans</h4>
              <div className="space-y-2">
                {recognitionResults.slice(0, 3).map((result, index) => (
                  <div key={index} className="text-xs text-gray-300 border-l-2 border-blue-400 pl-2">
                    <div className="font-medium">{result.itemName || 'Unknown item'}</div>
                    <div className="text-green-400">{result.suggestedPrice ? `$${result.suggestedPrice}` : 'No price'} - {new Date(result.timestamp).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
}
