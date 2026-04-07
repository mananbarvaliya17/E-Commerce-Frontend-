const COLLECTION_PREFIX = 'collection'

const notifyCollectionChange = (action, product) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent('collection:change', {
    detail: { action, product }
  }))
}

const getUserCollectionKey = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const userId = user?._id || user?.id || user?.email || 'guest'
  return `${COLLECTION_PREFIX}:${userId}`
}

export const getCollectionItems = () => {
  try {
    return JSON.parse(localStorage.getItem(getUserCollectionKey()) || '[]')
  } catch {
    return []
  }
}

export const saveCollectionItems = (items) => {
  localStorage.setItem(getUserCollectionKey(), JSON.stringify(items))
}

export const isInCollection = (productId) => {
  return getCollectionItems().some((item) => item?._id === productId)
}

export const toggleCollectionItem = (product) => {
  const currentItems = getCollectionItems()
  const exists = currentItems.some((item) => item?._id === product?._id)

  const nextItems = exists
    ? currentItems.filter((item) => item?._id !== product?._id)
    : [product, ...currentItems]

  saveCollectionItems(nextItems)
  notifyCollectionChange(exists ? 'remove' : 'add', product)
  return nextItems
}

export const removeCollectionItem = (productId) => {
  const currentItems = getCollectionItems()
  const removedItem = currentItems.find((item) => item?._id === productId)
  const nextItems = currentItems.filter((item) => item?._id !== productId)
  saveCollectionItems(nextItems)
  if (removedItem) {
    notifyCollectionChange('remove', removedItem)
  }
  return nextItems
}

export const clearCollection = () => {
  saveCollectionItems([])
  notifyCollectionChange('clear', null)
}