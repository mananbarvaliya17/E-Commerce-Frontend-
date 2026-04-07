import React, { useEffect, useState } from 'react'
import './DeleteProduct.css'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { apiFetch } from '../utils/api'

const DeleteProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const token = localStorage.getItem('token')

    if (!token || !user || user.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchProduct = async () => {
      try {
        const data = await apiFetch(`${API_BASE_URL}/api/shop/shop/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })

        setProduct(data.product)
      } catch (err) {
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  const handleDelete = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setDeleting(true)
    setError('')

    try {
      await apiFetch(`${API_BASE_URL}/api/shop/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })

      navigate('/preview')
    } catch (err) {
      setError(err.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="delete-product-page">
        <div className="delete-product-card">
          <p className="delete-product-message">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="delete-product-page">
      <div className="delete-product-card">
        <div className="delete-product-header">
          <p className="delete-product-eyebrow">Delete Product</p>
          <h1 className="delete-product-title">Confirm deletion</h1>
          <p className="delete-product-subtitle">
            This action will permanently remove the product from the store.
          </p>
        </div>

        {error ? <p className="delete-product-error">{error}</p> : null}

        {product ? (
          <div className="delete-product-summary">
            <img className="delete-product-image" src={product.image} alt={product.name} />
            <div className="delete-product-info">
              <h2>{product.name}</h2>
              <p>{product.category}</p>
              <span>${Number(product.price || 0).toLocaleString()}</span>
            </div>
          </div>
        ) : null}

        <div className="delete-product-actions">
        
          <button
            type="button"
            className="delete-product-cancel"
            onClick={() => navigate('/preview')}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-product-confirm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProduct