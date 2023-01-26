import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  addressRangesLoading,
  addressRanges,
  addressRangesFetch,
  addressRangesError
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
      if (!this.props.addressRangesError) {
        this.props.dispatch(addressRangesFetch(false))
        if (!this.props.addressRanges) {
          this.addressRangesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.addressRangesError) ) {
      if (!this.props.addressRanges) {
        this.addressRangesGet()
      }
      if (this.props.addressRangesFetch) {
        this.addressRangesGet()
        this.props.dispatch(addressRangesFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.addressRangesGet()
      }
    }
  }

  componentWillUnmount() {
  }


  addressRangesGet = async () => {
    this.props.dispatch(addressRangesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(addressRanges(resp))
      },
      error => {
        this.props.dispatch(addressRangesError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/address-ranges/?local`, this.props.token)
    this.props.dispatch(addressRangesLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.addressRanges_post || this.props.authorizations.any) ?
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
          { this.props.addressRangesError ? <Error component={'addressRange manager'} error={[this.props.addressRangesError]} visible={true} type={'addressRangesError'} /> : null }
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

  addressRanges: state.checkpoint.addressRanges,
  addressRangesFetch: state.checkpoint.addressRangesFetch,
  addressRangesError: state.checkpoint.addressRangesError
}))(Manager);
