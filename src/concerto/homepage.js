import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Card, Row, Col, Divider } from 'antd'

//import List from './list'
import Selector from '../fortinetdb/widgets/selector'
import ModelSelector from '../fortinetdb/widgets/modelSelector'
import Italia from '../fortinetdb/widgets/italia'

import Servizio from '../fortinetdb/widgets/servizio'
import Segmento from '../fortinetdb/widgets/segmento'

import Firmware from '../fortinetdb/widgets/firmware'
import Modello from '../fortinetdb/widgets/modello'
import BackupStatus from '../fortinetdb/widgets/backupStatus'
import EosFirmware from '../fortinetdb/widgets/eosFirmware'
import EosHardware from '../fortinetdb/widgets/eosHardware'

import AttivazioneAnno from '../fortinetdb/widgets/attivazioneAnno'
import AttivazioneMese from '../fortinetdb/widgets/attivazioneMese'

import EolAnno from '../fortinetdb/widgets/eolAnno'
import EolMese from '../fortinetdb/widgets/eolMese'



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
      {
        <React.Fragment>
          <br/>
          <Divider orientation="left">Devices</Divider>
          <React.Fragment>
            <Row>
              <Col span={24}>
                <Selector/>
              </Col>
            </Row>
            <Row>
            <Divider/>
              <Col offset={0} span={16}>
                <Row>
                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>MODELLO</p>} bordered={true}>
                      <Modello/>
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>FIRMWARE</p>} bordered={true}>
                      <Firmware/>
                    </Card>
                  </Col>

                  <Col span={8}>
                    <Card title={<p style={{textAlign: 'center'}}>BACKUP STATUS</p>} bordered={true}>
                      <BackupStatus/>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Card title={<p style={{textAlign: 'center'}}>ATTIVAZIONE ANNO</p>} bordered={true}>
                      <AttivazioneAnno/>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title={<p style={{textAlign: 'center'}}>ATTIVAZIONE MESE</p>} bordered={true}>
                      <AttivazioneMese/>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Card title={<p style={{textAlign: 'center'}}>EOL ANNO</p>} bordered={true}>
                      <EolAnno/>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title={<p style={{textAlign: 'center'}}>EOL MESE</p>} bordered={true}>
                      <EolMese/>
                    </Card>
                  </Col>
                </Row>
              </Col>
              <Col offset={0} span={8}>
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
              <Col span={8}>
                <Card title={<p style={{textAlign: 'center'}}>SERVIZIO</p>} bordered={true}>
                  <Servizio/>
                </Card>
              </Col>
              <Col span={8}>
                <Card title={<p style={{textAlign: 'center'}}>SEGMENTO</p>} bordered={true}>
                  <Segmento/>
                </Card>
              </Col>
            </Row>
          </React.Fragment>
        </React.Fragment>
      }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
}))(Homepage);
