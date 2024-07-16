import React, { useState, useEffect } from 'react';

import DataFrame from 'dataframe-js';

import Plot from 'react-plotly.js';

import readData from '../utils/FHIRUtils.js'


function GenomicSummary() {

    const [geneData, setGeneData] = useState([{
        type: 'bar',
        x: [],
        y: [],
        orientation: 'h'
    }]);

    const [amrClassData, setAmrClassData] = useState([{
        type: 'pie',
        values: [],
        labels: [],
    }]);

    function refreshData() {
        readData('http://10.172.235.4:8080/fhir/MolecularSequence?subject=P2115118').then(response => {
            let amrFile = null
            for (let entry of response[0].entry[0].resource.formatted) {
                if (entry.title == 'AMR File') {
                    DataFrame.fromTSV(entry.url).then(df => {
                        let geneGroupedDf = df.groupBy('Gene symbol').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
                        let amrClassGroupedDf = df.groupBy('Class').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
                        setGeneData(oldData => {
                            var data = [{
                                type: 'bar',
                                x: geneGroupedDf.select('count').toArray().flat(),
                                y: geneGroupedDf.select('type').toArray().flat(),
                                orientation: 'h'
                            }];
                            return (data)
                        })
                        setAmrClassData(oldData => {
                            var data = [{
                                type: 'pie',
                                values: amrClassGroupedDf.select('count').toArray().flat(),
                                labels: amrClassGroupedDf.select('type').toArray().flat(),
                            }];
                            return (data)
                        })
                    })
                }
            }

        })
    }

    useEffect(() => {
        refreshData()
    }, []);

    return (
        <div className='flex flex-col h-full w-full'>
            <br />
            <h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">Genomic  Data Summary</h2>
            <h2 className="text-3xl font-extrabold dark:text-white flex items-center justify-center">Genes</h2>
            <Plot data={geneData}></Plot>
            <h2 className="text-3xl font-extrabold dark:text-white flex items-center justify-center">AMR Mechanisms</h2>
            <Plot data={amrClassData}></Plot>
        </div>
    )
}

export default GenomicSummary;
