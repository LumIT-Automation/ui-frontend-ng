import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setNodesLoading, setNodes, setNodesFetch } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      /*error: {
        status: 400,
        message: "Bad Request",
        reason: "The requested folder (/bla) was not found.",
        type: "basic",
        url: "https://10.0.111.10/backend/f5/2/bla/nodes/"
      }*/
    };
  }

  componentDidMount() {
    console.log('mount')
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
      if (this.props.nodesFetch) {
        this.fetchNodes()
        this.props.dispatch(setNodesFetch(false))
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
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
    this.props.dispatch(setNodesLoading(false))
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    console.log('render manager nodes')
    console.log(this.props.error)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
         this.props.authorizations && (this.props.authorizations.nodes_post || this.props.authorizations.any) ?
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

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  nodes: state.f5.nodes,
  nodesFetch: state.f5.nodesFetch
}))(Manager);
