import * as React from 'react';
import { useTheme } from '@mui/material';
import { Stack, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { BarChart as XBarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

// Dummy value formatter (adjust as needed)
const valueFormatter = (value) => Math.round(value);

function TickParamsSelector({
  tickPlacement,
  tickLabelPlacement,
  setTickPlacement,
  setTickLabelPlacement,
}) {
  return (
    <Stack direction="column" justifyContent="space-between" sx={{ width: '100%' }}>
      {/* <FormControl>
        <FormLabel id="tick-placement-radio-buttons-group-label">tickPlacement</FormLabel>
        <RadioGroup
          row
          aria-labelledby="tick-placement-radio-buttons-group-label"
          name="tick-placement"
          value={tickPlacement}
          onChange={(event) => setTickPlacement(event.target.value)}
        >
          <FormControlLabel value="start" control={<Radio />} label="start" />
          <FormControlLabel value="end" control={<Radio />} label="end" />
          <FormControlLabel value="middle" control={<Radio />} label="middle" />
          <FormControlLabel value="extremities" control={<Radio />} label="extremities" />
        </RadioGroup>
      </FormControl> */}
      {/* <FormControl>
        <FormLabel id="label-placement-radio-buttons-group-label">tickLabelPlacement</FormLabel>
        <RadioGroup
          row
          aria-labelledby="label-placement-radio-buttons-group-label"
          name="label-placement"
          value={tickLabelPlacement}
          onChange={(event) => setTickLabelPlacement(event.target.value)}
        >
          <FormControlLabel value="tick" control={<Radio />} label="tick" />
          <FormControlLabel value="middle" control={<Radio />} label="middle" />
        </RadioGroup>
      </FormControl> */}
    </Stack>
  );
}

export default function UserCountBarChart() {
  const theme = useTheme();
  const [tickPlacement, setTickPlacement] = React.useState('middle');
  const [tickLabelPlacement, setTickLabelPlacement] = React.useState('middle');
  const [data, setData] = React.useState([]);
  const [year, setYear] = React.useState(new Date().getFullYear()); // Default to current year
  const [availableYears, setAvailableYears] = React.useState([2023, 2024]); // Placeholder, replace with your years dynamically

  React.useEffect(() => {
    axios
      .post("/api/auth/countUser", { year })  // Replace with your actual API endpoint
      .then((response) => {
        const monthlyUserData = response.data; // Assuming response is an array of objects with { month, totalUsers }

        // Format the data for @mui/x-charts BarChart
        const formattedData = monthlyUserData.map(item => ({
          month: `Month ${item.month}`,  // Convert month to string format
          users: item.totalUsers,        // The user count for the bar chart
        }));

        setData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching user count data:", error);
      });
  }, [year]);

  // const chartSetting = {
  //   yAxis: [
  //     {
  //       label: 'User Count',
  //     },
  //   ],
  //   series: [{ dataKey: 'users', label: 'Account Created', valueFormatter }],
  //   height: 300,
  //   sx: {
  //     [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
  //       transform: 'translateX(-10px)',
  //     },
  //   },
  // };
  // Fixed chart height
  const chartHeight = 300; // Fixed height for the chart (adjust as needed)

  // Maximum number of users (this is to scale the bars appropriately, you can adjust this based on your data range)
  const maxUserCount = Math.max(...data.map(item => item.users), 1);

  // Scale the bars proportionally (you can adjust this scaling factor as needed)
  const scaleFactor = chartHeight / maxUserCount;

  const chartSetting = {
    yAxis: [
      {
        label: "User Count",
        valueFormatter: (value) => value.toFixed(0), // Ensure integer values on the Y-axis
      },
    ],
    series: [
      {
        dataKey: "users",
        label: "Account Created",
        valueFormatter: (value) => value.toFixed(0), // Display the user count as an integer
        barHeight: (data) => data.users * scaleFactor, // Apply scaleFactor to each bar's height
      },
    ],
    height: chartHeight, // Fixed height for the entire chart
    sx: {
      [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
        transform: "translateX(-10px)",
      },
    },
  };


  return (
    <div style={{ width: '100%' }}>
      {/* <TickParamsSelector
        tickPlacement={tickPlacement}
        tickLabelPlacement={tickLabelPlacement}
        setTickPlacement={setTickPlacement}
        setTickLabelPlacement={setTickLabelPlacement}
      /> */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        {/* </FormControl> */}
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">Year</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={year}
            // onChange={handleChange}
            onChange={(event) => setYear(event.target.value)}

            label="Year"
          >
            {availableYears.map((yr) => (
              <MenuItem key={yr} value={yr}>
                {yr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <XBarChart
        dataset={data}  // Pass the dynamic data here
        xAxis={[
          { scaleType: 'band', dataKey: 'month', tickPlacement, tickLabelPlacement },
        ]}
        {...chartSetting}
      />
    </div>
  );
}
