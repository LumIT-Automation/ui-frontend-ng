import React from 'react'
import { connect } from 'react-redux'
import { VictoryChart, VictoryBar } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  valueError
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class AttivazioneMese extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      clicked: false,
      style: {
        data: { fill: "cyan" }
      }
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

  fetchValue = async () => {
    await this.setState({
      valueLoading: true,
      visible: true,
    })
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items })
      },
      error => {
        this.props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=ATTIVAZIONE_ANNO&fval=${this.props.attivazioneAnno}&fby=ATTIVAZIONE_MESE&fval=${this.state.value}`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    return (
      <React.Fragment>
        { this.props.attivazioneMesesLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={8}>
                <p>Anno: {this.props.attivazioneAnno}</p>
              </Col>
              <Col span={8}>
                <p>Mese: {this.state.attivazioneMese}</p>
              </Col>
              <Col span={8}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>
            <Row>
              <VictoryChart
                domainPadding={20}
              >
                {this.props.attivazioneMeses ?
                  <VictoryBar
                    style={this.state.style}
                    events={[{
                      target: "data",
                      eventHandlers: {
                        onClick: (event, data) => {
                          this.setState({
                            value: data.datum.ATTIVAZIONE_MESE,
                            count: data.datum.COUNT
                          }, () => this.fetchValue());

                        },
                        onMouseOver: (event, data) => {
                          this.setState({
                            attivazioneMese: data.datum.ATTIVAZIONE_MESE,
                            count: data.datum.COUNT
                          });
                        },
                        onMouseLeave: (event, data) => {
                          this.setState({
                            attivazioneMese: null,
                            count: null
                          });
                        }
                      }
                    }]}
                    data={this.props.attivazioneMeses}
                    x={'ATTIVAZIONE_MESE'}
                    y={'COUNT'}
                  />
                :
                  null
                }

              </VictoryChart>
            </Row>

            { this.state.visible ?
              <React.Fragment>
                <Modal
                  title={<p style={{textAlign: 'center'}}>{this.props.attivazioneAnno} - {this.state.value}</p>}
                  centered
                  destroyOnClose={true}
                  visible={this.state.visible}
                  footer={''}
                  //onOk={() => this.setState({visible: true})}
                  onCancel={this.hide}
                  width={1500}
                >
                  { this.state.valueLoading ?
                    <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                  :
                    <React.Fragment>
                      { this.props.attivazioneMeses ?
                        <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                      :
                        null
                      }
                    </React.Fragment>
                  }
                </Modal>

                { this.props.valueError ? <Error component={'ATTIVAZIONE_MESE'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }

              </React.Fragment>
            :
              null
            }

            { this.props.attivazioneMesesError ? <Error component={'ATTIVAZIONE_MESE'} error={[this.props.attivazioneMesesError]} visible={true} type={'attivazioneMesesError'} /> : null }

          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  attivazioneAnno: state.fortinetdb.attivazioneAnno,

  attivazioneMeses: state.fortinetdb.attivazioneMeses,
  attivazioneMesesLoading: state.fortinetdb.attivazioneMesesLoading,
  attivazioneMesesError: state.fortinetdb.attivazioneMesesError,

  attivazioneMese: state.fortinetdb.attivazioneMese,
  attivazioneMeseError: state.fortinetdb.attivazioneMeseError,

  valueError: state.fortinetdb.valueError,
}))(AttivazioneMese);
