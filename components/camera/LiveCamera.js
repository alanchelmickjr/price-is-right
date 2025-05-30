import { useState, useEffect, useRef, useCallback } from 'react';
import gunDataService from '../../lib/gunDataService';
import localVectorStore from '../../lib/localVectorStore';

const LiveCamera = ({
  onRecognitionResult,
  isProcessing = false,
  apiBaseUrl = 'http://localhost:8080',
  instruction = 'Identify items for eBay listing.'
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const photoCanvasRef = useRef(null);
  
  // Core state
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  
  // Mode state
  const [mode, setMode] = useState('video'); // 'video' or 'camera'
  
  // Video mode state
  const [detectedItems, setDetectedItems] = useState([]);
  const [selectedReticle, setSelectedReticle] = useState(null);
  const [tapCoordinates, setTapCoordinates] = useState(null);
  
  // Camera mode state
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoItems, setPhotoItems] = useState([]);
  const [lastProcessingTime, setLastProcessingTime] = useState(0);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return cleanup;
  }, []);

  const initializeCamera = async () => {
    try {
      console.log('🚀 Initializing camera...');
      
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
        
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata loaded');
          videoRef.current.play().then(() => {
            console.log('▶️ Video playing');
            setCameraReady(true);
            setError('');
          }).catch(err => {
            console.error('❌ Video play failed:', err);
            setError('Failed to start video');
          });
        };
      }
    } catch (err) {
      console.error('❌ Camera init failed:', err);
      setError(`Camera access denied: ${err.message}`);
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Camera track stopped');
      });
      streamRef.current = null;
    }
    
    setCameraReady(false);
  };

  const captureFrame = useCallback((targetCanvas = canvasRef.current) => {
    const video = videoRef.current;
    const canvas = targetCanvas;
    
    if (!video || !canvas) {
      console.warn('⚠️ Video or canvas not available');
      return null;
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('⚠️ Video dimensions not ready');
      return null;
    }
    
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      console.log('📸 Frame captured successfully');
      return dataURL;
    } catch (err) {
      console.error('❌ Frame capture failed:', err);
      return null;
    }
  }, []);

  // Updated AI processing with multiple endpoint support
  const processWithAI = async (imageData, tapX = null, tapY = null) => {
    try {
      console.log('🤖 Sending to AI...', { 
        endpoint: apiBaseUrl,
        hasTapCoords: !!(tapX && tapY),
        imageSize: imageData.length 
      });
      
      const startTime = Date.now();
      
      // Try multiple endpoints and formats
      let result = null;
      let lastError = null;
      
      // Method 1: Try chat/completions with proper vision format
      try {
        result = await tryVisionChatCompletion(imageData, tapX, tapY);
        console.log('✅ Vision chat completion succeeded');
      } catch (error) {
        console.warn('⚠️ Vision chat completion failed:', error.message);
        lastError = error;
      }
      
      // Method 2: Try completion endpoint
      if (!result) {
        try {
          result = await tryCompletionEndpoint(imageData, tapX, tapY);
          console.log('✅ Completion endpoint succeeded');
        } catch (error) {
          console.warn('⚠️ Completion endpoint failed:', error.message);
          lastError = error;
        }
      }
      
      // Method 3: Try multimodal endpoint
      if (!result) {
        try {
          result = await tryMultimodalEndpoint(imageData, tapX, tapY);
          console.log('✅ Multimodal endpoint succeeded');
        } catch (error) {
          console.warn('⚠️ Multimodal endpoint failed:', error.message);
          lastError = error;
        }
      }
      
      if (!result) {
        throw lastError || new Error('All AI endpoints failed');
      }

      const processingTime = Date.now() - startTime;
      setLastProcessingTime(processingTime);
      
      console.log('✅ AI processing complete:', { processingTime, itemCount: result.length });
      return result;
      
    } catch (error) {
      console.error('❌ AI processing failed:', error);
      throw error;
    }
  };

  // Method 1: Vision Chat Completion (LLaVA style)
  const tryVisionChatCompletion = async (imageData, tapX, tapY) => {
    let prompt = "Look at this image and identify any items that could be sold on eBay. For each item, provide the name, category, condition, and estimated price. Respond with a JSON array.";
    
    if (tapX && tapY) {
      prompt = `Focus on the item at coordinates ${tapX}%, ${tapY}% in this image. ${prompt}`;
    }

    const response = await fetch(`${apiBaseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "llava",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageData } }
          ]
        }],
        max_tokens: 300,
        temperature: 0.1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat completion failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in chat completion response');
    }

    return parseAIContent(content, tapX, tapY);
  };

  // Method 2: Completion Endpoint
  const tryCompletionEndpoint = async (imageData, tapX, tapY) => {
    let prompt = "USER: Analyze this image and identify sellable items. Provide name, category, condition, and price for each.\nASSISTANT:";
    
    if (tapX && tapY) {
      prompt = `USER: Focus on item at ${tapX}%, ${tapY}% coordinates. ${prompt.split('USER: ')[1]}`;
    }

    // Extract base64 data
    const base64Data = imageData.split(',')[1];

    const response = await fetch(`${apiBaseUrl}/completion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.1,
        image_data: [{
          data: base64Data,
          id: 1
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Completion failed (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const content = result.content;
    
    if (!content) {
      throw new Error('No content in completion response');
    }

    return parseAIContent(content, tapX, tapY);
  };

  // Method 3: Multimodal Endpoint (if available)
  const tryMultimodalEndpoint = async (imageData, tapX, tapY) => {
    const base64Data = imageData.split(',')[1];
    
    let prompt = "Identify sellable items in this image. List name, category, condition, price for each.";
    if (tapX && tapY) {
      prompt = `Focus on item at ${tapX}%, ${tapY}%. ${prompt}`;
    }

    const response = await fetch(`${apiBaseUrl}/v1/images/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        prompt: prompt,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`Multimodal endpoint failed (${response.status})`);
    }

    const result = await response.json();
    const content = result.response || result.content || result.text;
    
    if (!content) {
      throw new Error('No content in multimodal response');
    }

    return parseAIContent(content, tapX, tapY);
  };

  const parseAIContent = (content, tapX = null, tapY = null) => {
    try {
      console.log('🔍 Parsing AI content:', content.substring(0, 200) + '...');
      
      // Try to find JSON array first
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        try {
          const items = JSON.parse(arrayMatch[0]);
          if (Array.isArray(items)) {
            return items.map((item, index) => ({
              id: `item-${Date.now()}-${index}`,
              itemName: item.itemName || item.name || item.item || 'Detected Item',
              category: item.category || item.type || 'General',
              condition: item.condition || item.state || 'used',
              price: item.price || item.cost || item.value || '$5-20',
              confidence: parseFloat(item.confidence || item.score || 0.5),
              description: item.description || item.details || '',
              x: tapX || (20 + Math.random() * 60),
              y: tapY || (20 + Math.random() * 60),
              width: 15 + Math.random() * 20,
              height: 15 + Math.random() * 20,
              timestamp: Date.now()
            }));
          }
        } catch (parseError) {
          console.warn('Array JSON parse failed:', parseError);
        }
      }
      
      // Try to find single JSON object
      const objectMatch = content.match(/\{[^}]*\}/);
      if (objectMatch) {
        try {
          const item = JSON.parse(objectMatch[0]);
          return [{
            id: `item-${Date.now()}`,
            itemName: item.itemName || item.name || item.item || 'Detected Item',
            category: item.category || item.type || 'General',
            condition: item.condition || item.state || 'used',
            price: item.price || item.cost || item.value || '$10-30',
            confidence: parseFloat(item.confidence || item.score || 0.5),
            description: item.description || item.details || '',
            x: tapX || 50,
            y: tapY || 50,
            width: 20,
            height: 20,
            timestamp: Date.now()
          }];
        } catch (parseError) {
          console.warn('Object JSON parse failed:', parseError);
        }
      }
      
      // Text parsing fallback
      console.log('📝 Using text parsing fallback');
      const lines = content.split('\n').filter(line => line.trim());
      const items = [];
      
      for (const line of lines.slice(0, 5)) { // Max 5 items
        if (line.length > 10) { // Skip short lines
          items.push({
            id: `item-${Date.now()}-${items.length}`,
            itemName: line.substring(0, 50).trim(),
            category: 'General',
            condition: 'used',
            price: '$5-25',
            confidence: 0.3,
            description: line.substring(0, 100),
            x: tapX || (20 + Math.random() * 60),
            y: tapY || (20 + Math.random() * 60),
            width: 15 + Math.random() * 20,
            height: 15 + Math.random() * 20,
            timestamp: Date.now()
          });
        }
      }
      
      return items.length > 0 ? items : [{
        id: `item-${Date.now()}`,
        itemName: 'Detected Object',
        category: 'General',
        condition: 'unknown',
        price: '$5-20',
        confidence: 0.2,
        description: 'AI detected an object but could not identify it clearly',
        x: tapX || 50,
        y: tapY || 50,
        width: 20,
        height: 20,
        timestamp: Date.now()
      }];
      
    } catch (error) {
      console.error('❌ Content parsing failed:', error);
      return [{
        id: `item-${Date.now()}`,
        itemName: 'Parse Error',
        category: 'Unknown',
        condition: 'unknown',
        price: 'N/A',
        confidence: 0.0,
        description: `Parsing failed: ${error.message}`,
        x: tapX || 50,
        y: tapY || 50,
        width: 20,
        height: 20,
        timestamp: Date.now()
      }];
    }
  };

  // VIDEO MODE: Handle video tap with coordinates
  const handleVideoTap = async (event) => {
    if (!cameraReady || isProcessingFrame || mode !== 'video') return;
    
    const rect = videoRef.current.getBoundingClientRect();
    const tapX = ((event.clientX - rect.left) / rect.width) * 100;
    const tapY = ((event.clientY - rect.top) / rect.height) * 100;
    
    console.log('👆 Video tapped at:', { tapX: tapX.toFixed(1), tapY: tapY.toFixed(1) });
    
    setTapCoordinates({ x: tapX, y: tapY });
    setIsProcessingFrame(true);
    setError('');
    
    try {
      const frameData = captureFrame();
      if (!frameData) {
        throw new Error('Failed to capture frame');
      }

      const aiResults = await processWithAI(frameData, tapX, tapY);
      
      // Add new detections, keep last 3
      setDetectedItems(prev => [...aiResults, ...prev].slice(0, 3));
      
      if (onRecognitionResult && aiResults[0]) {
        onRecognitionResult({
          ...aiResults[0],
          imageData: frameData,
          tapCoordinates: { x: tapX, y: tapY }
        });
      }
      
    } catch (error) {
      console.error('❌ Video tap processing error:', error);
      setError(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessingFrame(false);
      // Clear tap coordinates after a moment
      setTimeout(() => setTapCoordinates(null), 2000);
    }
  };

  // CAMERA MODE: Take photo and process
  const takePhoto = async () => {
    if (!cameraReady || isProcessingFrame || mode !== 'camera') return;
    
    console.log('📷 Taking photo...');
    setIsProcessingFrame(true);
    setError('');
    setPhotoItems([]);
    
    try {
      const photoData = captureFrame(photoCanvasRef.current);
      if (!photoData) {
        throw new Error('Failed to capture photo');
      }
      
      console.log('📸 Photo captured, processing with AI...');
      setCapturedPhoto(photoData);
      
      // Process with AI
      const aiResults = await processWithAI(photoData);
      console.log('🎯 AI results:', aiResults);
      
      setPhotoItems(aiResults);
      
      if (onRecognitionResult && aiResults.length > 0) {
        onRecognitionResult({
          mode: 'camera',
          imageData: photoData,
          items: aiResults,
          processingTime: lastProcessingTime
        });
      }
      
    } catch (error) {
      console.error('❌ Photo processing error:', error);
      setError(`Photo processing failed: ${error.message}`);
    } finally {
      setIsProcessingFrame(false);
    }
  };

  // Reticle menu actions
  const handleReticleAction = (item, action) => {
    console.log('🎯 Reticle action:', { item: item.itemName, action });
    
    switch (action) {
      case 'list':
        // Navigate to listing page with item data
        if (onRecognitionResult) {
          onRecognitionResult({
            action: 'create_listing',
            ...item
          });
        }
        break;
      case 'similar':
        // Find similar items
        console.log('🔍 Finding similar items...');
        break;
      case 'remove':
        if (mode === 'video') {
          setDetectedItems(prev => prev.filter(i => i.id !== item.id));
        } else {
          setPhotoItems(prev => prev.filter(i => i.id !== item.id));
        }
        break;
    }
    
    setSelectedReticle(null);
  };

  // Neumorphic styles
  const cardStyle = "bg-gray-100 rounded-2xl shadow-[inset_-12px_-8px_40px_#46464620] border border-white/20 backdrop-blur-sm";
  const darkCardStyle = "bg-gray-800 rounded-2xl shadow-[8px_8px_24px_#00000040,inset_-8px_-8px_24px_#ffffff10] border border-gray-700/50";
  const buttonStyle = "rounded-xl shadow-[8px_8px_16px_#00000020,inset_-8px_-8px_16px_#ffffff40] border border-white/30 transition-all duration-200 active:shadow-[inset_8px_8px_16px_#00000020]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Mode Toggle */}
        <div className={`${cardStyle} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">📷 eBay Scanner</h1>
            
            {/* Mode Toggle */}
            <div className="flex items-center bg-white/50 rounded-xl p-1">
              <button
                onClick={() => setMode('video')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'video' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                📹 Video
              </button>
              <button
                onClick={() => setMode('camera')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === 'camera' 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                📷 Camera
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${cameraReady ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium">Camera</span>
              </div>
              
              {mode === 'video' && (
                <div className="text-sm text-gray-600">
                  👆 Tap video to identify items
                </div>
              )}
              
              {mode === 'camera' && (
                <div className="text-sm text-gray-600">
                  📸 Take photo to analyze all items
                </div>
              )}
            </div>
            
            {lastProcessingTime > 0 && (
              <div className="text-sm text-gray-500">
                Last scan: {(lastProcessingTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Video/Camera Card */}
          <div className="lg:col-span-2">
            <div className={`${darkCardStyle} p-6 space-y-4`}>
              
              {/* Video Container */}
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onClick={handleVideoTap}
                  className={`w-full h-full object-cover ${mode === 'video' ? 'cursor-pointer' : 'cursor-default'}`}
                />
                
                {/* Reticle Overlay for Video Mode */}
                {mode === 'video' && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Center crosshair */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 border-2 border-white/80 rounded-full">
                        <div className="w-full h-full border border-gray-300/60 rounded-full flex items-center justify-center">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tap indicator */}
                    {tapCoordinates && (
                      <div
                        className="absolute w-4 h-4 border-2 border-yellow-400 rounded-full animate-ping"
                        style={{
                          left: `${tapCoordinates.x}%`,
                          top: `${tapCoordinates.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}
                    
                    {/* Detection reticles */}
                    {detectedItems.map((item, index) => (
                      <div key={item.id} className="pointer-events-auto">
                        <div
                          className={`absolute border-2 rounded-lg transition-all duration-500 cursor-pointer ${
                            item.confidence > 0.7 ? 'border-green-400 bg-green-400/20' :
                            item.confidence > 0.4 ? 'border-yellow-400 bg-yellow-400/20' :
                            'border-red-400 bg-red-400/20'
                          } ${selectedReticle === item.id ? 'ring-4 ring-blue-400/50' : ''}`}
                          style={{
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            width: `${item.width}%`,
                            height: `${item.height}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReticle(selectedReticle === item.id ? null : item.id);
                          }}
                        >
                          {/* Item info */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {item.price}
                          </div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded max-w-24 truncate">
                            {item.itemName}
                          </div>
                          
                          {/* Reticle menu */}
                          {selectedReticle === item.id && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-32">
                              <button
                                onClick={() => handleReticleAction(item, 'list')}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                              >
                                💰 List on eBay
                              </button>
                              <button
                                onClick={() => handleReticleAction(item, 'similar')}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                              >
                                🔍 Find Similar
                              </button>
                              <button
                                onClick={() => handleReticleAction(item, 'remove')}
                                className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                              >
                                ❌ Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Processing indicator */}
                    {isProcessingFrame && (
                      <div className="absolute top-4 left-4 bg-blue-600/90 text-white text-sm px-3 py-1 rounded-full flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                        Processing...
                      </div>
                    )}
                  </div>
                )}
                
                {/* Camera mode overlay */}
                {mode === 'camera' && capturedPhoto && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured" 
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                )}
                
                {/* Loading overlay */}
                {!cameraReady && (
                  <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-lg font-medium">Starting Camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode-specific controls */}
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                {mode === 'video' ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-white text-sm">
                      👆 <span className="font-medium">Tap video</span> to identify items
                    </div>
                    <div className="text-gray-300 text-xs">
                      Items: {detectedItems.length}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={takePhoto}
                      disabled={!cameraReady || isProcessingFrame}
                      className={`${buttonStyle} px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold disabled:bg-gray-500`}
                    >
                      {isProcessingFrame ? '⏳ Processing...' : '📸 Take Photo'}
                    </button>
                    
                    {capturedPhoto && (
                      <button
                        onClick={() => {
                          setCapturedPhoto(null);
                          setPhotoItems([]);
                        }}
                        className={`${buttonStyle} px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium`}
                      >
                        🔄 Reset
                      </button>
                    )}
                  </div>
                )}
                
                <div className="text-right text-gray-300 text-sm">
                  {isProcessingFrame && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                      AI Processing...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className={`${cardStyle} p-6`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {mode === 'video' ? '📹 Video Mode' : '📷 Camera Mode'}
              </h3>
              
              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  ❌ {error}
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isProcessingFrame ? 'text-blue-600' : 'text-green-600'}>
                    {isProcessingFrame ? 'Processing' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="font-semibold capitalize">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Endpoint:</span>
                  <span className="text-xs">{apiBaseUrl}</span>
                </div>
                {mode === 'video' && (
                  <div className="flex justify-between">
                    <span>Detections:</span>
                    <span className="font-semibold">{detectedItems.length}</span>
                  </div>
                )}
                {mode === 'camera' && (
                  <div className="flex justify-between">
                    <span>Items Found:</span>
                    <span className="font-semibold">{photoItems.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {mode === 'video' && detectedItems.length > 0 && (
              <div className={`${cardStyle} p-6`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Video Detections</h3>
                <div className="space-y-3">
                  {detectedItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="bg-white/50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800">{item.itemName}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="text-xs text-gray-500">{item.condition}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{item.price}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(item.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'camera' && photoItems.length > 0 && (
              <div className={`${cardStyle} p-6`}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Photo Analysis</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {photoItems.map((item, index) => (
                    <div key={item.id} className="bg-white/50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-800">{item.itemName}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="text-xs text-gray-500">{item.condition}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{item.price}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(item.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      {item.description && (
                        <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                          {item.description}
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-3">
                        <button 
                          onClick={() => handleReticleAction(item, 'list')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
                        >
                          💰 List
                        </button>
                        <button 
                          onClick={() => handleReticleAction(item, 'similar')}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded"
                        >
                          🔍 Similar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`${cardStyle} p-6`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button className={`${buttonStyle} w-full p-3 bg-purple-500 hover:bg-purple-600 text-white font-medium`}>
                  📋 View All Items
                </button>
                <button className={`${buttonStyle} w-full p-3 bg-orange-500 hover:bg-orange-600 text-white font-medium`}>
                  🏷️ Create Listing
                </button>
                <button className={`${buttonStyle} w-full p-3 bg-gray-500 hover:bg-gray-600 text-white font-medium`}>
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={photoCanvasRef} className="hidden" />
    </div>
  );
};

export default LiveCamera;
