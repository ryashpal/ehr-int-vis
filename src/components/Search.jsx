import React, { useState, useEffect } from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


import readData from '../utils/FHIRUtils.js'


function Demographics() {

    const [name, setName] = useState("");
    const [rows, setRows] = useState([]);
    const [score, setScore] = useState([0.99, 1.00]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    function createData(name, gender, integratedSummary, integratedData) {
        return { name, gender, integratedSummary, integratedData };
    }

    function refreshData() {
        console.log('refreshing data!!!')
        readData(
            'http://10.172.235.4:8080/fhir/Patient?name=' + name
            + '&_has:RiskAssessment:subject:probability=ge' + score[0]
            + '&_has:RiskAssessment:subject:probability=le' + score[1]
            + ((fromDate == null) ? '' : '&_has:Encounter:subject:date-start=ge' + fromDate.format('YYYY-MM-DD'))
            + ((toDate == null) ? '' : '&_has:Encounter:subject:date-start=le' + toDate.format('YYYY-MM-DD'))
        ).then(response => {
            var searchResults = []
            response.map((data) => {
                if ('entry' in data) {
                    data.entry.map((entry) => {
                        searchResults.push(
                            createData(
                                entry.resource.name[0].given[0],
                                entry.resource.gender,
                                window.location.origin + '/#/IntegratedSummary/' + entry.resource.id,
                                window.location.origin + '/#/IntegratedData/' + entry.resource.id
                            )
                        )
                    })
                }
            })
            setRows(searchResults)
        })
    }

    function handleIdChange(e) {
        setName(e.target.value);
    }

    const handleScoreChange = (event, newScore) => {
        setScore(newScore);
        // refreshData();
    };

    useEffect(() => {
        refreshData()
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        refreshData()
    }

    return (
        <div className='h-full w-full justify-center items-center'>
            <form className="mt-4 mx-auto w-full py-2 px-2 rounded-lg bg-gray-50 border flex focus-within:border-gray-300" onSubmit={handleSubmit}>
                <div className='h-full w-full justify-center items-center'>
                    <div className="grid gap-2 mt-2 mb-2 grid-cols-6">
                        <div className="flex items-center">
                            <p className="text-base text-gray-900 dark:text-white">Patient ID: </p>
                        </div>
                        <div className="flex items-center">
                            <input type="text" placeholder="Patient ID" className="bg-transparent w-full focus:outline-none pr-4 font-semibold border-2 focus:ring-0 px-0 py-0 rounded-lg" name="name" onInput={handleIdChange} />
                        </div>
                        <div className="flex items-center col-span-4">
                            <Box m={4} p={4} sx={{ width: 1200 }}>
                                <Slider
                                    getAriaLabel={() => 'Risk Score Range'}
                                    value={score}
                                    onChange={handleScoreChange}
                                    valueLabelDisplay="on"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    marks={true}
                                />
                            </Box>
                        </div>
                    </div>
                    <div className="grid gap-2 mt-2 mb-2 grid-cols-6">
                        <div className="flex items-center">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker', 'DatePicker']}>
                                    <DatePicker
                                        label="From Date"
                                        value={fromDate}
                                        onChange={(fromDate) => setFromDate(fromDate)}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div className="flex items-center">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker', 'DatePicker']}>
                                    <DatePicker
                                        label="To Date"
                                        value={toDate}
                                        onChange={(toDate) => setToDate(toDate)}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div className="flex items-center justify-center col-span-2">
                            <button
                                value={name}
                                className="w-[130px] px-4 rounded-lg font-medium tracking-wide border disabled:cursor-not-allowed disabled:opacity-50 transition ease-in-out duration-150 text-base bg-black text-white font-medium tracking-wide border-transparent py-1.5 h-[38px] -mr-3"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient ID</TableCell>
                            <TableCell align="left">Gender</TableCell>
                            <TableCell align="left">Integrated Visualisations</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">{row.gender}</TableCell>
                                <TableCell align="left">
                                    <a href={row.integratedSummary} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs m-2 px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                        Data Summary
                                    </a>
                                    <a href={row.integratedData} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs m-2 px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                        Data Details
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

export default Demographics;
