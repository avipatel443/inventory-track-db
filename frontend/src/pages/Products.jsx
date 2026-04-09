import React, { useState } from 'react';
import '../Products.css';

const Products = () => {
  // State for products list
  const [products, setProducts] = useState([
    { id: 1, sku: 'SKU-001', name: 'Wireless Headphones', stock: 45, reorderLevel: 10, status: 'Active' },
    { id: 2, sku: 'SKU-002', name: 'Mechanical Keyboard', stock: 5, reorderLevel: 20, status: 'Low Stock' },
    { id: 3, sku: 'SKU-003', name: 'USB-C Cable', stock: 120, reorderLevel: 50, status: 'Active' },
    { id: 4, sku: 'SKU-004', name: 'Ergonomic Mouse', stock: 8, reorderLevel: 15, status: 'Low Stock' },
  ]);

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="page-title">Products Inventory</h1>
        <button className="primary-btn">Add Product</button>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Stock On Hand</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="sku-cell">{product.sku}</td>
                <td>{product.name}</td>
                <td className={product.stock <= product.reorderLevel ? 'text-danger fw-bold' : ''}>
                  {product.stock}
                </td>
                <td>{product.reorderLevel}</td>
                <td>
                  <span className={`status-badge ${product.stock <= product.reorderLevel ? 'status-low' : 'status-active'}`}>
                    {product.stock <= product.reorderLevel ? 'Low Stock' : 'Active'}
                  </span>
                </td>
                <td>
                  <button className="action-btn">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
