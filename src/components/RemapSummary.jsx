import readData from '../services/FHIRUtils.js'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Plot from 'react-plotly.js';

import DataFrame from 'dataframe-js';

function RemapSummary() {

    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const lowerRiskScore = searchParams.get('lowerRiskScore');
    const higherRiskScore = searchParams.get('higherRiskScore');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');


    const [tokenLengthCountData, setTokenLengthCountData] = useState({
        'tokenLengthCounts': {},
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Token Length Count Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Token Length' },
            xaxis: { title: 'Count' }
        }
    });

    const [topTokenCountData, setTopTokenCountData] = useState({
        'tokenCounts': {},
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Top 10 Token Count Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Token' },
            xaxis: { title: 'Count' }
        }
    });

    function refreshData() {
        setTokenLengthCountData(() => {
            var data = [
                {
                    type: 'bar',
                    x: [],
                    y: [],
                    text: [],
                    orientation: 'h',
                    marker: {
                        color: '#a2d2ff',
                    },
                },
            ];
            var layout = {
                title: { text: 'Token Length Count Plot' },
                yaxis: { showticklabels: true, type: 'category', title: 'Token Length' },
                xaxis: { title: 'Count' }
            }
            return ({ 'tokenLengthCounts': {}, 'data': data, 'layout': layout })
        })
        setTopTokenCountData(() => {
            var data = [
                {
                    type: 'bar',
                    x: [],
                    y: [],
                    text: [],
                    orientation: 'h',
                    marker: {
                        color: '#cdb4db',
                    },
                },
            ];
            var layout = {
                title: { text: 'Top 10 Token Count Plot' },
                yaxis: { showticklabels: true, type: 'category', title: 'Token' },
                xaxis: { title: 'Count' }
            }
            return ({ 'tokenCounts': {}, 'data': data, 'layout': layout })
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
                var remapInfoFiles = []
                responses.map((response) => {
                    if ('entry' in response) {
                        response.entry.map((outerEntry) => {
                            if ('resource' in outerEntry) {
                                if ('entry' in outerEntry.resource) {
                                    outerEntry.resource.entry.map((innerEntry) => {
                                        if ('resource' in innerEntry) {
                                            if ('formatted' in innerEntry.resource) {
                                                innerEntry.resource.formatted.map((formatted) => {
                                                    if (formatted.title == 'Remap info file') {
                                                        remapInfoFiles.push(formatted.url)
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
                remapInfoFiles.map((remapInfoFile) => {
                    DataFrame.fromCSV(remapInfoFile).then(df => {
                        setTokenLengthCountData((oldData) => {
                            let tokenLengthCounts = {}
                            df.toArray('token').map(token => { return (token.length) }).forEach(value => {
                                if (tokenLengthCounts[value]) {
                                    tokenLengthCounts[value] += 1;
                                } else {
                                    tokenLengthCounts[value] = 1;
                                }
                            })
                            new Set((Object.entries(tokenLengthCounts).map(([key, value]) => key)).concat(Object.entries(oldData.tokenLengthCounts).map(([key, value]) => key))).map((key) => {
                                tokenLengthCounts[key] = (tokenLengthCounts[key] == null) ? 0 : tokenLengthCounts[key]
                                tokenLengthCounts[key] = (oldData.tokenLengthCounts[key] == null) ? (tokenLengthCounts[key]) : (tokenLengthCounts[key] + oldData.tokenLengthCounts[key])
                            })
                            var data = [
                                {
                                    type: 'bar',
                                    x: Object.entries(tokenLengthCounts).map(([key, value]) => (value)),
                                    y: Object.entries(tokenLengthCounts).map(([key, value]) => (key)),
                                    text: Object.entries(tokenLengthCounts).map(([key, value]) => (value)),
                                    orientation: 'h',
                                    marker: {
                                        color: '#a2d2ff',
                                    },
                                },
                            ];
                            var layout = {
                                title: { text: 'Token Length Count Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Token Length' },
                                xaxis: { title: 'Count' }
                            }
                            return ({ 'tokenLengthCounts': tokenLengthCounts, 'data': data, 'layout': layout })
                        })
                        setTopTokenCountData((oldData) => {
                            let tokenCounts = {}
                            df.toArray('token').forEach(value => {
                                if (tokenCounts[value]) {
                                    tokenCounts[value] += 1;
                                } else {
                                    tokenCounts[value] = 1;
                                }
                            })
                            new Set((Object.entries(tokenCounts).map(([key, value]) => key)).concat(Object.entries(oldData.tokenCounts).map(([key, value]) => key))).map((key) => {
                                tokenCounts[key] = (tokenCounts[key] == null) ? 0 : tokenCounts[key]
                                tokenCounts[key] = (oldData.tokenCounts[key] == null) ? (tokenCounts[key]) : (tokenCounts[key] + oldData.tokenCounts[key])
                            })
                            const topTokenCounts = Object.fromEntries(
                                Object.entries(tokenCounts).sort(([, a], [, b]) => b - a).slice(0, 10)
                            );
                            var data = [
                                {
                                    type: 'bar',
                                    x: Object.entries(topTokenCounts).map(([key, value]) => (value)),
                                    y: Object.entries(topTokenCounts).map(([key, value]) => (key)),
                                    text: Object.entries(topTokenCounts).map(([key, value]) => (value)),
                                    orientation: 'h',
                                    marker: {
                                        color: '#cdb4db',
                                    },
                                },
                            ];
                            var layout = {
                                title: { text: 'Top 10 Token Count Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Token' },
                                xaxis: { title: 'Count' }
                            }
                            return ({ 'tokenCounts': tokenCounts, 'data': data, 'layout': layout })
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
                        data={tokenLengthCountData.data}
                        layout={tokenLengthCountData.layout}
                    >
                    </Plot>
                </div>
                <div className="flex items-center">
                    <Plot
                        data={topTokenCountData.data}
                        layout={topTokenCountData.layout}
                    >
                    </Plot>
                </div>
            </div>
        </>
    );
}

export default RemapSummary;
