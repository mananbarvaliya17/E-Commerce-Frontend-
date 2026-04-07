import React from 'react'
import './Logout.css'

const Logout = ({ isOpen, onConfirm, onCancel }) => {
  
  if (!isOpen) return null

  return (
    <div className="logout__overlay">
      <div className="logout__modal">
        <div className="logout__header">
          <h2>Confirm Logout</h2>
        </div>
        <div className="logout__body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="logout__footer">
          <button className="logout__btn logout__btn--cancel" onClick={onCancel}>Cancel</button>
          <button className="logout__btn logout__btn--danger" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default Logout