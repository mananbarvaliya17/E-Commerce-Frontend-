import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Preview.css'
import { API_BASE_URL } from '../../config'
import { apiFetch } from '../../utils/api'
import Pagination from '../../Component/Pagination'
import { isInCollection, toggleCollectionItem } from '../../utils/collection'

const ITEMS_PER_PAGE = 12

const Preview = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [, setCollectionVersion] = useState(0)
    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        const token = localStorage.getItem('token')

        if (!token || !user || user.role !== 'admin') {
            navigate('/login')
            return
        }

        const fetchProducts = async () => {
            try {
                const data = await apiFetch(`${API_BASE_URL}/api/shop/read`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include'
                })
                setProducts(data.products || [])
            } catch (err) {
                setError(err.message || 'Failed to fetch products')
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [navigate])

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.max(Math.ceil(filtered.length / ITEMS_PER_PAGE), 1)
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    }, [currentPage, filtered])

    useEffect(() => {
        setCurrentPage(1)
    }, [search])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        const productsSection = document.querySelector('.preview__products')
        productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
        <div className="preview">

            <section className="preview__header">
                <div className="preview__eyebrow">Admin Dashboard</div>
                <h1 className="preview__title">Product Preview</h1>
                <p className="preview__sub">Read-only view of all products as they appear to customers</p>
            </section>

            <section className="preview__searchWrap">
                <div className="preview__search">
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="preview__searchBtn">Search</button>
                </div>
            </section>

            <section className="preview__products">
                <div className="preview__sectionHeader">
                    <h2>All Products <span className="preview__count">{filtered.length}</span></h2>
                </div>

                {filtered.length > 0 ? (
                    <div className="preview__resultsMeta">
                        <span>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                            {' '}
                            -{' '}
                            {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                        </span>
                    </div>
                ) : null}

                {loading ? <p className="preview__msg">Loading products...</p> : null}
                {error ? <p className="preview__msg preview__msg--error">{error}</p> : null}
                {!loading && !error && filtered.length === 0 ? (
                    <p className="preview__msg">No products found.</p>
                ) : null}

                <div className="preview__grid">
                    {paginatedProducts.map((product) => (
                        <article key={product._id} className="preview__card">
                            <div className="preview__media">
                                <img src={product.image} alt={product.name} loading="lazy" />
                                {Number(product.discount || 0) > 0 ? (
                                    <span className="preview__discountBadge">{Number(product.discount)}% OFF</span>
                                ) : null}
                                <span className="preview__adminBadge">
                                    <Link to={`/deleteproduct/${product._id}`} className="preview__deleteBtn">
                                        Delete
                                    </Link>
                                </span>
                                <button
                                    type="button"
                                    className={`preview__wishlist${isInCollection(product._id) ? ' preview__wishlist--saved' : ''}`}
                                    aria-label={isInCollection(product._id) ? 'Remove product from collection' : 'Save product to collection'}
                                    aria-pressed={isInCollection(product._id)}
                                    onClick={() => handleToggleCollection(product)}
                                >
                                    {isInCollection(product._id) ? '♥' : '♡'}
                                </button>
                            </div>

                            <div className="preview__body">
                                <h3 title={product.name}>{product.name}</h3>
                                <p className="preview__desc">{product.description}</p>

                                <div className="preview__meta">
                                    <span className="preview__category">{product.category}</span>
                                    <span className="preview__rating">{product.rating} ★</span>
                                </div>

                                <div className="preview__pricing">
                                    <span className="preview__price">${Number(product.price).toLocaleString()}</span>
                                    <span className="preview__stock">Stock: {product.stock}</span>
                                </div>

                                <div className="preview__actions">
                                    <Link to={`/updateproduct/${product._id}`} className="preview__editBtn">
                                        Edit Product
                                    </Link>
                                    <Link to={`/product/${product._id}`} className="preview__viewBtn">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </section>
        </div>
    )
}

export default Preview