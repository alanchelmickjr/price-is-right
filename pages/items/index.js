import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { withAuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../context/AuthContext';
import gunDataService from '../../lib/gunDataService';
import localVectorStore from '../../lib/localVectorStore';

function UserItemsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [similarityResults, setSimilarityResults] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
    setupRealtimeSync();
  }, [user]);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) {
        setItems([]);
        return;
      }

      // Get items from Gun.js P2P network
      const userItems = await gunDataService.getUserItems();
      setItems(userItems);
      
      // Get vector similarity data
      const vectors = localVectorStore.getAllVectors();
      setSimilarityResults(vectors.slice(0, 5)); // Show recent 5 for now
      
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time sync with Gun.js
  const setupRealtimeSync = () => {
    if (!user) return;

    try {
      // Subscribe to real-time updates from Gun.js
      gunDataService.subscribeToUserItems((item) => {
        setItems(prevItems => {
          const existingIndex = prevItems.findIndex(i => i.id === item.id);
          if (existingIndex >= 0) {
            // Update existing item
            const updated = [...prevItems];
            updated[existingIndex] = item;
            return updated;
          } else {
            // Add new item
            return [...prevItems, item];
          }
        });
      });
    } catch (error) {
      console.warn('Real-time sync setup failed:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Remove from Gun.js
      if (user) {
        gunDataService.user.get('items').get(itemId).put(null);
      }
      
      // Remove from local vectors
      localVectorStore.removeVector(itemId.toString());
      localVectorStore.saveToStorage();
      
      // Update local state
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert(`Error deleting item: ${err.message}`);
    }
  };

  const filteredItems = items.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed': return '#28a745';
      case 'sold': return '#6f42c1';
      case 'draft': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          📦 My Inventory
        </h1>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/items/scan" className="flex-1 neumorphic-button py-3 px-6 text-center animate-fade-in"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white' }}>
            <div className="flex items-center justify-center gap-2">
              <span className="neumorphic-mini-circle w-8 h-8 bg-white/20 text-white flex-shrink-0">📷</span>
              <span>AI Scan Items</span>
            </div>
          </Link>
          <Link href="/items/new" className="flex-1 neumorphic-button py-3 px-6 text-center animate-fade-in"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent-dark))', color: 'white' }}>
            <div className="flex items-center justify-center gap-2">
              <span className="neumorphic-mini-circle w-8 h-8 bg-white/20 text-white flex-shrink-0">➕</span>
              <span>Add New Item</span>
            </div>
          </Link>
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <label className="form-label mb-2">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="neumorphic-input mobile-select"
          >
            <option value="all">All Items</option>
            <option value="recognized">📱 Recognized</option>
            <option value="draft">📝 Draft</option>
            <option value="listed">🔗 Listed</option>
            <option value="sold">💰 Sold</option>
          </select>
        </div>

        {/* Real-time Connection Status */}
        {user && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">
              🔄 Real-time sync enabled • {items.length} items • {similarityResults.length} AI vectors stored
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">❌ Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your items...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">
                {filterStatus === 'all' ? '📦 No items yet' : `No ${filterStatus} items found`}
              </p>
              <Link href="/items/scan" className="inline-block bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                Start Scanning Items
              </Link>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="neumorphic-card neumorphic-card-hover p-6 animate-slide-up">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/items/${item.id}`} className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
                        {item.name || 'Untitled Item'}
                      </Link>
                      <span
                        className="badge px-2 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: getStatusColor(item.status || 'recognized') }}
                      >
                        {item.status || 'recognized'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-600 mb-3">
                      <p>📂 Category: {item.category || 'Uncategorized'}</p>
                      <p>🏷️ Condition: {item.condition || 'Unknown'}</p>
                      <p>🎯 Confidence: {Math.round((item.confidence || 0.75) * 100)}%</p>
                      <p>⏰ {new Date(item.created_at || item.timestamp).toLocaleDateString()}</p>
                    </div>

                    {item.price && (
                      <p className="text-lg font-bold text-success mb-2">
                        💰 {item.price}
                      </p>
                    )}

                    {item.description && (
                      <p className="text-neutral-700 text-sm mb-3 line-clamp-2">
                        {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                    <Link
                      href={`/items/${item.id}`}
                      className="neumorphic-button-primary py-2 px-4 text-center"
                    >
                      📝 Edit
                    </Link>
                    <Link
                      href={`/api/items/${item.id}/create-ebay-listing`}
                      className="neumorphic-button-secondary py-2 px-4 text-center"
                    >
                      🔗 List on eBay
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="neumorphic-button py-2 px-4 text-center"
                      style={{ background: 'linear-gradient(135deg, #f87171, #ef4444)', color: 'white' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vector Similarity Insights */}
      {similarityResults.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🧠 AI Recognition Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarityResults.slice(0, 6).map((vector) => (
              <div key={vector.id} className="bg-white rounded-lg p-3 shadow-sm">
                <p className="font-semibold text-sm text-gray-800">{vector.metadata.itemName}</p>
                <p className="text-xs text-gray-600">{vector.metadata.category}</p>
                <p className="text-xs text-green-600 font-semibold">{vector.metadata.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuthGuard(UserItemsPage);
