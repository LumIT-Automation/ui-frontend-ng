import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import { virtualServersLoading, virtualServers, virtualServersFetch, virtualServersError } from '../store.f5'

import List from './list'

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
      if (!this.props.virtualServersError) {
        this.props.dispatch(virtualServersFetch(false))
        if (!this.props.virtualServers) {
          this.fetchVirtualServers()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
      if (!this.props.virtualServers) {
        this.fetchVirtualServers()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchVirtualServers()
      }
    }
    if (this.props.asset && this.props.partition) {
      if (this.props.virtualServersFetch) {
        this.fetchVirtualServers()
        this.props.dispatch(virtualServersFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchVirtualServers = async () => {
    this.props.dispatch(virtualServersLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(virtualServers(resp))
      },
      error => {
        this.props.dispatch(virtualServersError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
    this.props.dispatch(virtualServersLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>


        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <List/>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }


        <React.Fragment>
          { this.props.virtualServersError ? <Error component={'list vitrual server'} error={[this.props.virtualServersError]} visible={true} type={'virtualServersError'} /> : null }
        </React.Fragment>
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  virtualServers: state.f5.virtualServers,
  virtualServersFetch: state.f5.virtualServersFetch,

  virtualServersError: state.f5.virtualServersError
}))(Manager);
