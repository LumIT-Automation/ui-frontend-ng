import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie } from "recharts";

export default class Torta extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
     
    this.dammiFirmware()
  }

  dammiFirmware = () => {
    let firmwares = []
    let list = []

    this.props.devices.forEach((item, i) => {
      firmwares.push(item.FIRMWARE)
    })




    this.setState({firmwares: firmwares})
  }

  firmware = f => {
    this.setState({firmware: f}, () => {})
  }

  render() {

     
     

    const renderCustomizedLabel = ( {x, y, firmware, fill, cx, cy} ) => {
       
      return <text x={x} y={y} fill={fill} fontSize={15} textAnchor={x > cx ? 'start' : 'end'}>{firmware}</text>
      //return firmware
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

    const data = [
      { firmware: "v6.4.3 build1778 (GA)", value: 4, fill:"#0088FE" },
      { firmware: "9.0", value: 2, fill:"#00C49F" }
    ]

    return (
      <ResponsiveContainer>
        <React.Fragment>
          <PieChart width={this.props.w} height={this.props.h}>
             <Pie
               dataKey="value"
               startAngle={0}
               endAngle={360}
               data={data}
               cx={"40%"}
               cy={this.props.h / 2}
               outerRadius={50}
               fill="#8884d8"

               label={e => renderCustomizedLabel(e)}
               onClick={e => alert(e.firmware)}
               onMouseOver={e => this.firmware(e.firmware)}
             >
             <Tooltip content={<p>ciao</p>}/>
             </Pie>
           </PieChart>
         </React.Fragment>
      </ResponsiveContainer>
    )
  }
}
