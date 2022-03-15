import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Card, Row, Col, Divider } from 'antd'

//import List from './list'
import Vendor from '../fortinetdb/widgets/vendor'
import Italia from '../fortinetdb/widgets/italia'

import Servizio from '../fortinetdb/widgets/servizio'
import Segmento from '../fortinetdb/widgets/segmento'

import Firmware from '../fortinetdb/widgets/firmware'
import Modello from '../fortinetdb/widgets/modello'
import BackupStatus from '../fortinetdb/widgets/backupStatus'
import EosFirmware from '../fortinetdb/widgets/eosFirmware'
import EosHardware from '../fortinetdb/widgets/eosHardware'

import Attivazione from '../fortinetdb/widgets/attivazione'



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
      {/*
        <React.Fragment>
          <br/>
          <Divider orientation="left">Devices</Divider>
          <React.Fragment>
            <Row>
              <Col span={17}>
                <Row>
                  <Col offset={8}>
                    <Vendor/>
                  </Col>
                </Row>
                <Divider/>
                <Row>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>FIRMWARE</p>} bordered={true}>
                      <Firmware/>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>MODELLO</p>} bordered={true}>
                      <Modello/>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>BACKUP STATUS</p>} bordered={true}>
                      <BackupStatus/>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>ATTIVAZIONE</p>} bordered={true}>
                      <Attivazione/>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>EOS FIRMWARE</p>} bordered={true}>
                      <EosFirmware/>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>EOS HARDWARE</p>} bordered={true}>
                      <EosHardware/>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col offset={0} span={7}>
                <Card title={<p style={{textAlign: 'center'}}>REGION</p>} bordered={true}>
                  <Italia />
                </Card>
              </Col>
            </Row>
          </React.Fragment>

          <br/>
          <Divider orientation="left">Projects</Divider>
          <React.Fragment>
            <Row>
              <Col span={6}>
                <Card title={<p style={{textAlign: 'center'}}>SERVIZIO</p>} bordered={true}>
                  <Servizio/>
                </Card>
              </Col>
              <Col span={6}>
                <Card title={<p style={{textAlign: 'center'}}>SEGMENTO</p>} bordered={true}>
                  <Segmento/>
                </Card>
              </Col>
            </Row>
          </React.Fragment>
        </React.Fragment>
      */}
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
}))(Homepage);
