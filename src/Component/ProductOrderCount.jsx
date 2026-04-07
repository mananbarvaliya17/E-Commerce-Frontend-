import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { apiFetch } from '../utils/api'
import './ProductOrderCount.css'

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

const ProductOrderCount = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || 'null')

      if (!token || !user) {
        navigate('/login')
        return
      }

      if (user.role !== 'admin') {
        navigate('/home')
        return
      }

      try {
        const data = await apiFetch(`${API_BASE_URL}/api/shop/total-order`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include'
        })

        setOrders(Array.isArray(data.orders) ? data.orders : [])
      } catch (err) {
        setError(err.message || 'Failed to fetch order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [navigate])

  const groupedOrders = useMemo(() => {
    const filteredOrders = userId
      ? orders.filter((order) => order.user?._id === userId)
      : orders

    const map = new Map()

    filteredOrders.forEach((order) => {
      const userId = order.user?._id || 'unknown'
      const username = order.user?.username || 'Unknown user'
      const email = order.user?.email || 'N/A'
      const key = `${userId}-${email}`

      const current = map.get(key) || {
        userId,
        username,
        email,
        totalOrders: 0,
        totalAmount: 0,
        orders: []
      }

      current.totalOrders += 1
      current.totalAmount += Number(order.totalPrice || 0)
      current.orders.push(order)

      map.set(key, current)
    })

    return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount)
  }, [orders, userId])

  const selectedUser = groupedOrders[0]
  const selectedSummary = useMemo(() => {
    const totals = groupedOrders.reduce(
      (acc, group) => {
        acc.totalOrders += group.totalOrders
        acc.totalAmount += group.totalAmount
        acc.totalItems += group.orders.reduce(
          (itemTotal, order) => itemTotal + (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0),
          0
        )
        return acc
      },
      { totalOrders: 0, totalAmount: 0, totalItems: 0 }
    )

    return totals
  }, [groupedOrders])

  if (loading) {
    return <p>Loading order details...</p>
  }

  if (error) {
    return <p className="productOrderCount__error">{error}</p>
  }

  if (!groupedOrders.length) {
    return (
      <div className="productOrderCount">
        <div className="productOrderCount__emptyState">
          <h2>No order details available.</h2>
          <button type="button" onClick={() => navigate('/productorder')}>Back to Product Orders</button>
        </div>
      </div>
    )
  }

  return (
    <div className="productOrderCount">
      <div className="productOrderCount__topbar">
        <div>
          <p className="productOrderCount__eyebrow">Order Count Route</p>
          <h2>{selectedUser?.email || 'Selected User'}</h2>
          <p className="productOrderCount__subtitle">Detailed product orders for the selected user.</p>
        </div>
        <button type="button" className="productOrderCount__backBtn" onClick={() => navigate('/productorder')}>
          Back to users
        </button>
      </div>

      <section className="productOrderCount__stats">
        <article className="productOrderCount__statCard">
          <span>User Email</span>
          <strong>{selectedUser?.email || 'N/A'}</strong>
        </article>
        <article className="productOrderCount__statCard">
          <span>Total Orders</span>
          <strong>{selectedSummary.totalOrders}</strong>
        </article>
        <article className="productOrderCount__statCard">
          <span>Total Product Quantity</span>
          <strong>{selectedSummary.totalItems}</strong>
        </article>
        <article className="productOrderCount__statCard">
          <span>Total Revenue</span>
          <strong>{formatCurrency(selectedSummary.totalAmount)}</strong>
        </article>
      </section>

      {groupedOrders.map((userGroup) => (
        <article key={`${userGroup.userId}-${userGroup.email}`} className="productOrderCount__userBlock">
          <header className="productOrderCount__userHeader">
            <div>
              <h3>{userGroup.username}</h3>
              <p>
                <strong>Email:</strong> {userGroup.email}
              </p>
            </div>
            <div className="productOrderCount__userMeta">
              <span>Total Orders: {userGroup.totalOrders}</span>
              <span>Total Product Quantity: {userGroup.orders.reduce((total, order) => total + (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), 0)}</span>
              <strong>Total: {formatCurrency(userGroup.totalAmount)}</strong>
            </div>
          </header>

          <div className="productOrderCount__orders">
            {userGroup.orders.map((order) => (
              <section key={order._id} className="productOrderCount__orderCard">
                <div className="productOrderCount__orderTop">
                  <p>
                    <strong>Order ID:</strong> #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                  </p>
                  <p>
                    <strong>Order Total:</strong> {formatCurrency(order.totalPrice)}
                  </p>
                </div>

                <div className="productOrderCount__items">
                  {(order.items || []).map((item, index) => {
                    const originalPrice = Number(item.price || item.product?.price || 0)
                    const discount = Number(item.discount || 0)
                    const quantity = Number(item.quantity || 0)
                    const discountedPrice = originalPrice * (1 - Math.min(Math.max(discount, 0), 100) / 100)
                    const lineTotal = discountedPrice * quantity

                    return (
                      <article className="productOrderCount__item" key={`${order._id}-${item.product?._id || index}`}>
                        <div className="productOrderCount__thumb" aria-hidden="true">
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.name || item.product?.name || 'Product'} loading="lazy" />
                          ) : (
                            <span>{(item.name || item.product?.name || 'Product').slice(0, 1)}</span>
                          )}
                        </div>

                        <div className="productOrderCount__details">
                          <h4>{item.name || item.product?.name || 'Product'}</h4>
                          <p>{item.product?.category || 'Category unavailable'}</p>
                        </div>

                        <div className="productOrderCount__pricing">
                          <span>Qty: {quantity}</span>
                          <span>Price: {formatCurrency(discountedPrice)}</span>
                          <strong>Total: {formatCurrency(lineTotal)}</strong>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export default ProductOrderCount