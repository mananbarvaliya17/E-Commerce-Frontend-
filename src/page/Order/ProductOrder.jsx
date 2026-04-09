import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProductOrder.css'
import { API_BASE_URL } from '../../config'
import { apiFetch } from '../../utils/api'
import { getStoredUser } from '../../utils/auth'
import Pagination from '../../Component/Pagination'

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`

const ProductOrder = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, totalItems: 0 })
  const [userTotals, setUserTotals] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      const user = getStoredUser()

      if (!user) {
        navigate('/login')
        return
      }

      if (user.role !== 'admin') {
        navigate('/home')
        return
      }

      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams({ page: String(currentPage), limit: '8' })
        const data = await apiFetch(`${API_BASE_URL}/api/shop/total-order?${params.toString()}`, {
          credentials: 'include'
        })

        setOrders(Array.isArray(data.orders) ? data.orders : [])
        setAnalytics(data.analytics || { totalOrders: 0, totalRevenue: 0, totalItems: 0 })
        setUserTotals(Array.isArray(data.userTotals) ? data.userTotals : [])
        setTotalPages(Number(data.totalPages || 0))
      } catch (err) {
        setError(err.message || 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [currentPage, navigate])

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
            <strong>{analytics.totalOrders || orderSummary.totalOrders}</strong>
          </article>
          <article className="productOrder__stat">
            <span>Total Revenue</span>
            <strong>{formatCurrency(analytics.totalRevenue || orderSummary.totalRevenue)}</strong>
          </article>
          <article className="productOrder__stat">
            <span>Total Items Sold</span>
            <strong>{analytics.totalItems || orderSummary.totalItems}</strong>
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
                      <span>Total Products Quantity</span>
                      <strong>{entry.totalItems}</strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </section>
      </div>
    </section>
  )
}

export default ProductOrder