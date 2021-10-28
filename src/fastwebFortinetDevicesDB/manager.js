import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'

import List from './list'

import { Table, Input, Button, Space, Spin, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;





class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null,
      monitorFullList: []
    };
  }

  componentDidMount() {
    //this.ullalla()
    this.fetchDevices()
    //this.ullalla()
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  ullalla = () => {
    let list = [        "SERIALE",
        "ID_PROGETTO",
        "MODELLO",
        "FIRMWARE",
        "DESCRIZIONE",
        "HA",
        "VDOM",
        "IP_MGMT",
        "PORT_MGMT",
        "REVERSE",
        "INDIRIZZO",
        "POSIZIONE",
        "KEYMAKER",
        "USERADMIN",
        "PUBLIC_NET",
        "CODICE_SERVIZIO",
        "NOTE_APPARATO",
        "ASSISTENZA",
        "PROFILO",
        "ATTIVAZIONE_ANNO",
        "ATTIVAZIONE_MESE",
        "DISK_STATUS",
        "AUTENTICAZIONE",
        "SERVIZI",
        "ADDURL_MGMT",
        "SNMP_COMMUNITY",
        "SNMP_PORT",
        "STATUS_APPARATO",
        "BACKUP_SCRIPT",
        "BACKUP_STATUS",
        "BACKUP_TSTAMP",
        "BACKUP_CHECKSUM",
        "comune",
        "provincia",
        "targa",
        "regione",
        "extra_data"]

    let out = []

    list.forEach(i => {
      let o = {
        title: `${i}`,
        align: `center`,
        width: 'auto',
        dataIndex: `${i}`,
        key: `${i}`,
        cippa: `...this.getColumnSearchProps('${i}')`,
      }
      out.push(o)
    })
    

  }




  fetchDevices = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false, devices: resp.data})
      },
      error => {
        this.setState({loading: false, success: false})
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`fortinetdb/devices/`, this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <React.Fragment>

        { this.state.loading ?
          <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
          :
          <React.Fragment>
            { this.state.devices ?
              <List devices={this.state.devices}/>
              :
              null
            }
          </React.Fragment>
        }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors,
  monitorsFetch: state.f5.monitorsFetch
}))(Manager);
