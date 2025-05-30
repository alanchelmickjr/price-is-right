import { useState, useEffect } from 'react';

/**
 * Reticle Overlay Component for Camera Recognition
 * Shows targeting reticles with price information and confidence levels
 */
const ReticleOverlay = ({ 
  detectedItems = [], 
  videoRef, 
  showPrices = true, 
  showConfidence = true,
  onItemClick = null 
}) => {
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (videoRef?.current) {
        const { clientWidth, clientHeight } = videoRef.current;
        setOverlayDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    
    // Update dimensions when video loads
    const video = videoRef?.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateDimensions);
      video.addEventListener('resize', updateDimensions);
    }
    
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (video) {
        video.removeEventListener('loadedmetadata', updateDimensions);
        video.removeEventListener('resize', updateDimensions);
      }
    };
  }, [videoRef]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'border-green-400 bg-green-400';
    if (confidence >= 0.6) return 'border-yellow-400 bg-yellow-400';
    return 'border-red-400 bg-red-400';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'HIGH';
    if (confidence >= 0.6) return 'MED';
    return 'LOW';
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{ 
        width: overlayDimensions.width || '100%', 
        height: overlayDimensions.height || '100%' 
      }}
    >
      {/* Center crosshair - always visible */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-16 h-16 border-2 border-white border-opacity-80 rounded-full animate-pulse">
          <div className="w-full h-full border border-gray-300 border-opacity-60 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full opacity-90"></div>
          </div>
        </div>
        {/* Enhanced crosshair lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-white opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 bg-white opacity-80"></div>
      </div>

      {/* Grid overlay for better targeting */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full border border-white border-opacity-30">
          <div className="w-full h-1/3 border-b border-white border-opacity-30"></div>
          <div className="w-full h-1/3 border-b border-white border-opacity-30"></div>
        </div>
        <div className="absolute inset-0 w-full h-full border border-white border-opacity-30">
          <div className="w-1/3 h-full border-r border-white border-opacity-30 float-left"></div>
          <div className="w-1/3 h-full border-r border-white border-opacity-30 float-left"></div>
        </div>
      </div>

      {/* Item reticles */}
      {detectedItems.map((item, index) => (
        <div
          key={item.id || index}
          className={`absolute border-4 bg-opacity-30 rounded-xl transition-all duration-500 animate-pulse ${getConfidenceColor(item.confidence || 0.75)} ${onItemClick ? 'cursor-pointer pointer-events-auto hover:scale-105' : 'pointer-events-none'}`}
          style={{
            left: `${item.x || 50}%`,
            top: `${item.y || 50}%`,
            width: `${item.width || 120}px`,
            height: `${item.height || 80}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(255,255,255,0.5)',
            zIndex: 10 + index
          }}
          onClick={() => onItemClick && onItemClick(item)}
        >
          {/* Price bubble - more prominent */}
          {showPrices && item.estimatedPrice && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap shadow-xl border-2 border-white">
              💰 {item.estimatedPrice}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
            </div>
          )}
          
          {/* Item name - more readable */}
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded-lg max-w-32 truncate shadow-xl border border-white">
            🏷️ {item.name || 'Unknown'}
          </div>
          
          {/* Confidence indicator - larger */}
          {showConfidence && (
            <div className="absolute -top-4 -right-4 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-lg">
              {getConfidenceText(item.confidence || 0.75)}
            </div>
          )}
          
          {/* Enhanced corner markers */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-current rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-current rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-current rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-current rounded-br-lg"></div>
          
          {/* Center pulse indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-current rounded-full animate-ping"></div>
        </div>
      ))}

      {/* Enhanced scan status indicator */}
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-90 text-white text-sm px-4 py-2 rounded-xl border border-white shadow-lg pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">🔍 AI Scanning...</span>
        </div>
      </div>

      {/* Item count with animation */}
      {detectedItems.length > 0 && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl border border-white shadow-lg pointer-events-none animate-bounce">
          🎯 {detectedItems.length} item{detectedItems.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Processing indicator when items detected */}
      {detectedItems.length > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white shadow-lg pointer-events-none">
          🧠 AI Processing...
        </div>
      )}
    </div>
  );
};

export default ReticleOverlay;
