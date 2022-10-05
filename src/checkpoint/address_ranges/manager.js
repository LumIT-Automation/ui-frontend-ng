import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  address_rangesLoading,
  address_ranges,
  address_rangesFetch,
  address_rangesError
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
      if (!this.props.address_rangesError) {
        this.props.dispatch(address_rangesFetch(false))
        if (!this.props.address_ranges) {
          this.address_rangesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.address_rangesError) ) {
      if (!this.props.address_ranges) {
        this.address_rangesGet()
      }
      if (this.props.address_rangesFetch) {
        this.address_rangesGet()
        this.props.dispatch(address_rangesFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.address_rangesGet()
      }
    }
  }

  componentWillUnmount() {
  }


  address_rangesGet = async () => {
    console.log(this.props.domain)
    this.props.dispatch(address_rangesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        this.props.dispatch(address_ranges(resp))
      },
      error => {
        this.props.dispatch(address_rangesError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/address-ranges/?local`, this.props.token)
    this.props.dispatch(address_rangesLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.address_ranges_post || this.props.authorizations.any) ?
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
          { this.props.address_rangesError ? <Error component={'address_range manager'} error={[this.props.address_rangesError]} visible={true} type={'address_rangesError'} /> : null }
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

  address_ranges: state.checkpoint.address_ranges,
  address_rangesFetch: state.checkpoint.address_rangesFetch,
  address_rangesError: state.checkpoint.address_rangesError
}))(Manager);
