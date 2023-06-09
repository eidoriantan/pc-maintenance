
import React from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import Sidebar from '../Sidebar';
import { links as userLinks } from '../DashboardUser/navigation';
import { links as adminLinks} from '../DashboardAdmin/navigation';
import Operations from '../Operations';
import XIcon from '../../assets/svgs/x.svg';
import PenIcon from '../../assets/svgs/pen.svg';
import './style.scss';

class UnitView extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      department: '',
      area: '',
      maker: '',
      fixed: '',
      status: '',
      removed: 0,
      operations: []
    };

    this.viewReport = this.viewReport.bind(this);
  }

  viewReport (event) {
    event.preventDefault();

    const unitId = this.props.params.id;
    window.open('/api/monthly?id=' + unitId, '_blank');
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const unitId = this.props.params.id;
    const response = await axios.get(`/api/units/unit/${unitId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data;
    if (data.success) {
      const unit = data.unit;
      this.setState({
        department: unit.dept_name,
        area: unit.area,
        maker: unit.maker,
        fixed: unit.fixed,
        status: unit.status,
        removed: unit.removed
      });
    }
  }

  render () {
    const token = localStorage.getItem('token');
    const payloadStr = localStorage.getItem('payload');
    if (token === null || payloadStr === null) return <Navigate to="/login" />;

    const payload = JSON.parse(payloadStr);
    const unitId = this.props.params.id;

    return (
      <Sidebar links={payload.type === 'admin' ? adminLinks : userLinks}>
        <div id="unit-view" className="m-4">
          <div className="d-flex flex-space-between mb-2">
            <h3>Viewing PC Unit ID: { unitId }</h3>
            <div>
              { this.state.removed === 0 &&
                <NavLink to={`/unit/${unitId}/edit`} className="btn mr-2" role="button">
                  <PenIcon width={16} height={16} fill="currentColor" className="fa mr-1" /> Edit
                </NavLink>
              }

              <a href="#" className="btn btn-danger" role="button" onClick={window.close}>
                <XIcon width={16} height={16} fill="currentColor" className="fa mr-1" /> Close
              </a>
            </div>
          </div>

          <div className="d-flex d-md-block align-items-start">
            <div className="details-container details-view box">
              <table>
                <tbody>
                  <tr>
                    <td>Department:</td>
                    <td>{ this.state.department }</td>
                  </tr>

                  <tr>
                    <td>Area:</td>
                    <td>{ this.state.area }</td>
                  </tr>

                  <tr>
                    <td>Status:</td>
                    <td>{ this.state.status }</td>
                  </tr>

                  <tr>
                    <td>Maker/Supplier</td>
                    <td>{ this.state.maker }</td>
                  </tr>

                  <tr>
                    <td>Fixed Asset:</td>
                    <td>{ this.state.fixed }</td>
                  </tr>
                </tbody>
              </table>

              <button type="button" className="btn btn-primary mb-2" onClick={this.viewReport}>View Monthly Report</button>
            </div>

            <div className="flex-1 mx-4">
              <div className="border-bottom mb-3 p-2">
                <h2>Recent Operations</h2>
                <p>Edit this unit to add new operation</p>
              </div>

              <Operations id={unitId} className="m-2" />
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }
}

UnitView.propTypes = {
  params: PropTypes.exact({
    id: PropTypes.string.isRequired
  })
};

export default function UnitViewWrapper () {
  const params = useParams();
  return <UnitView params={params} />;
}
