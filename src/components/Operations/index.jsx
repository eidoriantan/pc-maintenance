
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import './style.scss';

class Operations extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      id: props.id,
      operations: []
    };
  }

  async componentDidMount () {
    const token = localStorage.getItem('token');
    if (token === null) return;

    const unitId = this.state.id;
    const url = this.state.id !== 0 ? `/api/units/unit/${unitId}/operations` : '/api/operations';
    const operationsRes = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = operationsRes.data;
    if (data.success) {
      this.setState({
        operations: data.operations
      });
    }
  }

  render () {
    const token = localStorage.getItem('token');
    if (token === null) return <Navigate to="/login" />;

    const operations = [];
    for (let i = 0; i < this.state.operations.length; i++) {
      const operation = this.state.operations[i];
      const dateStarted = new Date(operation.date_start);
      const dateEnded = new Date(operation.date_end);

      let type = '';
      switch (operation.operation) {
        case 0:
          type = 'Encoded';
          break;

        case 1:
          type = 'Cleaned';
          break;

        case 2:
          type = 'Repaired';
          break;

        case 3:
          type = 'Updated';
          break;

        case 4:
          type = 'Removed';
          break;
      }

      operations.push(
        <div className="box mb-3" key={i}>
          <h4 className="f-bold">{ type }</h4>
          <div className="op-date">Date { operation.operation !== 0 ? 'Started' : 'Encoded' }: { dateStarted.toLocaleString() }</div>
          { operation.operation !== 0 && operation.operation !== 4 && <div className="op-date">Date Ended: { dateEnded.toLocaleString() }</div> }

          { operation.operation !== 4 &&
            <div className="mt-2">
              <h5 className="f-bold">Description:</h5>
              <p>{ operation.description }</p>
            </div>
          }
        </div>
      );
    }

    return (
      <div className={this.props.className}>
        { operations }
      </div>
    );
  }
}

Operations.propTypes = {
  id: PropTypes.number,
  className: PropTypes.string
};

Operations.defaultProps = {
  id: 0,
  className: ''
};

export default Operations;
