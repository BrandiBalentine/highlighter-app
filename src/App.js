import React, { Component } from 'react';
import Phrase from './components/Phrase';
import './App.scss';
import uniqid from 'uniqid';
import { defaultString, rules } from './constants';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = this.initialState();
    this.handleChange = this.handleChange.bind(this);
  }

  initialState() {
    return {
      text: defaultString,
      rules: rules,
      highlights: [],
      phrases: []
    };
  }

  componentDidMount() {
    this.phrasesFromHighlights(this.createHighlights(this.state.rules));
  }
  
  handleChange(e) {
    this.setState({
      text: e.target.value
    }, () => {
      this.componentDidMount();
    })
  }

  phrasesFromHighlights(highlights) {
    this.createPhrases(this.mergeHighlights(this.sortByStartOffset(highlights)));
  }

  sortByStartOffset(data) {
    return data.sort((a, b) => { return a.startOffset - b.startOffset });
  }

  newHighlight(startOffset, endOffset, highlight, curved) {
    if (highlight.curved && highlight.curved !== "both" && highlight.curved !== curved) {
      curved = "neither";
    }
    return {
      id: highlight.id || uniqid(),
      startOffset: startOffset,
      endOffset: endOffset,
      color: highlight.color,
      originalColor: highlight.color,
      priority: highlight.priority,
      curved: curved,
      originalCurved: curved,
      rule: highlight.rule,
      dominatedHighlights: highlight.dominatedHighlights || [],
      dominatingHighlights: highlight.dominatingHighlights || []
    };
  }

  createHighlights(rules) {
    let highlights = [];
    rules.forEach(rule => {
      rule.phrases.forEach(phrase => {
        let phrase_locations = this.allIndicesOf(this.state.text, phrase);
        if (phrase_locations.length > 0) {
          phrase_locations.forEach(location => {
            highlights.push(this.newHighlight(location, location + phrase.length, {color: rule.color, priority: rule.priority, rule: rule}, "both"));
          });
        }
      });
    });
    this.setState({ highlights: highlights });
    return highlights;
  }

  allIndicesOf(str, phrase) {
    var indices = [];
    for(var pos = str.indexOf(phrase); pos !== -1; pos = str.indexOf(phrase, pos + 1)) {
        indices.push(pos);
    }
    return indices;
  }

  findHighlightById = (id, highlights) => {
    return highlights.find(highlight => {
      return highlight.id === id;
    });
  }


  matchColorOfHighlight = (highlight, highlights) => {
    let finalIds = new Set();
    let aggregateHighlights = (highlight, highlights) => {
      let otherHighlights = new Set();
      highlight.dominatedHighlights.forEach(h => {
        otherHighlights.add(h);
      });
      highlight.dominatingHighlights.forEach(h => {
        otherHighlights.add(h);
      });
      if (otherHighlights.size > 0) {
        otherHighlights.forEach(highlightId => {
          if (finalIds.has(highlightId)) {
            return;
          }
          let foundHighlight = this.findHighlightById(highlightId, highlights);
          finalIds.add(highlightId);
          return aggregateHighlights(foundHighlight, highlights);
        })
      }
    };

    aggregateHighlights(highlight, highlights);

    let duplicateHighlights = highlights.slice(0);
    finalIds.add(highlight.id);

    let highlightOrder = 1;

    let overlappingHighlights = highlights.filter(highlight => {
      return finalIds.has(highlight.id);
    });
    
    duplicateHighlights.forEach((h, index) => {
      if (finalIds.has(h.id)) {
        h.color = highlight.color;
        h.hover = "hover"
        duplicateHighlights.splice(index, 1, h);
        if (highlightOrder === 1) {
          h.curved = "left";
          highlightOrder++;
        } else if (highlightOrder === overlappingHighlights.length) {
          h.curved = "right";
          highlightOrder++;
        } else {
          h.curved = "neither";
          highlightOrder++;
        }
      }
    });

    this.createPhrases(duplicateHighlights);
  }

  makeHighlightsTransparent = (highlight, highlights) => {
    let finalIds = new Set();
    let aggregateHighlights = (highlight, highlights) => {
      let otherHighlights = new Set();
      highlight.dominatedHighlights.forEach(h => {
        otherHighlights.add(h);
      });
      highlight.dominatingHighlights.forEach(h => {
        otherHighlights.add(h);
      });
      if (otherHighlights.size > 0) {
        otherHighlights.forEach(highlightId => {
          if (finalIds.has(highlightId)) {
            return;
          }
          let foundHighlight = this.findHighlightById(highlightId, highlights);
          finalIds.add(highlightId);
          return aggregateHighlights(foundHighlight, highlights);
        })
      }
    };

    aggregateHighlights(highlight, highlights);

    if (finalIds.has(highlight.id)) {
      finalIds.delete(highlight.id);
    }

    let duplicateHighlights = highlights.slice(0);
    
    duplicateHighlights.forEach((h, index) => {
      if (finalIds.has(h.id)) {
        h.color = "transparent";
        duplicateHighlights.splice(index, 1, h);
      }
    });

    this.createPhrases(duplicateHighlights);
  }

  createPhrases(highlights) {
    let results = [];
    let iterator = 0;
    highlights.forEach((highlight, index) => {
      if (iterator < highlight.startOffset) {
        results.push(<Phrase text={this.state.text.slice(iterator, highlight.startOffset)}
                             key={uniqid()} />);
      }
      results.push(<Phrase text={this.state.text.slice(highlight.startOffset, highlight.endOffset)}
                           key={uniqid()}
                           highlight={highlight}
                           highlights={highlights}
                           matchColorOfHighlight={this.matchColorOfHighlight.bind(this)}
                           makeHighlightsTransparent={this.makeHighlightsTransparent.bind(this)}
                           rerender={this.componentDidMount.bind(this)}
                            />);
      iterator = highlight.endOffset;
    });
    results.push(<Phrase text={this.state.text.slice(iterator, this.state.text.length)}
                         key={uniqid()} />);
    this.setState({ phrases: results });
  }

  associateHighlights(lowerPriorityHighlight, higherPriorityHighlight) {
    lowerPriorityHighlight.dominatingHighlights.push(higherPriorityHighlight.id);
    higherPriorityHighlight.dominatedHighlights.push(lowerPriorityHighlight.id);
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
            let newHighlight = this.newHighlight(current.endOffset, existing.endOffset, existing, "right")
            this.associateHighlights(newHighlight, tempHighlights[tempHighlights.length - 1]);
            tempHighlights.push(newHighlight);
          }
        } else {
          if (current.endOffset > existing.endOffset) {
            let newHighlight = this.newHighlight(existing.endOffset, current.endOffset, current, "right");
            this.associateHighlights(newHighlight, existing);
            tempHighlights.push(existing);
            tempHighlights.push(newHighlight);
          }
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.mergeHighlights(this.sortByStartOffset(highlights));
      }
    
      if (currentEndsAfter) {
        if (currentHasPriority) {
          let newHighlight = this.newHighlight(existing.startOffset, current.startOffset, existing, "left");
          this.associateHighlights(newHighlight, current);
          tempHighlights.push(current);
          tempHighlights.push(newHighlight);
        } else {
          let newHighlight = this.newHighlight(existing.endOffset, current.endOffset, current, "right");
          this.associateHighlights(newHighlight, existing);
          tempHighlights.push(existing);
          tempHighlights.push(newHighlight);
        }
        highlights.splice(i - 1, 2, ...tempHighlights);
        return this.mergeHighlights(this.sortByStartOffset(highlights));
      }
      
      if (currentEndsBefore) {
        if (currentHasPriority) {
          let leftHighlight = this.newHighlight(existing.startOffset, current.startOffset, existing, "left");
          let rightHighlight = this.newHighlight(current.endOffset, existing.endOffset, existing, "right");
          this.associateHighlights(leftHighlight, current);
          this.associateHighlights(rightHighlight, current);
          tempHighlights.push(leftHighlight);
          tempHighlights.push(current);
          tempHighlights.push(rightHighlight);
          highlights.splice(i - 1, 2, ...tempHighlights);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        } else {
          highlights.splice(i, 1);
          return this.mergeHighlights(this.sortByStartOffset(highlights));
        }
      }

      if (currentEndsSame) {
        if (currentHasPriority) {
          let newHighlight = this.newHighlight(existing.startOffset, current.startOffset, existing, "left");
          this.associateHighlights(newHighlight, current);
          tempHighlights.push(newHighlight);
          tempHighlights.push(current);
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
