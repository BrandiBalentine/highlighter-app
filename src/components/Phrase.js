import React, { Component } from 'react';

class Phrase extends Component {
  constructor(props) {
    super(props);
    this.state = { text: props.text,
                   highlight: props.highlight,
                   highlights: props.highlights
                 };
  }

  handleMouseEnter = (e) => {
    if (!this.state.highlight) { return }
    this.props.highlight.color = this.props.highlight.originalColor;
    this.props.highlight.curved = this.props.highlight.originalCurved;
    this.props.highlight.hover = "hover";
    this.setState({highlight: this.props.highlight});
    if (this.state.highlight.dominatingHighlights.length > 0) {
      this.props.matchColorOfHighlight(this.state.highlight, this.state.highlights);
    }
    if (this.state.highlight.dominatedHighlights.length > 0) {
      this.props.makeHighlightsTransparent(this.state.highlight, this.state.highlights);
    }
  }

  handleMouseLeave = (e) => {
    if (this.props.rerender) {
      this.props.rerender();
    }
  }

  getClassNames = () => {
    let classNames = "";
    if (this.state.highlight) {
      classNames += ` phrase-color phrase-color--${this.state.highlight.color}`;
      classNames += ` phrase--${this.state.highlight.curved}`;
      if (this.state.highlight.hover) {
        classNames += ` ${this.state.highlight.hover}`
      }
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