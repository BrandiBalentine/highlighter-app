import React, { Component } from 'react';
import './App.css';
import { defaultString, defaultHighlights } from './constants';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { text: defaultString, highlightedText: [] };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    let fragments = this.createStringFragments(this.createNewHighlights(this.dataSort(defaultHighlights)));
    this.setState({ highlightedText: fragments});
  }
  

  handleChange(e) {
    this.setState({ text: e.target.value });
    this.setState({
      text: e.target.value
    }, () => {
      let fragments = this.createStringFragments(this.createNewHighlights(this.dataSort(defaultHighlights)));
      this.setState({ highlightedText: fragments});
    })
  }

  dataSort(data) {
    return data.sort(function(a, b){return a.startOffset - b.startOffset});
  }

  newHighlight(startOffset, endOffset, highlight) {
    return {
      startOffset: startOffset,
      endOffset: endOffset,
      color: highlight.color,
      priority: highlight.priority
    }
  }

  createStringFragments(highlights) {
    let results = [];
    let iterator = 0;
    highlights.forEach((highlight, index) => {
      if (iterator < highlight.startOffset) {
        results.push(React.createElement("span", {key: index}, this.state.text.slice(iterator, highlight.startOffset)));
      }
      results.push(React.createElement("span", {style: { "backgroundColor": highlight.color}, key: index + "color"}, this.state.text.slice(highlight.startOffset, highlight.endOffset)));
      iterator = highlight.endOffset;
    });
    results.push(React.createElement("span", {key: iterator}, this.state.text.slice(iterator, this.state.text.length)));
    return results;
  }
  

  createNewHighlights(highlights) {
    for (let i = 0; i < highlights.length; i++) {
  
      if (i === 0) { continue }
      
      let tempHighlights = [];
  
      let current = highlights[i];
      let existing = highlights[i - 1];
  
      if (current.startOffset >= existing.endOffset) { continue }
  
      let currentHasPriority = current.priority < existing.priority;
      let currentStartsSame = current.startOffset === existing.startOffset;
      let currentEndsAfter = current.startOffset > existing.startOffset && current.endOffset > existing.endOffset;
      let currentEndsBefore = current.startOffset > existing.startOffset && current.endOffset < existing.endOffset;
    
      // current starts same
      if (currentStartsSame) {
        if (currentHasPriority) {
          if (current.endOffset > existing.endOffset) {
            tempHighlights.push(current);
          } else {
            tempHighlights.push(this.newHighlight(current.startOffset, existing.startOffset, current));
            tempHighlights.push(this.newHighlight(existing.startOffset, existing.endOffset, existing));
          }
        } else {
          if (current.endOffset > existing.endOffset) {
            tempHighlights.push(this.newHighlight(existing.startOffset, existing.endOffset, existing));
            tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current));
          }
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.createNewHighlights(this.dataSort(highlights));
      }
    
      if (currentEndsAfter) {
        tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing));
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(current.startOffset, existing.endOffset, current));
          tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current));
        } else {
          tempHighlights.push(current);
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.createNewHighlights(this.dataSort(highlights));
      }
      
      if (currentEndsBefore) {
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing));
          tempHighlights.push(current);
          tempHighlights.push(this.newHighlight(current.startOffset, existing.startOffset, existing));
          highlights.splice(i - 1, 2, ...tempHighlights);
          return this.createNewHighlights(this.dataSort(highlights));
        }
      }
    }
    return highlights;
  }

  render() {
    return (
      <div className="App">
        <header>Textio Highlighter
        </header>
        <main>
          <p>{this.state.highlightedText}</p>
          <input 
            onChange={this.handleChange}
            value={this.state.text}
          />
        </main>
      </div>
    );
  }
}

export default App;
