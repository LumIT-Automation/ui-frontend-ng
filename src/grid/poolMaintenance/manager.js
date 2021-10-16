import React from 'react';
import { connect } from 'react-redux'

import Rest from "../../_helpers/Rest";
import { setAsset, setPartitions, setPartition, setCurrentPools } from '../../_store/store.f5'
import PoolsTable from './poolsTable'
import Error from '../../error'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


class Container extends React.Component {

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
      this.getPools()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (prevProps.asset !== this.props.asset) || (prevProps.partition !== this.props.partition) ) {
      this.getPools()
    }
  }

  componentWillUnmount() {
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


  render() {
    return (
        <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>


          {this.state.loading ?
            <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> :
            <PoolsTable/>
          }
        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

        </Space>
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
}))(Container);
