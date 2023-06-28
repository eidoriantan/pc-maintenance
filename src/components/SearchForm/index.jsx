
import React from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import $ from 'jquery';

import Pagination from '../Pagination';
import selectize from '../../utils/selectize';

import MagnifyingGlassIcon from '../../assets/svgs/magnifying-glass.svg';
import PenIcon from '../../assets/svgs/pen.svg';
import TrashIcon from '../../assets/svgs/trash.svg';
import './style.scss';

class SearchForm extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      error: '',
      searching: false,
      department: '',
      area: '',
      status: '',
      removed: '',
      results: [],
      pagination: {
        key: 0,
        page: 0,
        total: 0
      }
    };

    this.limit = 8;
    this.handleSearch = this.handleSearch.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.changePage = this.changePage.bind(this);
    this.deleteUnit = this.deleteUnit.bind(this);
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const headers = { Authorization: `Bearer ${token}` };
    const deptRes = await axios.get('/api/departments', { headers });
    const filtersRes = await axios.get('/api/units/filters', { headers });

    if (!deptRes.data.success) {
      this.setState({ error: deptRes.data.message });
      return;
    }

    if (!filtersRes.data.success) {
      this.setState({ error: filtersRes.data.message });
      return;
    }

    const filtersData = filtersRes.data;
    const statuses = filtersData.statuses.map((status, i) => {
      return {
        text: status,
        value: status,
        disabled: false,
        $order: i
      }
    });

    selectize('#search-department', deptRes.data.departments.map(department => {
      return {
        text: department.name,
        value: department.id,
        disabled: false,
        $order: department.id
      }
    }), this);

    selectize('#search-status', statuses, this);

    selectize('#search-removed', [
      {
        text: 'Existing Units',
        value: '0',
        disabled: false,
        $order: 1
      },
      {
        text: 'Removed Units',
        value: '1',
        disabled: false,
        $order: 2
      }
    ], this);
  }

  async handleSearch (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      error: '',
      searching: true
    });

    const query = new URLSearchParams();
    query.set('department', this.state.department);
    query.set('area', this.state.area);
    query.set('status', this.state.status);
    query.set('removed', this.state.removed);

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
        searching: false,
        error: data.message
      });
    }
  }

  handleInput (event) {
    const target = event.target;
    const state = this.state;
    state[target.name] = target.value;
    this.setState(state);
  }

  resetForm (event) {
    event.preventDefault();

    $('[data-selectize]').each((i, elem) => {
      $(elem).get(0).selectize.clear();
    });

    this.setState({
      department: '',
      area: '',
      status: '',
      removed: ''
    });
  }

  changePage (page) {
    const state = this.state;
    state.pagination.page = page;
    this.setState(state);
  }

  deleteUnit (id) {
    return async (event) => {
      event.preventDefault();

      const token = localStorage.getItem('token');
      if (token === null) return;

      const response = await axios.delete(`/api/units/unit/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      if (data.success) {
        const results = [];
        for (let i = 0; i < this.state.results.length; i++) {
          const result = this.state.results[i];
          if (result.id === id) result.removed = 1;
          results.push(result);
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
        this.setState({
          error: data.message
        });
      }
    }
  }

  render () {
    const token = localStorage.getItem('token');
    if (token === null) return <Navigate to="/login" />;

    const results = [];
    const page = this.state.pagination.page;
    const totalPages = this.state.pagination.total;
    const pageKey = this.state.pagination.key;
    const pagination = <Pagination active={page} pages={totalPages} onChange={this.changePage} key={pageKey} />;
    const limit = this.limit;
    const offset = page * limit;

    for (let i = offset; i < this.state.results.length && (i - offset) < limit; i++) {
      const unit = this.state.results[i];
      if (typeof unit === 'undefined') break;

      results.push(
        <div className="details-container box m-3" key={i}>
          <table className="details-table">
            <tbody>
              <tr>
                <td>ID:</td>
                <td>{ unit.id }</td>
              </tr>

              <tr>
                <td>Department:</td>
                <td>{ unit.dept_name }</td>
              </tr>

              <tr>
                <td>Area:</td>
                <td>{ unit.area }</td>
              </tr>

              <tr>
                <td>Condition:</td>
                <td>{ unit.status }</td>
              </tr>
            </tbody>
          </table>

          <div className="flex-1"></div>
          <div className="mt-2">
            <NavLink to={`/unit/${unit.id}`} target="_blank" className="btn mr-2" role="button">View</NavLink>
            { unit.removed
              ? 'Removed'
              : (
                  <React.Fragment>
                    <NavLink to={`/unit/${unit.id}/edit`} target="_blank" className="btn mr-2 btn-light" role="button">
                      <PenIcon width={16} height={16} fill="currentColor" className="fa mr-1" /> Edit
                    </NavLink>
                    { this.props.admin &&
                    <button type="button" className="btn btn-danger mr-2" onClick={this.deleteUnit(unit.id)}>
                      <TrashIcon width={16} height={16} fill="currentColor" className="fa mr-1" /> Delete
                    </button>
                    }
                  </React.Fragment>
                )
            }
          </div>
        </div>
      );
    }

    return (
      <div className="d-flex flex-baseline d-lg-block p-4">
        <form action="/api/search" method="get" className="search-form box p-4" onSubmit={this.handleSearch}>
          <h4>Filter PC Units</h4>
          <div className="form-group mb-2">
            <label htmlFor="search-department">Department:</label>
            <select id="search-department" name="department" defaultValue="" data-selectize></select>
          </div>

          <div className="form-group mb-2">
            <label htmlFor="search-area">Area:</label>
            <input type="text" id="search-area" name="area" value={this.state.area} autoComplete="off" onChange={this.handleInput} />
          </div>

          <div className="form-group mb-2">
            <label htmlFor="search-status">Condition:</label>
            <select id="search-status" name="status" defaultValue="" data-selectize></select>
          </div>

          <div className="form-group mb-2">
            <label htmlFor="search-removed">Status:</label>
            <select id="search-removed" name="removed" defaultValue="" data-selectize></select>
          </div>

          { this.state.error !== '' && <div className="box box-error d-block mb-2">{ this.state.error }</div> }

          <div className="form-actions">
            <button type="submit" className="btn" disabled={this.state.searching}>
              <MagnifyingGlassIcon width={17} height={17} fill="currentColor" className="fa mr-2" />
              { this.state.searching ? 'Searching...' : 'Search' }
            </button>

            <button type="reset" className="btn btn-light" onClick={this.resetForm}>Reset</button>
          </div>
        </form>

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
    );
  }
}

SearchForm.propTypes = {
  admin: PropTypes.bool
};

SearchForm.defaultProps = {
  admin: false
};

export default SearchForm;
