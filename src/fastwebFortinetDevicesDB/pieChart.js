import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie } from "recharts";

export default class Torta extends PureComponent {

  render() {

    const renderCustomizedLabel = ( {x, y, name} ) => {
      return name
    }

    const data = [
    { name: "FortiGate-10E", value: 4, fill:"#AAA718" },
    { name: "FortiGate-20E", value: 3, fill:"AAA415" },
    { name: "FortiGate-300E", value: 8, fill:"#AAA112"},
    { name: "FortiGate-4000E", value: 20, fill:"#AAA789" },
    { name: "FortiGate-20000E", value: 8, fill:"#000456" },
    { name: "FortiGate-9000E", value: 89, fill:"#000123" }
    ];

    return (
      <ResponsiveContainer width={this.props.w} height={this.props.h}>
        <PieChart>
           <Pie
             dataKey="value"
             startAngle={0}
             endAngle={360}
             data={data}
             cx={this.props.w / 100 * 40}
             cy={this.props.h / 2}
             outerRadius={80}
             fill="#8884d8"
             label={e => renderCustomizedLabel(e)}
             onClick={e => alert(e.name)}
           />
         </PieChart>
      </ResponsiveContainer>
    )
  }
}
