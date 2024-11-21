import React from 'react';
import '../styles/header.css'
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
        <div class="logo">
            <Link to="/">quamatbong</Link>
        </div>  
        <nav>
          <ul>
            <li><Link to="/about">About Me</Link></li>
            <li><Link to="/myphotos">My Photos</Link></li>
            <li><Link to="/myspotify">My Spotify</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
    </header>
  );
}

export default Header;
