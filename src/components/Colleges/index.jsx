
import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

import Pagination from '../Pagination';
import Sidebar from '../Sidebar';
import { links } from '../DashboardAdmin/navigation';

class Colleges extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      error: '',
      adding: false,
      college: '',
      dean: '',
      abbr: '',
      results: [],
      pagination: {
        key: 0,
        page: 0,
        total: 0
      }
    };

    this.limit = 8;
    this.handleAdd = this.handleAdd.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.changePage = this.changePage.bind(this);
    this.delete = this.delete.bind(this);
    this.loadColleges = this.loadColleges.bind(this);
  }

  async handleAdd (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      error: '',
      adding: true
    });

    const data = {
      college: this.state.college,
      dean: this.state.dean,
      abbr: this.state.abbr
    };

    const response = await axios.post(form.action, data, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      this.setState({
        adding: false
      });
      await this.loadColleges();
    } else {
      this.setState({
        adding: false,
        error: response.data.message
      });
    }
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

  delete (id) {
    return async (event) => {
      event.preventDefault();

      const token = localStorage.getItem('token');
      if (token === null) return;

      const response = await axios.delete(`/api/colleges/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        await this.loadColleges();
      } else {
        window.alert('Unable to delete college');
      }
    }
  }

  async loadColleges () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const collegesRes = await axios.get('/api/colleges', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (collegesRes.data.success) {
      this.setState({
        results: collegesRes.data.colleges,
        pagination: {
          key: this.state.pagination.key + 1,
          page: 0,
          total: Math.ceil(collegesRes.data.colleges.length / this.limit)
        }
      });
    } else {
      window.alert('Unable to load colleges');
    }
  }

  async componentDidMount () {
    await this.loadColleges();
  }

  render () {
    const token = localStorage.getItem('token');
    const payloadStr = localStorage.getItem('payload');
    if (token === null || payloadStr === null) return <Navigate to="/login" />;

    const payload = JSON.parse(payloadStr);
    if (payload.type !== 'admin') return <Navigate to="/" />;

    const results = [];
    const page = this.state.pagination.page;
    const totalPages = this.state.pagination.total;
    const pageKey = this.state.pagination.key;
    const pagination = <Pagination active={page} pages={totalPages} onChange={this.changePage} key={pageKey} />;
    const limit = this.limit;
    const offset = page * limit;

    for (let i = offset; i < this.state.results.length && (i - offset) < limit; i++) {
      const college = this.state.results[i];
      if (typeof college === 'undefined') break;

      results.push(
        <div className="details-container box m-3" key={i}>
          <table className="details-table">
            <tbody>
              <tr>
                <td>College:</td>
                <td>{ college.name }</td>
              </tr>

              <tr>
                <td>Dean:</td>
                <td>{ college.dean }</td>
              </tr>

              <tr>
                <td>Abbreviation:</td>
                <td>{ college.abbr }</td>
              </tr>
            </tbody>
          </table>

          <div className="flex-1"></div>
          <div className="mt-2">
            <button type="button" className="btn" onClick={this.delete(college.id)}>Delete</button>
          </div>
        </div>
      );
    }

    return (
      <Sidebar links={links}>
        <div className="d-flex flex-baseline d-lg-block p-4">
          <form action="/api/colleges" method="post" className="box mb-3 p-4" onSubmit={this.handleAdd}>
            <h4>Add College</h4>
            <div className="form-group mb-2">
              <label htmlFor="add-college">Name:</label>
              <input type="text" id="add-college" name="college" value={this.state.college} autoComplete="off" onChange={this.handleInput} />
            </div>

            <div className="form-group mb-2">
              <label htmlFor="add-abbr">Abbreviation:</label>
              <input type="text" id="add-abbr" name="abbr" value={this.state.abbr} autoComplete="off" onChange={this.handleInput} />
            </div>

            <div className="form-group mb-2">
              <label htmlFor="add-dean">Dean:</label>
              <input type="text" id="add-dean" name="dean" value={this.state.dean} autoComplete="off" onChange={this.handleInput} />
            </div>

            { this.state.error !== '' && <div className="box box-error d-block mb-2">{ this.state.error }</div> }
            
            <div className="form-actions">
              <button type="submit" className="btn" disabled={this.state.adding}>
                { this.state.adding ? 'Adding...' : 'Add New College' }
              </button>
            </div>
          </form>

          <div className="d-flex flex-column flex-1 align-self-start mx-3">
            <div className="mb-2 mx-1">
              <h3>Colleges</h3>
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

export default Colleges;
