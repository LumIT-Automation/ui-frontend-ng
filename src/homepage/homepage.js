import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ResponsiveContainer } from 'recharts';

import "antd/dist/antd.css"

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setDevices, setDevicesLoading, setDevicesError } from '../_store/store.fortinetdb'

//import List from './list'
import AmericanPie from './pieChart'
import Victory from './victory'
import Map from './maps'
import Firmware from './firmwaresWidget'

import { Spin, Card, Row, Col, Table } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



class Homepage extends React.Component {

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
    this.fetchDevices()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {

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

/*
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

*/

fetchDevices = async () => {
  this.props.dispatch(setDevicesLoading(true))
  let rest = new Rest(
    "GET",
    resp => {
      this.props.dispatch(setDevices(resp))
    },
    error => {
      this.props.dispatch(setDevicesError(error))
    }
  )
  await rest.doXHR(`fortinetdb/devices/`, this.props.token)
  this.props.dispatch(setDevicesLoading(false))
}



  render() {

    return (
      <React.Fragment>

        { this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
          :
          <React.Fragment>
            { this.props.devices ?
              <React.Fragment>

                <Row >
                  <Col span={4}>
                    <Card title={<p style={{textAlign: 'center'}}>Cert Expirations</p>} bordered={false}>
                      <Table scroll={{x: 'auto'}}/>
                    </Card>
                  </Col>
                  <Col offset={1} span={4}>
                    <Card title={<p style={{textAlign: 'center'}}>CVE Bulletin</p>} bordered={false}>
                      <Table scroll={{x: 'auto'}}/>
                    </Card>
                  </Col>
                  <Col offset={1} span={4}>
                    <Card title={<p style={{textAlign: 'center'}}>Logs</p>} bordered={false}>
                      <Table scroll={{x: 'auto'}}/>
                    </Card>
                  </Col>
                  <Col offset={1} span={9}>
                    <Card title={<p style={{textAlign: 'center'}}>History</p>} bordered={false}>
                      <Table scroll={{x: 'auto'}}/>
                    </Card>
                  </Col>
                </Row>

                <hr/>

                <Row>
                  <Col span={18}>
                    <Row>
                      <Col span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={3}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                    </Row>
                    <br/>
                    <Row>
                      <Col span={4}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={1} span={4}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col offset={1} span={4}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={1} span={4}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col offset={1} span={4}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                    </Row>
                    <br/>
                    <Row>
                      <Col span={6}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={6}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={0} span={6}>
                        <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                          <Victory/>
                        </Card>
                      </Col>
                    </Row>
                  </Col>


                  <Col offset={0} span={6}>
                  <Card title={<p style={{textAlign: 'center'}}>Region</p>} bordered={true}>
                    <Map />
                  </Card>
                  </Col>
                </Row>


              </React.Fragment>
              :
              null
            }
          </React.Fragment>
        }
      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  devices: state.fortinetdb.devices,
}))(Homepage);
