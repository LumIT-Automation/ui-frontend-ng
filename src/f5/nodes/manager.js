import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setNodesLoading, setNodes, setNodesFetchStatus } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';





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
      if (!this.props.nodes) {
        this.fetchNodes()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.nodes) {
        this.fetchNodes()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchNodes()
      }
      if ( (this.props.nodesFetchStatus === 'updated') ) {
        this.fetchNodes()
        this.props.dispatch(setNodesFetchStatus(''))
      }
    }
  }

  componentWillUnmount() {
  }


  fetchNodes = async () => {
    this.props.dispatch(setNodesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setNodes(resp))
      },
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
    this.props.dispatch(setNodesLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
         this.props.f5auth && (this.props.f5auth.nodes_post || this.props.f5auth.any) ?
            <Add/>
            :
            null
          :
          null
      }

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
  f5auth: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  nodesFetchStatus: state.f5.nodesFetchStatus
}))(Manager);
