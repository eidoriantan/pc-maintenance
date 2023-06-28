
import React from 'react';

import SearchForm from '../SearchForm';
import Sidebar from '../Sidebar';
import { links } from './navigation';

class DashboardUser extends React.Component {
  render () {
    return (
      <Sidebar links={links}>
        <SearchForm />
      </Sidebar>
    );
  }
}

export default DashboardUser;
