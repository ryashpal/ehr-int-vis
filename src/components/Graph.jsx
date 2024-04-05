/* eslint-disable no-unused-vars */

import "../styles/Graph.css";

import React from "react";
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

import data from '../services/Measurements.js'

const useStyles = makeStyles(() => ({
  paper: {
    backgroundColor: "#fff",
    color: "#FFFFFF",
    margin: "3%",
    "&:hover": {
      border: "3px dotted #77A6F7",
      color: "#77A6F7",
      background: "#fff",
    },
  },
  formControl: {
    margin: "1%",
    minWidth: 120,
  },
}));

function Graph() {
  const classes = useStyles();

  const [state, setState] = React.useState({
    region: "",
  });

  const handleChange = (event) => {
    const { value } = event.target;
    setState({
      region: value,
    });
  };


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
                <MenuItem value="Temperature">Temperature</MenuItem>
                <MenuItem value="Systolic BP">Systolic BP</MenuItem>
                <MenuItem value="Diastolic BP">Diastolic BP</MenuItem>
                <MenuItem value="Pulse rate">Pulse rate</MenuItem>
                <MenuItem value="Respiration rate">Respiration rate</MenuItem>
              </Select>
            </FormControl>
            <ResponsiveContainer height={250} width={500}>
              <LineChart
                width={500}
                height={300}
                data={data().filter((x) => x.region === state.region)}
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
                  dataKey="vitals"
                  stroke="#003366"
                  activeDot={{ r: 8 }}
                />
                {/* <Line type="monotone" dataKey="storage" stroke="#00887A" /> */}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        {/* </Grid> */}
      {/* </Grid> */}
    </div>
  );
}

export default Graph;
