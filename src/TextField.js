import React from 'react';
import { string } from './constants';

class TextField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: string};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    return (
      <input type="text" value={this.state.value} onChange={this.handleChange} />
    );
  }
}

export default TextField;
