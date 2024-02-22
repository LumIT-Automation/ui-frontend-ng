import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  firmwares,
  firmwaresLoading,
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
    if (!this.props.error) {
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
        let f = resp.data.items
        f.sort(function(a, b) {
          return b.COUNT - a.COUNT;
        });
        this.props.dispatch(firmwares(f))
      },
      error => {
        error = Object.assign(error, {
          component: 'firmware',
          vendor: 'fortinetdb',
          errorType: 'firmwaresError'
        })
        this.props.dispatch(err(error))
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
        error = Object.assign(error, {
          component: 'firmware',
          vendor: 'fortinetdb',
          errorType: 'firmwareError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=FIRMWARE&fval=${this.state.firmware}&fby=MODELLO&fval=${this.props.modello}`, this.props.token)
    this.setState({firmwareLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'firmware') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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
                  maskClosable={false}
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

              </React.Fragment>
            :
              null
            }

          </React.Fragment>
        }

        {errors()}

      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.fortinetdb,
  error: state.concerto.err,

  categoria: state.fortinetdb.categoria,
  vendor: state.fortinetdb.vendor,
  modello: state.fortinetdb.modello,

  firmwares: state.fortinetdb.firmwares,
  firmwaresLoading: state.fortinetdb.firmwaresLoading,
  firmware: state.fortinetdb.firmware,
}))(Firmware);
