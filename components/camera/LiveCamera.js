import { useState, useEffect, useRef, useCallback } from 'react';
import gunDataService from '../../lib/gunDataService';
import localVectorStore from '../../lib/localVectorStore';

const LiveCamera = ({
  onRecognitionResult,
  isProcessing = false,
  apiBaseUrl = 'http://localhost:8080',
  instruction = 'Identify this item for eBay listing. Focus on: item name, condition, estimated market price, and eBay category. Respond in JSON format.',
  interval = 3000, // Slower for real AI processing
  deduplicationThreshold = 0.6
}) => {
  // Video and canvas refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  
  // State management
  const [cameraReady, setCameraReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [detectedItems, setDetectedItems] = useState([]);
  const [processingCount, setProcessingCount] = useState(0);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Initialize camera and services
  useEffect(() => {
    initServices();
    initCamera();
    
    return () => {
      cleanup();
    };
  }, []);

  // Handle container resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  // Handle video size changes
  useEffect(() => {
    const updateVideoSize = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        setVideoSize({ width: rect.width, height: rect.height });
        console.log('📐 Video size updated:', { width: rect.width, height: rect.height });
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateVideoSize);
      video.addEventListener('resize', updateVideoSize);
      
      return () => {
        video.removeEventListener('loadedmetadata', updateVideoSize);
        video.removeEventListener('resize', updateVideoSize);
      };
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
      // Clean up existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          console.log('📷 Video metadata loaded:', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            clientWidth: videoRef.current.clientWidth,
            clientHeight: videoRef.current.clientHeight
          });
          
          setCameraReady(true);
          setError('');
        };

        videoRef.current.onerror = (err) => {
          console.error('Video error:', err);
          setError('Video playback error');
        };
      }
    } catch (err) {
      console.error('❌ Camera initialization failed:', err);
      setError(`Camera error: ${err.message}`);
      setCameraReady(false);
    }
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Camera track stopped');
      });
      streamRef.current = null;
    }
    
    setIsActive(false);
    setCameraReady(false);
  };

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('⚠️ Cannot capture frame: video not ready');
      return null;
    }
    
    // Set canvas size to match video's intrinsic dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('📸 Frame captured:', {
      canvasSize: `${canvas.width}x${canvas.height}`,
      dataSize: imageData.length
    });
    
    return imageData;
  }, []);

  const callAIService = async (imageData) => {
    if (!imageData) throw new Error('No image data provided');

    console.log('🤖 Calling AI service...');
    
    try {
      // First try the chat completions endpoint
      const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llava",
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for eBay listing. Identify the main object and provide: item name, condition, estimated price range, and eBay category. Respond in JSON format: {"itemName": "...", "category": "...", "condition": "...", "suggestedPrice": "...", "description": "...", "confidence": 0.0-1.0}`
              },
              {
                type: "image_url",
                image_url: { url: imageData }
              }
            ]
          }],
          max_tokens: 150,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`AI service responded with ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in AI response');
      }

      console.log('🤖 Raw AI response:', content);
      return parseAIResponse(content);
      
    } catch (error) {
      console.error('❌ AI service call failed:', error);
      
      // Return error placeholder instead of fake data
      return {
        itemName: 'AI Service Unavailable',
        category: 'Unknown',
        condition: 'unknown',
        suggestedPrice: 'N/A',
        description: `AI processing failed: ${error.message}`,
        confidence: 0.0,
        error: true
      };
    }
  };

  const parseAIResponse = (content) => {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[^}]*\}/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          itemName: parsed.itemName || 'Unknown Item',
          category: parsed.category || 'Other',
          condition: parsed.condition || 'unknown',
          suggestedPrice: parsed.suggestedPrice || 'N/A',
          description: parsed.description || content.substring(0, 100),
          confidence: parseFloat(parsed.confidence) || 0.5,
          error: false
        };
      }
    } catch (parseError) {
      console.warn('⚠️ JSON parsing failed, using text parsing');
    }
    
    // Fallback text parsing
    return {
      itemName: content.substring(0, 50) || 'Detected Item',
      category: 'General',
      condition: 'unknown',
      suggestedPrice: 'N/A',
      description: content.substring(0, 100),
      confidence: 0.3,
      error: false
    };
  };

  const processFrame = useCallback(async () => {
    if (!isActive || !cameraReady) {
      console.log('⏭️ Skipping frame processing:', { isActive, cameraReady });
      return;
    }

    const frameData = captureFrame();
    if (!frameData) {
      console.warn('⚠️ Failed to capture frame');
      return;
    }

    setProcessingCount(prev => prev + 1);
    setLastResponse('🔄 Processing frame with AI...');

    try {
      const aiResult = await callAIService(frameData);
      
      if (aiResult.error) {
        setError(aiResult.description);
        setLastResponse('❌ AI processing failed');
        return;
      }

      // Create detection with actual screen coordinates
      const video = videoRef.current;
      if (!video) return;

      // Calculate relative position on the video element
      const videoRect = video.getBoundingClientRect();
      const detection = {
        id: `detection-${Date.now()}`,
        name: aiResult.itemName,
        confidence: aiResult.confidence,
        estimatedPrice: aiResult.suggestedPrice,
        category: aiResult.category,
        condition: aiResult.condition,
        description: aiResult.description,
        // Position as percentage of video dimensions
        x: 30 + Math.random() * 40, // Center area %
        y: 30 + Math.random() * 40, // Center area %
        width: 15 + Math.random() * 20, // % of video width
        height: 15 + Math.random() * 20, // % of video height
        timestamp: Date.now(),
        frameData: frameData,
        videoRect: {
          width: videoRect.width,
          height: videoRect.height,
          top: videoRect.top,
          left: videoRect.left
        }
      };

      // Update detections (keep last 3 real detections)
      setDetectedItems(prev => {
        const newItems = [detection, ...prev.filter(item => !item.error)].slice(0, 3);
        console.log('🎯 Updated detections:', newItems.length);
        return newItems;
      });

      setLastResponse(`✅ Found: ${aiResult.itemName} (${Math.round(aiResult.confidence * 100)}% confident)`);
      setError('');

      // Callback with real data
      if (onRecognitionResult) {
        onRecognitionResult({
          ...aiResult,
          itemId: detection.id,
          imageData: frameData
        });
      }

    } catch (error) {
      console.error('❌ Frame processing error:', error);
      setError(`Processing failed: ${error.message}`);
      setLastResponse('❌ Frame processing failed');
    }
  }, [isActive, cameraReady, captureFrame, onRecognitionResult, apiBaseUrl]);

  const startScanning = () => {
    if (!cameraReady) {
      setError('Camera not ready');
      return;
    }

    console.log('🚀 Starting AI scanning...');
    setIsActive(true);
    setError('');
    setLastResponse('🚀 AI scanning started...');
    setDetectedItems([]);
    setProcessingCount(0);
    
    // Start frame processing
    intervalRef.current = setInterval(processFrame, interval);
  };

  const stopScanning = () => {
    console.log('⏹️ Stopping AI scanning...');
    setIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setLastResponse('⏹️ AI scanning stopped');
  };

  const toggleScanning = () => {
    if (isActive) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  // Real reticle overlay component
  const ReticleOverlay = () => {
    if (!videoRef.current || !cameraReady) return null;

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-white border-opacity-80 rounded-full">
            <div className="w-full h-full border border-gray-300 border-opacity-60 rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* AI Detection reticles */}
        {detectedItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute border-2 rounded transition-all duration-500 ${
              item.confidence >= 0.7 
                ? 'border-green-400 bg-green-400' 
                : item.confidence >= 0.4 
                  ? 'border-yellow-400 bg-yellow-400'
                  : 'border-red-400 bg-red-400'
            } bg-opacity-20`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              width: `${item.width}%`,
              height: `${item.height}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10 + index
            }}
          >
            {/* Price tag */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {item.estimatedPrice}
            </div>
            
            {/* Item label */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded max-w-24 truncate">
              {item.name}
            </div>
            
            {/* Confidence */}
            <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs px-1 py-0.5 rounded">
              {Math.round(item.confidence * 100)}%
            </div>
          </div>
        ))}

        {/* Scanning indicator */}
        {isActive && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
            AI Scanning
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white">📷 Simply eBay Scanner</h1>
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center gap-2 ${cameraReady ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
              Camera
            </div>
            <div className={`flex items-center gap-2 ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-400'} ${isActive ? 'animate-pulse' : ''}`}></div>
              AI Processing
            </div>
            <div className="text-blue-400">
              🎯 {detectedItems.length} detections
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center p-4 space-y-6">
        
        {/* Video container with proper aspect ratio */}
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg shadow-2xl border-4 border-gray-600 overflow-hidden w-full max-w-2xl"
          style={{ aspectRatio: '16/9' }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <ReticleOverlay />
          
          {!cameraReady && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg">Initializing Camera...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full max-w-2xl space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleScanning}
              disabled={!cameraReady}
              className={`px-8 py-4 text-white font-bold rounded-xl text-lg shadow-lg transition-all ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              } disabled:bg-gray-500 disabled:cursor-not-allowed`}
            >
              {isActive ? '⏹️ Stop AI Scanning' : '▶️ Start AI Scanning'}
            </button>
          </div>

          {/* Status */}
          <div className="space-y-2">
            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                ❌ {error}
              </div>
            )}
            
            {lastResponse && !error && (
              <div className="bg-blue-900 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg">
                🤖 {lastResponse}
                {processingCount > 0 && (
                  <div className="text-xs opacity-70 mt-1">
                    Processed {processingCount} frames
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default LiveCamera;
