
import React from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import $ from 'jquery';

import Sidebar from '../Sidebar';
import { links as userLinks } from '../DashboardUser/navigation';
import { links as adminLinks } from '../DashboardAdmin/navigation';
import selectize from '../../utils/selectize';
import PaperPlaneIcon from '../../assets/svgs/paper-plane.svg';
import XIcon from '../../assets/svgs/x.svg';
import './style.scss';

class UnitEdit extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      submitted: '',
      error: '',
      submitting: false,
      department: '',
      area: '',
      maker: '',
      fixed: '',
      status: '',
      removed: 0,
      added: '',
      addingError: '',
      adding: false,
      operation: '',
      personnel: '',
      incharge: '',
      'date-start': '',
      'date-end': '',
      description: '',
      tools: '',
      remarks: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.editUnit = this.editUnit.bind(this);
    this.submitOperation = this.submitOperation.bind(this);
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const unitId = this.props.params.id;
    const headers = { Authorization: `Bearer ${token}` }
    const deptRes = await axios.get('/api/departments', { headers });
    if (!deptRes.data.success) {
      this.setState({ error: deptRes.data.message });
      return;
    }

    const unitRes = await axios.get(`/api/units/unit/${unitId}`, { headers });
    if (!unitRes.data.success) {
      this.setState({ error: unitRes.data.message });
      return;
    }

    selectize('#unit-edit-department', deptRes.data.departments.map(department => {
      return {
        text: department.name,
        value: department.id,
        disabled: false,
        $order: department.id
      }
    }), this);


    const unit = unitRes.data.unit;
    $('#unit-edit-department').get(0).selectize.setValue(unit.dept_id);

    this.setState({
      department: unit.dept_id.toString(),
      area: unit.area,
      maker: unit.maker,
      fixed: unit.fixed,
      status: unit.status,
      removed: unit.removed
    });
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

  async editUnit (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      error: '',
      submitted: '',
      submitting: true
    });

    const response = await axios.post(form.action, {
      department: this.state.department,
      area: this.state.area,
      maker: this.state.maker,
      fixed: this.state.fixed,
      status: this.state.status
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;
    if (data.success) {
      this.setState({
        submitting: false,
        submitted: 'Unit was editted successfully'
      });
    } else {
      this.setState({
        submitting: false,
        error: data.message
      });
    }
  }

  async submitOperation (event) {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (token === null) return;

    const form = event.target;
    this.setState({
      addingError: '',
      added: '',
      adding: true
    });

    const response = await axios.post(form.action, {
      id: this.props.params.id,
      operation: this.state.operation,
      personnel: this.state.personnel,
      incharge: this.state.incharge,
      'date-start': this.state['date-start'],
      'date-end': this.state['date-end'],
      description: this.state.description,
      tools: this.state.tools,
      remarks: this.state.remarks
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;
    if (data.success) {
      $('#unit-addop-operation').val('');
      this.setState({
        operation: '',
        personnel: '',
        incharge: '',
        'date-start': '',
        'date-end': '',
        description: '',
        tools: '',
        remarks: '',
        adding: false,
        added: 'Operation was added successfully'
      });
    } else {
      this.setState({
        adding: false,
        addingError: data.message
      });
    }
  }

  render () {
    const token = localStorage.getItem('token');
    const payloadStr = localStorage.getItem('payload');
    if (token === null || payloadStr === null) return <Navigate to="/login" />;

    const payload = JSON.parse(payloadStr);
    const unitId = this.props.params.id;
    if (this.state.removed === 1) return <Navigate to={`/unit/${unitId}`} />;

    return (
      <Sidebar links={payload.type === 'admin' ? adminLinks : userLinks}>
        <div className="d-flex d-lg-block p-4">
          <div id="form-units-edit">
            <div className="d-flex flex-space-between mb-2">
              <h3>Edit Unit ID: { unitId }</h3>
              <div>
                <NavLink to={`/unit/${unitId}`} className="btn btn-sm mr-1" role="button">View</NavLink>

                <a href="#" className="btn btn-sm btn-danger" role="button" onClick={window.close}>
                  <XIcon width={12} height={12} fill="currentColor" className="fa mr-1" /> Close
                </a>
              </div>
            </div>

            <form action={`/api/units/unit/${unitId}`} method="put" className="box p-3" onSubmit={this.editUnit}>
              <div className="d-flex d-md-block">
                <div className="unit-details">
                  <div className="form-group mb-2">
                    <label htmlFor="unit-edit-department">Department:</label>
                    <select id="unit-edit-department" name="department" defaultValue="" required data-selectize></select>
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="unit-edit-area">Area:</label>
                    <input type="text" id="unit-edit-area" name="area" value={this.state.area} placeholder="Department Area" autoComplete="off" onChange={this.handleInput} required />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="unit-edit-status">Status:</label>
                    <input type="text" id="unit-edit-status" name="status" value={this.state.status} placeholder="Operational, Non-Operational, Stand-by" autoComplete="off" onChange={this.handleInput} required />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="unit-edit-maker">Maker/Supplier:</label>
                    <input type="text" id="unit-edit-maker" name="maker" value={this.state.maker} placeholder="Maker/Supplier" autoComplete="off" onChange={this.handleInput} required />
                  </div>

                  <div className="form-group form-check mb-3">
                    <label htmlFor="unit-edit-fixed">Fixed Asset:</label>
                    <input type="text" id="unit-edit-fixed" name="fixed" value={this.state.fixed} placeholder="Fixed Asset" autoComplete="off" onChange={this.handleInput} required />
                  </div>
                </div>
              </div>

              { this.state.error !== '' && <div className="box box-error mb-2">{ this.state.error }</div> }

              { this.state.submitted !== '' && <div className="box box-success mb-2">{ this.state.submitted }</div> }

              <div className="form-actions">
                <button type="submit" className="btn" disabled={this.state.submitting}>
                  <PaperPlaneIcon width={17} height={16} fill="currentColor" className="fa mr-2" />
                  { this.state.submitting ? 'Submitting' : 'Submit' }
                </button>
              </div>
            </form>
          </div>

          <form id="form-units-operation" action="/api/operations" method="post" className="box p-3" onSubmit={this.submitOperation}>
            <h3>Add Operation</h3>

            <div className="unit-rating">
              <div className="form-group mb-2">
                <label htmlFor="unit-addop-operation">Operation (Clean, Repair, or Update):</label>
                <select id="unit-addop-operation" name="operation" defaultValue="" required onChange={this.handleInput}>
                  <option value=""></option>
                  <option value="1">Clean</option>
                  <option value="2">Repair</option>
                  <option value="3">Update</option>
                </select>
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-personnel">Maintenance Personnel:</label>
                <input type="text" id="unit-addop-personnel" name="personnel" value={this.state.personnel} onChange={this.handleInput} required />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-incharge">Department/Teacher In-Charge:</label>
                <input type="text" id="unit-addop-incharge" name="incharge" value={this.state.incharge} onChange={this.handleInput} required />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-date-start">Datetime Start:</label>
                <input type="datetime-local" id="unit-addop-date-start" name="date-start" value={this.state['date-start']} required onChange={this.handleInput} />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-date-end">Datetime End:</label>
                <input type="datetime-local" id="unit-addop-date-end" name="date-end" value={this.state['date-end']} required onChange={this.handleInput} />
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-description">Actions Taken:</label>
                <textarea id="unit-addop-description" name="description" rows="3" value={this.state.description} onChange={this.handleInput}></textarea>
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-tools">Tools/Equipment Required:</label>
                <textarea id="unit-addop-tools" name="tools" rows="3" value={this.state.tools} onChange={this.handleInput}></textarea>
              </div>

              <div className="form-group mb-2">
                <label htmlFor="unit-addop-remarks">Remarks:</label>
                <textarea id="unit-addop-remarks" name="remarks" rows="3" value={this.state.remarks} onChange={this.handleInput}></textarea>
              </div>
            </div>

            { this.state.addingError !== '' && <div className="box box-error mb-2">{ this.state.addingError }</div> }

            { this.state.added !== '' && <div className="box box-success mb-2">{ this.state.added }</div> }

            <div className="form-actions">
              <button type="submit" className="btn" disabled={this.state.adding}>
                <PaperPlaneIcon width={17} height={16} fill="currentColor" className="fa mr-2" />
                { this.state.adding ? 'Submitting' : 'Submit' }
              </button>
            </div>
          </form>
        </div>
      </Sidebar>
    );
  }
}

UnitEdit.propTypes = {
  params: PropTypes.exact({
    id: PropTypes.string.isRequired
  })
};

export default function UnitEditWrapper () {
  const params = useParams();
  return <UnitEdit params={params} />;
}
