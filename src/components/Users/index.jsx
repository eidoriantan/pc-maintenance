
import React from 'react';
import axios from 'axios';

import Pagination from '../Pagination';
import Sidebar from '../Sidebar';
import { links } from '../DashboardAdmin/navigation';

import MagnifyingGlassIcon from '../../assets/svgs/magnifying-glass.svg';
import PlusIcon from '../../assets/svgs/plus.svg';

class Users extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      search: '',
      username: '',
      password: '',
      searchError: '',
      addError: '',
      searching: false,
      adding: false,
      results: [],
      pagination: {
        key: 0,
        page: 0,
        total: 0
      }
    };

    this.limit = 8;
    this.handleInput = this.handleInput.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.delete = this.delete.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  handleInput (event) {
    const target = event.target;
    const state = this.state;
    state[target.name] = target.value;
    this.setState(state);
  }

  changePage (page) {
    const state = this.state;
    state.pagination.page = page;
    this.setState(state);
  }

  async handleSearch (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      searchError: '',
      searching: true
    });

    const query = new URLSearchParams();
    query.set('username', this.state.search);

    const response = await axios.get(`${form.action}?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;
    if (data.success) {
      this.setState({
        searching: false,
        results: data.results,
        pagination: {
          key: this.state.pagination.key + 1,
          page: 0,
          total: Math.ceil(data.results.length / this.limit)
        }
      });
    } else {
      this.setState({
        searchError: data.message,
        searching: false
      });
    }
  }

  async handleAdd (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      addError: '',
      adding: true
    });

    const data = {
      username: this.state.username,
      password: this.state.password
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        username: '',
        password: '',
        adding: false
      });
    } else {
      this.setState({
        addError: response.data.message,
        adding: false
      });
    }
  }

  delete (id) {
    return async (event) => {
      event.preventDefault();

      const token = localStorage.getItem('token');
      if (token === null) return;

      const response = await axios.delete(`/api/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const results = [];
        for (let i = 0; i < this.state.results.length; i++) {
          const user = this.state.results[i];
          if (user.id !== id) results.push(user);
        }

        this.setState({
          results,
          pagination: {
            key: this.state.pagination.key + 1,
            page: 0,
            total: Math.ceil(results.length / this.limit)
          }
        });
      } else {
        window.alert(response.data.message);
      }
    }
  }

  render () {
    const results = [];
    const page = this.state.pagination.page;
    const totalPages = this.state.pagination.total;
    const pageKey = this.state.pagination.key;
    const pagination = <Pagination active={page} pages={totalPages} onChange={this.changePage} key={pageKey} />;
    const limit = this.limit;
    const offset = page * limit;

    for (let i = offset; i < this.state.results.length && (i - offset) < limit; i++) {
      const user = this.state.results[i];
      if (typeof user === 'undefined') break;

      results.push(
        <div id={`user-${user.id}`} className="details-container box m-3" key={i}>
          <table className="details-table">
            <tbody>
              <tr>
                <td>User:</td>
                <td>{ user.username }</td>
              </tr>

              <tr>
                <td>Added Date:</td>
                <td>{ user.added }</td>
              </tr>
            </tbody>
          </table>

          <div className="flex-1"></div>
          <div className="mt-2">
            <button type="button" className="btn" onClick={this.delete(user.id)}>Delete</button>
          </div>
        </div>
      );
    }

    return (
      <Sidebar links={links}>
        <div className="d-flex flex-baseline d-lg-block p-4">
          <div>
            <form action="/api/accounts" method="get" className="search-form box mb-3 p-4" onSubmit={this.handleSearch}>
              <h4>Search Users</h4>
              <div className="form-group mb-2">
                <label htmlFor="search-username">Username:</label>
                <input type="text" id="search-username" name="search" value={this.state.search} autoComplete="off" onChange={this.handleInput} />
              </div>

              { this.state.searchError !== '' && <div className="box box-error d-block mb-2">{ this.state.searchError }</div> }

              <div className="form-actions">
                <button type="submit" className="btn" disabled={this.state.searching}>
                  <MagnifyingGlassIcon width={17} height={17} fill="currentColor" className="fa mr-2" />
                  { this.state.searching ? 'Searching...' : 'Search' }
                </button>
              </div>
            </form>

            <form action="/api/accounts" method="post" className="search-form box p-4" onSubmit={this.handleAdd}>
              <h4>Add User</h4>
              <div className="form-group mb-2">
                <label htmlFor="add-username">Username:</label>
                <input type="text" id="add-username" name="username" value={this.state.username} autoComplete="off" onChange={this.handleInput} />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="add-password">Password:</label>
                <input type="password" id="add-password" name="password" value={this.state.password} autoComplete="off" onChange={this.handleInput} />
              </div>

              { this.state.addError !== '' && <div className="box box-error d-block mb-2">{ this.state.addError }</div> }

              <div className="form-actions">
                <button type="submit" className="btn" disabled={this.state.adding}>
                  <PlusIcon width={17} height={17} fill="currentColor" className="fa mr-2" />
                  { this.state.adding ? 'Adding...' : 'Add User' }
                </button>
              </div>
            </form>
          </div>

          <div className="d-flex flex-column flex-1 align-self-start mx-3">
            <div className="mb-2 mx-1">
              <h3>Search Results</h3>
              <p>
                { this.state.results.length > 0 ? this.state.results.length + ' result(s)' : '' }
                { this.state.results.length > 0 ? `: Showing page ${page + 1} of ${totalPages}` : '' }
              </p>
            </div>

            <nav className="align-self-center">
              { this.state.results.length > 0 && pagination }
            </nav>

            <div className="d-flex flex-wrap align-items-stretch my-2">
              { results.length > 0 ? results : 'No results.' }
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }
}

export default Users;
