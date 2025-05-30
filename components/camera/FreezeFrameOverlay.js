import { useState, useRef, useCallback, useEffect } from 'react';
import useSmartCamera from '../../hooks/useSmartCamera';

/**
 * Freeze-Frame Reticle Overlay Component
 * Implements the "smart constraints" approach - reticles on captured images, not live video
 * This eliminates lag issues and provides accurate positioning
 */
const FreezeFrameOverlay = ({ 
  onFrameProcessed = null,
  showPrices = true,
  showConfidence = true,
  apiBaseUrl = 'http://localhost:8080',
  instruction = 'Identify items for eBay listing with prices.'
}) => {
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const [reticleAnimation, setReticleAnimation] = useState('fade-in');
  const [error, setError] = useState('');
  const overlayRef = useRef(null);

  // Use our smart camera hook for freeze-frame functionality
  const {
    videoRef,
    frozenFrame,
    frameResults,
    isProcessing,
    cameraReady,
    captureAndProcess,
    processingStats,
    cleanup
  } = useSmartCamera({
    apiBaseUrl,
    intervalMs: 2500, // Slightly slower for better UX
    onFrameProcessed: (results) => {
      console.log('🎯 Frame processed with results:', results);
      setReticleAnimation('fade-in');
      if (onFrameProcessed) {
        onFrameProcessed(results);
      }
    }
  });

  // Cleanup on unmount - camera initializes automatically in the hook
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Update overlay dimensions when frozen frame changes
  useEffect(() => {
    const updateDimensions = () => {
      if (overlayRef?.current) {
        const { clientWidth, clientHeight } = overlayRef.current;
        setOverlayDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [frozenFrame]);

  // Smart capture handler
  const handleSmartCapture = useCallback(() => {
    if (!isProcessing && cameraReady) {
      console.log('📸 Triggering smart freeze-frame capture...');
      setReticleAnimation('capture');
      captureAndProcess(instruction);
    }
  }, [isProcessing, cameraReady, captureAndProcess, instruction]);

  // Auto-capture every few seconds when not processing
  useEffect(() => {
    if (!cameraReady || isProcessing) return;

    const interval = setInterval(() => {
      handleSmartCapture();
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [handleSmartCapture, cameraReady, isProcessing]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'border-emerald-400 bg-emerald-400';
    if (confidence >= 0.6) return 'border-amber-400 bg-amber-400';
    return 'border-red-400 bg-red-400';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'HIGH';
    if (confidence >= 0.6) return 'MED';
    return 'LOW';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">📱</div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => {
              setError('');
              // Hook will re-initialize automatically
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry Camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-lg">
      {/* Live Video Feed (background) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          transform: frozenFrame ? 'scale(0.95) blur(2px)' : 'scale(1)',
          transition: 'all 0.3s ease',
          opacity: frozenFrame ? 0.3 : 1
        }}
      />

      {/* Frozen Frame Overlay (when processing or showing results) */}
      {frozenFrame && (
        <div 
          ref={overlayRef}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${frozenFrame.frameData})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 0.5s ease',
            opacity: 1
          }}
        >
          {/* Reticles Container - positioned on frozen frame */}
          <div className="absolute inset-0 pointer-events-none">
            {frameResults.length > 0 && frameResults[0].items?.map((item, index) => (
              <div
                key={item.id || `item-${index}`}
                className={`absolute border-4 bg-opacity-20 rounded-lg transition-all duration-500 z-20 pointer-events-auto cursor-pointer hover:scale-105 ${getConfidenceColor(item.confidence || 0.75)}`}
                style={{
                  left: `${item.x || 50}%`,
                  top: `${item.y || 50}%`,
                  width: `${Math.max(item.width || 120, 100)}px`,
                  height: `${Math.max(item.height || 80, 60)}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 20px rgba(255,255,255,0.9)',
                  animation: reticleAnimation === 'fade-in' ? 'fadeInScale 0.6s ease-out' : 'none'
                }}
                onClick={() => console.log('🎯 Item clicked:', item)}
              >
                {/* Price Bubble */}
                {showPrices && item.estimatedPrice && (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-40 animate-bounce">
                    💰 {item.estimatedPrice}
                  </div>
                )}
                
                {/* Item Name */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 bg-opacity-90 text-white text-sm font-medium px-2 py-1 rounded max-w-32 truncate shadow-lg z-40">
                  {item.name || 'Unknown Item'}
                </div>
                
                {/* Confidence Badge */}
                {showConfidence && (
                  <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full z-40">
                    {getConfidenceText(item.confidence || 0.75)}
                  </div>
                )}

                {/* Pulse Effect */}
                <div className="absolute inset-0 border-2 border-white border-opacity-50 rounded-lg animate-ping"></div>
              </div>
            ))}
          </div>

          {/* Processing Complete Indicator */}
          {frameResults.length > 0 && frameResults[0].items && (
            <div className="absolute top-4 left-4 bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded-full shadow-lg z-30 animate-pulse">
              ✨ {frameResults[0].items.length} items detected
            </div>
          )}
        </div>
      )}

      {/* Camera Status Indicators */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-30">
        {/* Camera Ready Indicator */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
          cameraReady ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'
        }`}>
          📹 {cameraReady ? 'Camera Ready' : 'Initializing...'}
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-pulse">
            🧠 Analyzing...
          </div>
        )}

        {/* Performance Stats */}
        {processingStats.framesCaptured > 0 && (
          <div className="bg-gray-900 bg-opacity-80 text-white px-2 py-1 rounded text-xs shadow-lg">
            📊 {processingStats.framesProcessed}/{processingStats.framesCaptured}
            <br />
            ⚡ {processingStats.avgProcessingTime}ms avg
          </div>
        )}
      </div>

      {/* Center Crosshair - always visible on live video */}
      {!frozenFrame && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="w-16 h-16 border-2 border-white border-opacity-80 rounded-full">
            <div className="w-full h-full border border-gray-300 border-opacity-60 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full opacity-90 animate-pulse"></div>
            </div>
          </div>
          {/* Crosshair lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-white opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white opacity-80"></div>
        </div>
      )}

      {/* Manual Capture Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={handleSmartCapture}
          disabled={isProcessing || !cameraReady}
          className={`w-16 h-16 rounded-full border-4 border-white shadow-lg transition-all duration-200 ${
            isProcessing || !cameraReady
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          ) : (
            <div className="w-8 h-8 bg-white rounded-full mx-auto"></div>
          )}
        </button>
        <p className="text-white text-center text-xs mt-2 font-medium">
          {isProcessing ? 'Processing...' : 'Tap to Capture'}
        </p>
      </div>

      {/* Grid Overlay on Live Video */}
      {!frozenFrame && (
        <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
          <div className="w-full h-full">
            <div className="absolute w-full border-t border-white opacity-30" style={{ top: '33.33%' }}></div>
            <div className="absolute w-full border-t border-white opacity-30" style={{ top: '66.66%' }}></div>
            <div className="absolute h-full border-l border-white opacity-30" style={{ left: '33.33%' }}></div>
            <div className="absolute h-full border-l border-white opacity-30" style={{ left: '66.66%' }}></div>
          </div>
        </div>
      )}

      {/* Capture Flash Effect */}
      {reticleAnimation === 'capture' && (
        <div 
          className="absolute inset-0 bg-white z-50"
          style={{
            animation: 'flash 0.3s ease-out',
            pointerEvents: 'none'
          }}
          onAnimationEnd={() => setReticleAnimation('none')}
        />
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default FreezeFrameOverlay;
