import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'
import Logout from './Logout'
import { API_BASE_URL } from '../config'
import { apiFetch } from '../utils/api'
import { clearStoredAuth, getStoredUser } from '../utils/auth'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()
    const { user: authUser, setUser } = useAuth()

    const storedUser = getStoredUser()
    const user = authUser || storedUser

    const handleLogoutClick = () => {
        setShowLogoutModal(true)
    }

    const handleToggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev)
    }

    const handleCloseMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    const handleConfirmLogout = async () => {
        try {
            await apiFetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            })
        } catch {
            // Continue logout flow even if API request fails.
        }

        clearStoredAuth()
        setUser(null)
        setShowLogoutModal(false)
        setMobileMenuOpen(false)
        navigate('/login')
    }

    const handleCancelLogout = () => {
        setShowLogoutModal(false)
    }

    const role = user?.role
    const isAdmin = role === 'admin'
    const isUser = role === 'user'
    const isLoggedIn = !!user

    return (
        <>
            <nav className="navbar">
                <div className="navbar__inner">

                    <Link to="/home" className="navbar__brand" onClick={handleCloseMobileMenu}>
                        <span className="navbar__logo">Smart Commerce</span>
                    </Link>

                    <button
                        type="button"
                        className="navbar__menuBtn"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                        onClick={handleToggleMobileMenu}
                    >
                        <span className={`navbar__menuBar${mobileMenuOpen ? ' navbar__menuBar--open' : ''}`} />
                        <span className={`navbar__menuBar${mobileMenuOpen ? ' navbar__menuBar--open' : ''}`} />
                        <span className={`navbar__menuBar${mobileMenuOpen ? ' navbar__menuBar--open' : ''}`} />
                    </button>

                    <ul className={`navbar__links${mobileMenuOpen ? ' navbar__links--open' : ''}`}>

                        {!isLoggedIn && (
                            <>
                                <li><Link to="/register" onClick={handleCloseMobileMenu}>Register</Link></li>
                                <li><Link to="/login" onClick={handleCloseMobileMenu}>Login</Link></li>
                                <li><Link to="/aboutus" onClick={handleCloseMobileMenu}>About Us</Link></li>
                            </>
                        )}

                        {isUser && (
                            <>
                                <li><Link to="/home" onClick={handleCloseMobileMenu}>Home</Link></li>
                                <li><Link to="/cart" onClick={handleCloseMobileMenu}>Cart</Link></li>
                                <li><Link to="/collection" onClick={handleCloseMobileMenu}>Collection</Link></li>
                                <li><Link to="/profile" onClick={handleCloseMobileMenu}>Profile</Link></li>
                                <li><Link to="/aboutus" onClick={handleCloseMobileMenu}>About Us</Link></li>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <li><Link to="/preview" onClick={handleCloseMobileMenu}>Preview</Link></li>
                                <li><Link to="/createproduct" onClick={handleCloseMobileMenu}>Create Product</Link></li>
                                <li><Link to="/user" onClick={handleCloseMobileMenu}>Users</Link></li>
                                <li><Link to="/productorder" onClick={handleCloseMobileMenu}>Product Orders</Link></li>
                                <li><Link to="/collection" onClick={handleCloseMobileMenu}>Collection</Link></li>
                                <li><Link to="/profile" onClick={handleCloseMobileMenu}>Profile</Link></li>
                                <li><Link to="/aboutus" onClick={handleCloseMobileMenu}>About Us</Link></li>
                            </>
                        )}

                        {isLoggedIn ? (
                            <li className="navbar__mobileLogoutItem">
                                <button onClick={handleLogoutClick} className="navbar__logout navbar__logout--mobile">Logout</button>
                            </li>
                        ) : null}

                    </ul>

                    {isLoggedIn ? (
                        <button onClick={handleLogoutClick} className="navbar__logout navbar__logout--desktop">Logout</button>
                    ) : null }

                </div>
            </nav>

            <Logout 
                isOpen={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </>
    )
}

export default Navbar