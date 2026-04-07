import React, { useEffect, useState } from 'react'
import './UpdateProduct.css'
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../utils/api';

const UpdateProduct = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
        image: '',
        name: '',
        category: '',
        description: '',
        price: '',
        discount: '',
        rating: '',
        stock: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const data = await apiFetch(`${API_BASE_URL}/api/shop/shop/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include'
                });

                const matchedProduct = data.product;

                if (!matchedProduct) {
                    setError('Product not found');
                    setProduct(null);
                    return;
                }

                setProduct(matchedProduct);
                setFormData({
                    image: matchedProduct.image || '',
                    name: matchedProduct.name || '',
                    category: matchedProduct.category || '',
                    description: matchedProduct.description || '',
                    price: matchedProduct.price || '',
                    discount: matchedProduct.discount ?? 0,
                    rating: matchedProduct.rating || '',
                    stock: matchedProduct.stock || ''
                });
                setSelectedImage(null);
            } catch (err) {
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setSelectedImage(e.target.files?.[0] || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('category', formData.category);
            payload.append('description', formData.description);
            payload.append('price', String(formData.price));
            payload.append('discount', String(formData.discount));
            payload.append('rating', String(formData.rating));
            payload.append('stock', String(formData.stock));

            if (selectedImage) {
                payload.append('image', selectedImage);
            }

            await apiFetch(`${API_BASE_URL}/api/shop/update/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
                body: payload
            });

            navigate('/home');
        } catch (err) {
            setError(err.message || 'Failed to update product');
        }
    };

    if (loading) {
        return <div className="create-product-page"><p>Loading product...</p></div>;
    }

    if (!product) {
        return (
            <div className="create-product-page">
                <div className="create-product-form">
                    <div className="form-header">
                        <h1>Product Not Found</h1>
                        <p>{error || 'We could not find that product to update.'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-product-page">
            <form className="create-product-form" onSubmit={handleSubmit}>
                <div className="form-header">
                    <h1>Update Product</h1>
                    <p>Update item pricing, discount, stock, and category details.</p>
                </div>
                <div className="form-grid">
                    <div className="input-group full">
                        <label htmlFor="product-image">Product image</label>
                        <input id="product-image" value={formData.image} onChange={handleChange} type="text" name="image" readOnly />
                        <input id="product-image-file" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-name">Product name</label>
                        <input id="product-name" value={formData.name} onChange={handleChange} type="text" name="name" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-category">Category</label>
                        <input id="product-category" value={formData.category} onChange={handleChange} type="text" name="category" required />
                    </div>
                    <div className="input-group full">
                        <label htmlFor="product-description">Description</label>
                        <textarea id="product-description" value={formData.description} onChange={handleChange} name="description" required></textarea>
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-price">Price</label>
                        <input id="product-price" value={formData.price} onChange={handleChange} type="number" name="price" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-discount">Discount percentage (%)</label>
                        <select
                            id="product-discount"
                            value={formData.discount}
                            onChange={handleChange}
                            name="discount"
                        >
                            <option value="">Select discount</option>
                            <option value="0">0</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-rating">Rating</label>
                        <input id="product-rating" value={formData.rating} onChange={handleChange} type="number" name="rating" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="product-stock">Stock</label>
                        <input id="product-stock" value={formData.stock} onChange={handleChange} type="number" name="stock" required />
                    </div>

                </div>
                {error ? <p className="cp-feedback cp-feedback--error">{error}</p> : null}
                <button type="submit" className="form-submit">Update Product</button>
            </form>
        </div>
    )
}

export default UpdateProduct