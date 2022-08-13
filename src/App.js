import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PageHome from './pages/home/home';
import PageEditor from './pages/editor/editor';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element = { <PageHome /> } />
        <Route path = '/code/:id' element = { <PageEditor /> } />
        <Route path = '/*' render = { () => <Navigate to = '/' replace /> } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
