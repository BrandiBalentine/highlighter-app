import React from 'react';
export const highlights = [
  {
    startOffset: 4,
    endOffset: 20,
    color: 'yellow',
    priority: 3, // lower numbers are higher in priority
  },
  {
    startOffset: 17,
    endOffset: 54,
    color: 'green',
    priority: 2,
  },
  {
    startOffset: 19,
    endOffset: 44,
    color: 'blue',
    priority: 1,
  },
  {
    startOffset: 21,
    endOffset: 47,
    color: 'orange',
    priority: 0,
  },
  {
    startOffset: 60,
    endOffset: 62,
    color: 'red',
    priority: 0
  }
];

export const string = 'You will deliver new technology with an adorable puppy. Perfect! Perfect! Perfect! Perfect! Perfect!';


function createNewHighlights(highlights) {

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
          tempHighlights.push(newHighlight(current.startOffset, existing.startOffset, current));
          tempHighlights.push(newHighlight(existing.startOffset, existing.endOffset, existing));
        }
      } else {
        if (current.endOffset > existing.endOffset) {
          tempHighlights.push(newHighlight(existing.startOffset, existing.endOffset, existing));
          tempHighlights.push(newHighlight(existing.endOffset, current.endOffset, current));
        }
      }
      highlights.splice(i - 1, 2, ...tempHighlights);
      return createNewHighlights(dataSort(highlights));
    }
  
    if (currentEndsAfter) {
      tempHighlights.push(newHighlight(existing.startOffset, current.startOffset, existing));
      if (currentHasPriority) {
        tempHighlights.push(newHighlight(current.startOffset, existing.endOffset, current));
        tempHighlights.push(newHighlight(existing.endOffset, current.endOffset, current));
      } else {
        tempHighlights.push(current);
      }
      highlights.splice(i - 1, 2, ...tempHighlights);
      return createNewHighlights(dataSort(highlights));
    }
    
    if (currentEndsBefore) {
      if (currentHasPriority) {
        tempHighlights.push(newHighlight(existing.startOffset, current.startOffset, existing));
        tempHighlights.push(current);
        tempHighlights.push(newHighlight(current.startOffset, existing.startOffset, existing));
        highlights.splice(i - 1, 2, ...tempHighlights);
        return createNewHighlights(dataSort(highlights));
      }
    }
  }

  return highlights;
}

function newHighlight(startOffset, endOffset, highlight) {
  return {
    startOffset: startOffset,
    endOffset: endOffset,
    color: highlight.color,
    priority: highlight.priority
  }
}

function createStringFragments(highlights) {
  let results = [];
  let iterator = 0;
  highlights.forEach(function(highlight, index){
    if (iterator < highlight.startOffset) {
      results.push(React.createElement("span", {key: index}, string.slice(iterator, highlight.startOffset)));
    }
    results.push(React.createElement("span", {style: { "backgroundColor": highlight.color}, key: index + "color"}, string.slice(highlight.startOffset, highlight.endOffset)));
    iterator = highlight.endOffset;
  });
  results.push(React.createElement("span", {key: iterator}, string.slice(iterator, string.length)));
  return results;
}

function dataSort(data) {
  return data.sort(function(a, b){return a.startOffset - b.startOffset});
}

export const finalData = createStringFragments(createNewHighlights(dataSort(highlights)));