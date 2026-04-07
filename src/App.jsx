import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from './page/Register/Register'
import Login from './page/Login/Login'
import Home from './page/Home/Home'
import Profile from './page/Profile/Profile'
import Cart from './page/Cart/Cart'
import TotalUser from './page/TotalUser/TotalUser'
import Logout from './Component/Logout'
import Navbar from './Component/Navbar'
import Footer from './Component/Footer'
import AboutUs from './page/AboutUs/AboutUs'
import CreateProduct from './page/CreateProduct/CreateProduct'
import ProductDetails from './Component/ProductDetails'
import UpdateProduct from './Component/UpdateProduct'
import BuyNow from './Component/BuyNow'
import Preview from './page/Preview/Preview'
import DeleteProduct from './Component/DeleteProduct'
import Collection from './page/Collection/Collection'
import ProductOrder from './page/Order/ProductOrder'
import ProductOrderCount from './Component/ProductOrderCount'

const App = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Routes>
          <Route path='/' element={<Register />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/home' element={<Home />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/user' element={<TotalUser />} />
          <Route path='/aboutus' element={<AboutUs />} />
          <Route path='/createproduct' element={<CreateProduct />} />
          <Route path='/product/:id' element={<ProductDetails />} />
          <Route path='/updateproduct/:id' element={<UpdateProduct />} />
          <Route path='/deleteproduct/:id' element={<DeleteProduct />} />
          <Route path='/BuyNow/:id' element={<BuyNow />} />
          <Route path='/preview' element={<Preview />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/productorder' element={<ProductOrder />} />
          <Route path='/productordercount/:userId' element={<ProductOrderCount />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App;