import React, { useEffect, useState } from 'react';
import './BuyNow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { apiFetch } from '../utils/api';
import { getStoredUser } from '../utils/auth';

const BuyNow = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            const user = getStoredUser();
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const data = await apiFetch(`${API_BASE_URL}/api/shop/shop/${id}`, {
                    credentials: 'include'
                });

                setProduct(data.product);
            } catch {
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    if (loading) {
        return <div className="buyNow">Loading product...</div>;
    }

    if (!product) {
        return <div className="buyNow">Product not found</div>;
    }

    const pricePerUnit = Number(product.price || 0);
    const discountPercent = Math.min(Math.max(Number(product.discount || 0), 0), 100);
    const totalDiscount = pricePerUnit * quantity * (discountPercent / 100);
    const totalPrice = Math.max(quantity * pricePerUnit - totalDiscount, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = getStoredUser();

        if (!user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            await apiFetch(`${API_BASE_URL}/api/shop/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    items: [{ product: id, quantity }],
                    address,
                    phone,
                    paymentMethod,
                }),
            });

            setMessage('Order placed successfully. Redirecting...');
            setAddress('');
            setPhone('');
            setPaymentMethod('');
            setQuantity(1);

            window.setTimeout(() => {
                navigate('/home');
            }, 1200);
        } catch (err) {
            setMessage(err.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className="buyNow">
            <form className="buyNow__form" onSubmit={handleSubmit} noValidate>
                <h2 className="buyNow__title buyNow__full">Confirm Your Order</h2>

                <div className="buyNow__field">
                    <label htmlFor="product-name">Product</label>
                    <input id="product-name" className="buyNow__input" type="text" value={product.name} readOnly />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="product-price">Unit Price</label>
                    <input id="product-price" className="buyNow__input" type="text" value={`$${Number(product.price).toFixed(2)}`} readOnly />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="quantity">Quantity</label>
                    <input
                        id="quantity"
                        className="buyNow__input"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(Number(e.target.value) || 1, 1))}
                    />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="discount">Discount</label>
                    <input id="discount" className="buyNow__input" type="text" value={`$${totalDiscount.toFixed(2)}`} readOnly />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="total-price">Total Price</label>
                    <input id="total-price" className="buyNow__input" type="text" value={`$${totalPrice.toFixed(2)}`} readOnly />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="product-rating">Product Rating</label>
                    <input id="product-rating" className="buyNow__input" type="text" value={`${product.rating}★`} readOnly />
                </div>


                <div className="buyNow__field buyNow__full">
                    <label htmlFor="address">Shipping Address <span aria-label="required">*</span></label>
                    <input
                        id="address"
                        className="buyNow__input"
                        type="text"
                        placeholder="Enter your address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="phone">Contact Number <span aria-label="required">*</span></label>
                    <input
                        id="phone"
                        className="buyNow__input"
                        type="tel"
                        placeholder="Enter your contact number..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        pattern="[0-9]{10}"
                    />
                </div>

                <div className="buyNow__field">
                    <label htmlFor="payment">Payment Method <span aria-label="required">*</span></label>
                    <select
                        id="payment"
                        className="buyNow__input"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                    >
                        <option value="">Select a payment method</option>
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="qr">QR Code</option>
                    </select>
                </div>

                <button className="buyNow__submit buyNow__full" type="submit" disabled={!address || !phone || !paymentMethod}>
                    {submitting ? 'Placing Order...' : 'Confirm Purchase'}
                </button>

                {message ? (
                    <p className="buyNow__full" style={{ marginTop: '8px' }}>{message}</p>
                ) : null}
            </form>
        </div>
    );
};

export default BuyNow;
