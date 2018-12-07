import React, { Component } from 'react';
import Phrase from './components/Phrase';
import './App.scss';
import { defaultString, rules } from './constants';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { text: defaultString,
                   rules: rules,
                   highlights: [],
                   phrases: [] };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.phrasesFromHighlights(this.createHighlights(this.state.rules));
  }
  
  handleChange(e) {
    this.setState({
      text: e.target.value
    }, () => {
      this.phrasesFromHighlights(this.createHighlights(this.state.rules));
    })
  }

  phrasesFromHighlights(highlights) {
    this.createPhrases(this.mergeHighlights(this.sortByStartOffset(highlights)));
  }

  sortByStartOffset(data) {
    return data.sort((a, b) => { return a.startOffset - b.startOffset });
  }

  newHighlight(startOffset, endOffset, highlight, curved) {
    return {
      id: this.uniqueKey(),
      startOffset: startOffset,
      endOffset: endOffset,
      color: highlight.color,
      priority: highlight.priority,
      curved: curved
    };
  }

  createHighlights(rules) {
    let highlights = [];
    rules.forEach(rule => {
      rule.phrases.forEach(phrase => {
        let phrase_location = this.state.text.search(phrase);
        if (phrase_location > -1) {
          highlights.push(this.newHighlight(phrase_location, phrase_location + phrase.length, {color: rule.color, priority: rule.priority}, "both"));
        }
      });
    });
    this.setState({ highlights: highlights });
    return highlights;
  }

  createPhrases(highlights) {
    let results = [];
    let iterator = 0;
    highlights.forEach((highlight, index) => {
      if (iterator < highlight.startOffset) {
        results.push(<Phrase text={this.state.text.slice(iterator, highlight.startOffset)}
                             key={this.uniqueKey()} />);
      }
      results.push(<Phrase text={this.state.text.slice(highlight.startOffset, highlight.endOffset)}
                           color={highlight.color}
                           curved={highlight.curved}
                           key={this.uniqueKey()} />);
      iterator = highlight.endOffset;
    });
    results.push(<Phrase text={this.state.text.slice(iterator, this.state.text.length)}
                         key={this.uniqueKey()} />);
    this.setState({ phrases: results });
  }

  uniqueKey() {
    return (Date.now() + Math.random()) * 10000;
  }
  
  mergeHighlights(highlights) {
    for (let i = 0; i < highlights.length; i++) {
  
      if (i === 0) { continue }
      
      let tempHighlights = [];
  
      let current = highlights[i];
      let existing = highlights[i - 1];

      let noMergeNeeded = current.startOffset >= existing.endOffset;
      let currentHasPriority = current.priority < existing.priority;
      let currentStartsSame = current.startOffset === existing.startOffset;
      let currentEndsAfter = current.endOffset > existing.endOffset;
      let currentEndsBefore = current.endOffset < existing.endOffset;
      let currentEndsSame = current.endOffset === existing.endOffset;
      let duplicate = current.startOffset === existing.startOffset &&
                      current.endOffset === existing.endOffset &&
                      current.color === existing.color;
  
      if (noMergeNeeded) { continue }

      if (duplicate) {
        highlights.splice(i, 1);
        continue;
      }
    
      if (currentStartsSame) {
        if (currentHasPriority) {
          tempHighlights.push(current);
          if (current.endOffset < existing.endOffset) {
            tempHighlights.push(this.newHighlight(current.endOffset, existing.endOffset, existing, "right"));
          }
        } else {
          if (current.endOffset > existing.endOffset) {
            tempHighlights.push(existing);
            tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current, "both"));
          }
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.mergeHighlights(this.sortByStartOffset(highlights));
      }
    
      if (currentEndsAfter) {
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing, "left"));
          tempHighlights.push(this.newHighlight(current.startOffset, existing.endOffset, current, "both"));
          tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current, "both"));
        } else {
          tempHighlights.push(existing);
          tempHighlights.push(this.newHighlight(existing.endOffset, current.endOffset, current, "right"));
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.mergeHighlights(this.sortByStartOffset(highlights));
      }
      
      if (currentEndsBefore) {
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing, "left"));
          tempHighlights.push(current);
          tempHighlights.push(this.newHighlight(current.endOffset, existing.endOffset, existing, "right"));
          highlights.splice(i - 1, 2, ...tempHighlights);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        } else {
          highlights.splice(i, 1);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        }
      }

      if (currentEndsSame) {
        if (currentHasPriority) {
          tempHighlights.push(this.newHighlight(existing.startOffset, current.startOffset, existing, "left"));
          tempHighlights.push(this.newHighlight(current.startOffset, current.endOffset, current, "both"));
          highlights.splice(i - 1, 2, ...tempHighlights);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        } else {
          highlights.splice(i, 1);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        }
      }
    }
    return highlights;
  }

  render() {
    return (
      <div className="app">
        <h1>Phrase Highlighter</h1>
        <p className="container-phrase">{this.state.phrases}</p>
        <input
          value={this.state.text}
          onChange={this.handleChange}
          placeholder="Enter a phrase"
        />
      </div>
    );
  }
}

export default App;
