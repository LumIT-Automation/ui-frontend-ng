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
  virtualServersLoading,
  virtualServers,
  virtualServersFetch,
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
      if (!this.props.error) {
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
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
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
        error = Object.assign(error, {
          component: 'virtualServerManager',
          vendor: 'f5',
          errorType: 'virtualServersError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/virtualservers/`, this.props.token)
    this.props.dispatch(virtualServersLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'virtualServerManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>


        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <List/>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }

        {errors()}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
  virtualServers: state.f5.virtualServers,
  virtualServersFetch: state.f5.virtualServersFetch,
}))(Manager);
