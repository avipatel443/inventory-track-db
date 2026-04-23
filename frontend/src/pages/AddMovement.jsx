import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { movementsAPI } from '../services/movementsAPI';
import { productsAPI } from '../services/productsAPI';
import { authAPI } from '../services/authAPI';
import './Movements.css';

const TYPE_META = {
  IN: { label: 'IN — Receive stock', color: '#10b981', icon: ArrowDown },
  OUT: { label: 'OUT — Ship/Consume', color: '#ef4444', icon: ArrowUp },
  ADJUST: { label: 'ADJUST — Set quantity', color: '#f59e0b', icon: RefreshCw },
};

const AddMovement = ({ setCurrentPage }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    product_id: '',
    type: 'IN',
    quantity: 1,
    note: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = authAPI.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productsAPI.getAll({ active: 'true' });
        setProducts(res.data);
      } catch {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProjectedOnHand = () => {
    if (!selectedProduct) return null;

    const currentOnHand = Number(selectedProduct.on_hand || 0);
    const quantity = Number(form.quantity || 0);

    if (form.type === 'IN') return currentOnHand + quantity;
    if (form.type === 'OUT') return currentOnHand - quantity;
    return quantity;
  };

  const projectedOnHand = getProjectedOnHand();

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setForm((prev) => ({ ...prev, product_id: productId }));
    const product = products.find((p) => p.id === Number(productId));
    setSelectedProduct(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id) {
      setError('Please select a product.');
      return;
    }
    if (form.quantity < 0) {
      setError('Quantity must be 0 or greater.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await movementsAPI.create({
        product_id: Number(form.product_id),
        type: form.type,
        quantity: Number(form.quantity),
        note: form.note || null,
      });
      setSuccess('Movement logged successfully!');
      setForm({
        product_id: '',
        type: 'IN',
        quantity: 1,
        note: '',
      });
      setSelectedProduct(null);
      setTimeout(() => setCurrentPage('movements'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log movement.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          className="icon-btn"
          onClick={() => setCurrentPage('movements')}
          style={{ marginRight: '1rem' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Log Stock Movement</h1>
      </div>
      <p className="page-subtitle">
        Record stock coming in, going out, or being adjusted by entering the movement manually.
      </p>

      <div className="entry-shell" style={{ maxWidth: '700px', margin: '0 auto' }}>
        {error && (
          <div className="error-alert" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '1rem',
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            color: '#047857',
            marginBottom: '1.5rem',
          }}>
            {success}
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-state-card">
            <p>No active products are available yet, so there is nothing to move.</p>
            <div className="entry-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="action-btn"
                onClick={() => setCurrentPage('products')}
              >
                View Products
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setCurrentPage('add-product')}
                >
                  Add Product First
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form" style={{ padding: 0 }}>
            <div className="form-group">
              <label>Product *</label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleProductChange}
                required
              >
                <option value="">— Select a product —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} (on hand: {p.on_hand})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{selectedProduct.name}</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                  SKU: {selectedProduct.sku}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                  Current On Hand: <strong>{selectedProduct.on_hand}</strong>
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                  Unit Cost: <strong>${selectedProduct.unit_cost}</strong>
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Movement Type *</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  {Object.entries(TYPE_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                {form.type === 'ADJUST' && (
                  <p className="form-helper">For `ADJUST`, the quantity becomes the new on-hand stock.</p>
                )}
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
                {selectedProduct && projectedOnHand !== null && (
                  <p className="form-helper" style={{ color: projectedOnHand < 0 ? '#ef4444' : undefined }}>
                    Projected on hand after save: {projectedOnHand}
                  </p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Note (optional)</label>
              <textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="e.g., Received from supplier, Customer order, Stock adjustment"
                style={{ minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '2rem' }}>
              <button
                type="button"
                className="action-btn"
                onClick={() => setCurrentPage('movements')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving ? (
                  <><Loader size={16} className="spinner" /> Logging...</>
                ) : (
                  'Log Movement'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMovement;
