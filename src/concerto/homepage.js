import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Card, Row, Col, Divider } from 'antd'

//import List from './list'
import Selector from '../fortinetdb/widgets/selector'
import Modello from '../fortinetdb/widgets/modello'
import Firmware from '../fortinetdb/widgets/firmware'
import BackupStatus from '../fortinetdb/widgets/backupStatus'
import Italia from '../fortinetdb/widgets/italia'
import AttivazioneAnno from '../fortinetdb/widgets/attivazioneAnno'
import AttivazioneMese from '../fortinetdb/widgets/attivazioneMese'
import EolAnno from '../fortinetdb/widgets/eolAnno'
import EolMese from '../fortinetdb/widgets/eolMese'
import Servizio from '../fortinetdb/widgets/servizio'
import Segmento from '../fortinetdb/widgets/segmento'

import SearchRagioneSociale from '../fortinetdb/widgets/searchRagioneSociale'



class Homepage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

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
        { this.props.authorizationsFortinetdb ?
          <React.Fragment>
           {this.props.authorizationsFortinetdb.interface_search_view ?
              <React.Fragment>
                <SearchRagioneSociale/>
              </React.Fragment>
            :
              <React.Fragment>
                <br/>
                <Divider orientation="left">Devices</Divider>
                <React.Fragment>
                  <Row>
                    <Col span={24}>
                      <Selector/>
                    </Col>
                  </Row>
                  <Divider/>
                  <Row>
                    <Col span={24}>
                      <Row>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>MODELLO</p>} bordered={true}>
                            <Modello/>
                          </Card>
                        </Col>

                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>FIRMWARE</p>} bordered={true}>
                            <Firmware/>
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>BACKUP STATUS</p>} bordered={true}>
                            <BackupStatus/>
                          </Card>
                        </Col>

                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>REGION</p>} bordered={true}>
                            <Italia/>
                          </Card>
                        </Col>
                      </Row>

                      <Divider/>

                      <Row>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>ATTIVAZIONE ANNO</p>} bordered={true}>
                            <AttivazioneAnno/>
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>ATTIVAZIONE MESE</p>} bordered={true}>
                            <AttivazioneMese/>
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>EOL ANNO</p>} bordered={true}>
                            <EolAnno/>
                          </Card>
                        </Col>
                        <Col span={6}>
                          <Card title={<p style={{textAlign: 'center'}}>EOL MESE</p>} bordered={true}>
                            <EolMese/>
                          </Card>
                        </Col>
                      </Row>
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
        :
          null
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizationsFortinetdb: state.authorizations.fortinetdb,
}))(Homepage);
