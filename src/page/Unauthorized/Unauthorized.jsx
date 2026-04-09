import React from 'react'
import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <section className="app__fallback">
      <p className="app__fallbackEyebrow">Access Denied</p>
      <h1>You are not authorized to view this page.</h1>
      <p>Please sign in with the correct account role and try again.</p>
      <Link to="/login" className="app__fallbackButton">Go to login</Link>
    </section>
  )
}

export default Unauthorized