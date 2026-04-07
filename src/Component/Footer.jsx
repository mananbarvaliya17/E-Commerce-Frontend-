import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <h2>EcomNova</h2>
          <p>Smart shopping for modern life.</p>
          <div className="footer__meta">
            <span>Always-on support</span>
            <span>Secure payments</span>
          </div>
        </div>

        <div className="footer__links">
          <div>
            <h3>Shop</h3>
            <a href="/home">New arrivals</a>
            <a href="/cart">Cart</a>
            <a href="/profile">Profile</a>
          </div>
          <div>
            <h3>Account</h3>
            <a href="/login">Login</a>
            <a href="/">Register</a>
            <a href="/logout">Logout</a>
          </div>
          <div>
            <h3>Admin</h3>
            <a href="/user">Users</a>
            <a href="/home">Insights</a>
            <a href="/cart">Orders</a>
          </div>
        </div>

        <div className="footer__cta">
          <h3>Get updates</h3>
          <p>Subscribe for offers and launches.</p>
          <div className="footer__input">
            <input type="email" placeholder="Email address" />
            <button type="button">Join</button>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>2026 EcomNova. All rights reserved.</span>
        <span>Developed by : Manan Barvaliya</span>
      </div>
    </footer>
  )
}

export default Footer