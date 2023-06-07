
import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import $ from 'jquery';

import Header  from '../Header';
import SignOutIcon from '../../assets/svgs/sign-out.svg';
import './style.scss';

class Sidebar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      sidebar: false
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  toggleSidebar (event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ sidebar: !this.state.sidebar });
  }

  componentDidMount () {
    $(document).on('click', (event) => {
      if (!event.target.matches('.sidebar') && !event.target.matches('#sidebar-toggle')) {
        this.setState({ sidebar: false });
      }
    });
  }

  render () {
    const sidebarNavClass = ({ isActive }) => 'mb-2' + (isActive ? ' active' : '');
    const token = localStorage.getItem('token');
    const isLogged = token !== null;

    return (
      <React.Fragment>
        <Header toggleSidebar={this.toggleSidebar} />

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

              { isLogged &&
                <NavLink to="/signout" className="mb-2">
                  <SignOutIcon width={16} height={16} fill="currentColor" className="fa mr-2" />
                  Sign Out
                </NavLink>
              }
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
