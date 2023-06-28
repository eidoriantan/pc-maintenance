
import React from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import $ from 'jquery';

import Header  from '../Header';
import SignOutIcon from '../../assets/svgs/sign-out.svg';
import './style.scss';

class Sidebar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      sidebar: false,
      alerts: []
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.loadNotifications = this.loadNotifications.bind(this);
  }

  toggleSidebar (event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ sidebar: !this.state.sidebar });
  }

  async loadNotifications () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const notificationsRes = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (notificationsRes.data.success) {
      const notifications = notificationsRes.data.notifications.map(notification => {
        const href = `/unit/${notification.unitId}`;
        return {
          title: notification.title,
          details: notification.details,
          href
        }
      });

      this.setState({ alerts: notifications });
    } else {
      window.alert('Unable to load notifications');
    }
  }

  async componentDidMount () {
    $(document).on('click', (event) => {
      if (!event.target.matches('.sidebar') && !event.target.matches('#sidebar-toggle')) {
        this.setState({ sidebar: false });
      }
    });

    await this.loadNotifications();
  }

  render () {
    const sidebarNavClass = ({ isActive }) => 'mb-2' + (isActive ? ' active' : '');
    const token = localStorage.getItem('token');
    if (token === null) return <Navigate to="/login" />;

    return (
      <React.Fragment>
        <Header toggleSidebar={this.toggleSidebar} alerts={this.state.alerts} />

        <div className="d-flex d-md-block">
          <aside className={ 'sidebar' + (this.state.sidebar ? ' active' : '') }>
            <nav>
              {
                this.props.links.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <NavLink to={link.href} className={sidebarNavClass} key={i}>
                      { typeof Icon !== 'undefined' ? <Icon width={16} height={16} fill="currentColor" className="fa mr-2" /> : '' }
                      { link.name }
                    </NavLink>
                  );
                })
              }

              <NavLink to="/signout" className="mb-2">
                <SignOutIcon width={16} height={16} fill="currentColor" className="fa mr-2" />
                <span>Sign Out</span>
              </NavLink>
            </nav>
          </aside>

          <main className="main">
            { this.props.children }
          </main>
        </div>
      </React.Fragment>
    );
  }
}

Sidebar.propTypes = {
  children: PropTypes.node.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    icon: PropTypes.elementType
  }))
};

export default Sidebar;
