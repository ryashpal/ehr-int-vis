import React from 'react';

import Graph from './Graph.jsx';

function EHR() {
	return (
        <div className='flex flex-col h-full w-full'>
            <br/>
            <p className='font-semibold'>John Doe</p>
            <p className='font-semibold'>P637422</p>
            <p className='font-semibold'>Male</p>
            <Graph/>
            <Graph/>
        </div>
    )
}


export default EHR;
