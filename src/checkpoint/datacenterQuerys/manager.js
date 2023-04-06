import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  datacenterQuerysLoading,
  datacenterQuerys,
  datacenterQuerysFetch,
  datacenterQuerysError
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
      if (!this.props.datacenterQuerysError) {
        this.props.dispatch(datacenterQuerysFetch(false))
        if (!this.props.datacenterQuerys) {
          this.datacenterQuerysGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.datacenterQuerysError) ) {
      if (!this.props.datacenterQuerys) {
        this.datacenterQuerysGet()
      }
      if (this.props.datacenterQuerysFetch) {
        this.datacenterQuerysGet()
        this.props.dispatch(datacenterQuerysFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.datacenterQuerysGet()
      }
    }
  }

  componentWillUnmount() {
  }

  datacenterQuerysGet = async () => {
    this.props.dispatch(datacenterQuerysLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(datacenterQuerys(resp))
      },
      error => {
        this.props.dispatch(datacenterQuerysError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-queries/?local`, this.props.token)
    this.props.dispatch(datacenterQuerysLoading(false))
  }


  render() {
    console.log(this.props.datacenterQuerys)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.datacenterQuerys_post || this.props.authorizations.any) ?
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
          { this.props.datacenterQuerysError ? <Error component={'datacenterQuery manager'} error={[this.props.datacenterQuerysError]} visible={true} type={'datacenterQuerysError'} /> : null }
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

  datacenterQuerys: state.checkpoint.datacenterQuerys,
  datacenterQuerysFetch: state.checkpoint.datacenterQuerysFetch,
  datacenterQuerysError: state.checkpoint.datacenterQuerysError
}))(Manager);
