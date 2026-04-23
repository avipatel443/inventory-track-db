import React, { useState, useEffect, useEffectEvent } from 'react';
import { Plus, X, Loader, Search, Edit2, Trash2 } from 'lucide-react';
import { productsAPI } from '../services/productsAPI';
import { authAPI } from '../services/authAPI';
import '../Products.css';

// ── Add / Edit Modal ────────────────────────────────────────────────────────
const ProductModal = ({ product, onClose, onSaved }) => {
  const isEdit = !!product;
  const [form, setForm] = useState(
    isEdit
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          unit_cost: product.unit_cost,
          reorder_level: product.reorder_level,
          on_hand: product.on_hand,
        }
      : { sku: '', name: '', description: '', unit_cost: 0, reorder_level: 0, on_hand: 0 }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sku || !form.name) {
      setError('SKU and name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await productsAPI.update(product.id, form);
      } else {
        await productsAPI.create(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div className="error-alert" style={{ margin: '0 0 1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU-001" required />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange} placeholder="Optional description" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Unit Cost ($)</label>
              <input name="unit_cost" type="number" min="0" step="0.01" value={form.unit_cost} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>On Hand</label>
              <input name="on_hand" type="number" min="0" value={form.on_hand} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Reorder Level</label>
              <input name="reorder_level" type="number" min="0" value={form.reorder_level} onChange={handleChange} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="action-btn" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? <><Loader size={16} className="spinner" /> Saving...</> : (isEdit ? 'Save Changes' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Products Page ──────────────────────────────────────────────────────
const Products = ({ setCurrentPage }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const user = authAPI.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  const loadProducts = async (query = search) => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (query.trim()) params.q = query.trim();
      const res = await productsAPI.getAll(params);
      setProducts(res.data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = useEffectEvent(async () => {
    await loadProducts(search);
  });

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      fetchProducts();
    }, 350);
    return () => clearTimeout(id);
  }, [search]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await productsAPI.remove(id);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate product.');
    }
  };

  return (
    <div className="products-page">
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => { setEditingProduct(null); loadProducts(); }}
        />
      )}

      <div className="products-header">
        <h1 className="page-title">Products Inventory</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button className="primary-btn" onClick={() => setCurrentPage('add-product')}>
              <Plus size={16} style={{ marginRight: 4 }} /> Add Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Loader size={28} className="spinner" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <p>No products found.</p>
            {isAdmin && (
              <button
                className="primary-btn"
                style={{ marginTop: '1rem' }}
                onClick={() => setCurrentPage('add-product')}
              >
                Add the First Product
              </button>
            )}
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Stock On Hand</th>
                <th>Reorder Level</th>
                <th>Unit Cost</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLow = Number(product.on_hand) <= Number(product.reorder_level);
                return (
                  <tr key={product.id}>
                    <td className="sku-cell">{product.sku}</td>
                    <td>{product.name}</td>
                    <td className={isLow ? 'text-danger fw-bold' : ''}>{product.on_hand}</td>
                    <td>{product.reorder_level}</td>
                    <td>${Number(product.unit_cost || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${isLow ? 'status-low' : 'status-active'}`}>
                        {isLow ? 'Low Stock' : 'Active'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="action-btn" onClick={() => setEditingProduct(product)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-btn"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDeactivate(product.id)}
                          title="Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Products;
