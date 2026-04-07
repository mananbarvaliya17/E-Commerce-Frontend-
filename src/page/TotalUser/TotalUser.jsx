import React, { useEffect, useState } from 'react'
import './TotalUser.css'
import { API_BASE_URL } from '../../config'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../utils/api'

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TotalUser = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token')
      if (!token) { navigate('/login'); return }

      try {
        const data = await apiFetch(`${API_BASE_URL}/api/shop/total-user`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })
        setUsers(data.totalUsers || [])
      } catch (err) {
        setError(err.message || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [navigate])

  return (
    <section className="total-user">
      {/* Header */}
      <header className="total-user__header">
        <p className="total-user__eyebrow">Admin Dashboard</p>
        <h1 className="total-user__title">
          Total <em>Users</em>
        </h1>
        <p className="total-user__subtitle">
          Manage and track user registrations across your platform.
        </p>
      </header>

      {/* Stats bar */}
      <div className="total-user__stats">
        <div className="total-user__count">
          <span className="total-user__count-icon">
            <UsersIcon />
          </span>
          <div className="total-user__count-body">
            <span className="total-user__count-label">Registered Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>
      </div>

      {/* State messages */}
      {loading && <p className="total-user__loading">Loading users…</p>}
      {error   && <p className="total-user__error">{error}</p>}

      {/* User grid */}
      <div className="total-user__list">
        {users.map((user) => (
          <article key={user._id} className="user-card">
            <div className="user-image" aria-hidden="true">
              <img
                src={user.userimage || 'https://via.placeholder.com/80'}
                alt=""
              />
            </div>
            <div className="user-info">
              <h2>{user.username}</h2>
              <p className="user-email">{user.email}</p>
              <p className="user-date">
                {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
              <span className={`status ${user.role === 'admin' ? 'status--inactive' : 'status--active'}`}>
                {user.role}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TotalUser