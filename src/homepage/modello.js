import React from 'react';
import { connect } from 'react-redux'
import ReactDOM from 'react-dom';
import { VictoryGroup, VictoryPie, VictoryLabel } from 'victory'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from '../error/fortinetdbError'

import List from '../fortinetdb/devices/list'

import { Modal, Table, Spin } from 'antd'
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

import {
  field,
  fieldError,
  value,
  valueError
} from '../_store/store.fortinetdb'

class Modello extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    console.log('props')
    console.log(this.props)
    this.fetchField()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  fetchField = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({field: resp.data.items})
        //this.props.dispatch(field(resp))
      },
      error => {
        this.props.dispatch(fieldError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=MODELLO`, this.props.token)
    this.setState({loading: false})
  }

  fetchValue = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false, devices: resp.data.items})
      },
      error => {
        this.setState({loading: false}, () => this.props.dispatch(valueError(error)))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fby=MODELLO&fval=${this.state.value}`, this.props.token)
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
                this.setState({visible: true, value: n.datum.MODELLO}, () => this.fetchValue())
              },
              onMouseOver: (e, n) => {
                this.setState({name: n.datum.MODELLO, color: n.style.fill})
              },
              onMouseLeave: (e, n) => {
                this.setState({name: '', color: ''})
              }
            }
          }]}
          standalone={false}
          width={300} height={300}
          data={this.state.field}
          x="MODELLO"
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
          { this.props.fieldError ? <Error component={'MODELLO'} error={[this.props.fieldError]} visible={true} type={'fieldError'} /> : null }
          { this.props.valueError ? <Error component={'MODELLO'} error={[this.props.valueError]} visible={true} type={'valueError'} /> : null }
        </React.Fragment>
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

  fieldError: state.fortinetdb.fieldError,
  valueError: state.fortinetdb.valueError,
}))(Modello);
