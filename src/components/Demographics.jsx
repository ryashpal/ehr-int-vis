import React, { useState, useEffect } from 'react';

import readData from '../utils/FHIRUtils.js'


function Demographics() {

    const [data, setData] = useState(null);

    function refreshData() {
        readData('http://10.172.235.4:8080/fhir/Patient?_id=P2115118').then(response => {
            setData(response);
        })
    }

    useEffect(() => {
        refreshData()
    }, []);

    if (data) {
        return (
            <div className='flex flex-col h-full w-full'>
                <br />
                <p className='text-2xl font-semibold'>{data[0].entry[0].resource.id}</p>
                <p className='text-2xl font-bold'>{data[0].entry[0].resource.name[0].given[0]}</p>
                <p className='text-2xl font-normal'>{data[0].entry[0].resource.gender}</p>
            </div>
        )
    }
}

export default Demographics;
