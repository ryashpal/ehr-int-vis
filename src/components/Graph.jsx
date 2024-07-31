import "../styles/Graph.css";

import React, { useEffect, useState } from "react";

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

import readData from '../services/FHIRUtils.js'

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

function Graph(params) {

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

  function refreshData() {
    readData('http://10.172.235.4:8080/fhir/Observation?subject=' + params.patientId + '&_sort=date&_offset=0&_count=20').then(responses => {
      const result = [];
      for (let response of responses) {
        if ('entry' in response) {
          for (let entry of response.entry) {
            let obj = {
              region: entry.resource.code.text,
              date: entry.resource.effectiveDateTime,
              value: entry.resource.valueQuantity.value,
            };
            result.push(obj);
          }
        }
      }
      setData(result)
    })
  }


  useEffect(() => {
    refreshData()
  }, []);

  if (data) {

    let menuOptions = new Set()
    data.map(element => (
      menuOptions.add(element.region)
    ))

    return (
      <div className="Graph">
        <Paper className={classes.paper}>
          <FormControl className={classes.formControl}>
            <InputLabel>Select Vital</InputLabel>
            <Select
              value={state.region}
              id="regionSelector"
              name="region"
              onChange={handleChange}
            >
              {[...menuOptions].map(menuOption => (
                <MenuItem key={menuOption} value={menuOption}>{menuOption}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
          </LineChart>
        </Paper>
      </div>
    );
  }
}

export default Graph;
