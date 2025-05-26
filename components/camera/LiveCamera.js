import { useState, useEffect, useRef, useCallback } from 'react';
import gunDataService from '../../lib/gunDataService';
import localVectorStore from '../../lib/localVectorStore';
// Modularization: import new hooks for vector and Gun.js logic
// import useVectorProcessing from '../../hooks/useVectorProcessing';
// import useGunSync from '../../hooks/useGunSync';
import ReticleOverlay from './ReticleOverlay';

/**
 * LiveCamera component for real-time AI item recognition
 * Enhanced with Gun.js P2P sync and local vector storage
 */
const LiveCamera = ({
  onRecognitionResult,
  isProcessing = false,
  apiBaseUrl = 'http://localhost:8080',
  instruction = 'What do you see? Identify this item and suggest a price.',
  interval = 500,
  deduplicationThreshold = 0.6 // Configurable deduplication threshold
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [cameraReady, setCameraReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);

  // Initialize camera and services on mount
  useEffect(() => {
    initCamera();
    initServices();
    return () => {
      cleanup();
    };
  }, []);

  const initServices = async () => {
    try {
      // Initialize local vector store for similarity matching
      await localVectorStore.initialize();
      console.log('Vector store initialized');
    } catch (error) {
      console.warn('Vector store initialization failed:', error);
    }
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraReady(true);
        setError('');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera error: ${err.name} - ${err.message}. Please ensure permissions are granted and you are on HTTPS or localhost.`);
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  };

  const captureImage = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!streamRef.current || !video || !video.videoWidth) {
      console.warn('Video stream not ready for capture.');
      return null;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const sendChatCompletionRequest = async (instruction, imageBase64URL) => {
    try {
      // Input validation for instruction and imageBase64URL
      if (typeof instruction !== 'string' || instruction.length > 500) {
        throw new Error('Invalid instruction input');
      }
      if (typeof imageBase64URL !== 'string' || !imageBase64URL.startsWith('data:image/')) {
        throw new Error('Invalid image data');
      }
      // For llamafile with LLaVA, we need to use the completion endpoint with image data
      const imageData = imageBase64URL.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      
      const response = await fetch(`${apiBaseUrl}/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `USER: ${instruction} Please respond in this JSON format: {"itemName": "specific item name", "category": "eBay category", "condition": "new/used/good/fair", "suggestedPrice": "price range like $10-25", "description": "brief description", "confidence": 0.85}\nASSISTANT:`,
          max_tokens: 200,
          temperature: 0.1,
          image_data: [{
            data: imageData,
            id: 1
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const content = data.content;
      
      // Try to parse JSON response, fallback to text parsing
      try {
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parse failed, using text parsing:', parseError);
      }
      
      // Fallback: parse text response for key information
      return parseTextResponse(content);
      
    } catch (error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
  };

  // Parse unstructured text response into structured data
  const parseTextResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    // Extract price patterns
    const priceMatch = text.match(/\$\d+(?:\.\d{2})?(?:\s*-\s*\$?\d+(?:\.\d{2})?)?/);
    const price = priceMatch ? priceMatch[0] : '';
    
    // Common eBay categories for everyday items
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Toys & Hobbies', 'Books', 'Health & Beauty', 'Sports', 'Automotive', 'Collectibles'];
    const foundCategory = categories.find(cat => lowerText.includes(cat.toLowerCase())) || 'Other';
    
    // Extract first sentence as item name
    const sentences = text.split(/[.!?]/);
    const itemName = sentences[0]?.trim() || 'Unknown Item';
    
    return {
      itemName: itemName.length > 50 ? itemName.substring(0, 50) + '...' : itemName,
      category: foundCategory,
      condition: lowerText.includes('new') ? 'new' : lowerText.includes('used') ? 'used' : 'good',
      suggestedPrice: price || '$5-20',
      description: text.length > 100 ? text.substring(0, 100) + '...' : text,
      confidence: 0.75 // Default confidence for text parsing
    };
  };

  // Handles vector embedding and similarity search for a detected item
  const handleVectorProcessing = useCallback((detectedItem, imageBase64URL) => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const imageElement = new Image();
        imageElement.onload = async () => {
          try {
            // Generate image embedding
            const embedding = await localVectorStore.generateImageEmbedding(imageElement);
            // Store the vector with metadata
            localVectorStore.storeVector(detectedItem.id.toString(), embedding, {
              itemName: detectedItem.name,
              category: detectedItem.category,
              price: detectedItem.estimatedPrice,
              condition: detectedItem.condition,
              confidence: detectedItem.confidence
            });
            // Find similar items
            const similar = localVectorStore.findSimilar(embedding, 3, 0.6);
            setSimilarItems(similar);
            // Auto-save vectors
            localVectorStore.saveToStorage();
          } catch (vectorError) {
            console.warn('Vector processing failed:', vectorError);
          }
        };
        imageElement.src = imageBase64URL;
      }
    } catch (vectorError) {
      console.warn('Vector embedding failed:', vectorError);
    }
  }, []);

  // Handles Gun.js sync for a detected item and AI response
  const handleGunSync = useCallback((detectedItem, aiResponse, imageBase64URL) => {
    try {
      if (gunDataService.getCurrentUser()) {
        // Create item in Gun.js
        const gunItem = gunDataService.createItem({
          name: detectedItem.name,
          category: detectedItem.category,
          condition: detectedItem.condition,
          price: detectedItem.estimatedPrice,
          description: detectedItem.description,
          confidence: detectedItem.confidence,
          images: [imageBase64URL],
          status: 'recognized'
        });
        // Store recognition data
        gunDataService.storeRecognition(gunItem.id, {
          ai_response: aiResponse,
          confidence: detectedItem.confidence,
          image_data: imageBase64URL
        });
        console.log('Item synced to Gun.js:', gunItem.id);
      }
    } catch (gunError) {
      console.warn('Gun.js sync failed:', gunError);
    }
  }, []);

  // Orchestrates the frame processing pipeline
  const processFrame = useCallback(async () => {
    if (!isActive) return;
    const imageBase64URL = captureImage();
    if (!imageBase64URL) {
      setError('Failed to capture image. Stream might not be active.');
      return;
    }
    try {
      const aiResponse = await sendChatCompletionRequest(instruction, imageBase64URL);
      setLastResponse(typeof aiResponse === 'string' ? aiResponse : aiResponse.description);
      setError('');
      // Create detected item object
      const detectedItem = {
        id: Date.now(),
        name: aiResponse.itemName || 'Unknown Item',
        confidence: aiResponse.confidence || 0.75,
        estimatedPrice: aiResponse.suggestedPrice || '$5-20',
        category: aiResponse.category || 'Other',
        condition: aiResponse.condition || 'good',
        description: aiResponse.description || '',
        x: 50 + Math.random() * 30,
        y: 40 + Math.random() * 20,
        imageData: imageBase64URL,
        timestamp: Date.now()
      };
      handleVectorProcessing(detectedItem, imageBase64URL);
      handleGunSync(detectedItem, aiResponse, imageBase64URL);
        // Deduplicate by vector similarity: only add if not similar to existing items
        let isDuplicate = false;
        if (similarItems && Array.isArray(similarItems) && similarItems.length > 0) {
          // If any similar item has a similarity above threshold, treat as duplicate
          // Assume similarItems[i] has a 'similarity' property (0-1), and 'id' or 'itemName'
          isDuplicate = similarItems.some(sim => sim.similarity >= deduplicationThreshold);
        }
        if (!isDuplicate) {
          setDetectedItems(prev => Array.isArray(prev) ? [...prev, detectedItem] : [detectedItem]);
        } else {
          setLastResponse('Duplicate item detected (vector similarity). Not added.');
        }
      if (onRecognitionResult) {
        onRecognitionResult({
          itemName: detectedItem.name,
          suggestedPrice: detectedItem.estimatedPrice,
          category: detectedItem.category,
          condition: detectedItem.condition,
          description: detectedItem.description,
          confidence: detectedItem.confidence,
          imageData: imageBase64URL,
          rawResponse: aiResponse,
          similarItems: similarItems,
          itemId: detectedItem.id
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setError(error.message);
      setDetectedItems([]);
    }
  }, [isActive, instruction, captureImage, onRecognitionResult, apiBaseUrl, similarItems, handleVectorProcessing, handleGunSync]);

  const handleStart = () => {
    if (!cameraReady) {
      setError('Camera not available. Cannot start.');
      return;
    }
    
    setIsActive(true);
    setError('');
    setLastResponse('Processing started...');
    
    // Initial immediate call
    processFrame();
    
    // Then set interval
    intervalRef.current = setInterval(processFrame, interval);
  };

  const handleStop = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLastResponse('Processing stopped.');
    setDetectedItems([]);
  };

  const toggleProcessing = () => {
    if (isActive) {
      handleStop();
    } else {
      handleStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Simply Ebay - Live Scanner</h1>
      
      {/* Camera Feed with Reticle Overlay */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-lg h-auto border-2 border-gray-800 rounded-lg bg-black"
          style={{ maxHeight: '60vh' }}
        />
        
        {/* Enhanced Reticle Overlay */}
        <ReticleOverlay 
          detectedItems={detectedItems}
          videoRef={videoRef}
          showPrices={true}
          showConfidence={true}
          onItemClick={(item) => {
            console.log('Item clicked:', item);
            // Could trigger detailed view or quick actions
          }}
        />
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Interval selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Scan interval:
          </label>
          <select 
            value={interval} 
            onChange={(e) => {/* interval prop change if needed */}}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
            disabled={isActive}
          >
            <option value="100">100ms</option>
            <option value="250">250ms</option>
            <option value="500">500ms</option>
            <option value="1000">1s</option>
            <option value="2000">2s</option>
          </select>
        </div>
        
        {/* Start/Stop button */}
        <button
          onClick={toggleProcessing}
          disabled={!cameraReady}
          className={`px-6 py-3 text-white font-semibold rounded-lg text-lg ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors`}
        >
          {isActive ? 'Stop Scanning' : 'Start Scanning'}
        </button>
        
        {/* Status display */}
        <div className="w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
              {error}
            </div>
          )}
          
          {!cameraReady && !error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
              Requesting camera access...
            </div>
          )}
          
          {lastResponse && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <div className="text-sm font-medium mb-1">AI Response:</div>
              <div className="text-sm">{lastResponse}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default LiveCamera;
