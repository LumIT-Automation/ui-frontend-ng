import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  nodesLoading,
  nodes,
  nodesFetch,
} from '../store'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.error) {
        this.props.dispatch(nodesFetch(false))
        if (!this.props.nodes) {
          this.nodesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
      if (!this.props.nodes) {
        this.nodesGet()
      }
      if (this.props.nodesFetch) {
        this.nodesGet()
        this.props.dispatch(nodesFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.nodesGet()
      }
    }
  }

  componentWillUnmount() {
  }


  nodesGet = async () => {
    this.props.dispatch(nodesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(nodes(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'node',
          vendor: 'f5',
          errorType: 'nodesError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/nodes/`, this.props.token)
    this.props.dispatch(nodesLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'node') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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
          {errors()}
        </React.Fragment>
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  nodes: state.f5.nodes,
  nodesFetch: state.f5.nodesFetch,
}))(Manager);
