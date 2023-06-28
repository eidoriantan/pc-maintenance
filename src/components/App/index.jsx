
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from '../Login';
import Dashboard from '../Dashboard';
import Users from '../Users';
import UnitAdd from '../UnitAdd';
import UnitView from '../UnitView';
import UnitEdit from '../UnitEdit';
import Departments from '../Departments';
import SignOut from '../SignOut';
import NotFound from '../NotFound';

class App extends React.Component {
  render () {
    return (
      <Routes>
        <Route path="/">
          <Route index element={<Dashboard />} />

          <Route path="login" element={<Login />} />

          <Route path="users" element={<Users />} />

          <Route path="unit">
            <Route index element={<UnitAdd />} />
            <Route path=":id" element={<UnitView />} />
            <Route path=":id/edit" element={<UnitEdit />} />
          </Route>

          <Route path="departments" element={<Departments />} />

          <Route path="signout" element={<SignOut />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }
}

export default App;
