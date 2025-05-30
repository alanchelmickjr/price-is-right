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
        console.log('📐 Overlay dimensions updated:', { width: clientWidth, height: clientHeight });
      }
    };

    // Initial update
    updateDimensions();
    
    // Update on video load
    const video = videoRef?.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateDimensions);
      video.addEventListener('resize', updateDimensions);
    }
    
    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    
    // Periodic update to catch any changes
    const interval = setInterval(updateDimensions, 1000);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearInterval(interval);
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

  // Debug log
  console.log('🎯 ReticleOverlay render:', { 
    detectedItemsCount: detectedItems.length, 
    overlayDimensions,
    items: detectedItems 
  });

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '200px' // Ensure minimum size
      }}
    >
      {/* Always show center crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
        <div className="w-12 h-12 border-2 border-white border-opacity-80 rounded-full animate-pulse">
          <div className="w-full h-full border border-gray-300 border-opacity-60 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
          </div>
        </div>
        {/* Crosshair lines */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-white opacity-80"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-white opacity-80"></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-10">
        <div className="w-full h-full">
          {/* Horizontal lines */}
          <div className="absolute w-full border-t border-white opacity-30" style={{ top: '33.33%' }}></div>
          <div className="absolute w-full border-t border-white opacity-30" style={{ top: '66.66%' }}></div>
          {/* Vertical lines */}
          <div className="absolute h-full border-l border-white opacity-30" style={{ left: '33.33%' }}></div>
          <div className="absolute h-full border-l border-white opacity-30" style={{ left: '66.66%' }}></div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-90 text-white text-xs px-2 py-1 rounded z-30 pointer-events-none">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>🔍 Scanning</span>
        </div>
      </div>

      {/* Item count */}
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded z-30 pointer-events-none">
        🎯 {detectedItems.length} items
      </div>

      {/* Item reticles - ALWAYS RENDER IF ITEMS EXIST */}
      {detectedItems.map((item, index) => {
        console.log(`🎯 Rendering reticle ${index}:`, item);
        
        return (
          <div
            key={item.id || `item-${index}`}
            className={`absolute border-4 bg-opacity-20 rounded-lg transition-all duration-300 z-20 ${getConfidenceColor(item.confidence || 0.75)} ${onItemClick ? 'cursor-pointer pointer-events-auto hover:scale-105' : 'pointer-events-none'}`}
            style={{
              left: `${item.x || 50}%`,
              top: `${item.y || 50}%`,
              width: `${Math.max(item.width || 100, 80)}px`,
              height: `${Math.max(item.height || 60, 50)}px`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 15px rgba(255,255,255,0.8)',
              border: '3px solid currentColor',
              animation: 'pulse 2s infinite'
            }}
            onClick={() => onItemClick && onItemClick(item)}
          >
            {/* Price bubble */}
            {showPrices && item.estimatedPrice && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-40">
                💰 {item.estimatedPrice}
              </div>
            )}
            
            {/* Item name */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded max-w-24 truncate shadow-lg z-40">
              {item.name || 'Unknown'}
            </div>
            
            {/* Confidence */}
            {showConfidence && (
              <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold px-1 py-0.5 rounded-full z-40">
                {getConfidenceText(item.confidence || 0.75)}
              </div>
            )}
            
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-3 border-t-3 border-current"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-r-3 border-t-3 border-current"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-3 border-b-3 border-current"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-3 border-b-3 border-current"></div>
            
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-full animate-ping z-30"></div>
          </div>
        );
      })}

      {/* Force visible test reticle for debugging */}
      <div
        className="absolute border-4 border-red-500 bg-red-500 bg-opacity-20 rounded-lg z-30"
        style={{
          left: '10%',
          top: '10%',
          width: '80px',
          height: '60px',
          boxShadow: '0 0 15px rgba(255,0,0,0.8)'
        }}
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded">
          TEST
        </div>
      </div>
    </div>
  );
};

export default ReticleOverlay;
