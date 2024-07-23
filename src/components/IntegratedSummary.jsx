import React from 'react';

import Demographics from './Demographics.jsx'
import GenomicSummary from './GenomicSummary.jsx'

import { useParams } from 'react-router-dom';


function IntegratedSummary() {

	const { id } = useParams();

	return (
		<>
			<div className='flex flex-col h-full w-full'>
				<div className='p-3'>
					<h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">Demographics</h2>
					<Demographics patientId={id}/>
				</div>
				<div className='p-3'>
					<GenomicSummary  patientId={id}/>
				</div>
			</div>
		</>
	);
}

export default IntegratedSummary;
