import React from 'react';
import { connect } from 'react-redux'
import ReactDOM from 'react-dom';
import { VictoryGroup, VictoryPie, VictoryLabel } from 'victory';

import Rest from "../_helpers/Rest"
import Error from '../error'

import { Modal, Table } from 'antd'

import { setFirmwares, setFirmwaresLoading, setFirmwaresError } from '../_store/store.fortinetdb'

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
    this.props.dispatch(setFirmwaresLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(setFirmwares(resp))
      },
      error => {
        this.props.dispatch(setFirmwaresError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/?fieldValues=FIRMWARE`, this.props.token)
    this.props.dispatch(setFirmwaresLoading(false))
  }


  render() {
    return (
      <svg viewBox="0 0 300 300">
        <VictoryPie
          colorScale={["tomato", "orange", "gold", "cyan", "navy" ]}
          events={[{
            target: "data",
            eventHandlers: {
              onClick: (e, n) => {
                console.log(n.style.fill)
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
    );

  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,

  firmwares: state.fortinetdb.firmwares,
}))(Firmware);
