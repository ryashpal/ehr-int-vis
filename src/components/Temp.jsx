import React, { useEffect } from 'react';

import { useSearchParams } from 'react-router-dom';

import exportEHR from '../services/ExportEHR';

import DataFrame from 'dataframe-js';


function Temp() {

    // const [searchParams] = useSearchParams();
    // const name = searchParams.get('name');
    // const lowerRiskScore = searchParams.get('lowerRiskScore');
    // const higherRiskScore = searchParams.get('higherRiskScore');
    // const fromDate = searchParams.get('fromDate');
    // const toDate = searchParams.get('toDate');

    function refreshData() {
        // console.log('name: ', name)
        // console.log('lowerRiskScore: ', lowerRiskScore)
        // console.log('higherRiskScore: ', higherRiskScore)
        // console.log('fromDate: ', fromDate)
        // console.log('toDate: ', toDate)
        DataFrame.fromCSV('https://raw.githubusercontent.com/ryashpal/ehr-int-vis/main/genomic_data/index_saur.csv').then(df => {
            df.map((row, i) => {
                let name = 'P' + row.get('PATIENT_ID')
                let lowerRiskScore = 0.0
                let higherRiskScore = 1.0
                let fromDate = ''
                let toDate = ''
                console.log('index: ', i)
                console.log('name: ', name)
                exportEHR(name, lowerRiskScore, higherRiskScore, fromDate, toDate)
            })
        })
    }

    useEffect(() => {
        refreshData()
    }, []);

    return (
        <div className='flex flex-col h-full w-full'>
            {/* <p>Name: {name}</p>
                <p>Lower Risk Score: {lowerRiskScore}</p>
                <p>Higher Risk Score: {higherRiskScore}</p>
                <p>From Date: {fromDate}</p>
                <p>To Date: {toDate}</p> */}
        </div>
    )
}

export default Temp;
