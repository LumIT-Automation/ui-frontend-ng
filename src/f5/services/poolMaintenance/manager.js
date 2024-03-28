import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Alert, Button, Divider, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../../_helpers/Rest'
import Error from '../../../concerto/error'

import {
  err
} from '../../../concerto/store'

import {
  pools,
} from '../../store'

import AssetSelector from '../../../concerto/assetSelector'
import Pools from './pools'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    if (this.state.visible) {
      if (this.props.asset && this.props.partition) {
        this.getPools()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
        this.getPools()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }


  getPools = () => {
    if (this.props.asset.id) {
      this.poolsGet(this.props.asset.id, this.props.partition)
    }
  }

  poolsGet = async (id, partition) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(pools( resp ))
      },
      error => {
        error = Object.assign(error, {
          component: 'poolMaintenanceManager',
          vendor: 'f5',
          errorType: 'poolsError'
        })
        this.props.dispatch(err(error))
        this.setState({loading: false})

      }
    )
    await rest.doXHR(`f5/${id}/${partition}/pools/`, this.props.token)
  }

  closeModal = () => {
    this.setState({
      visible: false
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'poolMaintenanceManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>POOL MANAGEMENT</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>POOL MANAGEMENT</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >
          <AssetSelector vendor='f5'/>
          <Divider/>

          { ( (this.props.asset && this.props.asset.id) && this.props.partition ) ?
            <React.Fragment>
            {this.state.loading ?
              <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/> :
              <Pools/>
            }
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {errors()}

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  pools: state.f5.pools,
}))(Manager);
