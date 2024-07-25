import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import DataFrame from 'dataframe-js';

import Plot from 'react-plotly.js';

import readData from '../services/FHIRUtils';


function FASTASummary() {

    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const lowerRiskScore = searchParams.get('lowerRiskScore');
    const higherRiskScore = searchParams.get('higherRiskScore');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const [geneLengthsData, setGeneLengthsData] = useState([{
        'data': [{
            type: 'histogram',
            y: [],
            marker: {
                color: '#cdb4db',
            },
        }],
        'layout': {
            title: { text: 'Contig Lengths Distribution' },
            yaxis: { title: 'Count' },
            xaxis: { title: 'Contig Lengths' }
        }
    }]);

    const [geneLengthsViolinData, setGeneLengthsViolinData] = useState([{
        'data': [{
            type: 'violin',
            x: [],
            y: [],
            transforms: [{
                type: 'groupby',
                groups: [],
                styles: [
                    { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                    { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                ]
            }]
        }],
        'layout': {
            title: { text: 'Contig Lengths Violin Plots' },
            yaxis: { title: 'Count' },
            xaxis: { title: 'Contig Lengths' }
        }
    }]);

    const [geneCoverageData, setGeneCoverageData] = useState([{
        'data': [{
            type: 'histogram',
            y: [],
            marker: {
                color: '#a2d2ff',
            },
        }],
        'layout': {
            title: { text: 'Contig Coverage Distribution' },
            yaxis: { title: 'Count' },
            xaxis: { title: 'Contig Coverage' }
        }
    }]);

    const [geneCoverageViolinData, setGeneCoverageViolinData] = useState([{
        'data': [{
            type: 'violin',
            x: [],
            y: [],
            transforms: [{
                type: 'groupby',
                groups: [],
                styles: [
                    { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                    { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                ]
            }]
        }],
        'layout': {
            title: { text: 'Contig Coverage Violin Plots' },
            yaxis: { title: 'Count' },
            xaxis: { title: 'Contig Coverage' }
        }
    }]);

    function mergeGeneLengthsData(oldY, df) {
        let y = df.select('length').toArray().flat()
        if (!oldY || (oldY.length == 0)) {
            return [y]
        }
        return [oldY.concat(y)]
    }

    function mergeGeneLengthsViolinData(oldData, df) {
        let x = df.select('circular').toArray().flat().map((i) => (i == 'true') ? 'circular' : 'non-circular')
        let y = df.select('length').toArray().flat()
        if (!oldData[0].data[0].y || (oldData[0].data[0].y.length == 0) || !oldData[0].data[0].x || (oldData[0].data[0].x.length == 0)) {
            return [x, y]
        }
        return [oldData[0].data[0].x.concat(x), oldData[0].data[0].y.concat(y)]
    }

    function mergeGeneCoverageData(oldData, df) {
        let y = df.select('depth').toArray().flat().map((i) => (i.slice(0, -1) * 1))
        if (!oldData[0].data[0].y || (oldData[0].data[0].y.length == 0)) {
            return [y]
        }
        return [oldData[0].data[0].y.concat(y)]
    }

    function mergeGeneCoverageViolinData(oldData, df) {
        let x = df.select('circular').toArray().flat().map((i) => (i == 'true') ? 'circular' : 'non-circular')
        let y = df.select('depth').toArray().flat().map((i) => (i.slice(0, -1) * 1))
        if (!oldData[0].data[0].y || (oldData[0].data[0].y.length == 0) || !oldData[0].data[0].x || (oldData[0].data[0].x.length == 0)) {
            return [x, y]
        }
        return [oldData[0].data[0].x.concat(x), oldData[0].data[0].y.concat(y)]
    }

    function refreshData() {
        setGeneLengthsData(() => {
            var data = [{
                type: 'histogram',
                y: [],
                marker: {
                    color: '#cdb4db',
                },
            }],
                layout = {
                    title: { text: 'Contig Lengths Distribution' },
                    yaxis: { title: 'Count' },
                    xaxis: { title: 'Contig Lengths' }
                }
            return ([{ 'data': data, 'layout': layout }])
        })
        setGeneLengthsViolinData(() => {
            var data = [{
                type: 'violin',
                x: [],
                y: [],
                transforms: [{
                    type: 'groupby',
                    groups: [],
                    styles: [
                        { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                        { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                    ]
                }]
            }],
                layout = {
                    title: { text: 'Contig Lengths Violin Plots' },
                    yaxis: { title: 'Count' },
                    xaxis: { title: 'Contig Lengths' }
                }
            return ([{ 'data': data, 'layout': layout }])
        })
        setGeneCoverageData(() => {
            var data = [{
                type: 'histogram',
                y: [],
                marker: {
                    color: '#a2d2ff',
                },
            }],
                layout = {
                    title: { text: 'Contig Coverage Distribution' },
                    yaxis: { title: 'Count' },
                    xaxis: { title: 'Contig Coverage' }
                }
            return ([{ 'data': data, 'layout': layout }])
        })
        setGeneCoverageViolinData(() => {
            var data = [{
                type: 'violin',
                x: [],
                y: [],
                transforms: [{
                    type: 'groupby',
                    groups: [],
                    styles: [
                        { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                        { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                    ]
                }]
            }],
                layout = {
                    title: { text: 'Contig Coverage Violin Plots' },
                    yaxis: { title: 'Count' },
                    xaxis: { title: 'Contig Coverage' }
                }
            return ([{ 'data': data, 'layout': layout }])
        })
        readData(
            'http://10.172.235.4:8080/fhir/Patient?name=' + name
            + '&_has:RiskAssessment:subject:probability=ge' + lowerRiskScore
            + '&_has:RiskAssessment:subject:probability=le' + higherRiskScore
            + ((fromDate == '') ? '' : '&_has:Encounter:subject:date-start=ge' + fromDate)
            + ((toDate == '') ? '' : '&_has:Encounter:subject:date-start=le' + toDate)
        ).then(response => {
            let patientIds = new Set();
            response.map(resourceBundle => {
                if ('entry' in resourceBundle) {
                    resourceBundle.entry.map(entry => {
                        patientIds.add(entry.resource.id)
                    })
                }
            })
            var requestEntries = []
            patientIds.map((patientId) => {
                var requestEntry = {
                    "request": {
                        "method": "GET",
                        "url": "/MolecularSequence?subject=" + patientId
                    }
                }
                requestEntries.push(requestEntry)
            })
            let body = {
                "resourceType": "Bundle",
                "id": "patients-bundle-request",
                "type": "batch",
                "entry": requestEntries
            }
            readData('http://10.172.235.4:8080/fhir', 'POST', JSON.stringify(body)).then(responses => {
                var fastaInfoFiles = []
                responses.map((response) => {
                    if ('entry' in response) {
                        response.entry.map((outerEntry) => {
                            if ('resource' in outerEntry) {
                                if ('entry' in outerEntry.resource) {
                                    outerEntry.resource.entry.map((innerEntry) => {
                                        if ('resource' in innerEntry) {
                                            if ('formatted' in innerEntry.resource) {
                                                innerEntry.resource.formatted.map((formatted) => {
                                                    if (formatted.title == 'Fasta info file') {
                                                        fastaInfoFiles.push(formatted.url)
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    }
                })
                fastaInfoFiles.map((fastaInfoFile) => {
                    DataFrame.fromCSV(fastaInfoFile).then(df => {
                        setGeneLengthsData((oldData) => {
                            let [newY] = mergeGeneLengthsData(oldData[0].data[0].y, df)
                            var data = [{
                                type: 'histogram',
                                y: newY,
                                marker: {
                                    color: '#cdb4db',
                                },
                            }],
                                layout = {
                                    title: { text: 'Contig Lengths Distribution' },
                                    yaxis: { title: 'Count' },
                                    xaxis: { title: 'Contig Lengths' }
                                }
                            return ([{ 'data': data, 'layout': layout }])
                        })
                        setGeneLengthsViolinData((oldData) => {
                            let [newX, newY] = mergeGeneLengthsViolinData(oldData, df)
                            var data = [{
                                type: 'violin',
                                x: newX,
                                y: newY,
                                transforms: [{
                                    type: 'groupby',
                                    groups: newX,
                                    styles: [
                                        { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                                        { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                                    ]
                                }]
                            }],
                                layout = {
                                    title: { text: 'Contig Lengths Violin Plots' },
                                    yaxis: { title: 'Count' },
                                    xaxis: { title: 'Contig Lengths' }
                                }
                            return ([{ 'data': data, 'layout': layout }])
                        })
                        setGeneCoverageData((oldData) => {
                            let [newY] = mergeGeneCoverageData(oldData, df)
                            var data = [{
                                type: 'histogram',
                                y: newY,
                                marker: {
                                    color: '#a2d2ff',
                                },
                            }],
                                layout = {
                                    title: { text: 'Contig Coverage Distribution' },
                                    yaxis: { title: 'Count' },
                                    xaxis: { title: 'Contig Coverage' }
                                }
                            return ([{ 'data': data, 'layout': layout }])
                        })
                        setGeneCoverageViolinData((oldData) => {
                            let [newX, newY] = mergeGeneCoverageViolinData(oldData, df)
                            var data = [{
                                type: 'violin',
                                x: newX,
                                y: newY,
                                transforms: [{
                                    type: 'groupby',
                                    groups: newX,
                                    styles: [
                                        { target: 'circular', value: { line: { color: '#a2d2ff' } } },
                                        { target: 'non-circular', value: { line: { color: '#cdb4db' } } },
                                    ]
                                }]
                            }],
                                layout = {
                                    title: { text: 'Contig Coverage Violin Plots' },
                                    yaxis: { title: 'Count' },
                                    xaxis: { title: 'Contig Coverage' }
                                }
                            return ([{ 'data': data, 'layout': layout }])
                        })
                    })
                })
            })
        })
    }

    useEffect(() => {
        refreshData()
    }, []);

    return (
        <>
            <div className="flex-col items-center grid-cols-1">
                <div className="flex items-center">
                    <Plot
                        data={geneLengthsData[0].data}
                        layout={geneLengthsData[0].layout}
                    >
                    </Plot>
                </div>
                <div className="flex items-center">
                    <Plot
                        data={geneLengthsViolinData[0].data}
                        layout={geneLengthsViolinData[0].layout}
                    >
                    </Plot>
                </div>
                <div className="flex items-center">
                    <Plot
                        data={geneCoverageData[0].data}
                        layout={geneCoverageData[0].layout}
                    >
                    </Plot>
                </div>
                <div className="flex items-center">
                    <Plot
                        data={geneCoverageViolinData[0].data}
                        layout={geneCoverageViolinData[0].layout}
                    >
                    </Plot>
                </div>
            </div>
        </>
    );
}

export default FASTASummary;
