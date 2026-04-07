import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Collection.css'
import '../Home/Home.css'
import { clearCollection, getCollectionItems, removeCollectionItem } from '../../utils/collection'

const Collection = () => {
  const navigate = useNavigate()
  const [items, setItems] = React.useState([])
  const [enteringIds, setEnteringIds] = React.useState([])
  const [removingIds, setRemovingIds] = React.useState([])
  const cleanupTimers = React.useRef([])

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const token = localStorage.getItem('token')

    if (!token || !user) {
      navigate('/login')
      return
    }

    setItems(getCollectionItems())
  }, [navigate])

  React.useEffect(() => {
    const handleCollectionChange = (event) => {
      const { action, product } = event.detail || {}

      if (action === 'add' && product?._id) {
        setItems((currentItems) => {
          if (currentItems.some((item) => item?._id === product._id)) {
            return currentItems
          }

          return [product, ...currentItems]
        })

        setEnteringIds((currentIds) => [...currentIds, product._id])
        const enterTimer = window.setTimeout(() => {
          setEnteringIds((currentIds) => currentIds.filter((id) => id !== product._id))
        }, 320)
        cleanupTimers.current.push(enterTimer)
      }

      if (action === 'remove' && product?._id) {
        setRemovingIds((currentIds) => (currentIds.includes(product._id) ? currentIds : [...currentIds, product._id]))

        const removeTimer = window.setTimeout(() => {
          setItems((currentItems) => currentItems.filter((item) => item?._id !== product._id))
          setRemovingIds((currentIds) => currentIds.filter((id) => id !== product._id))
        }, 260)
        cleanupTimers.current.push(removeTimer)
      }

      if (action === 'clear') {
        setItems([])
        setEnteringIds([])
        setRemovingIds([])
      }
    }

    window.addEventListener('collection:change', handleCollectionChange)

    return () => {
      window.removeEventListener('collection:change', handleCollectionChange)
      cleanupTimers.current.forEach((timerId) => window.clearTimeout(timerId))
      cleanupTimers.current = []
    }
  }, [])

  const handleRemove = (productId) => {
    removeCollectionItem(productId)
  }

  const handleClear = () => {
    clearCollection()
    setItems([])
  }

  return (
    <div className="collection">
      <section className="collection__header">
        <div>
          <p className="collection__eyebrow">Saved Items</p>
          <h1 className="collection__title">Your Collection</h1>
          <p className="collection__subtitle">Products you saved with the heart button appear here.</p>
        </div>
        <div className="collection__actions">
          <span className="collection__count">{items.length} items</span>
          <button className="collection__clearBtn" onClick={handleClear} disabled={items.length === 0}>
            Clear all
          </button>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="collection__empty">
          <h2>No saved products yet</h2>
          <p>Tap the heart icon on any card to add it to your collection.</p>
          <Link to="/home" className="collection__browseBtn">Browse products</Link>
        </section>
      ) : (
        <section className="collection__grid">
          {items.map((product) => {
            const price = Number(product.price || 0)
            const discount = Number(product.discount || 0)
            const discountedPrice = discount > 0
              ? Math.floor(price * (1 - discount / 100))
              : price

            return (
              <article
                onClick={() => navigate(`/product/${product._id}`)}
                key={product._id}
                className={`home__productCard home__productCard--bg collection__card${enteringIds.includes(product._id) ? ' collection__card--entering' : ''}${removingIds.includes(product._id) ? ' collection__card--removing' : ''}`}
                style={{ backgroundImage: product.image ? `url("${encodeURI(product.image)}")` : 'none' }}
              >
                {discount > 0 ? <span className="home__discount">{discount}% OFF</span> : null}
                <button
                  type="button"
                  className="home__wishlist home__wishlist--saved"
                  aria-label={`Remove ${product.name} from collection`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(product._id)
                  }}
                >
                  ♥
                </button>

                <div className="home__productBody home__productBody--overlay collection__body">
                  <h3 title={product.name}>
                    <Link to={`/product/${product._id}`} className="home__titleLink" aria-label={`View details for ${product.name}`}>
                      {product.name}
                    </Link>
                  </h3>

                  <p className="home__productDesc">{product.description}</p>

                  <div className="home__rating">
                    <span className="home__ratingValue">{product.rating || 0} ★</span>
                    <span className="home__ratingCount">Saved product</span>
                  </div>

                  <div className="home__pricing">
                    <div className="home__priceRow">
                      <span className="home__price">${discountedPrice.toLocaleString('en-IN')}</span>
                      {discount > 0 ? <span className="home__originalPrice">${price.toLocaleString('en-IN')}</span> : null}
                    </div>
                    <span className="home__save">{product.category}</span>
                  </div>

                  <div className="home__actions collection__links">
                    <Link
                      to={`/product/${product._id}`}
                      className="home__cartBtn collection__linkBtn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View details
                    </Link>
                    <Link
                      to={`/BuyNow/${product._id}`}
                      className="home__buyBtn collection__linkBtn collection__linkBtn--soft"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Buy now
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}

export default Collection