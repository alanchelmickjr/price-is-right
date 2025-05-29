import { useState, useEffect } from 'react';

export default function StatusIndicators() {
  const [gunStatus, setGunStatus] = useState('disconnected'); // 'local', 'syncing', 'disconnected'
  const [llamaStatus, setLlamaStatus] = useState('disconnected'); // 'ready', 'loading', 'disconnected'

  useEffect(() => {
    // Check Gun.js status
    const checkGunStatus = async () => {
      try {
        // Check if Gun.js is available and connected
        if (typeof window !== 'undefined') {
          // Try to import Gun dynamically
          try {
            const Gun = require('gun');
            require('gun/sea');
            
            // Test Gun.js connection
            const gun = Gun(['http://localhost:8765/gun']);
            setGunStatus('local');
            
            // Listen for Gun.js network activity
            gun.get('test').put({status: 'ping', timestamp: Date.now()});
            
            // Check for peer connections
            setTimeout(() => {
              if (gun._.opt.peers && Object.keys(gun._.opt.peers).length > 0) {
                setGunStatus('syncing');
                setTimeout(() => setGunStatus('local'), 2000);
              }
            }, 1000);
            
          } catch (gunError) {
            console.log('Gun.js not available:', gunError.message);
            setGunStatus('disconnected');
          }
        }
      } catch (error) {
        setGunStatus('disconnected');
      }
    };

    // Check LlamaFile status
    const checkLlamaStatus = async () => {
      try {
        const response = await fetch('http://localhost:8080/', {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        
        if (response.ok) {
          setLlamaStatus('ready');
        } else {
          setLlamaStatus('disconnected');
        }
      } catch (error) {
        setLlamaStatus('disconnected');
      }
    };

    checkGunStatus();
    checkLlamaStatus();

    // Set up periodic checks
    const gunInterval = setInterval(checkGunStatus, 10000); // Check every 10 seconds
    const llamaInterval = setInterval(checkLlamaStatus, 15000); // Check every 15 seconds

    return () => {
      clearInterval(gunInterval);
      clearInterval(llamaInterval);
    };
  }, []);

  const getStatusColor = (status, type) => {
    if (type === 'gun') {
      switch (status) {
        case 'local': return 'bg-green-500';
        case 'syncing': return 'bg-yellow-500';
        default: return 'bg-red-500';
      }
    } else {
      switch (status) {
        case 'ready': return 'bg-blue-500';
        case 'loading': return 'bg-yellow-500';
        default: return 'bg-red-500';
      }
    }
  };

  const getStatusText = (status, type) => {
    if (type === 'gun') {
      switch (status) {
        case 'local': return 'Gun.js Local';
        case 'syncing': return 'Gun.js Sync';
        default: return 'Gun.js Off';
      }
    } else {
      switch (status) {
        case 'ready': return 'LlamaFile AI';
        case 'loading': return 'LlamaFile Load';
        default: return 'LlamaFile Off';
      }
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="flex justify-between items-center">
        {/* Left corner - Gun.js status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(gunStatus, 'gun')} ${gunStatus === 'syncing' ? 'animate-ping' : 'animate-pulse'}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {getStatusText(gunStatus, 'gun')}
          </span>
        </div>
        
        {/* Center - Legal links */}
        <div className="flex gap-4">
          <a href="/terms" className="text-xs text-gray-400 no-underline font-medium hover:text-primary transition-colors">Terms of Service</a>
          <a href="/privacy" className="text-xs text-gray-400 no-underline font-medium hover:text-primary transition-colors">Privacy Policy</a>
        </div>
        
        {/* Right corner - LlamaFile status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(llamaStatus, 'llama')} ${llamaStatus === 'loading' ? 'animate-ping' : 'animate-pulse'}`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {getStatusText(llamaStatus, 'llama')}
          </span>
        </div>
      </div>
    </div>
  );
}
