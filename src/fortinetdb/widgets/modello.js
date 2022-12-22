import React from 'react'
import { connect } from 'react-redux'
import { VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../../App.css'

import Rest from '../../_helpers/Rest'
import ColorScale from '../../_helpers/colorScale'
import Error from '../error'

import {
  modellos20,
  modellos20Loading,
  modellos20Error,
  modelloError
} from '../store'

import List from '../devices/list'

import { Modal, Spin, Row, Col } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Modello extends React.Component {

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
      this.props.dispatch(modellos20(null))
    }
    if (this.props.vendor !== prevProps.vendor) {
      this.props.dispatch(modellos20(null))
    }
    if (!this.props.vendorError) {
      if (this.props.vendor && prevProps.vendor !== this.props.vendor) {
        this.modellosGet()
      }
    }
  }

  componentWillUnmount() {
  }

  split20 = async mod => {
    mod.sort(function(a, b) {
      return b.COUNT - a.COUNT;
    });
    let first20 = mod.slice(0,20)
    let others = mod.slice(21)

    let c = 0
    others.forEach((item, i) => {
      c = c + item.COUNT
    });

    first20.push({'MODELLO': 'others', 'COUNT': c})
    this.props.dispatch(modellos20(first20))
  }

  modellosGet = async () => {
    this.props.dispatch(modellos20Loading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.split20(resp.data.items)
      },
      error => {
        this.props.dispatch(modellos20Error(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=CATEGORIA&fval=${this.props.categoria}&fby=VENDOR&fval=${this.props.vendor}&fieldValues=MODELLO`, this.props.token)
    this.props.dispatch(modellos20Loading(false))
  }

  modelloGet = async () => {
    this.setState({modelloLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({devices: resp.data.items})
      },
      error => {
        this.props.dispatch(modelloError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=MODELLO&fval=${this.state.modello}`, this.props.token)
    this.setState({modelloLoading: false})
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <React.Fragment>
        { this.props.modellos20Loading ?
          <Spin indicator={spinIcon} style={{margin: '45% 42%'}}/>
        :
          <React.Fragment>
            <Row>
              <Col span={19}>
                <p>Model: {this.state.name}</p>
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
                        this.setState({visible: true, modello: n.datum.MODELLO}, () => this.modelloGet())
                      },
                      onMouseOver: (e, n) => {
                        this.setState({name: n.datum.MODELLO, color: n.style.fill, count: n.datum.COUNT})
                      },
                      onMouseLeave: (e, n) => {
                        this.setState({name: '', color: '', count: ''})
                      }
                    }
                  }]}
                  standalone={false}
                  width={300} height={300}
                  data={this.props.modellos20}
                  x="MODELLO"
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
                title={<p style={{textAlign: 'center'}}>{this.state.modello}</p>}
                centered
                destroyOnClose={true}
                visible={this.state.visible}
                footer={''}
                //onOk={() => this.setState({visible: true})}
                onCancel={this.hide}
                width={1500}
              >
                { this.state.modelloLoading ?
                  <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                :
                  <React.Fragment>
                    { this.props.modellos20 ?
                      <List height={550} pagination={5} filteredDevices={this.state.devices}/>
                    :
                      null
                    }
                  </React.Fragment>
                }
              </Modal>

              { this.props.modellos20Error ? <Error component={'modello'} error={[this.props.modellos20Error]} visible={true} type={'modellos20Error'} /> : null }
              { this.props.modelloError ? <Error component={'MODELLO'} error={[this.props.modelloError]} visible={true} type={'modelloError'} /> : null }

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

  modellos20: state.fortinetdb.modellos20,
  modellos20Loading: state.fortinetdb.modellos20Loading,
  modellos20Error: state.fortinetdb.modellos20Error,

  modello: state.fortinetdb.modello,
  modelloError: state.fortinetdb.modelloError,
}))(Modello);
