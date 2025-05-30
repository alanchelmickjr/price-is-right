import { useState, useEffect, useRef, useCallback } from 'react';
import gunDataService from '../../lib/gunDataService';
import localVectorStore from '../../lib/localVectorStore';
import ReticleOverlay from './ReticleOverlay';

const LiveCamera = ({
  onRecognitionResult,
  isProcessing = false,
  apiBaseUrl = 'http://localhost:8080',
  instruction = 'Identify this item for eBay listing. Focus on: item name, condition, estimated market price, and eBay category. Respond in JSON format.',
  interval = 1000,
  deduplicationThreshold = 0.6
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
  const [processingCount, setProcessingCount] = useState(0);

  // Initialize camera and services on mount
  useEffect(() => {
    initCamera();
    initServices();
    return () => {
      cleanup();
    };
  }, []);

  // Auto-start recognition when camera is ready
  useEffect(() => {
    if (cameraReady && !isActive) {
      // Auto-start after a short delay
      const timer = setTimeout(() => {
        handleStart();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cameraReady]);

  const initServices = async () => {
    try {
      await localVectorStore.initialize();
      console.log('✅ Vector store initialized');
    } catch (error) {
      console.warn('⚠️ Vector store initialization failed:', error);
    }
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          setError('');
          console.log('📷 Camera initialized successfully');
        };
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      setError(`Camera error: ${err.message}`);
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
    
    if (!video || !canvas || video.videoWidth === 0) {
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
      const imageData = imageBase64URL.split(',')[1];
      
      // Try LlamaFile chat/completions endpoint first
      const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llava",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${instruction} Please respond in this exact JSON format: {"itemName": "specific item name", "category": "eBay category", "condition": "new/used/good/fair", "suggestedPrice": "price range like $10-25", "description": "brief description", "confidence": 0.85}`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64URL
                  }
                }
              ]
            }
          ],
          max_tokens: 200,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        // Fallback to completion endpoint
        return await sendCompletionRequest(instruction, imageData);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || data.content || '';
      
      return parseAIResponse(content);
      
    } catch (error) {
      console.error('AI request failed:', error);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  };

  const sendCompletionRequest = async (instruction, imageData) => {
    const response = await fetch(`${apiBaseUrl}/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `USER: ${instruction}\nASSISTANT:`,
        max_tokens: 200,
        temperature: 0.1,
        image_data: [{
          data: imageData,
          id: 1
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return parseAIResponse(data.content);
  };

  const parseAIResponse = (content) => {
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[^}]*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          itemName: parsed.itemName || 'Unknown Item',
          category: parsed.category || 'Other',
          condition: parsed.condition || 'good',
          suggestedPrice: parsed.suggestedPrice || '$5-20',
          description: parsed.description || content.substring(0, 100),
          confidence: parsed.confidence || 0.75
        };
      }
    } catch (parseError) {
      console.log('JSON parse failed, using text parsing');
    }
    
    // Fallback text parsing
    return parseTextResponse(content);
  };

  const parseTextResponse = (text) => {
    const priceMatch = text.match(/\$\d+(?:\.\d{2})?(?:\s*-\s*\$?\d+(?:\.\d{2})?)?/);
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Toys', 'Books', 'Health & Beauty', 'Sports', 'Automotive'];
    const foundCategory = categories.find(cat => text.toLowerCase().includes(cat.toLowerCase())) || 'Other';
    
    const sentences = text.split(/[.!?]/);
    const itemName = sentences[0]?.trim().substring(0, 50) || 'Unknown Item';
    
    return {
      itemName,
      category: foundCategory,
      condition: text.toLowerCase().includes('new') ? 'new' : 'used',
      suggestedPrice: priceMatch?.[0] || '$5-20',
      description: text.substring(0, 100),
      confidence: 0.75
    };
  };

  const processFrame = useCallback(async () => {
    if (!isActive || !cameraReady) return;
    
    const imageBase64URL = captureImage();
    if (!imageBase64URL) {
      return;
    }

    setProcessingCount(prev => prev + 1);

    try {
      console.log('🔍 Processing frame...');
      const aiResponse = await sendChatCompletionRequest(instruction, imageBase64URL);
      
      setLastResponse(`Found: ${aiResponse.itemName} - ${aiResponse.suggestedPrice}`);
      setError('');

      // Create detected item with random position for demonstration
      const detectedItem = {
        id: Date.now(),
        name: aiResponse.itemName,
        confidence: aiResponse.confidence,
        estimatedPrice: aiResponse.suggestedPrice,
        category: aiResponse.category,
        condition: aiResponse.condition,
        description: aiResponse.description,
        x: 30 + Math.random() * 40, // Random position in center area
        y: 30 + Math.random() * 40,
        width: 120 + Math.random() * 60,
        height: 80 + Math.random() * 40,
        imageData: imageBase64URL,
        timestamp: Date.now()
      };

      // Add to detected items (keep last 5)
      setDetectedItems(prev => {
        const newItems = [detectedItem, ...prev].slice(0, 5);
        return newItems;
      });

      // Vector processing
      try {
        const canvas = canvasRef.current;
        if (canvas) {
          const imageElement = new Image();
          imageElement.onload = async () => {
            try {
              const embedding = await localVectorStore.generateImageEmbedding(imageElement);
              await localVectorStore.storeVector(detectedItem.id.toString(), embedding, {
                itemName: detectedItem.name,
                category: detectedItem.category,
                price: detectedItem.estimatedPrice,
                confidence: detectedItem.confidence
              });
              
              const similar = localVectorStore.findSimilar(embedding, 3, 0.6);
              setSimilarItems(similar);
            } catch (vectorError) {
              console.warn('Vector processing failed:', vectorError);
            }
          };
          imageElement.src = imageBase64URL;
        }
      } catch (vectorError) {
        console.warn('Vector embedding failed:', vectorError);
      }

      // Gun.js sync
      try {
        if (gunDataService.getCurrentUser()) {
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
        }
      } catch (gunError) {
        console.warn('Gun.js sync failed:', gunError);
      }

      // Callback
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
      console.error('❌ Recognition error:', error);
      setError(`Recognition failed: ${error.message}`);
    }
  }, [isActive, cameraReady, instruction, captureImage, onRecognitionResult, apiBaseUrl, similarItems]);

  const handleStart = () => {
    if (!cameraReady) {
      setError('Camera not ready');
      return;
    }
    
    setIsActive(true);
    setError('');
    setLastResponse('🚀 Scanning started...');
    setDetectedItems([]);
    
    // Start processing
    intervalRef.current = setInterval(processFrame, interval);
  };

  const handleStop = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLastResponse('⏹️ Scanning stopped');
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
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📷 Simply eBay - Live Scanner</h1>
      
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
            console.log('🎯 Item clicked:', item);
            if (onRecognitionResult) {
              onRecognitionResult({
                itemName: item.name,
                suggestedPrice: item.estimatedPrice,
                category: item.category,
                itemId: item.id
              });
            }
          }}
        />
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Controls */}
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        {/* Status Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className={`flex items-center gap-1 ${cameraReady ? 'text-green-600' : 'text-red-600'}`}>
            📷 Camera: {cameraReady ? 'Ready' : 'Loading...'}
          </div>
          <div className={`flex items-center gap-1 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
            🔍 Scanning: {isActive ? 'Active' : 'Stopped'}
          </div>
          <div className="text-blue-600">
            🎯 Items: {detectedItems.length}
          </div>
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
          {isActive ? '⏹️ Stop Scanning' : '▶️ Start Scanning'}
        </button>
        
        {/* Status display */}
        <div className="w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2">
              ❌ {error}
            </div>
          )}
          
          {lastResponse && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <div className="text-sm font-medium mb-1">🤖 AI Response:</div>
              <div className="text-sm">{lastResponse}</div>
              {processingCount > 0 && (
                <div className="text-xs mt-1 opacity-70">
                  Processed {processingCount} frame{processingCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
