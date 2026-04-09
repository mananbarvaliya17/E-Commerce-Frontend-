import React, { useState } from 'react'
import './CreateProduct.css'
import { API_BASE_URL } from '../../config'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'
import { getStoredUser } from '../../utils/auth'

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        image: null,
        name: '',
        category: '',
        description: '',
        price: '',
        discount: '',
        rating: '',
        stock: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    const validate = () => {
        if (!formData.name.trim())        return 'Product name is required'
        if (!formData.category.trim())    return 'Category is required'
        if (!formData.description.trim()) return 'Description is required'
        if (!formData.price || Number(formData.price) <= 0) return 'Enter a valid price greater than 0'
        if (formData.discount !== '' && (Number(formData.discount) < 0 || Number(formData.discount) > 100)) return 'Discount must be between 0 and 100'
        if (!formData.rating || Number(formData.rating) < 1 || Number(formData.rating) > 5) return 'Rating must be between 1 and 5'
        if (!formData.stock || Number(formData.stock) < 0) return 'Enter a valid stock value (0 or more)'
        return null
    }

    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'image') {
            setFormData((prev) => ({ ...prev, image: files[0] || null }))
            return
        }
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationError = validate()
        if (validationError) {
            setError(validationError)
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        const user = getStoredUser()
        if (!user) {
            navigate('/login')
            return
        }

        try {
            const payload = new FormData()
            payload.append('name', formData.name)
            payload.append('category', formData.category)
            payload.append('description', formData.description)
            payload.append('price', formData.price)
            if (formData.discount !== '') {
                payload.append('discount', formData.discount)
            }
            payload.append('rating', formData.rating)
            payload.append('stock', formData.stock)
            if (formData.image) {
                payload.append('image', formData.image)
            }

            await apiFetch(`${API_BASE_URL}/api/shop/create`, {
                method: 'POST',
                credentials: 'include',
                body: payload
            })

            setSuccess('Product created successfully! Redirecting...')
            setTimeout(() => navigate('/preview'), 1000)
        } catch (err) {
            setError(err.message || 'Failed to create product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="create-product-page">
            <form className="create-product-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h1>Create Product</h1>
                    <p>Add a new item with pricing, stock, and category details.</p>
                </div>
                <div className="form-grid">
                    <div className="input-group full">
                        <label htmlFor="product-image">Product image</label>
                        <input id="product-image" type="file" name="image" required onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-name">Product name</label>
                        <input id="product-name" type="text" name="name" required onChange={handleChange} value={formData.name} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-category">Category</label>
                        <input id="product-category" type="text" name="category" required onChange={handleChange} value={formData.category} />
                    </div>
                    <div className="input-group full">
                        <label htmlFor="product-description">Description</label>
                        <textarea id="product-description" name="description" required onChange={handleChange} value={formData.description}></textarea>
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-price">Price</label>
                        <input id="product-price" type="number" name="price" required onChange={handleChange} value={formData.price} min="1" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-discount">Discount percentage</label>
                        <input id="product-discount" type="number" name="discount" onChange={handleChange} value={formData.discount} min="0" max="100" step="1" placeholder="Optional" />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-rating">Rating</label>
                        <input id="product-rating" type="number" name="rating" required onChange={handleChange} value={formData.rating} min="1" max="5" step="0.1" />
                    </div>
                    <div className="input-group ">
                        <label htmlFor="product-stock">Stock</label>
                        <input id="product-stock" type="number" name="stock" required onChange={handleChange} value={formData.stock} min="0" />
                    </div>

                </div>
                {error ? <p className="cp-feedback cp-feedback--error">{error}</p> : null}
                {success ? <p className="cp-feedback cp-feedback--success">{success}</p> : null}
                <button type="submit" className="form-submit" disabled={loading}>
                    {loading ? <span className="cp-spinner" /> : null}
                    {loading ? 'Creating...' : 'Create Product'}
                </button>
            </form>
        </div>
    )
}

export default CreateProduct