import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  datacenterServersLoading,
  datacenterServers,
  datacenterServersFetch,
  datacenterServersError
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
    if (this.props.asset && this.props.domain) {
      if (!this.props.datacenterServersError) {
        this.props.dispatch(datacenterServersFetch(false))
        if (!this.props.datacenterServers) {
          this.datacenterServersGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.datacenterServersError) ) {
      if (!this.props.datacenterServers) {
        this.datacenterServersGet()
      }
      if (this.props.datacenterServersFetch) {
        this.datacenterServersGet()
        this.props.dispatch(datacenterServersFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.datacenterServersGet()
      }
    }
  }

  componentWillUnmount() {
  }


  datacenterServersGet = async () => {
    this.props.dispatch(datacenterServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(datacenterServers(resp))
      },
      error => {
        this.props.dispatch(datacenterServersError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-servers/?local`, this.props.token)
    this.props.dispatch(datacenterServersLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.datacenterServers_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Domain not set" type="error" />
        }

        <React.Fragment>
          { this.props.datacenterServersError ? <Error component={'datacenterServer manager'} error={[this.props.datacenterServersError]} visible={true} type={'datacenterServersError'} /> : null }
        </React.Fragment>
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  datacenterServers: state.checkpoint.datacenterServers,
  datacenterServersFetch: state.checkpoint.datacenterServersFetch,
  datacenterServersError: state.checkpoint.datacenterServersError
}))(Manager);
