import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  virtualServersLoading,
  virtualServers,
  virtualServersFetch,
  virtualServersError
} from '../store'

import List from './list'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.virtualServersError) {
        this.props.dispatch(virtualServersFetch(false))
        if (!this.props.virtualServers) {
          this.virtualServersGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) ) {
      if (!this.props.virtualServers) {
        this.virtualServersGet()
      }
      if (this.props.virtualServersFetch) {
        this.virtualServersGet()
        this.props.dispatch(virtualServersFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.virtualServersGet()
      }
    }
  }

  componentWillUnmount() {
  }

  virtualServersGet = async () => {
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
