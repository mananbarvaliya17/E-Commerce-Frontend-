import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'
import { apiFetch } from '../utils/api'
import { clearStoredAuth, getStoredUser, setStoredUser } from '../utils/auth'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const profile = await apiFetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: 'include',
        })

        if (profile?.user) {
          setUser(profile.user)
          setStoredUser(profile.user)
        } else {
          setUser(null)
          clearStoredAuth()
        }
      } catch {
        setUser(null)
        clearStoredAuth()
      } finally {
        setLoading(false)
      }
    }

    bootstrapAuth()
  }, [])

  const refreshAuth = async () => {
    try {
      const profile = await apiFetch(`${API_BASE_URL}/api/auth/profile`, {
        credentials: 'include',
      })

      if (profile?.user) {
        setUser(profile.user)
        setStoredUser(profile.user)
        return profile.user
      }

      setUser(null)
      clearStoredAuth()
      return null
    } catch {
      setUser(null)
      clearStoredAuth()
      return null
    }
  }

  const loginUser = (nextUser) => {
    setUser(nextUser)
    setStoredUser(nextUser)
  }

  const logout = async () => {
    try {
      await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Continue local cleanup even if the backend call fails.
    }

    setUser(null)
    clearStoredAuth()
    navigate('/login')
  }

  const value = useMemo(() => ({
    loading,
    logout,
    loginUser,
    refreshAuth,
    setUser,
    user,
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}