
import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

class Pagination extends React.Component {
  constructor (props) {
    super(props);

    if (props.limit % 2 === 0) throw new Error('`limit` should be an odd number');
    if (props.active >= props.pages) throw new Error('Invalid `active` and/or `pages`');

    this.state = {
      active: props.active,
      pages: props.pages,
      limit: props.limit,
      onChange: props.onChange
    };

    this.change = this.change.bind(this);
  }

  change (event) {
    event.preventDefault();

    let page = event.target.dataset.key;
    if (page === 'prev') page = this.state.active - 1;
    if (page === 'next') page = this.state.active + 1;
    if (page !== 'prev' && page !== 'next') page = parseInt(page);

    if (page < 0 || page >= this.state.pages) page = this.state.active;
    this.setState({ active: page });
    this.state.onChange(page);
  }

  render () {
    const pagination = [];
    pagination.push(
      <a href="#" data-key="prev" key={-1} onClick={this.change}>&laquo;</a>
    );

    const sideLimit = Math.floor(this.state.limit / 2);
    let i = 0;
    let x = 0;
    if (this.state.pages > this.state.limit) {
      if (this.state.active + 1 > this.state.limit - sideLimit) i = this.state.active - sideLimit;
      if (this.state.active + 1 > this.state.pages - sideLimit) i = this.state.pages - this.state.limit;
    }

    for (i; i < this.state.pages && x < this.state.limit; i++) {
      pagination.push(
        <a href="#" className={this.state.active === i ? 'active' : ''} data-key={i} key={i} onClick={this.change}>{i + 1}</a>
      );
      x++;
    }

    pagination.push(
      <a href="#" data-key="next" key={this.state.pages} onClick={this.change}>&raquo;</a>
    );

    const className = `pagination ${this.props.className}`.trim();
    return (
      <nav className={className}>
        { pagination }
      </nav>
    );
  }
}

Pagination.propTypes = {
  limit: PropTypes.number,
  active: PropTypes.number.isRequired,
  pages: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string
};

Pagination.defaultProps = {
  limit: 7,
  onChange: (() => {})
};

export default Pagination;
