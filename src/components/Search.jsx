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

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import readData from '../services/FHIRUtils.js'


function Demographics() {

    const [name, setName] = useState("");
    const [score, setScore] = useState([0.95, 1.00]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [rows, setRows] = useState([]);
    const [anchorPlotEl, setAnchorPlotEl] = useState(null);
    const [anchorExportEl, setAnchorExportEl] = useState(null);
    const openPlot = Boolean(anchorPlotEl);
    const openExport = Boolean(anchorExportEl);

    function createData(name, gender, integratedSummary, integratedData) {
        return { name, gender, integratedSummary, integratedData };
    }

    function refreshData() {
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

    const handlePlotMenuClick = (event) => {
        setAnchorPlotEl(event.currentTarget);
    };

    const handlePlotMenuClose = () => {
        setAnchorPlotEl(null);
    };

    const handleExportMenuClick = (event) => {
        setAnchorExportEl(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setAnchorExportEl(null);
    };

    return (
        <div className='h-full w-full justify-center items-center'>
            <form className="mt-4 mx-auto w-full py-2 px-2 rounded-lg bg-gray-50 border flex focus-within:border-gray-300" onSubmit={handleSubmit}>
                <div className='h-full w-full justify-center items-center'>
                    <div className="grid gap-2 mt-2 mb-2 grid-cols-8">
                        <div className="flex items-center justify-center">
                            <input type="text" placeholder="Patient ID" className="bg-transparent h-full w-full focus:outline-none pr-4 font-semibold border-2 focus:ring-0 px-0 py-0 rounded-lg" name="name" onInput={handleIdChange} />
                        </div>
                        <div className="flex items-center justify-center col-span-3">
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
                        <div className="flex items-center justify-center col-span-3">
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
                        <div className="flex items-center justify-center">
                            <button
                                value={name}
                                className="w-[130px] px-4 rounded-lg font-medium tracking-wide border disabled:cursor-not-allowed disabled:opacity-50 transition ease-in-out duration-150 text-base bg-blue-500 text-white font-medium tracking-wide border-transparent py-1.5 h-[38px] -mr-3"
                            >
                                SEARCH
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-2 mt-2 mb-2 grid-cols-6">
                        <div className="flex items-center col-span-4">
                            <Box m={2} p={2} sx={{ width: 1200 }}>
                            <span>Risk Score Range</span>
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
                        <div className="flex items-center justify-end">
                            <Button
                                id="plot-button"
                                variant="contained"
                                aria-controls={openPlot ? 'plot-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={openPlot ? 'true' : undefined}
                                onClick={handlePlotMenuClick}
                                style={{
                                    borderRadius: 7,
                                    backgroundColor: "#3b82f6",
                                }}
                            >
                                Plots<span className='pl-2'><svg fill="#ffffff" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333 c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333 z"></path> <path d="M347.582,198.248L256,289.83l-91.582-91.582c-8.331-8.331-21.839-8.331-30.17,0c-8.331,8.331-8.331,21.839,0,30.17 l106.667,106.667c8.331,8.331,21.839,8.331,30.17,0l106.667-106.667c8.331-8.331,8.331-21.839,0-30.17 C369.42,189.917,355.913,189.917,347.582,198.248z"></path> </g> </g> </g> </g></svg></span>
                            </Button>
                            <Menu
                                id="plot-menu"
                                anchorEl={anchorPlotEl}
                                open={openPlot}
                                onClose={handlePlotMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'plot-button',
                                }}
                            >
                                <MenuItem component='a' href={'#/AMRSummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>AMR Summary</MenuItem>
                                <MenuItem component='a' href={'#/FASTASummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>FASTA Summary</MenuItem>
                                <MenuItem component='a' href={'#/RemapSummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>Remap Summary</MenuItem>
                            </Menu>
                        </div>
                        <div className="flex items-center justify-end">
                            <Button
                                id="export-button"
                                variant="contained"
                                aria-controls={openExport ? 'export-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={openExport ? 'true' : undefined}
                                onClick={handleExportMenuClick}
                                style={{
                                    borderRadius: 7,
                                    backgroundColor: "#3b82f6",
                                }}
                            >
                                Export<span className='pl-2'><svg fill="#ffffff" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <g> <path d="M256,0C114.618,0,0,114.618,0,256s114.618,256,256,256s256-114.618,256-256S397.382,0,256,0z M256,469.333 c-117.818,0-213.333-95.515-213.333-213.333S138.182,42.667,256,42.667S469.333,138.182,469.333,256S373.818,469.333,256,469.333 z"></path> <path d="M347.582,198.248L256,289.83l-91.582-91.582c-8.331-8.331-21.839-8.331-30.17,0c-8.331,8.331-8.331,21.839,0,30.17 l106.667,106.667c8.331,8.331,21.839,8.331,30.17,0l106.667-106.667c8.331-8.331,8.331-21.839,0-30.17 C369.42,189.917,355.913,189.917,347.582,198.248z"></path> </g> </g> </g> </g></svg></span>
                            </Button>
                            <Menu
                                id="export-menu"
                                anchorEl={anchorExportEl}
                                open={openExport}
                                onClose={handleExportMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'export-button',
                                }}
                            >
                                <MenuItem component='a' href={'#/AMRSummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>EHR</MenuItem>
                                <MenuItem component='a' href={'#/FASTASummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>Genomics</MenuItem>
                                <MenuItem component='a' href={'#/RemapSummary?name=' + name + '&lowerRiskScore=' + score[0] + '&higherRiskScore=' + score[1] + '&fromDate=' + ((fromDate == null) ? '' : fromDate.format('YYYY-MM-DD')) + '&toDate=' + ((toDate == null) ? '' : toDate.format('YYYY-MM-DD'))}>EHR + Genomics</MenuItem>
                            </Menu>
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
                                    <a href={row.integratedSummary} className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs m-2 px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                        Data Summary
                                    </a>
                                    <a href={row.integratedData} className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs m-2 px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
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
