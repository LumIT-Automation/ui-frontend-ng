import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  hostsLoading,
  hosts,
  hostsFetch,
  hostsError
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
      if (!this.props.hostsError) {
        this.props.dispatch(hostsFetch(false))
        if (!this.props.hosts) {
          this.hostsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain) ) {
      if (!this.props.hosts) {
        this.hostsGet()
      }
      if (this.props.hostsFetch) {
        this.hostsGet()
        this.props.dispatch(hostsFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.hostsGet()
      }
    }
  }

  componentWillUnmount() {
  }


  hostsGet = async () => {
    console.log(this.props.domain)
    this.props.dispatch(hostsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(hosts(resp))
      },
      error => {
        this.props.dispatch(hostsError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/hosts/?local`, this.props.token)
    this.props.dispatch(hostsLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.hosts_post || this.props.authorizations.any) ?
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
          { this.props.hostsError ? <Error component={'host manager'} error={[this.props.hostsError]} visible={true} type={'hostsError'} /> : null }
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

  hosts: state.checkpoint.hosts,
  hostsFetch: state.checkpoint.hostsFetch,
  hostsError: state.checkpoint.hostsError
}))(Manager);
