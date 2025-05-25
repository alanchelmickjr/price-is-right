import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import ImageUploader from '../../components/items/ImageUploader';
import { withAuthGuard } from '../../components/auth/AuthGuard';
import { useAuth } from '../../context/AuthContext';

const VALID_ITEM_STATUSES = ["new", "inventory", "listed_on_ebay", "sold", "kept", "archived"];

function ItemDetailPage() {
  const { user, session, loading: authLoading } = useAuth(); // Use AuthContext
  const router = useRouter();
  const { itemId } = router.query;
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceSuggestionError, setPriceSuggestionError] = useState(null);
  const [priceSuggestionDetails, setPriceSuggestionDetails] = useState(null);
  const [isListingOnEbay, setIsListingOnEbay] = useState(false);
  const [ebayListingError, setEbayListingError] = useState(null);
  const [ebayListingDetails, setEbayListingDetails] = useState(null);

  // State for Update and Delete
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    itemName: '',
    description: '',
    status: 'new',
    suggestedPriceRangeMin: '',
    suggestedPriceRangeMax: '',
  });
  const [updateError, setUpdateError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (session) {
      setSessionToken(session.access_token);
    } else if (!authLoading) {
      // if not loading and no session, token is null
      setSessionToken(null);
      console.warn('No active session found for ItemDetailPage.');
    }
  }, [session, authLoading]);

  useEffect(() => {
    if (authLoading || !itemId || !user) { // Wait for auth to load
      if (!authLoading && user && !itemId && router.isReady) setIsLoading(false);
      return;
    }

    const fetchItemDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/items/${itemId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || errorData.error || `Failed to fetch item (status: ${res.status})`);
        }
        const data = await res.json();
        setItem(data);
        setEditFormData({
          itemName: data.item_name || '',
          description: data.description || '',
          status: data.status || 'new',
          suggestedPriceRangeMin: data.suggested_price_range_min !== null ? String(data.suggested_price_range_min) : '',
          suggestedPriceRangeMax: data.suggested_price_range_max !== null ? String(data.suggested_price_range_max) : '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
        fetchItemDetails();
    }
  }, [itemId, user, router.isReady]);

  const handleEditToggle = () => {
    if (!isEditing && item) {
      setEditFormData({
        itemName: item.item_name || '',
        description: item.description || '',
        status: item.status || 'new',
        suggestedPriceRangeMin: item.suggested_price_range_min !== null ? String(item.suggested_price_range_min) : '',
        suggestedPriceRangeMax: item.suggested_price_range_max !== null ? String(item.suggested_price_range_max) : '',
      });
      setUpdateError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!sessionToken || !item) {
      setUpdateError("Session token or item data is missing.");
      return;
    }
    setIsUpdating(true);
    setUpdateError(null);

    const payload = {
      itemName: editFormData.itemName,
      description: editFormData.description,
      status: editFormData.status,
    };
    if (editFormData.suggestedPriceRangeMin !== '') {
        payload.suggestedPriceRangeMin = parseFloat(editFormData.suggestedPriceRangeMin);
    }
    if (editFormData.suggestedPriceRangeMax !== '') {
        payload.suggestedPriceRangeMax = parseFloat(editFormData.suggestedPriceRangeMax);
    }
    
    if (payload.suggestedPriceRangeMin !== undefined && payload.suggestedPriceRangeMax !== undefined) {
        if (payload.suggestedPriceRangeMin > payload.suggestedPriceRangeMax) {
            setUpdateError("Price range min cannot be greater than max.");
            setIsUpdating(false);
            return;
        }
    }

    try {
      const res = await fetch(`/api/items/${item.item_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || `Failed to update item (status: ${res.status})`);
      }
      setItem(data);
      setIsEditing(false);
      setEditFormData({ // Re-initialize with updated data
        itemName: data.item_name || '',
        description: data.description || '',
        status: data.status || 'new',
        suggestedPriceRangeMin: data.suggested_price_range_min !== null ? String(data.suggested_price_range_min) : '',
        suggestedPriceRangeMax: data.suggested_price_range_max !== null ? String(data.suggested_price_range_max) : '',
      });
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!sessionToken || !item) {
      setDeleteError("Session token or item data is missing.");
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/items/${item.item_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || `Failed to delete item (status: ${res.status})`);
      }
      alert(data.message || 'Item deleted successfully!');
      router.push('/items');
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRecognizeItem = async () => {
    if (!itemId || !sessionToken) {
      setRecognitionError("Item ID or session token is missing.");
      return;
    }
    setIsRecognizing(true);
    setRecognitionError(null);
    try {
      const res = await fetch(`/api/items/${itemId}/recognize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to recognize item (status: ${res.status})`);
      }
      setItem(data);
    } catch (err) {
      console.error("Recognition error:", err);
      setRecognitionError(err.message);
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleSuggestPrice = async () => {
    if (!itemId || !sessionToken) {
      setPriceSuggestionError("Item ID or session token is missing.");
      return;
    }
    setIsSuggestingPrice(true);
    setPriceSuggestionError(null);
    setPriceSuggestionDetails(null);
    try {
      const res = await fetch(`/api/items/${itemId}/suggest-price`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMessage = data.error || data.message || `Failed to suggest price (status: ${res.status})`;
        setPriceSuggestionError(errorMessage); // Set error state with API message
        setPriceSuggestionDetails(null); // Clear details on error
        throw new Error(errorMessage); // Throw to be caught by catch block, which also sets error
      }
      setItem(data.item); // Update the main item state
      setPriceSuggestionDetails(data.message || null); // Use the API message for details
      setPriceSuggestionError(null); // Clear any previous error on success
    } catch (err) {
      console.error("Price suggestion error:", err);
      setPriceSuggestionError(err.message);
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleCreateEbayListing = async () => {
    if (!itemId || !sessionToken) {
      setEbayListingError("Item ID or session token is missing.");
      return;
    }
    setIsListingOnEbay(true);
    setEbayListingError(null);
    setEbayListingDetails(null);
    try {
      const res = await fetch(`/api/items/${itemId}/create-ebay-listing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to create eBay listing (status: ${res.status})`);
      }
      setEbayListingDetails(data);
      alert(`Successfully listed on eBay! Listing ID: ${data.ebayListingId}`);
      // Re-fetch item to update status and listing details
      const itemRes = await fetch(`/api/items/${itemId}`);
      if (itemRes.ok) setItem(await itemRes.json());

    } catch (err) {
      console.error("eBay listing creation error:", err);
      setEbayListingError(err.message);
    } finally {
      setIsListingOnEbay(false);
    }
  };

  const renderAiData = (aiData) => {
    if (!aiData) return <p>N/A</p>;
    if (typeof aiData === 'string') {
        try {
            aiData = JSON.parse(aiData);
        } catch (e) {
            return <pre>{aiData}</pre>;
        }
    }
    return (
      <div>
        {aiData.suggestedName && (
          <p><strong>Suggested Name:</strong> {aiData.suggestedName} (Confidence: {aiData.suggestedNameConfidence?.toFixed(2) || 'N/A'})</p>
        )}
        {aiData.labels && aiData.labels.length > 0 && (
          <div>
            <strong>Labels:</strong>
            <ul>
              {aiData.labels.slice(0, 5).map((label, index) => (
                <li key={`label-${index}`}>{label.description} (Score: {label.score?.toFixed(2)})</li>
              ))}
            </ul>
          </div>
        )}
        {aiData.objects && aiData.objects.length > 0 && (
          <div style={{marginTop: '10px'}}>
            <strong>Detected Objects:</strong>
            <ul>
              {aiData.objects.slice(0, 3).map((obj, index) => (
                <li key={`object-${index}`}>{obj.name} (Score: {obj.score?.toFixed(2)})</li>
              ))}
            </ul>
          </div>
        )}
        {process.env.NODE_ENV === 'development' && aiData.rawResponse && (
            <details style={{marginTop: '10px'}}>
                <summary>Raw AI Response (Dev)</summary>
                <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto', background: '#f0f0f0', padding: '10px', borderRadius: '4px'}}>
                    {JSON.stringify(aiData.rawResponse, null, 2)}
                </pre>
            </details>
        )}
      </div>
    );
  };

  const formRowStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
  const buttonGroupStyle = { marginTop: '20px', display: 'flex', gap: '10px' };


  if (authLoading || (isLoading && !error)) return <div>Loading item details...</div>; // Check authLoading
  if (error) return <div>Error: {error}</div>;
  if (!item && !isLoading) return <div>Item not found or you might not have access.</div>;

  return (
    <div className="app-container py-6">
      <Link href="/items" className="inline-block mb-4 text-primary hover:text-primary-dark transition-colors">
        <div className="flex items-center gap-2">
          <span className="neumorphic-mini-circle w-6 h-6 flex items-center justify-center">&larr;</span>
          <span>Back to Inventory</span>
        </div>
      </Link>
      
      {item && (
        <>
          {!isEditing ? (
            <div className="neumorphic-card p-6 animate-fade-in">
              <h1 className="text-2xl font-bold border-b border-neutral-200 pb-3 mb-6">{item.item_name}</h1>
              <div className="grid gap-4 mb-6">
                <p><span className="font-semibold text-neutral-700">Description:</span> {item.description || 'N/A'}</p>
                <p>
                  <span className="font-semibold text-neutral-700">Status:</span>
                  <span className={`ml-2 badge ${item.status === 'new' ? 'badge-success' : 'badge-primary'}`}>
                    {item.status}
                  </span>
                </p>
                <p><span className="font-semibold text-neutral-700">Created At:</span> {new Date(item.created_at).toLocaleString()}</p>
                <p><span className="font-semibold text-neutral-700">Last Updated:</span> {new Date(item.updated_at).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateItem} className="neumorphic-card p-6 mb-8 animate-fade-in">
              <h2 className="text-xl font-bold mb-6">Edit Item</h2>
              <div className="form-group">
                <label htmlFor="itemName" className="form-label">Item Name:</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={editFormData.itemName}
                  onChange={handleInputChange}
                  required
                  className="neumorphic-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  className="neumorphic-input"
                  style={{minHeight: '100px'}}
                />
              </div>
              <div className="form-group">
                <label htmlFor="status" className="form-label">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="neumorphic-input mobile-select"
                >
                  {VALID_ITEM_STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="suggestedPriceRangeMin" className="form-label">Suggested Price Min ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    id="suggestedPriceRangeMin"
                    name="suggestedPriceRangeMin"
                    value={editFormData.suggestedPriceRangeMin}
                    onChange={handleInputChange}
                    className="neumorphic-input"
                    placeholder="e.g., 10.00"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="suggestedPriceRangeMax" className="form-label">Suggested Price Max ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    id="suggestedPriceRangeMax"
                    name="suggestedPriceRangeMax"
                    value={editFormData.suggestedPriceRangeMax}
                    onChange={handleInputChange}
                    className="neumorphic-input"
                    placeholder="e.g., 20.00"
                  />
                </div>
              </div>
              {updateError && (
                <div className="glass-card mt-4 p-4 border-l-4 border-red-500 animate-fade-in">
                  <p className="text-red-600">{updateError}</p>
                </div>
              )}
              <div className="button-container mt-6">
                <button
                  type="submit"
                  disabled={isUpdating || !sessionToken}
                  className="neumorphic-button-primary"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="neumorphic-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
            
          <div className="flex flex-wrap gap-3 my-6">
            {!isEditing && (
              <button
                onClick={handleEditToggle}
                disabled={!sessionToken}
                className={`neumorphic-button ${!sessionToken ? 'opacity-50' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <span>✏️</span>
                  <span>Edit Item</span>
                </span>
              </button>
            )}
            <button
              onClick={handleRecognizeItem}
              disabled={isRecognizing || !sessionToken || isEditing}
              className={`neumorphic-button-primary ${(isRecognizing || !sessionToken || isEditing) ? 'opacity-50' : ''}
                relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span>{isRecognizing ? 'Recognizing...' : 'Recognize with AI'}</span>
              </span>
              {/* Add subtle glow effect for active button */}
              {!isRecognizing && !isEditing && sessionToken && (
                <div className="absolute -inset-1 opacity-20 bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-500 blur-sm"></div>
              )}
            </button>
            <button
              onClick={handleSuggestPrice}
              disabled={isSuggestingPrice || !sessionToken || isEditing}
              className={`neumorphic-button-primary ${(isSuggestingPrice || !sessionToken || isEditing) ? 'opacity-50' : ''}
                relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span>{isSuggestingPrice ? 'Suggesting Price...' : 'Suggest Price'}</span>
              </span>
              {/* Add subtle glow effect for active button */}
              {!isSuggestingPrice && !isEditing && sessionToken && (
                <div className="absolute -inset-1 opacity-20 bg-gradient-to-r from-green-400 via-green-500 to-teal-500 blur-sm"></div>
              )}
            </button>
            <button
              onClick={handleCreateEbayListing}
              disabled={isListingOnEbay || !sessionToken || item.status === 'listed_on_ebay' || isEditing}
              className={`${item.status === 'listed_on_ebay' ? 'neumorphic-button-disabled' : 'neumorphic-button-accent'}
                ${(isListingOnEbay || !sessionToken || item.status === 'listed_on_ebay' || isEditing) ? 'opacity-50' : ''}
                relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.status === 'listed_on_ebay' ? '✅' : '🚀'}</span>
                <span>
                  {isListingOnEbay ? 'Listing on eBay...' : (item.status === 'listed_on_ebay' ? 'Already Listed' : 'List on eBay')}
                </span>
              </span>
              {/* Add subtle glow effect for active button */}
              {!isListingOnEbay && !isEditing && item.status !== 'listed_on_ebay' && sessionToken && (
                <div className="absolute -inset-1 opacity-20 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 blur-sm"></div>
              )}
            </button>
            {!isEditing && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!sessionToken}
                  className={`neumorphic-button-danger ml-auto ${!sessionToken ? 'opacity-50' : ''}
                    relative overflow-hidden transition-all duration-300 hover:shadow-lg`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🗑️</span>
                    <span>Delete Item</span>
                  </span>
                  {/* Add subtle glow effect for active button */}
                  {sessionToken && (
                    <div className="absolute -inset-1 opacity-20 bg-gradient-to-r from-red-400 via-red-500 to-pink-500 blur-sm"></div>
                  )}
                </button>
            )}
          </div>
          <div className="mt-4">
            {recognitionError && (
              <div className="glass-card p-4 my-3 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-600"><strong>AI Error:</strong> {recognitionError}</p>
              </div>
            )}
            {priceSuggestionError && (
              <div className="glass-card p-4 my-3 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-600"><strong>Price Suggestion Error:</strong> {priceSuggestionError}</p>
              </div>
            )}
            {ebayListingError && (
              <div className="glass-card p-4 my-3 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-600"><strong>eBay Listing Error:</strong> {ebayListingError}</p>
              </div>
            )}
            {deleteError && (
              <div className="glass-card p-4 my-3 border-l-4 border-red-500 animate-fade-in">
                <p className="text-red-600"><strong>Delete Error:</strong> {deleteError}</p>
              </div>
            )}
          </div>

          {/* Image Uploader Section */}
          {sessionToken && item.item_id && (
            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <ImageUploader itemId={item.item_id} sessionToken={sessionToken} />
            </div>
          )}

          {!isEditing && (
            <>
              <h3 style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px', marginBottom: '10px'}}>Additional Information</h3>
              <div><strong>AI Recognized Data:</strong> {renderAiData(item.ai_recognized_item)}</div>
              <p style={{marginTop: '10px'}}><strong>Suggested Price Range:</strong>
                {item.suggested_price_range_min != null && item.suggested_price_range_max != null ?
                 `$${Number(item.suggested_price_range_min).toFixed(2)} - $${Number(item.suggested_price_range_max).toFixed(2)}` : 'N/A'}
              </p>
              {item.price_suggestion_last_updated_at && (
                <p style={{fontSize: '0.9em', color: '#555'}}>
                  Price last suggested at: {new Date(item.price_suggestion_last_updated_at).toLocaleString()}
                </p>
              )}
              {(priceSuggestionDetails || item.price_suggestion_details) && (
                  <p style={{fontSize: '0.9em', fontStyle: 'italic', color: '#555'}}>
                      Note: {priceSuggestionDetails || item.price_suggestion_details}
                  </p>
              )}
              {ebayListingDetails && (
                <div style={{marginTop: '15px', padding: '10px', border: '1px solid green', borderRadius: '5px', backgroundColor: '#e6ffed'}}>
                  <h4>eBay Listing Created!</h4>
                  <p><strong>eBay Listing ID:</strong> {ebayListingDetails.ebayListingId}</p>
                  {ebayListingDetails.ebayListingUrl && (
                    <p>
                      <strong>View on eBay:</strong>{' '}
                      <a href={ebayListingDetails.ebayListingUrl} target="_blank" rel="noopener noreferrer" style={{color: '#0070f3'}}>
                        {ebayListingDetails.ebayListingUrl}
                      </a>
                    </p>
                  )}
                  {ebayListingDetails.localListing && (
                    <p>Local listing status: {ebayListingDetails.localListing.status}</p>
                  )}
                </div>
              )}
              {item && item.status === 'listed_on_ebay' && !ebayListingDetails && item.listing && (
                   <div style={{marginTop: '15px', padding: '10px', border: '1px solid #0070f3', borderRadius: '5px', backgroundColor: '#e7f3ff'}}>
                      <h4>Item is Listed on eBay</h4>
                      <p><strong>eBay Listing ID:</strong> {item.listing.ebay_listing_id}</p>
                      {item.listing.listing_url && (
                      <p>
                          <strong>View on eBay:</strong>{' '}
                          <a href={item.listing.listing_url} target="_blank" rel="noopener noreferrer" style={{color: '#0070f3'}}>
                          {item.listing.listing_url}
                          </a>
                      </p>
                      )}
                  </div>
              )}
            </>
          )}

          {showDeleteConfirm && (
            <div style={{
              position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div className="glass-card" style={{padding: '30px', textAlign: 'center', maxWidth: '400px', width: '90%'}}>
                <h3 style={{marginTop: 0, marginBottom: '15px'}}>Confirm Deletion</h3>
                <p style={{marginBottom: '25px'}}>Are you sure you want to delete this item? This action cannot be undone.</p>
                {deleteError && <p style={{color: 'var(--error)', marginBottom: '15px'}}>{deleteError}</p>}
                <div style={buttonGroupStyle}>
                  <button
                    onClick={handleDeleteItem}
                    disabled={isDeleting}
                    className="neumorphic-button"
                    style={{backgroundColor: 'var(--error)', color: 'white'}}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Item'}
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                    disabled={isDeleting}
                    className="neumorphic-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {itemId && sessionToken && (
            <ImageUploader itemId={itemId} sessionToken={sessionToken} />
          )}
          {!sessionToken && user && <p>Loading image uploader...</p>}
        </>
      )}
    </div>
  );
}

export default withAuthGuard(ItemDetailPage);