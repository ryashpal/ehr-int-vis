import React, { useState, useEffect } from 'react';

import { format, addDays } from 'date-fns';

import Box from '@mui/material/Box';

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import DataFrame from 'dataframe-js';

import { DateRangePicker } from 'react-date-range';

import AMRSummaryPlots from './AMRSummaryPlots.jsx';

import readData from '../services/FHIRUtils.js'


function AMRRiskScores() {

  const [dates, setDates] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);
  const [geneData, setGeneData] = useState([{
    'data': [{
      type: 'bar',
      x: [],
      y: [],
      orientation: 'h'
    }],
    'layout': {
      title: { text: 'Genes Count' },
      yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol' },
      xaxis: { title: 'Count' }
    }
  }]);
  const [amrClassData, setAmrClassData] = useState([{
    'data': [{
      type: 'pie',
      values: [],
      labels: [],
    }],
    'layout': {
      title: { text: 'AMR Mechanisms' },
    }
  }]);

  function mergeData(oldX, oldY, groupedDf) {
    if (!oldX || !oldY || (oldX.length == 0) || (oldY.length == 0)) {
      groupedDf = groupedDf.filter(row => row.get('type') !== 'NA');
      return [groupedDf.select('count').toArray().flat(), groupedDf.select('type').toArray().flat()]
    }
    var oldDf = new DataFrame({ 'column1': oldY, 'column2': oldX }, ['type', 'count'])
    var unionDf = groupedDf.union(oldDf).groupBy('type').aggregate(group => group.stat.sum('count')).renameAll(['type', 'count']).sortBy('count', true)
    unionDf = unionDf.filter(row => row.get('type') !== 'NA');
    return [unionDf.select('count').toArray().flat(), unionDf.select('type').toArray().flat()]
  }

  function refreshData() {
    setGeneData([{
      'data': [{
        type: 'bar',
        x: [],
        y: [],
        orientation: 'h'
      }],
      'layout': {
        title: { text: 'Genes Count' },
        yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol' },
        xaxis: { title: 'Count' }
      }
    }])
    setAmrClassData([{
      'data': [{
        type: 'pie',
        values: [],
        labels: [],
      }],
      'layout': {
        title: { text: 'AMR Mechanisms' },
      }
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
              let [newX, newY] = mergeData(oldData[0].data[0].x, oldData[0].data[0].y, geneGroupedDf)
              var data = [{
                type: 'bar',
                x: newX,
                y: newY,
                orientation: 'h',
                marker: {
                  color: '#cdb4db',
                },
              }];
              var layout = {
                title: { text: 'Genes Count' },
                yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol', "categoryorder": "array", "categoryarray": newY },
                xaxis: { title: 'Count' }
              }
              return ([{ 'data': data, 'layout': layout }])
            })
            setAmrClassData(oldData => {
              let [newX, newY] = mergeData(oldData[0].data[0].values, oldData[0].data[0].labels, amrClassGroupedDf)
              var data = [{
                type: 'pie',
                values: newX,
                labels: newY,
                marker: {
                  colors: [
                    '#FDE4CF',
                    '#FFCFD2',
                    '#F1C0E8',
                    '#CFBAF0',
                    '#A3C4F3',
                    '#90DBF4',
                    '#8EECF5',
                    '#98F5E1',
                    '#B9FBC0',
                    '#FBF8CC',
                  ]
                },
              }];
              var layout = {
                title: { text: 'AMR Mechanisms' },
              }
              return ([{ 'data': data, 'layout': layout }])
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
            />
          </Box>
        </div>
        <AMRSummaryPlots geneData={geneData[0]} amrClassData={amrClassData[0]}></AMRSummaryPlots>
      </div>
    </>
  );
}

export default AMRRiskScores;
