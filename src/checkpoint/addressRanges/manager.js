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
  addressRangesLoading,
  addressRanges,
  addressRangesFetch,
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
    this.setState({moun: true})
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.domain && !prevProps.error && !this.props.error) {
      if (!this.props.addressRanges) {
        this.addressRangesGet()
      }
      else if (this.props.addressRangesFetch) {
        this.addressRangesGet()
        this.props.dispatch(addressRangesFetch(false))
      }
      else if ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) {
        this.addressRangesGet()
      }
      else {

      }
    }
  }

  componentWillUnmount() {
    this.setState({moun: false})
  }


  addressRangesGet = async () => {
    this.props.dispatch(addressRangesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(addressRanges(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'addressRanges',
          vendor: 'checkpoint',
          errorType: 'addressRangesError'
        })
        this.props.dispatch(err(error))
        this.setState( {loading: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/address-ranges/?local`, this.props.token)
    this.props.dispatch(addressRangesLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'addressRanges') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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

        {errors()}

      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  addressRanges: state.checkpoint.addressRanges,
  addressRangesFetch: state.checkpoint.addressRangesFetch,
}))(Manager);
