import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ResponsiveContainer } from 'recharts';

import "antd/dist/antd.css"

import Rest from "../_helpers/Rest"
import Error from '../error'

import {
  setDevices,
  setDevicesLoading,
  setDevicesError,

  setDdosses,
  setDdossesLoading,
  setDdossesError,

  setProjects,
  setProjectsLoading,
  setProjectsError,
} from '../_store/store.fortinetdb'

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
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }


  render() {

    return (
      <React.Fragment>
        { this.props.devicesLoading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
          :
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

            { this.props.devices ?
              <React.Fragment>
                <Row>
                  <Col span={17}>
                    <Row>
                      <Col span={10}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmware</p>} bordered={true}>
                          <Firmware/>
                        </Card>
                      </Col>
                      <Col offset={1} span={10}>
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
  ddosses: state.fortinetdb.ddosses,
  projects: state.fortinetdb.projects,

  devicesLoading: state.fortinetdb.devicesLoading,
  ddossesLoading: state.fortinetdb.ddossesLoading,
  projectsLoading: state.fortinetdb.projectsLoading,

  devicesError: state.fortinetdb.devicesError,
  ddossesError: state.fortinetdb.ddossesError,
  projectsError: state.fortinetdb.projectsError,
}))(Homepage);
