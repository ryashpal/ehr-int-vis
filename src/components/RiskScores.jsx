import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';

import Plot from 'react-plotly.js';

import readData from '../services/FHIRUtils.js'


function RiskScore() {

    function refreshData() {
        readData('http://10.172.235.4:8080/fhir/RiskAssessment?subject=P2115118').then(response => {
            response.map(resourceBundle => {
                if (resourceBundle.entry) {
                    resourceBundle.entry.map(entry => {
                        let targetTime = parseInt(JSON.parse(entry.resource.note[0].text.replaceAll("'", '"'))['targetTime'].split(' ')[0])
                        let newData = [
                            {
                                name: '7 Day Mortality',
                                x: ['0 Day', '1 Day', '2 Day', '3 Day'],
                                y: [null, null, null, null],
                                mode: 'lines+markers',
                                connectgaps: true
                            },
                            {
                                name: '14 Day Mortality',
                                x: ['0 Day', '1 Day', '2 Day', '3 Day'],
                                y: [null, null, null, null],
                                mode: 'lines+markers',
                                connectgaps: true
                            },
                            {
                                name: '30 Day Mortality',
                                x: ['0 Day', '1 Day', '2 Day', '3 Day'],
                                y: [null, null, null, null],
                                mode: 'lines+markers',
                                connectgaps: true
                            }
                        ]
                        if (targetTime == 7) {
                            setData(oldData => {
                                let updatedRow0 = oldData[0].y
                                let updatedRow1 = oldData[1].y
                                let updatedRow2 = oldData[2].y
                                updatedRow0[parseInt(JSON.parse(entry.resource.note[0].text.replaceAll("'", '"'))['windowAfter'].split(' ')[0])] = entry.resource.prediction[0].probabilityDecimal
                                newData[0].y = updatedRow0
                                newData[1].y = updatedRow1
                                newData[2].y = updatedRow2
                                return newData
                            })
                        } 
                        if(targetTime == 14){
                            setData(oldData => {
                                let updatedRow0 = oldData[0].y
                                let updatedRow1 = oldData[1].y
                                let updatedRow2 = oldData[2].y
                                updatedRow1[parseInt(JSON.parse(entry.resource.note[0].text.replaceAll("'", '"'))['windowAfter'].split(' ')[0])] = entry.resource.prediction[0].probabilityDecimal
                                newData[0].y = updatedRow0
                                newData[1].y = updatedRow1
                                newData[2].y = updatedRow2
                                return newData
                            })
                        }
                        if(targetTime == 30){
                            setData(oldData => {
                                let updatedRow0 = oldData[0].y
                                let updatedRow1 = oldData[1].y
                                let updatedRow2 = oldData[2].y
                                updatedRow2[parseInt(JSON.parse(entry.resource.note[0].text.replaceAll("'", '"'))['windowAfter'].split(' ')[0])] = entry.resource.prediction[0].probabilityDecimal
                                newData[0].y = updatedRow0
                                newData[1].y = updatedRow1
                                newData[2].y = updatedRow2
                                return newData
                            })
                        }
                    })
                }
            })
        })
    }

    const [data, setData] = useState([
        {
            name: '7 Day Mortality',
            x: ['0 Day', '1 Day', '2 Day', '3 Day'],
            y: [null, null, null, null],
            mode: 'lines+markers',
            connectgaps: true
        },
        {
            name: '14 Day Mortality',
            x: ['0 Day', '1 Day', '2 Day', '3 Day'],
            y: [null, null, null, null],
            mode: 'lines+markers',
            connectgaps: true
        },
        {
            name: '30 Day Mortality',
            x: ['0 Day', '1 Day', '2 Day', '3 Day'],
            y: [null, null, null, null],
            mode: 'lines+markers',
            connectgaps: true
        }
    ]);

    useEffect(() => {
        refreshData()
    }, []);

    return (
        <Box m={2} p={2}>
            <p className='font-black'>Risk Scores</p>
            <Plot data={data} layout={{ width: 800, height: 400 }}></Plot>
        </Box>
    )
}

export default RiskScore;
