import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import StatusIndicators from '../components/layout/StatusIndicators';

// Gun.js for local database
let gun;
if (typeof window !== 'undefined') {
  const Gun = require('gun');
  require('gun/sea');
  gun = Gun(['http://localhost:8765/gun']);
}

/**
 * Simply eBay Dashboard - Local Gun.js powered experience
 */
export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    itemsScannedToday: 0,
    totalValue: 0,
    pendingListings: 0,
    soldItems: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    if (!gun) {
      console.log('Gun.js not available on server side');
      setLoading(false);
      return;
    }

    console.log('🔗 Loading REAL data from Gun.js database...');
    
    try {
      const items = [];
      let hasCheckedForData = false;
      let dataCheckTimer = null;
      
      // Real-time listener for Gun.js items
      gun.get('items').map().on((item, key) => {
        if (item && typeof item === 'object' && !item._ && key !== '_') {
          const existingIndex = items.findIndex(i => i.id === key);
          const newItem = { id: key, ...item };
          
          if (existingIndex >= 0) {
            items[existingIndex] = newItem;
          } else {
            items.push(newItem);
          }
          
          updateStatsFromItems(items);
          
          // Cancel seeding timer if we get data
          if (dataCheckTimer && !hasCheckedForData) {
            clearTimeout(dataCheckTimer);
            hasCheckedForData = true;
            console.log(`✅ Found existing data: ${items.length} items from Gun.js`);
            setLoading(false);
          }
        }
      });

      // Only seed if no data comes in within reasonable time
      dataCheckTimer = setTimeout(() => {
        if (!hasCheckedForData && items.length === 0) {
          hasCheckedForData = true;
          console.log('📊 No existing data found - seeding demo data ONCE...');
          seedDemoData();
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Failed to load real data:', error);
      // Fallback to demo data on error
      seedDemoData();
    }
  };

  const updateStatsFromItems = (items) => {
    const totalItems = items.length;
    const soldItems = items.filter(item => item.status === 'sold').length;
    const pendingListings = items.filter(item => item.status === 'pending' || item.status === 'draft').length;
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    // Items scanned today
    const today = new Date().toDateString();
    const itemsScannedToday = items.filter(item => {
      const itemDate = new Date(item.createdAt || 0).toDateString();
      return itemDate === today;
    }).length;

    setStats({
      totalItems,
      itemsScannedToday,
      totalValue,
      pendingListings,
      soldItems
    });

    // Get recent items
    const recent = items
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 3);
    
    setRecentItems(recent);
    setLoading(false);
  };

  const seedDemoData = async () => {
    if (!gun) return;

    // Double-check we don't already have data before seeding
    let existingItems = 0;
    gun.get('items').map().once((item, key) => {
      if (item && typeof item === 'object' && !item._ && key !== '_') {
        existingItems++;
      }
    });

    // Wait a moment to let the check complete
    setTimeout(() => {
      if (existingItems > 0) {
        console.log(`🚫 Skipping seed - found ${existingItems} existing items`);
        setLoading(false);
        return;
      }

      console.log('🌱 Seeding demo data for beta testing (NO existing data found)...');
      
      const demoItems = [
        {
          name: 'iPhone 14 Pro Max 256GB',
          description: 'Space Black, excellent condition',
          price: 899.99,
          status: 'sold',
          category: 'Electronics',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          aiConfidence: 0.95
        },
        {
          name: 'Nike Air Jordan 1 Retro',
          description: 'Size 10.5, Chicago colorway',
          price: 299.99,
          status: 'listed',
          category: 'Shoes', 
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          aiConfidence: 0.88
        },
        {
          name: 'MacBook Pro M2 14-inch',
          description: '512GB SSD, Space Gray',
          price: 1899.99,
          status: 'pending',
          category: 'Computers',
          createdAt: new Date().toISOString(),
          aiConfidence: 0.92
        }
      ];

      // Store in Gun.js
      demoItems.forEach((item, index) => {
        const key = `demo_${Date.now()}_${index}`;
        gun.get('items').get(key).put(item);
      });

      console.log('✅ Demo data seeded successfully!');
      setLoading(false);
    }, 500);
  };

  const quickActions = [
    {
      title: "Scan New Item",
      subtitle: "Point camera to identify",
      icon: "📸",
      action: () => router.push('/items/scan'),
      gradient: "from-orange-400 to-orange-600",
      primary: true
    },
    {
      title: "My Items",
      subtitle: `${stats.totalItems} total items`,
      icon: "📦", 
      action: () => router.push('/items'),
      gradient: "from-blue-400 to-blue-600"
    },
    {
      title: "Sold Items",
      subtitle: `$${stats.totalValue.toFixed(2)} earned`,
      icon: "💰",
      action: () => router.push('/items?filter=sold'),
      gradient: "from-green-400 to-green-600"
    },
    {
      title: "Seed Demo Data",
      subtitle: "For beta testing",
      icon: "🌱",
      action: seedDemoData,
      gradient: "from-purple-400 to-purple-600"
    }
  ];

  // Helper function to format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const now = new Date();
    const itemTime = new Date(timestamp);
    const diffMs = now - itemTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // Gun.js helper functions for real database operations
  const addNewItem = async (itemData) => {
    if (!gun) return null;
    
    const key = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item = {
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    gun.get('items').get(key).put(item);
    console.log('✅ Added new item to Gun.js:', item.name);
    return { id: key, ...item };
  };

  const updateItemStatus = async (itemId, status) => {
    if (!gun || !itemId) return;
    
    gun.get('items').get(itemId).get('status').put(status);
    gun.get('items').get(itemId).get('updatedAt').put(new Date().toISOString());
    console.log(`✅ Updated item ${itemId} status to:`, status);
  };

  const deleteItem = async (itemId) => {
    if (!gun || !itemId) return;
    
    gun.get('items').get(itemId).put(null);
    console.log('🗑️ Deleted item:', itemId);
  };

  return (
    <>
      <Head>
        <title>Dashboard - Simply eBay</title>
        <meta name="description" content="Your AI-powered selling dashboard" />
      </Head>

      <div className="min-h-screen" style={{background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)"}}>
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full blur-xl animate-pulse floating-particle-1"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl animate-pulse delay-1000 floating-particle-2"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full blur-xl animate-pulse delay-500 floating-particle-3"></div>
        </div>
        
        {/* Header */}
        <div className="neumorphic-card p-6 mb-6 mx-6 mt-6 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Simply eBay</h1>
              <p className="text-sm" style={{color: "var(--text-secondary)"}}>Welcome back, {user?.email?.split('@')[0] || 'there'}!</p>
            </div>
            <div className="flex space-x-4">
              {/* AI Test Chat Button */}
              <button
                onClick={() => setChatOpen(true)}
                className="neumorphic-button w-12 h-12 rounded-full flex items-center justify-center text-lg hover-lift"
                title="AI Assistant"
              >
                🧠
              </button>
              {/* Settings/Logout */}
              <button
                onClick={logout}
                className="neumorphic-button w-12 h-12 rounded-full flex items-center justify-center text-lg hover-lift"
                title="Logout"
              >
                👋
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-6 relative z-10">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="neumorphic-card p-6 text-center hover-lift">
              <div className="text-3xl font-bold mb-2" style={{color: "var(--primary)"}}>
                {loading ? '...' : stats.totalItems}
              </div>
              <div className="text-sm font-medium" style={{color: "var(--text-secondary)"}}>Total Items</div>
            </div>
            <div className="neumorphic-card p-6 text-center hover-lift">
              <div className="text-3xl font-bold mb-2" style={{color: "var(--secondary)"}}>
                {loading ? '...' : `$${stats.totalValue.toFixed(0)}`}
              </div>
              <div className="text-sm font-medium" style={{color: "var(--text-secondary)"}}>Total Value</div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="neumorphic-card p-4 text-center">
              <div className="text-xl font-bold" style={{color: "var(--accent)"}}>
                {loading ? '...' : stats.itemsScannedToday}
              </div>
              <div className="text-xs" style={{color: "var(--text-tertiary)"}}>Today</div>
            </div>
            <div className="neumorphic-card p-4 text-center">
              <div className="text-xl font-bold" style={{color: "var(--primary-dark)"}}>
                {loading ? '...' : stats.pendingListings}
              </div>
              <div className="text-xs" style={{color: "var(--text-tertiary)"}}>Pending</div>
            </div>
            <div className="neumorphic-card p-4 text-center">
              <div className="text-xl font-bold" style={{color: "var(--secondary-dark)"}}>
                {loading ? '...' : stats.soldItems}
              </div>
              <div className="text-xs" style={{color: "var(--text-tertiary)"}}>Sold</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{color: "var(--text-primary)"}}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`neumorphic-card p-6 text-left hover-lift hover-glow transition-all ${
                    action.primary ? 'neumorphic-button-primary text-white' : ''
                  }`}
                >
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <div className={`font-bold text-lg mb-1 ${action.primary ? 'text-white' : ''}`} 
                       style={!action.primary ? {color: "var(--text-primary)"} : {}}>
                    {action.title}
                  </div>
                  <div className={`text-sm ${action.primary ? 'text-white opacity-90' : ''}`}
                       style={!action.primary ? {color: "var(--text-secondary)"} : {}}>
                    {action.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{color: "var(--text-primary)"}}>Recent Activity</h2>
            <div className="neumorphic-card p-6 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-loader h-16"></div>
                  ))}
                </div>
              ) : recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-opacity-20 last:border-b-0" 
                       style={{borderColor: "var(--text-tertiary)"}}>
                    <div className="flex-1">
                      <div className="font-semibold" style={{color: "var(--text-primary)"}}>
                        {item.name}
                      </div>
                      <div className="text-sm" style={{color: "var(--text-secondary)"}}>
                        {item.status} • {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{color: "var(--primary)"}}>
                        ${item.price}
                      </div>
                      <div className="text-xs badge badge-secondary">
                        {Math.round(item.aiConfidence * 100)}% AI
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📦</div>
                  <div className="font-medium" style={{color: "var(--text-secondary)"}}>
                    No items yet
                  </div>
                  <div className="text-sm" style={{color: "var(--text-tertiary)"}}>
                    Start by scanning your first item!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="glass-morphism-strong p-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🔒</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2" style={{color: "var(--text-primary)"}}>
                  100% Private & Local
                </h3>
                <p className="text-sm leading-relaxed" style={{color: "var(--text-secondary)"}}>
                  Your photos and data stay on your device. AI processing happens locally. 
                  Nothing shared unless you choose to list an item.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium" style={{color: "var(--secondary)"}}>
                    Local AI Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Privacy Links */}
          <div className="text-center space-x-4 text-sm pb-8" style={{color: "var(--text-tertiary)"}}>
            <button 
              onClick={() => router.push('/terms')}
              className="neumorphic-button px-4 py-2 text-sm"
              style={{color: "var(--text-secondary)"}}
            >
              Terms of Service
            </button>
            <button 
              onClick={() => router.push('/privacy')}
              className="neumorphic-button px-4 py-2 text-sm"
              style={{color: "var(--text-secondary)"}}
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => router.push('/about')}
              className="neumorphic-button px-4 py-2 text-sm"
              style={{color: "var(--text-secondary)"}}
            >
              About
            </button>
          </div>
        </div>

        {/* AI Chat Popup */}
        {chatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-morphism-strong max-w-sm w-full max-h-[500px] overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">🧠 Simply eBay AI</h3>
                    <p className="text-sm opacity-90">Your local selling assistant</p>
                  </div>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="text-white hover:text-gray-200 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                    aria-label="Close AI chat"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="neumorphic-card p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">👋</span>
                      <span className="font-bold" style={{color: "var(--primary)"}}>Hi there!</span>
                    </div>
                    <p className="text-sm" style={{color: "var(--text-secondary)"}}>
                      I'm your local AI assistant, running entirely on your device. I can help you sell more effectively!
                    </p>
                  </div>
                  
                  <div className="neumorphic-card p-4">
                    <h4 className="font-bold mb-3 flex items-center" style={{color: "var(--text-primary)"}}>
                      <span className="mr-2">🎯</span>
                      What I can help with:
                    </h4>
                    <ul className="text-sm space-y-2" style={{color: "var(--text-secondary)"}}>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        📸 Identify items from photos instantly
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                        💰 Research current market prices
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                        ✍️ Write compelling descriptions
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-primary-dark rounded-full mr-3"></span>
                        📊 Suggest optimal pricing
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-secondary-dark rounded-full mr-3"></span>
                        ❓ Answer eBay questions
                      </li>
                    </ul>
                  </div>

                  <div className="neumorphic-card p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">🔒</span>
                      <span className="font-bold" style={{color: "var(--secondary)"}}>100% Private</span>
                    </div>
                    <p className="text-xs" style={{color: "var(--text-tertiary)"}}>
                      All conversations stay on your device. No data leaves your phone unless you create a listing.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => {
                      setChatOpen(false);
                      router.push('/items/scan');
                    }}
                    className="neumorphic-button-primary px-4 py-4 text-sm font-bold flex items-center justify-center space-x-2"
                  >
                    <span>📸</span>
                    <span>Scan Item</span>
                  </button>
                  <button
                    onClick={() => setChatOpen(false)}
                    className="neumorphic-button-secondary px-4 py-4 text-sm font-bold flex items-center justify-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Full Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status indicators */}
        <StatusIndicators />
      </div>
    </>
  );
}
