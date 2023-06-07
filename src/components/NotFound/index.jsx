
import React from 'react';
import { NavLink } from 'react-router-dom';

import Header from '../Header';
import HouseIcon from '../../assets/svgs/house.svg';
import './style.scss';

class NotFound extends React.Component {
  render () {
    return (
      <React.Fragment>
        <Header />

        <main>
          <div className="notfound box">
            <h2>Page Not Found</h2>
            <p className="mb-3">The page you&apos;re trying to access is not found on the server.</p>

            <NavLink to="/">
              <button type="button" className="btn">
                <HouseIcon width={16} height={16} fill="currentColor" className="fa mr-2" /> Home
              </button>
            </NavLink>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default NotFound;
