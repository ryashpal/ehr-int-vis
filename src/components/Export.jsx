import React from 'react';

import exportDemographics from '../services/ExportDemographics';
import exportObservations from '../services/ExportObservations';
import exportGenomics from '../services/ExportGenomics';

import DataFrame from 'dataframe-js';


function Export() {

    const handleDatatypeChange = (e) => {
        console.log('e.target.id: ', e.target.id)
        if (e.target.id == 'demographics_export_button') {
            refreshData("demographics")
        }
        if (e.target.id == 'observations_export_button') {
            refreshData("observations")
        }
        if (e.target.id == 'genomics_export_button') {
            refreshData("genomics")
        }
    }

    function refreshData(datatype) {

        console.log('dataType: ', datatype)
        if (datatype) {
            DataFrame.fromCSV('https://raw.githubusercontent.com/ryashpal/ehr-int-vis/main/genomic_data/index_saur.csv').then(df => {
                df.map((row, i) => {
                    let name = 'P' + row.get('PATIENT_ID')
                    let lowerRiskScore = 0.0
                    let higherRiskScore = 1.0
                    let fromDate = ''
                    let toDate = ''
                    console.log('index: ', i)
                    console.log('name: ', name)
                    if (datatype == 'demographics') {
                        exportDemographics(name, lowerRiskScore, higherRiskScore, fromDate, toDate)
                    }
                    if (datatype == 'observations') {
                        exportObservations(name, lowerRiskScore, higherRiskScore, fromDate, toDate)
                    }
                    if (datatype == 'genomics') {
                        exportGenomics(name, lowerRiskScore, higherRiskScore, fromDate, toDate)
                    }
                })
            })
        }
    }

    return (
        <div className='flex flex-col h-full w-full'>
            <button id='demographics_export_button' className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={handleDatatypeChange}>
                Export Demographics
            </button>
            <button id='observations_export_button' className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={handleDatatypeChange}>
                Export Observations
            </button>
            <button id='genomics_export_button' className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={handleDatatypeChange}>
                Export Genomics
            </button>
        </div>
    )
}

export default Export;
