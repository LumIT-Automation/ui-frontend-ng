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
    this.fetchDevices()
    this.fetchDdosses()
    this.fetchProjects()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }


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

  fetchDdosses = async () => {
    this.props.dispatch(setDdossesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setDdosses(resp))
      },
      error => {
        this.props.dispatch(setDdossesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/ddosses/`, this.props.token)
    this.props.dispatch(setDdossesLoading(false))
  }

  fetchProjects = async () => {
    this.props.dispatch(setProjectsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setProjects(resp))
      },
      error => {
        this.props.dispatch(setProjectsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/`, this.props.token)
    this.props.dispatch(setProjectsLoading(false))
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
  ddosses: state.fortinetdb.ddosses,
  projects: state.fortinetdb.projects,

  devicesLoading: state.fortinetdb.devicesLoading,
  ddossesLoading: state.fortinetdb.ddossesLoading,
  projectsLoading: state.fortinetdb.projectsLoading,

  devicesError: state.fortinetdb.devicesError,
  ddossesError: state.fortinetdb.ddossesError,
  projectsError: state.fortinetdb.projectsError,
}))(Homepage);
