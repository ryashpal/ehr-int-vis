import * as React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import IntegratedExample from './components/IntegratedExample.jsx';
import PatientRiskScores from './components/PatientRiskScores.jsx'
import AMRRiskScores from './components/AMRRiskScores.jsx'
import AMRRiskScoresV2 from './components/AMRRiskScoresV2.jsx'
import AMRDates from './components/AMRDates.jsx'
import Integrated2 from './components/Integrated2.jsx';

import 'higlass/dist/hglib.css';


// The full list of explorations
const explorations = {
	'ARS': <AMRRiskScores/>,
	'ARSV2': <AMRRiskScoresV2/>,
	'AD': <AMRDates/>,
	'PRS': <PatientRiskScores/>,
	'Integrated': <IntegratedExample/>,
	'Integrated2': <Integrated2/>,
}


function App() {
	return (
		<div className='flex flex-row h-full w-full'>
			<div className='flex-none border-r-[1px]'>
				<div className='font-bold font-lg m-3'>Dashboards</div>
				<ol className='list-decimal list-inside divide-y divide-solid'>
					{Object.entries(explorations).map(entry => <li className='p-3' key={entry[0]}><Link className='hover:underline' to={`/${entry[0].replace(' ', '_')}`}>{entry[0]}</Link></li>)}
				</ol>
			</div>
			<div className=''>
				<Routes>
					<Route path="/" element={explorations.Simple} />
					{Object.entries(explorations).map(entry => <Route key={entry[0]} path={`/${entry[0].replace(' ', '_')}`} element={entry[1]}/>)}
				</Routes>
			</div>
		</div>
	);
}

export default App;