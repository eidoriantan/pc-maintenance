
import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import $ from 'jquery';

import sealLogo from '../../assets/imgs/seal.png';
import BarsIcon from '../../assets/svgs/bars.svg';
import BellIcon from '../../assets/svgs/bell.svg';
import BellEmptyIcon from '../../assets/svgs/bell-empty.svg';
import './style.scss';

class Header extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      alerts: false
    };

    this.toggleAlerts = this.toggleAlerts.bind(this);
  }

  toggleAlerts (event) {
    event.stopPropagation();
    this.setState({ alerts: !this.state.alerts });
  }

  componentDidMount () {
    $(document).on('click', (event) => {
      if (!event.target.matches('#alerts') && !event.target.matches('#alerts-toggle')) {
        this.setState({ alerts: false });
      }
    });
  }

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

        { Array.isArray(this.props.alerts) &&
          <div id="alerts-container" onClick={this.toggleAlerts}>
            <div id="alerts-toggle">
              { this.props.alerts.length > 0
                ? <BellIcon width={20} height={20} fill="currentColor" className="fa" />
                : <BellEmptyIcon width={20} height={20} fill="currentColor" className="fa" />
              }
            </div>

            <ul id="alerts" className={this.state.alerts && this.props.alerts.length > 0 ? 'active' : ''}>
              { this.props.alerts.map((alert, i) => {
                return (
                  <li key={i}>
                    <NavLink to={alert.href} target="_blank">
                      <h5>{ alert.title }</h5>
                      <p>{ alert.details }</p>
                    </NavLink>
                  </li>
                );
              })}
              
            </ul>
          </div>
        }
      </header>
    );
  }
}

Header.propTypes = {
  toggleSidebar: PropTypes.func,
  alerts: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    details: PropTypes.string.isRequired,
    href: PropTypes.string
  }))
};

Header.defaultProps = {
  toggleSidebar: null,
  alerts: null
};

export default Header;
