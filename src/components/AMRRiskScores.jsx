import readData from '../utils/FHIRUtils.js'
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import DataFrame from 'dataframe-js';


function AMRRiskScores() {

  const [value, setValue] = useState([0.92, 0.97]);
  const [data, setData] = useState([]);

  DataFrame.fromText('https://raw.githubusercontent.com/ryashpal/EHR-Int-Analysis/main/temp/AH19K081_genome_nlp_tokens_5.sampled.csv').then(df => {
      console.log('Data Frame!!');
      console.log(df);
    }
  );

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
    console.log('change:', newValue);
    setValue(newValue);
    refreshData();
  };

  useEffect(() => {
    refreshData()
  }, []);

  return (
    <>
      <Box  m={4} p={4} sx={{ width: 1200 }}>
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
    </>
  );
}

function createData(
  id,
  patient_id,
  date,
  score,
  desciption,
) {
  return { id, patient_id, date, score, desciption };
}

function loadData() {
}


loadData()

export default AMRRiskScores;
