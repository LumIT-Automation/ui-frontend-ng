import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setError } from '../../_store/store.error'

import {
  networksLoading,
  networks,
  networksFetch
} from '../../_store/store.infoblox'

import List from './list'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';



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
    if (this.props.asset) {
      if (!this.props.networks) {
        this.fetchNetworks()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset) {
      if (!this.props.networks) {
        this.fetchNetworks()
      }
      if (prevProps.asset !== this.props.asset) {
        this.fetchNetworks()
      }
      if (this.props.networksFetch) {
        this.fetchNetworks()
        this.props.dispatch(networksFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchNetworks = async () => {
    this.props.dispatch(networksLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(networks(resp))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/networks/`, this.props.token)
    this.props.dispatch(networksLoading(false))
  }


  resetError = () => {
    this.setState({ error: null})
  }


  render() {

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

      { (this.props.asset && this.props.asset.id ) ?
        <List/>
        :
        <Alert message="Asset not set" type="error" />
      }

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.infoblox.asset,

  networks: state.infoblox.networks,
  networksFetch: state.infoblox.networksFetch,
}))(Manager);
