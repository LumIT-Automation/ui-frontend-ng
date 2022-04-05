import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../error'

import {
  firmwares,
  firmwaresLoading,
  firmwaresError,
  firmware,
  firmwareError,
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
    if (this.props.categoria !== prevProps.categoria) {
      this.props.dispatch(firmwares(null))
    }
    if (this.props.vendor !== prevProps.vendor) {
      this.props.dispatch(firmwares(null))
    }
    if (!this.props.modelloError) {
      if (this.props.modello && prevProps.modello !== this.props.modello) {
        this.firmwaresGet()
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
    await rest.doXHR(`fortinetdb/devices/?fby=MODELLO&fval=${this.props.modello}&fieldValues=FIRMWARE`, this.props.token)
    this.props.dispatch(firmwaresLoading(false))
  }

  firmwareGet = async () => {
    this.setState({firmwareLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(firmwareError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=FIRMWARE&fval=${this.state.firmware}`, this.props.token)
    this.setState({firmwareLoading: false})
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
              <Col span={19}>
                <p>Firmware: {this.state.name}</p>
              </Col>
              <Col span={5}>
                <p>Count: {this.state.count}</p>
              </Col>
            </Row>

            <Row>
              <svg viewBox="0 0 300 300">
                <VictoryPie
                  colorScale={ColorScale}
                  events={[{
                    target: "data",
                    eventHandlers: {
                      onClick: (e, n) => {
                        this.setState({visible: true, firmware: n.datum.FIRMWARE}, () => this.firmwareGet())
                      },
                      onMouseOver: (e, n) => {
                        this.setState({name: n.datum.FIRMWARE, color: n.style.fill, count: n.datum.COUNT})
                      },
                      onMouseLeave: (e, n) => {
                        this.setState({name: '', color: '', count: ''})
                      }
                    }
                  }]}
                  standalone={false}
                  width={300} height={300}
                  data={this.props.firmwares}
                  x="FIRMWARE"
                  y="COUNT"
                  innerRadius={0} radius={80}
                  labels={({ datum }) => null}
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
                  title={<p style={{textAlign: 'center'}}>{this.state.firmware}</p>}
                  centered
                  destroyOnClose={true}
                  visible={this.state.visible}
                  footer={''}
                  //onOk={() => this.setState({visible: true})}
                  onCancel={this.hide}
                  width={1500}
                >
                  { this.state.firmwareLoading ?
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
                { this.props.firmwareError ? <Error component={'FIRMWARE'} error={[this.props.firmwareError]} visible={true} type={'firmwareError'} /> : null }

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

  categoria: state.fortinetdb.categoria,
  vendor: state.fortinetdb.vendor,
  modello: state.fortinetdb.modello,

  firmwares: state.fortinetdb.firmwares,
  firmwaresLoading: state.fortinetdb.firmwaresLoading,
  firmwaresError: state.fortinetdb.firmwaresError,

  firmware: state.fortinetdb.firmware,
  firmwareError: state.fortinetdb.firmwareError,
}))(Firmware);
