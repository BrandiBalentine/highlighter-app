import React, { Component } from 'react';
import './App.scss';
import { defaultString, defaultHighlights } from './constants';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { text: defaultString,
                   highlightedText: [],
                   highlights: this.extractHighlights(defaultHighlights),
                   newHighlight: '' };
    this.handleChange = this.handleChange.bind(this);
    this.setNewHighlight = this.setNewHighlight.bind(this);
    this.addHighlight = this.addHighlight.bind(this);
    this.resetHighlights = this.resetHighlights.bind(this);
    this.defaultHighlights = defaultHighlights;
  }

  componentDidMount() {
    let fragments = this.stringFragmentsFromHighlights(defaultHighlights);
    this.setState({ highlightedText: fragments});
  }
  
  handleChange(e) {
    this.setState({ text: e.target.value });
    this.setState({
      text: e.target.value
    }, () => {
      let fragments = this.stringFragmentsFromHighlights(defaultHighlights);
      this.setState({ highlightedText: fragments});
    })
  }

  setNewHighlight(e) {
    this.setState({ newHighlight: e.target.value });
  }

  resetHighlights() {
    this.setState({ highlights: [] });
  }

  addHighlight() {
    let highlightString = this.state.newHighlight.split(',');
    let highlight = {startOffset: parseInt(highlightString[0]),
                     endOffset: parseInt(highlightString[1]),
                     color: highlightString[2],
                     priority: parseInt(highlightString[3])};
    this.defaultHighlights.push(highlight);
    let fragments = this.stringFragmentsFromHighlights(this.defaultHighlights);
    this.setState({ highlights: [...this.state.highlights, this.extractHighlights(this.createNewHighlights(this.defaultHighlights))] });
    this.setState({ highlightedText: fragments});
  }

  stringFragmentsFromHighlights(highlights) {
    return (this.createStringFragments(this.createNewHighlights(this.dataSort(highlights))));
  }

  extractHighlights(highlights) {
    return highlights.map((highlight, index) => {
      return React.createElement("li", {key: `highlight-${index}`}, `Start Offset: ${highlight.startOffset}, End Offset: ${highlight.endOffset}, Color: ${highlight.color}, Priority: ${highlight.priority}`);
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
        results.push(React.createElement("span", {key: index, className: "phrase"}, this.state.text.slice(iterator, highlight.startOffset)));
      }
      results.push(React.createElement("span", {style: { "backgroundColor": highlight.color}, className: "phrase", key: index + "color"}, this.state.text.slice(highlight.startOffset, highlight.endOffset)));
      iterator = highlight.endOffset;
    });
    results.push(React.createElement("span", {key: iterator, className: "phrase"}, this.state.text.slice(iterator, this.state.text.length)));
    return results;
  }
  

  createNewHighlights(highlights) {
    for (let i = 0; i < highlights.length; i++) {
  
      if (i === 0) { continue }
      
      let tempHighlights = [];
  
      let current = highlights[i];
      let existing = highlights[i - 1];
  
      if (current.startOffset >= existing.endOffset) { continue }
      if (current.startOffset === existing.startOffset &&
          current.endOffset === existing.endOffset &&
          current.color === existing.color) {
            highlights.splice(i, 1);
            continue;
          }
  
      let currentHasPriority = current.priority < existing.priority;
      let currentStartsSame = current.startOffset === existing.startOffset;
      let currentEndsAfter = current.endOffset > existing.endOffset;
      let currentEndsBefore = current.endOffset < existing.endOffset;
    
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
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing));
          tempHighlights.push(this.newHighlight(current.startOffset, existing.endOffset, current));
          tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current));
        } else {
          tempHighlights.push(this.newHighlight(existing.startOffset, existing.endOffset, existing));
          tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current));
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.createNewHighlights(this.dataSort(highlights));
      }
      
      if (currentEndsBefore) {
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing));
          tempHighlights.push(current);
          tempHighlights.push(this.newHighlight(current.endOffset, existing.endOffset, existing));
          highlights.splice(i - 1, 2, ...tempHighlights);
          return this.createNewHighlights(this.dataSort(highlights));
        }
      }
    }
    return highlights;
  }

  render() {
    return (
      <div className="app">
        <main>
          <h1>Phrase Highlighter</h1>
          <p className="container-phrase">{this.state.highlightedText}</p>
          <input
            value={this.state.text}
            onChange={this.handleChange}
            placeholder="Enter a phrase"
          />

        </main>
      </div>
    );
  }
}

export default App;
