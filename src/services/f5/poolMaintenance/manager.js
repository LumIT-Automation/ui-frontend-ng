import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../../_helpers/Rest";
import Error from '../../../error'

import { setError } from '../../../_store/store.error'
import { setAsset, setPartitions, setPartition, setCurrentPools } from '../../../_store/store.f5'

import AssetSelector from '../assetSelector'
import PoolsTable from './poolsTable'

import { Modal, Alert, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      environments: [],
      environment: '',
      envAssets: [],
      error: null,
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partitions) {
      console.log('monto manager')
      this.getPools()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('manager update')
    if ( (this.props.asset && this.props.partitions) && (prevProps.partition !== this.props.partition) ) {
      console.log('getpools')
      this.getPools()
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
        this.props.dispatch(setCurrentPools( resp ))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${id}/${partition}/pools/`, this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  closeModal = () => {
    this.setState({
      visible: false,
      success: false,
      body: {},
      errors: []
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
              <PoolsTable/>
            }
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }
        </Modal>

        {this.props.error ? <Error error={[this.props.error]} visible={true} /> : <Error visible={false} errors={null}/>}

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,
  currentPools: state.f5.currentPools
}))(Manager);
