import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { finalData } from './constants';
import TextField from './TextField'
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
                <div>
                  {finalData}
                  <div><TextField/></div>
                </div>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
