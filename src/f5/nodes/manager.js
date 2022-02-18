import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  nodesLoading,
  nodes,
  nodesFetch,
  nodesError
} from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd'


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.nodesError) {
        this.props.dispatch(nodesFetch(false))
        if (!this.props.nodes) {
          this.fetchNodes()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) && (this.props.partition !== null) ) {
      if (!this.props.nodes) {
        this.fetchNodes()
      }/*
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchNodes()
      }*/
    }
    if (this.props.asset && this.props.partition) {
      if (this.props.nodesFetch) {
        this.fetchNodes()
        this.props.dispatch(nodesFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }


  fetchNodes = async () => {
    this.props.dispatch(nodesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(nodes(resp))
      },
      error => {
        this.props.dispatch(nodesError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
    this.props.dispatch(nodesLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>


        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.nodes_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }

        <React.Fragment>
          { this.props.nodesError ? <Error component={'node manager'} error={[this.props.nodesError]} visible={true} type={'nodesError'} /> : null }
        </React.Fragment>
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  nodes: state.f5.nodes,
  nodesFetch: state.f5.nodesFetch,
  nodesError: state.f5.nodesError
}))(Manager);
