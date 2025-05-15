import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:4000/api';

const StoreList = ({ token }) => {
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`${API_BASE}/stores`, {
  headers: { Authorization: `Bearer ${token}` },
});

        const data = await res.json();
        if (res.ok) {
          setStores(data.stores);
        } else {
          setError(data.error || 'Error fetching stores');
        }
      } catch (err) {
        setError('Failed to fetch stores: ' + err.message);
      }
    };
    fetchStores();
  }, [token]);

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!stores.length) {
    return <div>No stores found.</div>;
  }

  return (
    <div>
      <h2>Store Listings</h2>
      {stores.map((store) => (
        <div key={store.id}>
          <h3>{store.name}</h3>
          <p>Address: {store.address}</p>
          <p>Average Rating: {store.average_rating || 0}</p>
          {/* Add rating submission form here */}
        </div>
      ))}
    </div>
  );
};

export default StoreList;

