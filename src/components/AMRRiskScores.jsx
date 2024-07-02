import readData from '../utils/FHIRUtils.js'
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

import DataFrame from 'dataframe-js';

import Plot from 'react-plotly.js';


function AMRRiskScores() {

  const [value, setValue] = useState([0.92, 0.97]);
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

  function mergeData(oldX, oldY, groupedDf) {
    console.log('groupedDf: ', groupedDf)
    if (!oldX || !oldY || (oldX.length == 0) || (oldY.length == 0)) {
      console.log('inside')
      groupedDf = groupedDf.filter(row => row.get('type') !== 'NA');
      return [groupedDf.select('count').toArray().flat(), groupedDf.select('type').toArray().flat()]
    }
    var oldDf = new DataFrame({'column1': oldY, 'column2': oldX}, ['type', 'count'])
    console.log('oldDf: ', oldDf)
    var unionDf = groupedDf.union(oldDf).groupBy('type').aggregate(group => group.stat.sum('count')).renameAll(['type', 'count']).sortBy('count', true)
    unionDf = unionDf.filter(row => row.get('type') !== 'NA');
    console.log('unionDf: ', unionDf)
    return [unionDf.select('count').toArray().flat(), unionDf.select('type').toArray().flat()]
  }

  function refreshData() {
    setGeneData([{
        type: 'bar',
        x: [],
        y: [],
        orientation: 'h'
      }])
      setAmrClassData([{
        type: 'pie',
        values: [],
        labels: [],
      }])
    DataFrame.fromCSV('https://raw.githubusercontent.com/ryashpal/ehr-int-vis/main/genomic_data/index_saur.csv').then(df => {
      readData('http://10.172.235.4:8080/fhir/RiskAssessment?probability=ge' + value[0] + '&probability=le' + value[1]).then(response => {
        let patientIds = new Set();
        response.map(resourceBundle => {
          resourceBundle.entry.map(entry => {
            patientIds.add(entry.resource.subject.reference.substring(9,))
          })
        })
        let mappingDf = df.filter(row => patientIds.has(row.get('PATIENT_ID')));
        mappingDf.map((row) => {
          DataFrame.fromTSV(row.get('amr_file')).then(df => {
            let geneGroupedDf = df.groupBy('Gene symbol').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
            let amrClassGroupedDf = df.groupBy('Class').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
            setGeneData(oldData => {
              let [newX, newY] = mergeData(oldData[0].x, oldData[0].y, geneGroupedDf)
              var data = [{
                type: 'bar',
                x: newX,
                y: newY,
                orientation: 'h'
              }];
              return (data)
            })
            setAmrClassData(oldData => {
              let [newX, newY] = mergeData(oldData[0].values, oldData[0].labels, amrClassGroupedDf)
              var data = [{
                  type: 'pie',
                  values: newX,
                  labels: newY,
                }];
              return (data)
            })
          })
        })
      })
    }
    );
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
      <Plot data={geneData}></Plot>
      <Plot data={amrClassData}></Plot>
    </>
  );
}

export default AMRRiskScores;
