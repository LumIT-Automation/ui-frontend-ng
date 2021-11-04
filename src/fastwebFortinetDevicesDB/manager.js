import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ResponsiveContainer } from 'recharts';

import "antd/dist/antd.css"

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'

import List from './list'
import AmericanPie from './pieChart'

import { Spin, Card, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null,
      monitorFullList: []
    };
  }

  componentDidMount() {
    console.log('mount kkk')
    //this.ullalla()
    this.fetchDevices()
    //this.ullalla()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('update kkk')
  }

  componentWillUnmount() {
  }

/*

import "./styles.css";
import React from "react";
import { PieChart, Pie } from "recharts";

const renderCustomizedLabel = ({
x, y, name
}) => {
return name
};

const data = [
{ name: "FortiGate-10E", value: 4, fill:"#AAA718" },
{ name: "FortiGate-20E", value: 3, fill:"AAA415" },
{ name: "FortiGate-300E", value: 8, fill:"#AAA112"},
{ name: "FortiGate-4000E", value: 20, fill:"#AAA789" },
{ name: "FortiGate-20000E", value: 8, fill:"#000456" },
{ name: "FortiGate-9000E", value: 89, fill:"#000123" }
];

export default function App() {
return (
  <PieChart width={400} height={400}>
    <Pie
      dataKey="value"
      startAngle={0}
      endAngle={360}
      data={data}
      cx={200}
      cy={200}
      outerRadius={80}
      fill="#8884d8"
      label={renderCustomizedLabel}
      onClick={e => alert(e.name)}
    />
  </PieChart>
);
}


*/


  ullalla = () => {
    let list = [        "SERIALE",
        "ID_PROGETTO",
        "MODELLO",
        "FIRMWARE",
        "DESCRIZIONE",
        "HA",
        "VDOM",
        "IP_MGMT",
        "PORT_MGMT",
        "REVERSE",
        "INDIRIZZO",
        "POSIZIONE",
        "KEYMAKER",
        "USERADMIN",
        "PUBLIC_NET",
        "CODICE_SERVIZIO",
        "NOTE_APPARATO",
        "ASSISTENZA",
        "PROFILO",
        "ATTIVAZIONE_ANNO",
        "ATTIVAZIONE_MESE",
        "DISK_STATUS",
        "AUTENTICAZIONE",
        "SERVIZI",
        "ADDURL_MGMT",
        "SNMP_COMMUNITY",
        "SNMP_PORT",
        "STATUS_APPARATO",
        "BACKUP_SCRIPT",
        "BACKUP_STATUS",
        "BACKUP_TSTAMP",
        "BACKUP_CHECKSUM",
        "comune",
        "provincia",
        "targa",
        "regione",
        "extra_data"]

    let out = []

    list.forEach(i => {
      let o = {
        title: `${i}`,
        align: `center`,
        width: 'auto',
        dataIndex: `${i}`,
        key: `${i}`,
        cippa: `...this.getColumnSearchProps('${i}')`,
      }
      out.push(o)
    })


  }




  fetchDevices = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false, devices: resp.data})
      },
      error => {
        this.setState({loading: false, success: false})
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/`, this.props.token)
  }

  renderCustomizedLabel = ( x ) => {
    console.log(x)
    //return name
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {




    return (
      <React.Fragment>

        { this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
          :
          <React.Fragment>
            { this.state.devices ?
              <React.Fragment>
                <Row>
                    <Col offset={1} span={6}>

                    <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={false}>
                      <AmericanPie w={350} h={200}/>
                    </Card>
                  </Col>
                </Row>
                <Row style={{marginTop: '50px'}}>
                  <Col>
                    <List devices={this.state.devices}/>
                  </Col>
                </Row>
              </React.Fragment>
              :
              null
            }
          </React.Fragment>
        }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors,
  monitorsFetch: state.f5.monitorsFetch
}))(Manager);
