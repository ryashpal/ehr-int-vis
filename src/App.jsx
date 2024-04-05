import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import EHR from './EHR.jsx'
import IntegratedExample from './IntegratedExample.jsx';

import 'higlass/dist/hglib.css';


function App() {
	return (
		<div className='flex flex-row h-full w-full'>
			<div className='p-3'>
				<h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">EHR</h2>
				<EHR/>
			</div>
			<div className=''>
			<h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">Genome</h2>
			<IntegratedExample/>
			</div>
		</div>
	);
}


export default App;