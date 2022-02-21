import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  snatPoolsLoading,
  snatPools,
  snatPoolsFetch,
  snatPoolsError
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
      if (!this.props.snatPoolsError) {
        this.props.dispatch(snatPoolsFetch(false))
        if (!this.props.snatPools) {
          this.fetchSnatPools()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) && (this.props.partition !== null) ) {
      if (!this.props.snatPools) {
        this.fetchSnatPools()
      }/*
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchSnatPools()
      }*/
    }
    if (this.props.asset && this.props.partition) {
      if (this.props.snatPoolsFetch) {
        this.fetchSnatPools()
        this.props.dispatch(snatPoolsFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }


  fetchSnatPools = async () => {
    this.props.dispatch(snatPoolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(snatPools(resp))
      },
      error => {
        this.props.dispatch(snatPoolsError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/snatpools/`, this.props.token)
    this.props.dispatch(snatPoolsLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.snatPools_post || this.props.authorizations.any) ?
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
          { this.props.snatPoolsError ? <Error component={'snatPool manager'} error={[this.props.snatPoolsError]} visible={true} type={'snatPoolsError'} /> : null }
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

  snatPools: state.f5.snatPools,
  snatPoolsFetch: state.f5.snatPoolsFetch,
  snatPoolsError: state.f5.snatPoolsError
}))(Manager);
