import React, { useCallback, useEffect, useState } from 'react'
import './Home.css'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'
import { apiFetch } from '../../utils/api'
import Pagination from '../../Component/Pagination'
import { isInCollection, toggleCollectionItem } from '../../utils/collection'
import { getStoredUser } from '../../utils/auth'

const ITEMS_PER_PAGE = 12

const Home = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalProducts, setTotalProducts] = useState(0)
    const [categories, setCategories] = useState([])
    const [, setCollectionVersion] = useState(0)
    const navigate = useNavigate()

    const fetchProducts = useCallback(async () => {
        const user = getStoredUser()
        if (!user) {
            navigate('/login')
            return
        }
        setLoading(true)
        setError('')
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: String(ITEMS_PER_PAGE)
            })

            if (searchQuery.trim()) {
                params.set('search', searchQuery.trim())
            }

            if (activeCategory) {
                params.set('category', activeCategory)
            }

            const data = await apiFetch(`${API_BASE_URL}/api/shop/shop?${params.toString()}`, {
                credentials: 'include',
            })
            setProducts(data.products || [])
            setTotalPages(data.totalPages || 0)
            setTotalProducts(data.totalProducts || 0)
            setCurrentPage(data.currentPage || 1)
            setCategories(data.categories || [])
        } catch (err) {
            setError(err.message || 'Failed to fetch products')
            setProducts([])
            setTotalPages(0)
            setTotalProducts(0)
            setCategories([])
        } finally {
            setLoading(false)
        }
    }, [activeCategory, currentPage, navigate, searchQuery])

    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    const handleSearchSubmit = () => {
        setCurrentPage(1)
        setSearchQuery(searchInput.trim())
    }

    const handleAddToCart = async (productId) => {
        const user = getStoredUser()
        if (!user) {
            navigate('/login')
            return
        }
        try {
            await apiFetch(`${API_BASE_URL}/api/shop/shop/${productId}/product`, {
                method: 'POST',
                credentials: 'include',
            })
            alert('Product added to cart')
            navigate('/cart')
        } catch (err) {
            alert(err.message || 'Failed to add product to cart')
        }
    }

    const handleBuyNow = (productId) => {
        navigate(`/BuyNow/${productId}`)
    }

    const handleToggleCollection = (product) => {
        const user = getStoredUser()
        if (!user) {
            navigate('/login')
            return
        }

        toggleCollectionItem(product)
        setCollectionVersion((version) => version + 1)
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        const productSection = document.querySelector('.home__products')
        productSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="home">

            {/* ── HERO ── */}
            <section className="home__hero">
                <div className="home__heroContent">


                    <div className="home__search">
                        <input
                            type="text"
                            placeholder="Search products, brands and more…"
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleSearchSubmit()
                                }
                            }}
                        />
                        <button className="home__searchBtn" onClick={handleSearchSubmit}>Search</button>
                    </div>


                </div>

                {/* stats card */}

            </section>

            {/* ── CATEGORIES ── */}
            <section className="home__categories">
                <div className="home__sectionHeader">
                    <h2>Shop by category</h2>
                    <button
                        className="home__ghostBtn"
                        onClick={() => {
                            setActiveCategory(null)
                            setCurrentPage(1)
                        }}
                    >
                        {activeCategory ? 'Clear filter' : 'Browse all'}
                    </button>
                </div>
                <div className="home__categoryRow">
                    {categories.length > 0 ? (
                        categories.map((label) => (
                            <button
                                key={label}
                                className={`home__categoryBtn${activeCategory === label ? ' home__categoryBtn--active' : ''}`}
                                onClick={() => {
                                    setActiveCategory((prev) => (prev === label ? null : label))
                                    setCurrentPage(1)
                                }}
                            >
                                {label}
                            </button>
                        ))
                    ) : (
                        <span className="home__categoryEmpty">No categories available</span>
                    )}
                </div>
            </section>

            {/* ── PRODUCTS ── */}
            <section className="home__products">
                <div className="home__sectionHeader">
                    <h2>
                        {activeCategory ? activeCategory : 'Featured products'}
                        {!loading && totalProducts > 0 && (
                            <span className="home__productCount">
                                {totalProducts}
                            </span>
                        )}
                    </h2>
                    <button className="home__ghostBtn" onClick={fetchProducts}>
                        Refresh
                    </button>
                </div>

                {/* loading skeleton */}
                {loading && (
                    <div className="home__productGrid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="home__skeleton" />
                        ))}
                    </div>
                )}

                {/* error */}
                {!loading && error && (
                    <div className="home__errorState" role="alert">
                        <strong>Unable to load products</strong>
                        <p>{error}</p>
                        <button className="home__errorBtn" onClick={fetchProducts}>
                            Try again
                        </button>
                    </div>
                )}

                {/* empty */}
                {!loading && !error && products.length === 0 && (
                    <div className="home__emptyState">
                        <span className="home__emptyIcon">🔍</span>
                        <p>No products found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
                        <button
                            className="home__ghostBtn"
                            onClick={() => {
                                setSearchInput('')
                                setSearchQuery('')
                                setActiveCategory(null)
                                setCurrentPage(1)
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* grid */}
                {!loading && !error && products.length > 0 && (
                    <>
                        <div className="home__resultsMeta">
                            <span>
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                {' '}
                                -{' '}
                                {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts}
                            </span>
                        </div>
                        <div className="home__productGrid">
                        {products.map((product, index) => {
                            const originalPrice = Number(product.price || 0)
                            const discountPercent = Number(product.discount || 0)
                            const hasDiscount = discountPercent > 0
                            const discountedPrice = hasDiscount
                                ? Math.floor(originalPrice * (1 - discountPercent / 100))
                                : originalPrice
                            const saved = isInCollection(product._id)

                            return (
                                <article
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    key={product._id || index}
                                    className="home__productCard home__productCard--bg"
                                    style={{
                                        backgroundImage: product.image
                                            ? `url("${encodeURI(product.image)}")`
                                            : 'none',
                                    }}
                                >
                                    
                                        {hasDiscount && (
                                            <span className="home__discount">{discountPercent}% OFF</span>
                                        )}
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

                                                {product.name}
                                            </h3>

                                            {product.description && (
                                                <p className="home__productDesc">{product.description}</p>
                                            )}

                                            <div className="home__rating">
                                                <span className="home__ratingValue">
                                                    {product.rating || 0} ★
                                                </span>
                                                <span className="home__ratingCount">Verified product</span>
                                            </div>

                                            <div className="home__pricing">
                                                <div className="home__priceRow">
                                                    <span className="home__price">
                                                        ${discountedPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    {hasDiscount && (
                                                        <span className="home__originalPrice">
                                                            ${originalPrice.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                    {hasDiscount && (
                                                        <span className="home__save">
                                                            Save ${(originalPrice - discountedPrice).toLocaleString('en-IN')}
                                                            {/* ₹ */}
                                                        </span>
                                                    )}
                                                </div>
                                                    {/* <span className="home__stock">
                                                        {product.stock > 0
                                                            ? `${product.stock} in stock`
                                                            : 'Out of stock'}
                                                    </span> */}
                                            </div>

                                            <div className="home__actions">
                                                <button
                                                    className="home__cartBtn"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAddToCart(product._id)
                                                    }}
                                                    disabled={product.stock === 0}
                                                >
                                                    Add to cart
                                                </button>
                                                <button
                                                    type="button"
                                                    className="home__buyBtn"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleBuyNow(product._id)
                                                    }}
                                                >
                                                    Buy now
                                                </button>
                                            </div>
                                        </div>
                                </article>
                            )
                        })}
                    </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            </section>
        </div>
    )
}

export default Home 