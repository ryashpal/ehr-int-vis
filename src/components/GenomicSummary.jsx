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

    const [fastaSummaryData, setFastaSummaryData] = useState({
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Overall Summary Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx' },
            xaxis: { title: 'Length' }
        }
    });

    const [fastaLengthData, setFastaLengthData] = useState({
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Contig Length Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx' },
            xaxis: { title: 'Length' }
        }
    });

    const [fastaCoverageData, setFastaCoverageData] = useState({
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Contig Coverage Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx' },
            xaxis: { title: 'Coverage' }
        }
    });

    const [tokenCountData, setTokenCountData] = useState({
        'data': [{
            type: 'bar',
            x: [],
            y: [],
            orientation: 'h'
        }],
        'layout': {
            title: { text: 'Contig Token Count Plot' },
            yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx' },
            xaxis: { title: 'Token Count' }
        }
    });

    const [tokenLengthCountData, setTokenLengthCountData] = useState({
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
                } else if (entry.title == 'Fasta info file') {
                    DataFrame.fromCSV(entry.url).then(df => {
                        setFastaSummaryData(oldData => {
                            var data = [
                                {
                                    type: 'bar',
                                    x: df.filter(row => row.get('circular') == 'true').toArray('length'),
                                    y: df.filter(row => row.get('circular') == 'true').toArray('idx'),
                                    text: df.filter(row => row.get('circular') == 'true').toArray('depth'),
                                    orientation: 'h',
                                    name: 'Curcular',
                                    marker: {
                                        color: '#cdb4db',
                                    },
                                },
                                {
                                    type: 'bar',
                                    x: df.filter(row => row.get('circular') == 'false').toArray('length'),
                                    y: df.filter(row => row.get('circular') == 'false').toArray('idx'),
                                    text: df.filter(row => row.get('circular') == 'false').toArray('depth'),
                                    orientation: 'h',
                                    name: 'Non Curcular',
                                    marker: {
                                        color: '#a2d2ff',
                                    },
                                }
                            ];
                            var layout = {
                                title: { text: 'Overall Summary Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx', "categoryorder": "array", "categoryarray": df.toArray('idx') },
                                xaxis: { title: 'Length' }
                            }
                            return ({ 'data': data, 'layout': layout })
                        });
                        setFastaLengthData(oldData => {
                            var data = [
                                {
                                    type: 'bar',
                                    x: df.toArray('length'),
                                    y: df.toArray('idx'),
                                    text: df.toArray('length'),
                                    orientation: 'h',
                                    marker: {
                                        color: '#cdb4db',
                                    },
                                },
                            ];
                            var layout = {
                                title: { text: 'Contig Length Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx', "categoryorder": "array", "categoryarray": df.toArray('idx') },
                                xaxis: { title: 'Length' }
                            }
                            return ({ 'data': data, 'layout': layout })
                        })
                        setFastaCoverageData(oldData => {
                            var data = [
                                {
                                    type: 'bar',
                                    x: df.toArray('depth').map((x) => x.slice(0, -1)),
                                    y: df.toArray('idx'),
                                    text: df.toArray('depth'),
                                    orientation: 'h',
                                    marker: {
                                        color: '#a2d2ff',
                                    },
                                },
                            ];
                            var layout = {
                                title: { text: 'Contig Coverage Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx', "categoryorder": "array", "categoryarray": df.toArray('idx') },
                                xaxis: { title: 'Coverage' }
                            }
                            return ({ 'data': data, 'layout': layout })
                        })
                    })
                } else if (entry.title == 'Remap info file') {
                    DataFrame.fromCSV(entry.url).then(df => {
                        var groupedDf = df.groupBy('idx').aggregate((group) => group.count())
                        let tokenLengthCounts = {}
                        df.toArray('token').map(token => { return (token.length) }).forEach(value => {
                            if (tokenLengthCounts[value]) {
                                tokenLengthCounts[value] += 1;
                            } else {
                                tokenLengthCounts[value] = 1;
                            }
                        })
                        let tokenCounts = {}
                        df.toArray('token').forEach(value => {
                            if (tokenCounts[value]) {
                                tokenCounts[value] += 1;
                            } else {
                                tokenCounts[value] = 1;
                            }
                        })
                        const topTokensDict = Object.fromEntries(
                            Object.entries(tokenCounts).sort(([, a], [, b]) => b - a).slice(0, 10)
                        );
                        setTokenCountData(oldData => {
                            var data = [
                                {
                                    type: 'bar',
                                    x: groupedDf.toArray('aggregation'),
                                    y: groupedDf.toArray('idx'),
                                    text: groupedDf.toArray('aggregation'),
                                    orientation: 'h',
                                    marker: {
                                        color: '#cdb4db',
                                    },
                                },
                            ];
                            var layout = {
                                title: { text: 'Contig Token Count Plot' },
                                yaxis: { showticklabels: true, type: 'category', title: 'Contig Idx', "categoryorder": "array", "categoryarray": groupedDf.toArray('idx') },
                                xaxis: { title: 'Token Count' }
                            }
                            return ({ 'data': data, 'layout': layout })
                        })
                        setTokenLengthCountData(oldData => {
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
                            return ({ 'data': data, 'layout': layout })
                        })
                        setTopTokenCountData(oldData => {
                            var data = [
                                {
                                    type: 'bar',
                                    x: Object.entries(topTokensDict).map(([key, value]) => (value)),
                                    y: Object.entries(topTokensDict).map(([key, value]) => (key)),
                                    text: Object.entries(topTokensDict).map(([key, value]) => (value)),
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
                            return ({ 'data': data, 'layout': layout })
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
            <Plot
                data={geneData}
                layout={{ xaxis: { title: 'Count' }, yaxis: { title: 'Gene Name' } }}
            >
            </Plot>
            <h2 className="text-3xl font-extrabold dark:text-white flex items-center justify-center">AMR Mechanisms</h2>
            <Plot data={amrClassData}></Plot>
            <h2 className="text-3xl font-extrabold dark:text-white flex items-center justify-center">FASTA Info</h2>
            <Plot
                data={fastaSummaryData.data}
                layout={fastaSummaryData.layout}
            >
            </Plot>
            <Plot
                data={fastaLengthData.data}
                layout={fastaLengthData.layout}
            >
            </Plot>
            <Plot
                data={fastaCoverageData.data}
                layout={fastaCoverageData.layout}
            >
            </Plot>
            <h2 className="text-3xl font-extrabold dark:text-white flex items-center justify-center">Remap Info</h2>
            <Plot
                data={tokenCountData.data}
                layout={tokenCountData.layout}
            >
            </Plot>
            <Plot
                data={tokenLengthCountData.data}
                layout={tokenLengthCountData.layout}
            >
            </Plot>
            <Plot
                data={topTokenCountData.data}
                layout={topTokenCountData.layout}
            >
            </Plot>
        </div>
    )
}

export default GenomicSummary;
