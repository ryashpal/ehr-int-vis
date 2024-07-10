import React, { useState } from 'react';

import Graph from './Graph.jsx';
import RiskScores from './RiskScores.jsx'

// import data from '../services/Demographics.js';


function EHR() {

    const [data, setData] = useState(null);

    function loadData() {
        if(!data){
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'http://10.172.235.4:8080/fhir/Patient?_id=P2115118');
            xhr.setRequestHeader("authentication", "mjRmoNGW6klxaClkKhEkqi7HVYwx6NTH");
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
                <p className='text-2xl font-bold'>{data.entry[0].resource.name[0].given[0]}</p>
                <p className='text-2xl font-normal'>{data.entry[0].resource.gender}</p>
                <br/>
                <p className='font-black'>Vitals</p>
                <Graph/>
                <p className='font-black'>Lab Values</p>
                <Graph/>
                <RiskScores/>
            </div>
        )
    }
}

export default EHR;
