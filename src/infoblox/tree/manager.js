import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/infobloxError'

import { setError } from '../../_store/store.error'

import {
  treeLoading,
  tree,
  treeFetch,
} from '../../_store/store.infoblox'

import List from './list'

import { Space, Alert } from 'antd';



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
      if (!this.props.treeError) {
        this.props.dispatch(treeFetch(false))
        if (!this.props.tree) {
          this.fetchTree()
        }
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
        this.props.dispatch(treeFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchTree = async () => {
    this.props.dispatch(treeLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch( tree(resp) )
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/tree/`, this.props.token)
    this.props.dispatch(treeLoading(false))
  }



  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

      { (this.props.asset && this.props.asset.id ) ?
        <List/>
        :
        <Alert message="Asset not set" type="error" />
      }


      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.infoblox.error,
  authorizations: state.authorizations.f5,
  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
}))(Manager);
