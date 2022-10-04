import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  networksLoading,
  networks,
  networksFetch,
  networksError
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
      if (!this.props.networksError) {
        this.props.dispatch(networksFetch(false))
        if (!this.props.networks) {
          this.networksGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain) ) {
      if (!this.props.networks) {
        this.networksGet()
      }
      if (this.props.networksFetch) {
        this.networksGet()
        this.props.dispatch(networksFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.networksGet()
      }
    }
  }

  componentWillUnmount() {
  }


  networksGet = async () => {
    console.log(this.props.domain)
    this.props.dispatch(networksLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(networks(resp))
      },
      error => {
        this.props.dispatch(networksError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/networks/?local`, this.props.token)
    this.props.dispatch(networksLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.networks_post || this.props.authorizations.any) ?
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
          { this.props.networksError ? <Error component={'network manager'} error={[this.props.networksError]} visible={true} type={'networksError'} /> : null }
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

  networks: state.checkpoint.networks,
  networksFetch: state.checkpoint.networksFetch,
  networksError: state.checkpoint.networksError
}))(Manager);
