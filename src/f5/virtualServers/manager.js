import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setVirtualServersLoading, setVirtualServers, setVirtualServersFetchStatus } from '../../_store/store.f5'

import List from './list'
//import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';



/*

*/


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.virtualServers) {
        this.fetchVirtualServers()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.virtualServers) {
        this.fetchVirtualServers()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchVirtualServers()
      }
      if ( (this.props.virtualServersFetchStatus === 'updated') ) {
        this.fetchVirtualServers()
        this.props.dispatch(setVirtualServersFetchStatus(''))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchVirtualServers = async () => {
    this.props.dispatch(setVirtualServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setVirtualServers(resp))
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
    this.props.dispatch(setVirtualServersLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>


        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <List/>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  asset: state.f5.asset,
  partition: state.f5.partition,
  virtualServers: state.f5.virtualServers,
  virtualServersFetchStatus: state.f5.virtualServersFetchStatus
}))(Manager);
