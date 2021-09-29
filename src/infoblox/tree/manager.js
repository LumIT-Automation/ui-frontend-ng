import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import {
  setTreeLoading,
  setTree,
  setTreeFetch,
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
      if (!this.props.tree) {
        this.fetchTree()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset) {
      if (!this.props.tree) {
        this.fetchTree()
      }
      if (prevProps.asset !== this.props.asset) {
        this.fetchTree()
      }
      if (this.props.treeFetch) {
        this.fetchTree()
        this.props.dispatch(setTreeFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchTree = async () => {
    this.props.dispatch(setTreeLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch( setTree(resp) )
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/tree/`, this.props.token)
    this.props.dispatch(setTreeLoading(false))
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

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
}))(Manager);
