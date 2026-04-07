import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductOrder.css'
import { API_BASE_URL } from '../../config'
import { apiFetch } from '../../utils/api'

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

const ProductOrder = () => {
  const navigate = useNavigate()
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
        setError(err.message || 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [navigate])

  const orderSummary = useMemo(() => orders.reduce((acc, order) => {
    acc.totalOrders += 1
    acc.totalRevenue += Number(order.totalPrice || 0)
    acc.totalItems += (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    return acc
  }, {
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0
  }), [orders])

  const userTotals = useMemo(() => {
    const totalsMap = new Map()

    orders.forEach((order) => {
      const userId = order.user?._id || 'unknown'
      const username = order.user?.username || 'Unknown user'
      const email = order.user?.email || 'N/A'
      const key = `${userId}-${email}`

      const current = totalsMap.get(key) || {
        userId,
        username,
        email,
        ordersCount: 0,
        totalAmount: 0,
        totalItems: 0
      }

      current.ordersCount += 1
      current.totalAmount += Number(order.totalPrice || 0)
      current.totalItems += (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)

      totalsMap.set(key, current)
    })

    return [...totalsMap.values()].sort((a, b) => b.totalAmount - a.totalAmount)
  }, [orders])

  const handleUserClick = (userId) => {
    navigate(`/productordercount/${userId}`)
  }

  return (
    <section className="productOrder">
      <div className="productOrder__container">
        <header className="productOrder__header">
          <div>
            <p className="productOrder__eyebrow">Admin Dashboard</p>
            <h1 className="productOrder__title">Product Orders</h1>
            <p className="productOrder__subtitle">Track all placed orders and each user&apos;s total purchase amount.</p>
          </div>
        </header>

        <div className="productOrder__stats">
          <article className="productOrder__stat">
            <span>Total Orders</span>
            <strong>{orderSummary.totalOrders}</strong>
          </article>
          <article className="productOrder__stat">
            <span>Total Revenue</span>
            <strong>{formatCurrency(orderSummary.totalRevenue)}</strong>
          </article>
          <article className="productOrder__stat">
            <span>Total Items Sold</span>
            <strong>{orderSummary.totalItems}</strong>
          </article>
          <article className="productOrder__stat">
            <span>Total Buying Users</span>
            <strong>{userTotals.length}</strong>
          </article>
        </div>

        <section className="productOrder__panel">
          <h2>User Totals</h2>
          {loading ? <p>Loading orders...</p> : null}
          {error ? <p className="productOrder__error">{error}</p> : null}
          {!loading && !error && userTotals.length === 0 ? <p>No orders found yet.</p> : null}

          {!loading && !error && userTotals.length > 0 ? (
            <div className="productOrder__usersGrid">
              {userTotals.map((entry) => (
                <button
                  key={`${entry.userId}-${entry.email}`}
                  type="button"
                  className="productOrder__userCard"
                  onClick={() => handleUserClick(entry.userId)}
                >
                  <div className="productOrder__userCardTop">
                    <div>
                      <p className="productOrder__userLabel">User Email</p>
                      <h3>{entry.email}</h3>
                    </div>
                    <span className="productOrder__userHint">View details</span>
                  </div>
                  <div className="productOrder__userMetrics">
                    <div>
                      <span>Total Orders</span>
                      <strong>{entry.ordersCount}</strong>
                    </div>
                    <div>
                      <span>Revenue</span>
                      <strong>{formatCurrency(entry.totalAmount)}</strong>
                    </div>
                    <div>
                      <span>Total Products Quantity </span>
                      <strong>{entry.totalItems}</strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}

export default ProductOrder