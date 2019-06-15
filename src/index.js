import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { init } from 'd2'

let baseUrl = process.env.REACT_APP_DHIS2_BASE_URL;

if (!baseUrl) {
    //console.warn('Set the environment variable `REACT_APP_DHIS2_BASE_URL` to your DHIS2 instance to override localhost:8080!');
    baseUrl = 'http://199.188.207.78:8080';
    // baseUrl = '../../../';
}

init({baseUrl: baseUrl + '/api'})
    .then(d2 => {
        ReactDOM.render(<App d2={d2} baseUrl={baseUrl} />, document.getElementById('root'));
        registerServiceWorker();
    })
    .catch(err => console.error(err));
