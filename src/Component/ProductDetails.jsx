import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ProductDetails.css";
import { API_BASE_URL } from '../config';
import { apiFetch } from '../utils/api';
import { getStoredUser } from '../utils/auth';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      const user = getStoredUser();

      setIsAdmin(user?.role === 'admin');

      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const data = await apiFetch(`${API_BASE_URL}/api/shop/shop/${id}`, {
          credentials: 'include'
        });

        setProduct(data.product);
      } catch (err) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    const user = getStoredUser();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await apiFetch(`${API_BASE_URL}/api/shop/shop/${id}/product`, {
        method: 'POST',
        credentials: 'include'
      });

      navigate('/cart');
    } catch (err) {
      alert(err.message || 'Failed to add product to cart');
    }
  };

  if (loading) {
    return <div className="product-details-page"><p>Loading product...</p></div>;
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="product-details-card">
          <h2 className="product-details-title">{error || 'Product Not Found'}</h2>
        </div>
      </div>
    );
  }

  const finalPrice = Number(product.price || 0);
  const discountPercent = Number(product.discount || 0);
  const discountedPrice = discountPercent > 0
    ? Math.round((finalPrice - (finalPrice * discountPercent) / 100) * 100) / 100
    : finalPrice;

  return (
    <div className="product-details-page">
      <div className="product-details-card">
        <div className="product-details-media">
          <img src={product.image} alt={product.name} />
          <span className="product-details-badge">In Stock: {product.stock}</span>
        </div>
        <div className="product-details-body">
          <h1 className="product-details-title">{product.name}</h1>
          <p className="product-details-description">{product.description}</p>
          <div className="product-details-meta">
            <div className="product-details-pricing">
              <span className="product-details-price">${discountedPrice.toLocaleString()}</span>
              {discountPercent > 0 ? (
                <span className="product-details-original">${finalPrice.toLocaleString()}</span>
              ) : null}
              {/* {discountPercent > 0 ? (
                <span className="product-details-discount">{discountPercent}% OFF</span>
              ) : null} */}
              <span className="product-details-save">Stock: {product.stock}</span>
            </div>
            <div className="product-details-rating">
              <span className="product-details-ratingValue">{product.rating} ★</span>
              <span className="product-details-ratingLabel">Verified product</span>
            </div>
          </div>
          <div className="product-details-info">
            <div className="product-details-infoItem">
              <span className="product-details-infoLabel">Product ID</span>
              <strong className="product-details-infoValue product-details-infoValue--mono">{product._id}</strong>
            </div>
            <div className="product-details-infoItem product-details-infoItem--category">
              <span className="product-details-infoLabel">Category</span>
              <span className="product-details-tag">{product.category}</span>
            </div>
          </div>
          <div className="product-details-actions">
              {!isAdmin ? (
                <>
              <button className="product-details-primary" type="button" onClick={handleAddToCart}>
                Add to Cart
              </button>

                <Link to={`/BuyNow/${product._id}`} className="product-details-secondary">
                  Buy Now
                </Link>
                </>
              ) : null}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
