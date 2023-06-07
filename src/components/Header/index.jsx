
import React from 'react';
import PropTypes from 'prop-types';

import sealLogo from '../../assets/imgs/seal.png';
import BarsIcon from '../../assets/svgs/bars.svg';
import './style.scss';

class Header extends React.Component {
  render () {
    return (
      <header className="header">
        <div className="header-brand">
          { typeof this.props.toggleSidebar === 'function' &&
            <div id="sidebar-toggle" className="d-none" onClick={(e) => this.props.toggleSidebar(e)}>
              <BarsIcon width={20} height={20} fill="currentColor" className="fa mr-2" />
            </div>
          }

          <img src={sealLogo} alt="TUPV PC Maintenance System" width={48} height={48} className="mr-2" />
          <strong>PC Maintenance System</strong>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  toggleSidebar: PropTypes.func
};

Header.defaultProps = {
  toggleSidebar: null
};

export default Header;
