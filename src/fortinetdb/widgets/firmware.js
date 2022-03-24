import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  firmwares,
  firmwaresLoading,
  firmwaresError,
  firmware,
  firmwareError,
  valueError
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Firmware extends React.Component {

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
    if (!this.props.vendorError || !this.props.modelError) {
      if ( (this.props.vendor && prevProps.vendor !== this.props.vendor) || (this.props.model && prevProps.model !== this.props.model) ) {
        if (this.props.vendor && this.props.model) {
          this.firmwaresGet()
        }
      }
    }
  }

  componentWillUnmount() {
  }

  firmwaresGet = async () => {
    this.props.dispatch(firmwaresLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(firmwares(resp.data.items))
      },
      error => {
        this.props.dispatch(firmwaresError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=VENDOR&fval=${this.props.vendor}&fby=MODELLO&fval=${this.props.model}&fieldValues=FIRMWARE`, this.props.token)
    this.props.dispatch(firmwaresLoading(false))
  }

  fetchValue = async () => {
    this.setState({valueLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(valueError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=ATTIVAZIONE_ANNO&fval=2020&fieldValues=ATTIVAZIONE_MESE`, this.props.token)
    this.setState({valueLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    return (
      <React.Fragment>
        { this.props.firmwaresLoading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Firmware: {this.state.name}</p>
            </Row>
            <Row>
              <svg viewBox="0 0 300 300">
                <VictoryPie
                  colorScale={["tomato", "orange", "gold", "cyan", "navy" ]}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: (e, n) => {
                        this.setState({visible: true, value: n.datum.FIRMWARE}, () => this.fetchValue())
                      },
                      onMouseOver: (e, n) => {
                        this.setState({name: n.datum.FIRMWARE, color: n.style.fill})
                      },
                      onMouseLeave: (e, n) => {
                        this.setState({name: '', color: ''})
                      }
                    }
                  }]}
                  standalone={false}
                  width={300} height={300}
                  data={this.props.firmwares}
                  x="FIRMWARE"
                  y="COUNT"
                  innerRadius={0} radius={80}
                  labels={({ datum }) => datum.COUNT}
                />
                <VictoryLabel
                  textAnchor="start"
                  x={80}
                  y={280}
                  style={{ fill: this.state.color }}
                />
              </svg>
            </Row>

            { this.state.visible ?
              <React.Fragment>
                <Modal
                  title={<p style={{textAlign: 'center'}}>{this.state.value}</p>}
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
                      { this.props.firmwares ?
                        <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                      :
                        null
                      }
                    </React.Fragment>
                  }
                </Modal>

                { this.props.firmwaresError ? <Error component={'FIRMWARE'} error={[this.props.firmwaresError]} visible={true} type={'firmwaresError'} /> : null }
                { this.props.valueError ? <Error component={'FIRMWARE'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }

              </React.Fragment>
            :
              null
            }

          </React.Fragment>
        }
      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  vendor: state.fortinetdb.vendor,
  model: state.fortinetdb.model,

  firmwares: state.fortinetdb.firmwares,
  firmwaresLoading: state.fortinetdb.firmwaresLoading,
  firmwaresError: state.fortinetdb.firmwaresError,

  firmware: state.fortinetdb.firmware,
  firmwareError: state.fortinetdb.firmwareError,

  valueError: state.fortinetdb.valueError,
}))(Firmware);
