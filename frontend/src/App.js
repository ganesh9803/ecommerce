import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Products from './components/Products';
import Cart from './components/Cart';
import NotFound from './components/NotFound';
import Signup from './components/signupform'; 
import Login from './components/loginform'; 
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import ProductItemDetails from './components/ProductItemDetails'

import './App.css';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<ProtectedRoute element={Home} />} />
      <Route path="/products" element={<ProtectedRoute element={Products} />} />
      <Route path="/cart" element={<ProtectedRoute element={Cart} />} />
      <Route path="/products/:id" element={<ProtectedRoute element={ProductItemDetails} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
