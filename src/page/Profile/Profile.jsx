import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { API_BASE_URL } from '../../config';
import { apiFetch } from '../../utils/api';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ totalOrders: 0, totalRevenue: 0, totalItems: 0 });
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const data = await apiFetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setOrderLoading(false);
        return;
      }

      try {
        const data = await apiFetch(`${API_BASE_URL}/api/shop/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        });

        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setOrderStats({
          totalOrders: Number(data.totalOrders || 0),
          totalRevenue: Number(data.totalRevenue || 0),
          totalItems: Number(data.totalItems || 0)
        });
      } catch (err) {
        setOrderError(err.message || 'Failed to load order history');
      } finally {
        setOrderLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  if (loading) {
    return <div className="profile-page"><p>Loading profile...</p></div>;
  }

  if (!user) {
    return <div className="profile-page"><p>Profile not available.</p></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <img
            src={user.userimage || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="profile-pic"
          />
          <h2>{user.username}</h2>
          <p className="role-badge">{user.role === 'admin' ? 'Admin' : 'Customer'}</p>

          <button className="edit-btn">Edit Profile</button>
        </div>

        {/* Right Content */}
        <div className="profile-content">

          {/* Personal Info */}
          <div className="profile-card">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div> 
                <label>Name </label>
                <p>{user.username}</p>
              </div>
              <div>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div>
                <label>Phone</label>
                <p>{user.phone}</p>
              </div>
              <div>
                <label>Member Since</label>
                <p>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          

          {/* Order Summary */}
          <div className="profile-card">
            <h3>Order Summary</h3>
            <div className="order-summary">
              <div>
                <h2>{orderStats.totalOrders}</h2>
                <p>Total Orders</p>
              </div>
              <div>
                <h2>{orderStats.totalItems}</h2>
                <p>Total Products</p>
              </div>
              <div>
                <h2>{formatCurrency(orderStats.totalRevenue)}</h2>
                <p>Total Price</p>
              </div>
            </div>
          </div>

          {orderLoading || orderError || orders.length > 0 ? (
            <div className="profile-card">
              <h3>Past Orders</h3>
              {orderLoading ? <p className="profile-state">Loading orders...</p> : null}
              {orderError ? <p className="profile-state profile-state--error">{orderError}</p> : null}

              {!orderLoading && !orderError && orders.length > 0 ? (
                <div className="past-orders">
                  {orders.map((order) => (
                    <article className="past-order-card" key={order._id}>
                      <div className="past-order-card__head">
                        <div>
                          <p className="past-order-card__label">Order ID</p>
                          <h4>#{order._id?.slice(-8)?.toUpperCase() || 'N/A'}</h4>
                        </div>
                        <div className="past-order-card__total">
                          <span>Order Total</span>
                          <strong>{formatCurrency(order.totalPrice)}</strong>
                        </div>
                      </div>

                      <div className="past-order-card__items">
                        {(order.items || []).map((item, index) => {
                          const originalPrice = Number(item.price || item.product?.price || 0)
                          const discount = Number(item.discount || 0)
                          const discountedPrice = originalPrice * (1 - Math.min(Math.max(discount, 0), 100) / 100)
                          const lineTotal = discountedPrice * Number(item.quantity || 0)

                          return (
                            <article className="past-order-item" key={`${order._id}-${item.product?._id || index}`}>
                              <div className="past-order-item__thumb">
                                {item.product?.image ? (
                                  <img src={item.product.image} alt={item.name || item.product?.name || 'Product'} loading="lazy" />
                                ) : (
                                  <span>{(item.name || item.product?.name || 'P').slice(0, 1)}</span>
                                )}
                              </div>

                              <div className="past-order-item__details">
                                <h4>{item.name || item.product?.name || 'Product'}</h4>
                                <p>{item.product?.description || item.product?.category || 'Product details unavailable'}</p>
                                <div className="past-order-item__meta">
                                  <span>Qty: {item.quantity}</span>
                                  <span>Price: {formatCurrency(discountedPrice)}</span>
                                  <span>Line Total: {formatCurrency(lineTotal)}</span>
                                </div>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default Profile;
