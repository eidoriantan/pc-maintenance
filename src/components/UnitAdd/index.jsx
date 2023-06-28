
import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';

import Sidebar from '../Sidebar';
import { links } from '../DashboardUser/navigation';
import selectize from '../../utils/selectize';
import PaperPlaneIcon from '../../assets/svgs/paper-plane.svg';
import './style.scss';

class UnitAdd extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      added: '',
      error: '',
      submitting: false,
      department: '',
      area: '',
      status: '',
      quantity: 0,
      maker: '',
      fixed: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.submitUnit = this.submitUnit.bind(this);
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const deptRes = await axios.get('/api/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!deptRes.data.success) {
      this.setState({ error: deptRes.data.message });
      return;
    }

    selectize('#unit-add-department', deptRes.data.departments.map(department => {
      return {
        text: department.name,
        value: department.id,
        disabled: false,
        $order: department.id
      }
    }), this);

    selectize('#unit-add-status', [
      {
        text: 'Operational',
        value: 'Operational',
        disabled: false,
        $order: 1
      },
      {
        text: 'Non-Operational',
        value: 'Non-operational',
        disabled: false,
        $order: 2
      }
    ], this);
  }

  handleInput (event) {
    const state = this.state;
    const target = event.target;
    if (target.type === 'checkbox') {
      state[target.name] = target.checked;
    } else {
      state[target.name] = target.value;
    }

    this.setState({ state });
  }

  async submitUnit (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      error: '',
      added: '',
      submitting: true
    });

    const response = await axios.post(form.action, {
      department: this.state.department,
      area: this.state.area,
      status: this.state.status,
      quantity: this.state.quantity,
      maker: this.state.maker,
      fixed: this.state.fixed
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;
    if (data.success) {
      $('[data-selectize]').each((i, elem) => {
        $(elem).get(0).selectize.clear();
      });

      this.setState({
        submitting: false,
        added: 'Unit was successfully added',
        department: '',
        area: '',
        status: '',
        quantity: 0,
        maker: '',
        fixed: ''
      });
    } else {
      this.setState({
        submitting: false,
        error: data.message
      });
    }
  }

  render () {
    const token = localStorage.getItem('token');
    if (token === null) return <Navigate to="/login" />;

    return (
      <Sidebar links={links}>
        <form id="form-units-add" action="/api/units" method="post" className="box mt-4 mx-auto p-3" onSubmit={this.submitUnit}>
          <h3>Add PC Unit</h3>

          <div className="d-flex d-md-block">
            <div className="unit-details">
              <div className="form-group mb-2">
                <label htmlFor="unit-add-department">Department:</label>
                <select id="unit-add-department" name="department" defaultValue="" required data-selectize></select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="unit-add-area">Area:</label>
                <input type="text" id="unit-add-area" name="area" value={this.state.area} placeholder="Department Area" autoComplete="off" onChange={this.handleInput} required />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="unit-add-status">Status:</label>
                <select id="unit-add-status" name="status" defaultValue="" required data-selectize></select>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="unit-add-quantity">Quantity:</label>
                <input type="number" id="unit-add-quantity" name="quantity" value={this.state.quantity} placeholder="1" autoComplete="off" onChange={this.handleInput} required />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-add-maker">Maker/Supplier:</label>
                <input type="text" id="unit-add-maker" name="maker" value={this.state.maker} placeholder="Maker/Supplier" autoComplete="off" onChange={this.handleInput} required />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-add-fixed">Fixed Asset:</label>
                <input type="text" id="unit-add-fixed" name="fixed" value={this.state.fixed} placeholder="Fixed Asset" autoComplete="off" onChange={this.handleInput} required />
              </div>
            </div>
          </div>

          { this.state.error !== '' && <div className="box box-error mb-2">{ this.state.error }</div> }

          { this.state.added !== '' && <div className="box box-success mb-2">{ this.state.added }</div> }

          <div className="form-actions">
            <button type="submit" className="btn" disabled={this.state.submitting}>
              <PaperPlaneIcon width={17} height={16} fill="currentColor" className="fa mr-2" />
              { this.state.submitting ? 'Submitting' : 'Submit' }
            </button>
          </div>
        </form>
      </Sidebar>
    );
  }
}

export default UnitAdd;
