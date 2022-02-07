import React from 'react';
import { connect } from 'react-redux'
import ReactDOM from 'react-dom';
import { VictoryGroup, VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

import FirmwareTable from './firmwareTable'
import List from '../fortinetdb/devices/list'

import { Modal, Table, Spin } from 'antd'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

import { firmwares, firmwaresLoading, firmwaresError } from '../_store/store.fortinetdb'

class Firmware extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.fetchFirmware()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  fetchFirmware = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(firmwares(resp))
      },
      error => {
        this.props.dispatch(firmwaresError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=FIRMWARE`, this.props.token)
    this.setState({loading: false})
  }

  fetchFirmwareTable = async () => {
    this.setState({loading: true})
    console.log('èèèèèèèèèèèè')
    console.log(this.state.value)
    let rest = new Rest(
      "GET",
      resp => {
        console.log('reerrrrrrrrrrrrrrrrrèèèèèèèèèèèè')
        console.log(resp)
        this.setState({loading: false, devices: resp.data.items})
      },
      error => {
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=FIRMWARE&fval=${this.state.value}`, this.props.token)
  }

  hide = () => {
    this.setState({visible: false})
  }

  render() {
    return (
      <React.Fragment>
      <svg viewBox="0 0 300 300">
        <VictoryPie
          colorScale={["tomato", "orange", "gold", "cyan", "navy" ]}
          events={[{
            target: "data",
            eventHandlers: {
              onClick: (e, n) => {
                console.log(n.datum.FIRMWARE)
                console.log(n.style.fill)
                this.setState({visible: true, value: n.datum.FIRMWARE}, () => this.fetchFirmwareTable())
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
          text={this.state.name}
          style={{ fill: this.state.color }}
        />
      </svg>

      {
        //<FirmwareTable visible={this.state.visible} value={this.state.value} hide={() => this.hide()}/>
      }
      { this.state.visible ?
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
          { this.state.loading ?
             <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
          :
            <React.Fragment>
              { this.state.devices ?
                <List height={350} pagination={5} filteredDevices={this.state.devices}/>
              :
                null
              }
            </React.Fragment>
          }
        </Modal>
      :
        null
      }

      </React.Fragment>
    );

  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  firmwares: state.fortinetdb.firmwares,
}))(Firmware);
