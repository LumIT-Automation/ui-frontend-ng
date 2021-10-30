import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    "year": "2015",
    "new": 400,
    "dissmissed": 240
  },
  {
    "year": "2016",
    "new": 300,
    "dissmissed": 139
  },
  {
    "year": "2017",
    "new": 600,
    "dissmissed": 200
  },
  {
    "year": "2018",
    "new": 878,
    "dissmissed": 390
  },
  {
    "year": "2019",
    "new": 189,
    "dissmissed": 480
  },
  {
    "year": "2020",
    "new": 239,
    "dissmissed": 380
  },
  {
    "year": "2021",
    "new": 349,
    "dissmissed": 430
  }
]



export default class Histogram extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/c9pL8k61/';

  render() {
    return (
      <React.Fragment>
      <p style={{textAlign: 'center', color: '#8C8C8C'}}>Performance year per year</p>
      {//<ResponsiveContainer width="1000px" height="2000px">
      }
        <BarChart
          width={1070}
          height={250}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="dissmissed" fill="#8884d8" />
          <Bar dataKey="new" fill="#82ca9d" />
        </BarChart>
      {//</ResponsiveContainer>
      }
      </React.Fragment>
    );
  }
}
