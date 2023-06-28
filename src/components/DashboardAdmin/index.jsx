
import React from 'react';

import SearchForm from '../SearchForm';
import Sidebar from '../Sidebar';
import { links } from './navigation';

class DashboardAdmin extends React.Component {
  render () {
    return (
      <Sidebar links={links}>
        <SearchForm admin={true} />
      </Sidebar>
    );
  }
}

export default DashboardAdmin;
