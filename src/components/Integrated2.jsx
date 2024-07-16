import React from 'react';

import Demographics from './Demographics.jsx'
import GenomicSummary from './GenomicSummary.jsx'


function Integrated2() {
	return (
		<>
		<div className='flex flex-col h-full w-full'>
			<div className='p-3'>
				<h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">Demographics</h2>
				<Demographics/>
			</div>
			<div className='p-3'>
				<GenomicSummary/>
			</div>
		</div>
			</>
	);
}

export default Integrated2;
