import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  poolsLoading,
  pools,
  poolsFetch,
  poolsError,
  monitorTypes,
  monitorTypesError
} from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd';



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.poolsError) {
        this.props.dispatch(poolsFetch(false))
        if (!this.props.pools) {
          this.fetchPools()
          this.fetchMonitorsTypeList()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
      if (!this.props.pools) {
        this.fetchPools()
        this.fetchMonitorsTypeList()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchPools()
        this.fetchMonitorsTypeList()
      }
    }
    if (this.props.asset && this.props.partition) {
      if (this.props.poolsFetch) {
        this.fetchPools()
        this.fetchMonitorsTypeList()
        this.props.dispatch(poolsFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }


  fetchPools = async () => {
    this.props.dispatch(poolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(pools(resp))
      },
      error => {
        this.props.dispatch(poolsError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
    this.props.dispatch(poolsLoading(false))
  }

  fetchMonitorsTypeList = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(monitorTypes(resp.data.items))
      },
      error => {
        this.props.dispatch(monitorTypesError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/`, this.props.token)
  }

  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
         this.props.authorizations && (this.props.authorizations.pools_post || this.props.authorizations.any) ?
            <Add/>
          :
          null
        :
        null
      }

      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
        <List/>
        :
        <Alert message="Asset and Partition not set" type="error" />
      }

      <React.Fragment>
        { this.props.poolsError ? <Error component={'pools manager'} error={[this.props.poolsError]} visible={true} type={'poolsError'} /> : null }
      </React.Fragment>

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  pools: state.f5.pools,
  poolsFetch: state.f5.poolsFetch,
  poolsError: state.f5.poolsError
}))(Manager);
