import React, { Suspense, lazy } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Navbar from './Component/Navbar'
import Footer from './Component/Footer'
import ProtectedRoute from './Component/ProtectedRoute'

const Register = lazy(() => import('./page/Register/Register'))
const Login = lazy(() => import('./page/Login/Login'))
const Home = lazy(() => import('./page/Home/Home'))
const Profile = lazy(() => import('./page/Profile/Profile'))
const Cart = lazy(() => import('./page/Cart/Cart'))
const TotalUser = lazy(() => import('./page/TotalUser/TotalUser'))
const AboutUs = lazy(() => import('./page/AboutUs/AboutUs'))
const CreateProduct = lazy(() => import('./page/CreateProduct/CreateProduct'))
const ProductDetails = lazy(() => import('./Component/ProductDetails'))
const UpdateProduct = lazy(() => import('./Component/UpdateProduct'))
const BuyNow = lazy(() => import('./Component/BuyNow'))
const Preview = lazy(() => import('./page/Preview/Preview'))
const DeleteProduct = lazy(() => import('./Component/DeleteProduct'))
const Collection = lazy(() => import('./page/Collection/Collection'))
const ProductOrder = lazy(() => import('./page/Order/ProductOrder'))
const ProductOrderCount = lazy(() => import('./Component/ProductOrderCount'))
const Unauthorized = lazy(() => import('./page/Unauthorized/Unauthorized'))
const NotFound = lazy(() => import('./page/NotFound/NotFound'))

const LoadingScreen = () => <div className="app__loading">Loading...</div>

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path='/' element={<Register />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/unauthorized' element={<Unauthorized />} />
            <Route path='/aboutus' element={<AboutUs />} />

            <Route path='/home' element={<ProtectedRoute allowedRoles={['user', 'admin']}><Home /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute allowedRoles={['user', 'admin']}><Profile /></ProtectedRoute>} />
            <Route path='/cart' element={<ProtectedRoute allowedRoles={['user', 'admin']}><Cart /></ProtectedRoute>} />
            <Route path='/collection' element={<ProtectedRoute allowedRoles={['user', 'admin']}><Collection /></ProtectedRoute>} />
            <Route path='/product/:id' element={<ProtectedRoute allowedRoles={['user', 'admin']}><ProductDetails /></ProtectedRoute>} />
            <Route path='/BuyNow/:id' element={<ProtectedRoute allowedRoles={['user', 'admin']}><BuyNow /></ProtectedRoute>} />

            <Route path='/preview' element={<ProtectedRoute allowedRoles={['admin']}><Preview /></ProtectedRoute>} />
            <Route path='/createproduct' element={<ProtectedRoute allowedRoles={['admin']}><CreateProduct /></ProtectedRoute>} />
            <Route path='/user' element={<ProtectedRoute allowedRoles={['admin']}><TotalUser /></ProtectedRoute>} />
            <Route path='/updateproduct/:id' element={<ProtectedRoute allowedRoles={['admin']}><UpdateProduct /></ProtectedRoute>} />
            <Route path='/deleteproduct/:id' element={<ProtectedRoute allowedRoles={['admin']}><DeleteProduct /></ProtectedRoute>} />
            <Route path='/productorder' element={<ProtectedRoute allowedRoles={['admin']}><ProductOrder /></ProtectedRoute>} />
            <Route path='/productordercount/:userId' element={<ProtectedRoute allowedRoles={['admin']}><ProductOrderCount /></ProtectedRoute>} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App;