import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <section className="app__fallback">
      <p className="app__fallbackEyebrow">404</p>
      <h1>Page not found.</h1>
      <p>The route you requested does not exist.</p>
      <Link to="/home" className="app__fallbackButton">Go home</Link>
    </section>
  )
}

export default NotFound