import React, { useState, useEffect } from 'react';

import { format, addDays } from 'date-fns';

import Box from '@mui/material/Box';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import DataFrame from 'dataframe-js';

import { DateRangePicker } from 'react-date-range';

import Plot from 'react-plotly.js';

import readData from '../utils/FHIRUtils.js'


function AMRRiskScores() {

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
  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);

  function mergeData(oldX, oldY, groupedDf) {
    // console.log('groupedDf: ', groupedDf)
    if (!oldX || !oldY || (oldX.length == 0) || (oldY.length == 0)) {
      // console.log('inside')
      groupedDf = groupedDf.filter(row => row.get('type') !== 'NA');
      return [groupedDf.select('count').toArray().flat(), groupedDf.select('type').toArray().flat()]
    }
    var oldDf = new DataFrame({ 'column1': oldY, 'column2': oldX }, ['type', 'count'])
    // console.log('oldDf: ', oldDf)
    var unionDf = groupedDf.union(oldDf).groupBy('type').aggregate(group => group.stat.sum('count')).renameAll(['type', 'count']).sortBy('count', true)
    unionDf = unionDf.filter(row => row.get('type') !== 'NA');
    // console.log('unionDf: ', unionDf)
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
      readData('http://10.172.235.4:8080/fhir/Encounter?date=ge' + format(dates[0].startDate, "yyyy-MM-dd") + '&date=le' + format(dates[0].endDate, "yyyy-MM-dd")).then(response => {
        let patientIds = new Set();
        response.map(resourceBundle => {
          if (resourceBundle.entry) {
            resourceBundle.entry.map(entry => {
              patientIds.add(entry.resource.subject.reference.substring(9,))
            })
          }
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


  const handleDateChange = (item) => {
    console.log('Date Changed: ', item);
    setDates([item.selection])
    refreshData();
  };

  useEffect(() => {
    refreshData()
  }, []);

  return (
    <>
      <div className="flex-col items-center grid-cols-1">
        <div className="flex items-center">
          <Box m={2} p={2} sx={{ width: 800 }}>
            <span>Admission Dates</span>
            <DateRangePicker
              onChange={handleDateChange}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={3}
              ranges={dates}
              direction="horizontal"
            />;
          </Box>
        </div>
        <div className="flex items-center">
          <Plot data={geneData}></Plot>
        </div>
        <div className="flex items-center">
          <Plot data={amrClassData}></Plot>
        </div>
      </div>
    </>
  );
}

export default AMRRiskScores;
