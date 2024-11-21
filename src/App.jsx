import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import MyPhotos from './pages/MyPhotos';
import MySpotify from './pages/MySpotify';
import About from './pages/About';
import Contact from './pages/Contact';
import OurCompatibility from './pages/OurCompatibility';

const App = () => {
  const appStyles = {
    minHeight: '100vh', // Ensure the div takes up at least the full height of the viewport
  };

  return (
    <div style={appStyles}>
      <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myphotos" element={<MyPhotos />} />
          <Route path="/myspotify" element={<MySpotify />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compatibility" element={<OurCompatibility />} />
        </Routes>
      <Footer />
    </div>
  );
};

export default App;
