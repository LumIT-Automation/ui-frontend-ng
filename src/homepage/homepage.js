import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { ResponsiveContainer } from 'recharts';

import "antd/dist/antd.css"

import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

import {
  devices,
  devicesLoading,
  devicesError,

  ddosses,
  ddossesLoading,
  ddossesError,

  projects,
  projectsLoading,
  projectsError,
} from '../_store/store.fortinetdb'

//import List from './list'
import AmericanPie from './pieChart'
import Victory from './victory'
import Map from './maps'
import Firmwares from './firmwares'

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
    this.main()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {
  }

  main = async () => {
    this.setState({mainLoading: true})
    await this.fetchProjects()
    await this.fetchDevices()
    this.setState({mainLoading: false})
  }

  fetchProjects = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(projects(resp))
        console.log('fetch projects OK')
      },
      error => {
        this.props.dispatch(projectsError(error))
      }
    )
    await rest.doXHR(`fortinetdb/projects/`, this.props.token)
  }

  fetchDevices = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(devices(resp))
        console.log('fetch devices OK')
      },
      error => {
        this.props.dispatch(devicesError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/`, this.props.token)
  }


  render() {
    console.log(this.state.mainLoading)

    return (
      <React.Fragment>
        { this.state.mainLoading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
        :
          <React.Fragment>
            { this.props.projects ?
            <React.Fragment>
              <Row>
                <Col span={17}>
                  <Row>
                    <Col span={10}>
                      <Card title={<p style={{textAlign: 'center'}}>Firmwares</p>} bordered={true}>
                        <Firmwares/>
                      </Card>
                    </Col>
                    <Col offset={1} span={10}>
                      <Card title={<p style={{textAlign: 'center'}}>Environment</p>} bordered={true}>
                        <Victory/>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </React.Fragment>
            :
            null
          }
            { this.props.devices ?
              <React.Fragment>
                <Row>
                  <Col span={17}>
                    <Row>
                      <Col span={10}>
                        <Card title={<p style={{textAlign: 'center'}}>Firmwares</p>} bordered={true}>
                          <Firmwares/>
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

        { this.props.devicesError ? <Error component={'homepage'} error={[this.props.devicesError]} visible={true} type={'devicesError'} /> : null }
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
