import React, { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import { productsAPI } from '../services/productsAPI';
import { authAPI } from '../services/authAPI';
import '../Products.css';
import './Movements.css';

const AddProduct = ({ setCurrentPage }) => {
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    unit_cost: 0,
    reorder_level: 0,
    on_hand: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = authAPI.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'unit_cost' || name === 'reorder_level' || name === 'on_hand' 
        ? Number(value) 
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sku.trim() || !form.name.trim()) {
      setError('SKU and name are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await productsAPI.create(form);
      setSuccess('Product added successfully!');
      setForm({
        sku: '',
        name: '',
        description: '',
        unit_cost: 0,
        reorder_level: 0,
        on_hand: 0,
      });
      setTimeout(() => setCurrentPage('products'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            className="icon-btn"
            onClick={() => setCurrentPage('products')}
            style={{ marginRight: '1rem' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Add New Product</h1>
        </div>

        <div className="entry-shell">
          <p className="page-subtitle" style={{ margin: 0 }}>
            Only admin users can create products manually. You can still review the catalog and log stock movements.
          </p>

          <div className="entry-actions">
            <button type="button" className="action-btn" onClick={() => setCurrentPage('products')}>
              Back to Products
            </button>
            <button type="button" className="primary-btn" onClick={() => setCurrentPage('add-movement')}>
              Log Movement Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          className="icon-btn" 
          onClick={() => setCurrentPage('products')}
          style={{ marginRight: '1rem' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>Add New Product</h1>
      </div>
      <p className="page-subtitle">
        Enter product details manually to create a new inventory item.
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

        <form onSubmit={handleSubmit} className="modal-form" style={{ padding: 0 }}>
          <div className="form-row">
            <div className="form-group">
              <label>SKU *</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g., SKU-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Laptop"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional product description"
              style={{ minHeight: '80px', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unit Cost ($)</label>
              <input
                name="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={form.unit_cost}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>On Hand (qty)</label>
              <input
                name="on_hand"
                type="number"
                min="0"
                value={form.on_hand}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Reorder Level (qty)</label>
              <input
                name="reorder_level"
                type="number"
                min="0"
                value={form.reorder_level}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '2rem' }}>
            <button 
              type="button" 
              className="action-btn" 
              onClick={() => setCurrentPage('products')}
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
                <><Loader size={16} className="spinner" /> Adding...</>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
