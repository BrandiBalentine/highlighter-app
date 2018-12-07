import React, { Component } from 'react';

class Phrase extends Component {
  constructor(props) {
    super(props);
    this.state = { text: props.text,
                   color: props.color,
                   curved: props.curved
                 };
  }

  handleMouseEnter = (e) => {
    console.log("I'm entering a phrase");
  }

  handleMouseLeave = (e) => {
    console.log("I'm leaving a phrase");
  }

  getClassNames = () => {
    let classNames = "";
    if (this.props.color) {
      classNames += ` phrase-color phrase-color--${this.props.color}`;
    }
    if (this.props.curved) {
      classNames += ` phrase--${this.props.curved}`;
    }
    return classNames;
  }

  render() {
    return (
      <span className={"phrase" + this.getClassNames()}
            onMouseEnter={this.handleMouseEnter.bind(this)}
            onMouseLeave={this.handleMouseLeave.bind(this)}>
        {this.state.text}
      </span>
    );
  }
}

export default Phrase;