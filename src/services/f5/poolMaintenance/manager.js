import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../../_helpers/Rest'
import Error from '../../../error/f5Error'

import { setPools, setPoolsError } from '../../../_store/store.f5'

import AssetSelector from '../../../f5/assetSelector'
import Pools from './pools'

import { Modal, Alert, Button, Divider, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

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
      this.fetchPools(this.props.asset.id, this.props.partition)
    }
  }

  fetchPools = async (id, partition) => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setPools( resp ))
      },
      error => {
        this.setState({loading: false})
        this.props.dispatch(setPoolsError(error))
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
    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>POOL MAINTENANCE</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>POOL MAINTENANCE</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >
          <AssetSelector />
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

        {this.state.visible ?
          <React.Fragment>
            { this.props.poolsError ? <Error component={'poolMaint manager'} error={[this.props.poolsError]} visible={true} type={'setPoolsError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,

  asset: state.f5.asset,
  partition: state.f5.partition,

  pools: state.f5.pools,
  poolsError: state.f5.poolsError
}))(Manager);
