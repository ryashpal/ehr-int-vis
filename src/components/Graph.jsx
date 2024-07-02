/* eslint-disable no-unused-vars */

import "../styles/Graph.css";

import React, { useState } from "react";

import {
  makeStyles,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Paper,
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const useStyles = makeStyles(() => ({
  paper: {
    backgroundColor: "#fff",
    color: "#FFFFFF",
  },
  formControl: {
    margin: "1%",
    minWidth: 120,
  },
}));

function Graph() {

  const classes = useStyles();

  const [state, setState] = useState({
    region: "",
  });

  const handleChange = (event) => {
    const { value } = event.target;
    setState({
      region: value,
    });
  };


  const [data, setData] = useState(null);

  const result = [];

  function loadData(url) {
    if (!data) {
      const xhr = new XMLHttpRequest();
      console.log('Fetching URL: ', url);
      xhr.open('GET', url);
      xhr.onload = function () {
        if (xhr.status === 200) {
          for (let entry of JSON.parse(xhr.responseText).entry) {
            let obj = {
              region: entry.resource.code.text,
              date: entry.resource.effectiveDateTime,
              value: entry.resource.valueQuantity.value,
            };
            result.push(obj);
          }
          let nextUrl = null
          for (let link of JSON.parse(xhr.responseText).link) {
            if (link.relation == 'next') {
              nextUrl = link.url
            }
          }
          if (nextUrl) {
            loadData(nextUrl)
          } else {
            setData(result)
          }
        }
      };
      xhr.send();
    }
  }


  // var demographicsData = data()
  loadData('http://10.172.235.4:8080/fhir/Observation?subject=P2102099&_sort=date')

  if (data) {

    let menuOptions = new Set()
    data.map(element => (
      menuOptions.add(element.region)
    ))

    return (
      <div className="Graph">
        {/* <Grid container spacing={3}> */}
        {/* <Grid item xs={12} sm={6}> */}
        <Paper className={classes.paper}>
          <FormControl className={classes.formControl}>
            <InputLabel>Select Vital</InputLabel>
            <Select
              value={state.region}
              id="regionSelector"
              name="region"
              onChange={handleChange}
            >
              {/* <MenuItem value={data[0].region}>{data[0].region}</MenuItem>
              <MenuItem value={data[1].region}>{data[1].region}</MenuItem>
              <MenuItem value="Diastolic BP">Diastolic BP</MenuItem>
              <MenuItem value="Pulse rate">Pulse rate</MenuItem>
              <MenuItem value="Respiration rate">Respiration rate</MenuItem> */}
              {[...menuOptions].map(menuOption => (
              <MenuItem value={menuOption}>{menuOption}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <ResponsiveContainer height={250} width={750}> */}
          <LineChart
            width={700}
            height={250}
            data={data.filter((x) => x.region === state.region)}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#003366"
              activeDot={{ r: 8 }}
            />
            {/* <Line type="monotone" dataKey="storage" stroke="#00887A" /> */}
          </LineChart>
          {/* </ResponsiveContainer> */}
        </Paper>
        {/* </Grid> */}
        {/* </Grid> */}
      </div>
    );
  }
}

export default Graph;
