import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../error/infobloxError'

import { setError } from '../../_store/store.error'

import {
  treeLoading,
  tree,
  treeFetch,
  treeError,
} from '../store.infoblox'

import NetworksTree from './networksTree'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
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
    if (this.props.asset && (prevProps.asset !== this.props.asset)) {
      if (!this.props.tree) {
        this.fetchTree()
      }
    }
    if (this.props.asset) {
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
        this.props.dispatch(tree(resp))
      },
      error => {
        this.props.dispatch(treeError(error))
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/tree/`, this.props.token)
    this.props.dispatch(treeLoading(false))
  }



  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        { this.props.tree ?
          <NetworksTree/>
        :
          <Alert message="Asset not set" type="error" />
        }

        { this.props.treeError ? <Error component={'tree manager'} error={[this.props.treeError]} visible={true} type={'treeError'} /> : null }
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.infoblox,

  asset: state.infoblox.asset,

  tree: state.infoblox.tree,
  treeFetch: state.infoblox.treeFetch,
  treeError: state.infoblox.treeError,
}))(Manager);
