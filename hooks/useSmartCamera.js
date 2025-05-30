import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Smart Freeze-Frame Camera Hook
 * Implements intelligent frame capture with AI processing queue
 * Prevents overlapping AI requests and manages processing lag gracefully
 */
const useSmartCamera = ({
  apiBaseUrl = 'http://localhost:8080',
  intervalMs = 2000,
  onFrameProcessed = null
}) => {
  // Core camera state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Smart processing state
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [processingStats, setProcessingStats] = useState({
    avgProcessingTime: 0,
    successRate: 0,
    framesCaptured: 0,
    framesProcessed: 0
  });

  // Freeze-frame state
  const [frozenFrame, setFrozenFrame] = useState(null);
  const [frameResults, setFrameResults] = useState([]);
  const [currentFrameId, setCurrentFrameId] = useState(null);

  // Processing timing management
  const processingTimeRef = useRef([]);
  const lastProcessingStartRef = useRef(0);

  /**
   * Initialize camera with optimal settings for AI processing
   */
  const initializeCamera = useCallback(async () => {
    try {
      console.log('🚀 Initializing smart camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraReady(true);
            console.log('📹 Smart camera ready');
          });
        };
      }
    } catch (error) {
      console.error('❌ Camera initialization failed:', error);
      throw error;
    }
  }, []);

  /**
   * Intelligent frame capture with quality optimization
   */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.videoWidth === 0) {
      return null;
    }

    try {
      // Optimize canvas dimensions for AI processing
      const targetWidth = 1280;
      const targetHeight = 720;
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      let width = targetWidth;
      let height = targetHeight;
      
      if (aspectRatio > targetWidth / targetHeight) {
        height = targetWidth / aspectRatio;
      } else {
        width = targetHeight * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      
      // High quality JPEG for AI processing
      const frameData = canvas.toDataURL('image/jpeg', 0.85);
      const frameId = `frame-${Date.now()}`;
      
      setProcessingStats(prev => ({
        ...prev,
        framesCaptured: prev.framesCaptured + 1
      }));

      console.log('📸 Frame captured:', { frameId, size: frameData.length });
      return { frameId, frameData, timestamp: Date.now(), width, height };
    } catch (error) {
      console.error('❌ Frame capture failed:', error);
      return null;
    }
  }, []);

  /**
   * Smart AI processing with queue management
   */
  const processFrameWithAI = useCallback(async (frame, options = {}) => {
    if (isProcessing && processingQueue.length >= 2) {
      console.log('⏭️ Processing queue full, skipping frame');
      return null;
    }

    const processRequest = {
      frameId: frame.frameId,
      frameData: frame.frameData,
      timestamp: frame.timestamp,
      options: {
        instruction: options.instruction || 'Identify sellable items in this image for eBay listing.',
        maxTokens: 300,
        temperature: 0.1,
        ...options
      }
    };

    setProcessingQueue(prev => [...prev, processRequest]);
    
    if (!isProcessing) {
      await processQueue();
    }
  }, [isProcessing, processingQueue]);

  /**
   * Process AI queue with smart endpoint selection
   */
  const processQueue = useCallback(async () => {
    if (processingQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    lastProcessingStartRef.current = Date.now();

    const request = processingQueue[0];
    setProcessingQueue(prev => prev.slice(1));
    
    try {
      console.log('🤖 Processing frame with AI:', request.frameId);
      
      // Freeze the current frame for overlay
      setFrozenFrame({
        frameId: request.frameId,
        frameData: request.frameData,
        timestamp: request.timestamp
      });
      setCurrentFrameId(request.frameId);

      const result = await callAIEndpoint(request.frameData, request.options);
      
      if (result && result.length > 0) {
        const frameResult = {
          frameId: request.frameId,
          items: result,
          timestamp: request.timestamp,
          processingTime: Date.now() - lastProcessingStartRef.current
        };

        setFrameResults(prev => [frameResult, ...prev.slice(0, 4)]); // Keep last 5 results
        
        // Update processing stats
        const processingTime = Date.now() - lastProcessingStartRef.current;
        processingTimeRef.current.push(processingTime);
        if (processingTimeRef.current.length > 10) {
          processingTimeRef.current.shift();
        }

        const avgTime = processingTimeRef.current.reduce((a, b) => a + b, 0) / processingTimeRef.current.length;
        
        setProcessingStats(prev => ({
          ...prev,
          avgProcessingTime: avgTime,
          framesProcessed: prev.framesProcessed + 1,
          successRate: prev.framesProcessed / prev.framesCaptured
        }));

        if (onFrameProcessed) {
          onFrameProcessed(frameResult);
        }

        console.log('✅ AI processing complete:', { 
          frameId: request.frameId, 
          itemCount: result.length,
          processingTime 
        });
      }
    } catch (error) {
      console.error('❌ AI processing failed:', error);
    } finally {
      setIsProcessing(false);
      
      // Process next item in queue after short delay
      setTimeout(() => {
        if (processingQueue.length > 0) {
          processQueue();
        }
      }, 100);
    }
  }, [processingQueue, isProcessing, onFrameProcessed]);

  /**
   * Call AI endpoint with fallback strategy
   */
  const callAIEndpoint = useCallback(async (frameData, options) => {
    const endpoints = [
      { name: 'vision-chat', url: `${apiBaseUrl}/v1/chat/completions` },
      { name: 'completion', url: `${apiBaseUrl}/completion` },
      { name: 'multimodal', url: `${apiBaseUrl}/v1/images/analyze` }
    ];

    for (const endpoint of endpoints) {
      try {
        const result = await tryEndpoint(endpoint, frameData, options);
        if (result) return result;
      } catch (error) {
        console.warn(`⚠️ ${endpoint.name} failed:`, error.message);
      }
    }

    throw new Error('All AI endpoints failed');
  }, [apiBaseUrl]);

  /**
   * Try specific AI endpoint
   */
  const tryEndpoint = async (endpoint, frameData, options) => {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: options.instruction },
            { type: 'image_url', image_url: { url: frameData } }
          ]
        }],
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || result.response || result.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    return parseAIResponse(content);
  };

  /**
   * Parse AI response into structured items
   */
  const parseAIResponse = (content) => {
    try {
      // Try JSON array first
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        const items = JSON.parse(arrayMatch[0]);
        if (Array.isArray(items)) {
          return items.map((item, index) => ({
            id: `item-${Date.now()}-${index}`,
            name: item.itemName || item.name || item.item || 'Detected Item',
            category: item.category || item.type || 'General',
            condition: item.condition || item.state || 'used',
            price: item.price || item.cost || item.value || '$5-25',
            confidence: parseFloat(item.confidence || item.score || 0.6),
            description: item.description || item.details || '',
            x: 30 + Math.random() * 40, // Random position for now
            y: 30 + Math.random() * 40,
            width: 15 + Math.random() * 20,
            height: 15 + Math.random() * 20
          }));
        }
      }

      // Try single JSON object
      const objectMatch = content.match(/\{[^}]*\}/);
      if (objectMatch) {
        const item = JSON.parse(objectMatch[0]);
        return [{
          id: `item-${Date.now()}`,
          name: item.itemName || item.name || 'Detected Item',
          category: item.category || 'General',
          condition: item.condition || 'used',
          price: item.price || '$10-30',
          confidence: parseFloat(item.confidence || 0.5),
          description: item.description || '',
          x: 50, y: 50, width: 20, height: 20
        }];
      }

      // Fallback text parsing
      return [{
        id: `item-${Date.now()}`,
        name: 'Detected Item',
        category: 'General',
        condition: 'unknown',
        price: '$5-20',
        confidence: 0.3,
        description: content.substring(0, 100),
        x: 50, y: 50, width: 20, height: 20
      }];
    } catch (error) {
      console.warn('Response parsing failed:', error);
      return [];
    }
  };

  /**
   * Smart interval capture based on processing speed
   */
  const startSmartCapture = useCallback(() => {
    if (!cameraReady) return;

    const adaptiveInterval = Math.max(
      intervalMs,
      processingStats.avgProcessingTime * 1.5 // Adaptive timing
    );

    const captureInterval = setInterval(() => {
      if (!isProcessing || processingQueue.length < 2) {
        const frame = captureFrame();
        if (frame) {
          processFrameWithAI(frame);
          setLastFrameTime(Date.now());
        }
      }
    }, adaptiveInterval);

    return () => clearInterval(captureInterval);
  }, [cameraReady, intervalMs, isProcessing, processingQueue.length, captureFrame, processFrameWithAI, processingStats.avgProcessingTime]);

  /**
   * Manual capture for user-triggered scanning
   */
  const captureAndProcess = useCallback(async (options = {}) => {
    if (!cameraReady) return null;
    
    const frame = captureFrame();
    if (frame) {
      await processFrameWithAI(frame, options);
      return frame.frameId;
    }
    return null;
  }, [cameraReady, captureFrame, processFrameWithAI]);

  /**
   * Cleanup camera resources
   */
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setIsProcessing(false);
    setProcessingQueue([]);
  }, []);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return cleanup;
  }, [initializeCamera, cleanup]);

  return {
    // Refs for components
    videoRef,
    canvasRef,
    
    // Camera state
    cameraReady,
    isProcessing,
    processingQueue: processingQueue.length,
    processingStats,
    
    // Freeze-frame state
    frozenFrame,
    frameResults,
    currentFrameId,
    
    // Actions
    captureAndProcess,
    startSmartCapture,
    cleanup,
    
    // Utils
    lastFrameTime
  };
};

export default useSmartCamera;
