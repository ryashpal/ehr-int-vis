import React, { useState } from 'react';

import Graph from './Graph.jsx';

// import data from '../services/Demographics.js';


function EHR() {

    const [data, setData] = useState(null);

    function loadData() {
        if(!data){
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://10.172.235.4:8080/fhir/Patient?_id=P2102099');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    setData(JSON.parse(xhr.responseText));
                }
            };
            xhr.send();
        }
    }


    // var demographicsData = data()
    loadData()

    if (data) {
        return (
            <div className='flex flex-col h-full w-full'>
                <br/>
                <p className='text-2xl font-semibold'>{data.entry[0].resource.id}</p>
                <p className='text-2xl font-extrabold'>{data.entry[0].resource.name}</p>
                <p className='text-2xl font-normal'>{data.entry[0].resource.gender}</p>
                <Graph/>
                <Graph/>
            </div>
        )
    }
}

export default EHR;
