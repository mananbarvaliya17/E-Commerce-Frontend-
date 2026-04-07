import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isInCollection, toggleCollectionItem } from '../utils/collection'

const ProductCart = ({
  products = [],
  loading = false,
  error = '',
  onRetry,
  onAddToCart
}) => {
  const navigate = useNavigate()
  const [, setCollectionVersion] = useState(0)

  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry()
    }
  }

  const handleAddToCart = (productId) => {
    if (typeof onAddToCart === 'function') {
      onAddToCart(productId)
    }

    navigate('/cart')
  }

  const handleBuyNow = (productId) => {
    navigate(`/BuyNow/${productId}`)
  }

  const handleToggleCollection = (product) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    toggleCollectionItem(product)
    setCollectionVersion((version) => version + 1)
  }

  return (
    <div>
      <section className="home__products">
        <div className="home__sectionHeader">
          <h2>Featured products</h2>
          <button className="home__ghostBtn" onClick={handleRetry}>Retry</button>
        </div>
        {loading ? <p>Loading products...</p> : null}
        {error ? (
          <div className="home__errorState" role="alert">
            <strong>Unable to load Home products</strong>
            <p>{error}</p>
            <button className="home__errorBtn" onClick={handleRetry}>Try again</button>
          </div>
        ) : null}
        <div className="home__productGrid">
          {products.map((product, index) => (
            <article
              key={product._id || index}
              className="home__productCard home__productCard--bg"
              style={{ backgroundImage: product.image ? `url("${encodeURI(product.image)}")` : 'none' }}
            >
              {(() => {
                const originalPrice = Number(product.price || 0)
                const discountPercent = Number(product.discount || 0)
                const hasDiscount = discountPercent > 0
                const discountedPrice = hasDiscount
                  ? Math.floor(originalPrice * (1 - discountPercent / 100))
                  : originalPrice
                  const saved = isInCollection(product._id)

                return (
                  <>
                    {hasDiscount ? <span className="home__discount">{discountPercent}% OFF</span> : null}
                    <button
                      type="button"
                      className={`home__wishlist${saved ? ' home__wishlist--saved' : ''}`}
                      aria-label={saved ? 'Remove product from collection' : 'Save product to collection'}
                      aria-pressed={saved}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleCollection(product)
                      }}
                    >
                      {saved ? '♥' : '♡'}
                    </button>
                    <div className="home__productBody home__productBody--overlay">
                <h3 title={product.name}>
                  <Link to={`/product/${product._id}`} className="home__titleLink" aria-label={`View details for ${product.name}`}>
                    {product.name}
                  </Link>
                </h3>
                <p>{product.description}</p>
                <div className="home__rating">
                  <span className="home__ratingValue">{product.rating || 0} ★</span>
                  <span className="home__ratingCount">Verified product</span>
                </div>
                <div className="home__pricing">
                  <div className="home__priceRow">
                    <span className="home__price">${discountedPrice.toLocaleString()}</span>
                    {hasDiscount ? (
                      <span className="home__originalPrice">${originalPrice.toLocaleString()}</span>
                    ) : null}
                  </div>
                  <span className="home__save">In stock: {product.stock}</span>
                </div>
                <div className="home__actions">
                  <button
                    className="home__cartBtn"
                    onClick={() => handleAddToCart(product._id)}
                  >
                    <span>Add to Cart</span>

                  </button>

                  <button
                    type="button"
                    className="home__buyBtn"
                    onClick={() => handleBuyNow(product._id)}
                  >
                    Buy Now
                  </button>

                </div>
              </div>
                  </>
                )
              })()}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductCart