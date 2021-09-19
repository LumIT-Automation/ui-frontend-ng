import React from 'react';
import { connect } from 'react-redux'

import Rest from "../../_helpers/Rest";
import { selectAsset, setPartitions, selectPartition, setCurrentPools } from '../../_store/store.f5'
import PoolsTable from './poolsTable'
import Error from '../../error'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*
This is the Container of tab "Container"
It allows to choose the environment, then the asset of that environment, then the asset's partitions and render the pools in <PoolsTable/>

It receives from the store
  token,
  assetList,

  asset,
  assetPartitions,
  partition,

MOUNT
Sets in the local state.environments the possible environments selectable from the assetList.
When user chooses an environment option it sets it in the local state.environment.
Filters the assets that are in the selected environment and sets them in the local state.envAssets (the possible assets selectable).
When user chooses the asset it sets in the store as asset, then calls /backend/f5/${id}/partitions/ to gets the partitions.
Container sets them in the store as assetPartitions.
When user chooses a partition, Container sets it in the store as partition.

When user click on the Get Pools Button Container calls /backend/f5/${id}/${partition}/pools/ and sets the response in the store as currentPoolList.
Than render PoolsTable child.

In case of error it renders Error component.
*/


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
    this.getPools()
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
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${id}/${partition}/pools/`, this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    console.log(this.props.currentPools)
    return (
        <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>


          {this.state.loading ?
            <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> :
            <PoolsTable/>
          }
        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}

        </Space>
      )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,
  assetList: state.f5.assetList,
  asset: state.f5.asset,
  assetPartitions: state.f5.assetPartitions,
  partition: state.f5.partition,
  currentPools: state.f5.currentPools
}))(Container);
