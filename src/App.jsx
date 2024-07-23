import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import IntegratedData from './components/IntegratedData.jsx';
import PatientRiskScores from './components/PatientRiskScores.jsx'
import AMRRiskScores from './components/AMRRiskScores.jsx'
import AMRDates from './components/AMRDates.jsx'
import IntegratedSummary from './components/IntegratedSummary.jsx';
import Search from './components/Search.jsx';

import 'higlass/dist/hglib.css';


// The full list of explorations
const explorations = {
	'Search': <Search/>,
	'ARS': <AMRRiskScores/>,
	'AD': <AMRDates/>,
	'PRS': <PatientRiskScores/>,
	'IntegratedData/:id': <IntegratedData/>,
	'IntegratedSummary/:id': <IntegratedSummary/>,
}


function App() {
	return (
		<div className='flex flex-row h-full w-full'>
			<div className='flex-none border-r-[1px]'>
				<div className='font-bold font-lg m-3'>Dashboards</div>
				<ol className='list-decimal list-inside divide-y divide-solid'>
					{Object.entries(explorations).filter(entry => {return !entry[0].includes('/')}).map(entry => <li className='p-3' key={entry[0]}><Link className='hover:underline' to={`/${entry[0].replace(' ', '_')}`}>{entry[0]}</Link></li>)}
				</ol>
			</div>
			<div className='flex flex-row h-full w-full'>
				<Routes>
					<Route path="/" element={explorations.Search} />
					{Object.entries(explorations).map(entry => <Route key={entry[0]} path={`/${entry[0].replace(' ', '_')}`} element={entry[1]}/>)}
				</Routes>
			</div>
		</div>
	);
}

export default App;