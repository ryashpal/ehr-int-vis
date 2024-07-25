import readData from '../services/FHIRUtils.js'
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


function PatientRiskScores() {

  const [value, setValue] = useState([0.9, 0.95]);
  const [data, setData] = useState([]);

  function createData(
    id,
    patient_id,
    date,
    score,
    desciption,
  ) {
    return { id, patient_id, date, score, desciption };
  }

  function refreshData() {
    readData('http://10.172.235.4:8080/fhir/RiskAssessment?probability=ge' + value[0] + '&probability=le' + value[1]).then(response => {
      const rows = [
      ];
      response.map(resourceBundle => {
        resourceBundle.entry.map(entry => {
          rows.push(createData(entry.resource.id, entry.resource.subject.reference, entry.resource.occurrenceDateTime, entry.resource.note[0].text, entry.resource.prediction[0].probabilityDecimal))
        })
      })
      setData(rows)
    })
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
    refreshData();
  };

  useEffect(() => {
    refreshData()
  }, []);

  return (
    <>
      <div className="flex-col items-center grid-cols-1">
        <div className="flex items-center col-span-1">
          <Box m={4} p={4} sx={{ width: 1200 }}>
            <span>Risk Score Range</span>
            <Slider
              getAriaLabel={() => 'Risk Score Range'}
              value={value}
              onChange={handleChange}
              valueLabelDisplay="on"
              min={0}
              max={1}
              step={0.01}
              marks={true}
            />
          </Box>
        </div>
        <div className="flex items-center col-span-1">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Patient ID</TableCell>
                  <TableCell align="right">Date</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell align="right">{row.patient_id}</TableCell>
                    <TableCell align="right">{row.date}</TableCell>
                    <TableCell align="right">{row.desciption}</TableCell>
                    <TableCell align="right">{row.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
}

export default PatientRiskScores;
