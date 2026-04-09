import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './Cart.css'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'
import { apiFetch } from '../../utils/api'
import Pagination from '../../Component/Pagination'
import { getStoredUser } from '../../utils/auth'

const ITEMS_PER_PAGE = 4

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [shippingAddress, setShippingAddress] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const navigate = useNavigate()

  const validCartItems = useMemo(
    () => cartItems.filter((item) => item?.product?._id),
    [cartItems]
  )

  const totals = useMemo(() => validCartItems.reduce(
    (acc, item) => {
      const quantity = item.quantity || 0
      const price = Number(item.product?.price || 0)
      const discount = Number(item.product?.discount || 0)
      const discountedPrice = price * (1 - Math.min(Math.max(discount, 0), 100) / 100)
      acc.items += quantity
      acc.subtotal += discountedPrice * quantity
      acc.savings += (price - discountedPrice) * quantity
      return acc
    },
    { items: 0, subtotal: 0, savings: 0 }
  ), [validCartItems])

  const totalPages = Math.max(Math.ceil(validCartItems.length / ITEMS_PER_PAGE), 1)
  const paginatedCartItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return validCartItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, validCartItems])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const fetchCart = useCallback(async () => {
    const user = getStoredUser()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const data = await apiFetch(`${API_BASE_URL}/api/shop/cart`, {
        credentials: 'include'
      })

      const items = data.cart?.items || []
      setCartItems(items.filter((item) => item?.product?._id))
    } catch (err) {
      setError(err.message || 'Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const updateQuantity = async (productId, quantity) => {
    const user = getStoredUser()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const data = await apiFetch(`${API_BASE_URL}/api/shop/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      })

      const items = data.cart?.items || []
      setCartItems(items.filter((item) => item?.product?._id))
    } catch (err) {
      alert(err.message || 'Failed to update quantity')
    }
  }

  const removeItem = async (productId) => {
    const user = getStoredUser()
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const data = await apiFetch(`${API_BASE_URL}/api/shop/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const items = data.cart?.items || []
      setCartItems(items.filter((item) => item?.product?._id))
    } catch (err) {
      alert(err.message || 'Failed to remove item')
    }
  }

  const handleCheckout = async () => {
    const user = getStoredUser()
    if (!user) {
      navigate('/login')
      return
    }

    if (!validCartItems.length) {
      setCheckoutMessage('Your cart is empty.')
      return
    }

    if (!shippingAddress.trim() || !contactPhone.trim() || !paymentMethod.trim()) {
      setCheckoutMessage('Please fill shipping address, contact number, and payment method.')
      return
    }

    setCheckoutLoading(true)
    setCheckoutMessage('')

    try {
      await apiFetch(`${API_BASE_URL}/api/shop/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          items: validCartItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity || 1
          })),
          address: shippingAddress,
          phone: contactPhone,
          paymentMethod
        })
      })

      await apiFetch(`${API_BASE_URL}/api/shop/cart`, {
        method: 'DELETE',
        credentials: 'include'
      })

      setCartItems([])
      setCheckoutMessage('Order placed successfully. Redirecting...')
      setTimeout(() => navigate('/home'), 1200)
    } catch (err) {
      setCheckoutMessage(err.message || 'Failed to place order')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    const listTop = document.querySelector('.cart__panel')
    listTop?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const shipping = totals.subtotal > 150 ? 0 : 9
  const tax = Math.round(totals.subtotal * 0.08)
  const grandTotal = totals.subtotal + shipping + tax

  return (
    <section className="cart">
      <div className="cart__container">
        <div className="cart__hero">
          <div>
            <p className="cart__eyebrow">Your Cart</p>
            <h1 className="cart__title">Ready to check out?</h1>
            <p className="cart__subtitle">
              Review your items, adjust quantities, and finish your order.
            </p>
          </div>
          <div className="cart__badge">
            <span>{totals.items} items</span>
            <strong>${grandTotal.toFixed(2)}</strong>
          </div>
        </div>

        <div className="cart__grid">
          <div className="cart__panel">
            <div className="cart__panelHeader">
              <h2>Items in your bag</h2>
              <button className="cart__ghost">Continue shopping</button>
            </div>

            <div className="cart__resultsMeta">
              <span>
                Showing {validCartItems.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                {' '}
                -{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, validCartItems.length)} of {validCartItems.length}
              </span>
            </div>

            <div className="cart__list">
              {loading ? <p>Loading cart...</p> : null}
              {error ? <p style={{ color: '#c53030' }}>{error}</p> : null}
              {!loading && !error && paginatedCartItems.length === 0 ? (
                <p className="cart__empty">Your cart is empty.</p>
              ) : null}
              {paginatedCartItems.map((item) => {
                const originalPrice = Number(item.product?.price || 0)
                const discount = Number(item.product?.discount || 0)
                const discountedPrice = originalPrice * (1 - Math.min(Math.max(discount, 0), 100) / 100)

                return (
                  <article className="cart__item" key={item.product?._id || item._id}>
                    <div className="cart__thumb" aria-hidden="true">
                      {item.product?.image ? (
                        <img
                          className="cart__thumbImage"
                          src={item.product.image}
                          alt={item.product?.name || 'Product'}
                          loading="lazy"
                        />
                      ) : (
                        <span className="cart__thumbFallback">{(item.product?.name || 'Product').split(' ')[0]}</span>
                      )}
                    </div>
                    <div className="cart__details">
                      <div className="cart__info">
                        <h3>{item.product?.name || 'Product'}</h3>
                        <p>{item.product?.category || 'Category'}</p>
                      </div>
                      <div className="cart__price">
                        <strong>${discountedPrice.toFixed(2)}</strong>
                        {discount > 0 ? (
                          <span style={{ marginLeft: '8px', textDecoration: 'line-through', color: '#64748b' }}>
                            ${originalPrice.toFixed(2)}
                          </span>
                        ) : null}
                      </div>
                      <div className="cart__actions">
                        <div className="cart__qty">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.product?._id, Math.max((item.quantity || 1) - 1, 1))}
                          >
                            -
                          </button>
                          <span>{item.quantity || 1}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.product?._id, (item.quantity || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button className="cart__link" onClick={() => removeItem(item.product?._id)}>Remove</button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>

          <aside className="cart__summary">
            <div className="cart__summaryCard">
              <h2>Order summary</h2>
              <div className="cart__row">
                <span>Subtotal</span>
                <strong>${totals.subtotal.toFixed(2)}</strong>
              </div>
              <div className="cart__row">
                <span>Shipping</span>
                <strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong>
              </div>
              <div className="cart__row">
                <span>Estimated tax</span>
                <strong>${tax.toFixed(2)}</strong>
              </div>
              <div className="cart__row cart__row--total">
                <span>Total</span>
                <strong>${grandTotal.toFixed(2)}</strong>
              </div>

              <div className="cart__checkoutFields">
                <input
                  className="cart__checkoutInput"
                  type="text"
                  placeholder="Shipping address"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
                <input
                  className="cart__checkoutInput"
                  type="tel"
                  placeholder="Contact number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <select className="cart__checkoutInput" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="">Select payment method</option>
                  <option value="credit">Credit Card</option>
                  <option value="debit">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="qr">QR Code</option>
                </select>
              </div>

              {checkoutMessage ? <p style={{ marginTop: '12px' }}>{checkoutMessage}</p> : null}

              <button className="cart__cta" type="button" onClick={handleCheckout} disabled={checkoutLoading || validCartItems.length === 0}>
                {checkoutLoading ? 'Placing order...' : 'Proceed to checkout'}
              </button>
              <p className="cart__note">Protected checkout with 256-bit SSL.</p>
            </div>

            <div className="cart__summaryCard cart__summaryCard--light">
              <h3>Promo code</h3>
              <div className="cart__promo">
                <input type="text" placeholder="Enter code" />
                <button>Apply</button>
              </div>
              <div className="cart__row">
                <span>You save</span>
                <strong>${totals.savings.toFixed(2)}</strong>
              </div>
            </div>

            <div className="cart__summaryCard cart__summaryCard--ship">
              <h3>Delivery</h3>
              <p>Standard delivery by Feb 20, 2026</p>
              <div className="cart__shipping">
                <div>
                  <span>Free shipping</span>
                  <strong>Orders over $150</strong>
                </div>
                <div>
                  <span>Easy returns</span>
                  <strong>30-day policy</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Cart