const green = '#d9f593';
const blue = '#a9e7fe';
const orange = '#ffce8b';
const purple = '#f0b6ff';
const grey = '#e8e8e8';

export const defaultString = 'We expect our candidates to be action-oriented, an adorable puppy, and have creative ideas for our team. They will deliver new technology and their creativity will be very unlikely to leave.';
export const rules = [
  {
    priority: 1,
    color: orange,
    phrases: ["action-oriented", "alarming", "candidates", "leave", "do not want"]
  },
  {
    priority: 2,
    color: green,
    phrases: ["adorable", "creative", "love", "will deliver new"]
  },
  {
    priority: 3,
    color: blue,
    phrases: ["an adorable puppy", "aggressive", "arm", "very unlikely"]
  },
  {
    priority: 4,
    color: purple,
    phrases: ["do not cross", "log file", "our team", "radio"]
  },
  {
    priority: 5,
    color: grey,
    phrases: ["very unlikely to leave", "new technology"]
  }
]