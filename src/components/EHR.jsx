import React, { useState, useEffect } from 'react';

import Graph from './Graph.jsx';
import RiskScores from './RiskScores.jsx'

import readData from '../services/FHIRUtils.js'


function EHR(params) {

    const [data, setData] = useState(null);

    function refreshData() {
        readData('http://10.172.235.4:8080/fhir/Patient?_id=' + params.patientId).then(response => {
            setData(response);
        })
    }


    useEffect(() => {
        refreshData()
    }, []);

    if (data) {
        return (
            <div className='flex flex-col h-full w-full'>
                <br/>
                <p className='text-2xl font-semibold'>{data[0].entry[0].resource.id}</p>
                <p className='text-2xl font-bold'>{data[0].entry[0].resource.name[0].given[0]}</p>
                <p className='text-2xl font-normal'>{data[0].entry[0].resource.gender}</p>
                <br/>
                <p className='font-black'>Vitals</p>
                <Graph patientId={params.patientId}/>
                <p className='font-black'>Lab Values</p>
                <Graph patientId={params.patientId}/>
                <RiskScores patientId={params.patientId}/>
            </div>
        )
    }
}

export default EHR;
