import React from 'react';
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest";
import { setEnvironment, selectAsset, setPartitions, selectPartition, setPoolList } from '../_store/store.f5'
import Error from '../error'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*
This is the Container of tab "AssetSelector"
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
AssetSelector sets them in the store as assetPartitions.
When user chooses a partition, AssetSelector sets it in the store as partition.

When user click on the Get Pools Button AssetSelector calls /backend/f5/${id}/${partition}/pools/ and sets the response in the store as currentPoolList.
Than render PoolsTable child.

In case of error it renders Error component.
*/


class AssetSelector extends React.Component {

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
    if (this.props.assetList) {
      this.setEnvironmentList()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assetList !== prevProps.assetList) {
      this.setEnvironmentList()
    }
  }

  componentWillUnmount() {
    this.props.dispatch(setEnvironment(null))
    this.props.dispatch(selectAsset(null))
    this.props.dispatch(selectPartition(null))
  }

  setEnvironmentList = () => {
    const items = Object.assign([], this.props.assetList)
    const list = items.map( e => {
      return e.environment
    })
    const newList = list.filter((v, i, a) => a.indexOf(v) === i);

    this.setState({
      environments: newList
    })
  }

  setEnvironment = e => {
    this.setState({ environment: e }, () => this.setEnvAssets(e))
    this.props.dispatch(setEnvironment(e))
  }

  setEnvAssets = e => {
    let envAssets = this.props.assetList.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  setAsset = address => {
    let asset = this.props.assetList.find( a => {
      return a.address === address
    })
    this.props.dispatch(selectAsset(asset))
    this.fetchAssetPartitions(asset.id)
  }

  fetchAssetPartitions = async (id) => {
    let rest = new Rest(
      "GET",
      resp => this.props.dispatch(setPartitions( resp )),
      error => {
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${id}/partitions/`, this.props.token)
  }

  setPartition = p => {
    this.props.dispatch(selectPartition(p))
  }

  assetString = () => {
    if (this.props.asset) {
      let a = `${this.props.asset.fqdn} - ${this.props.asset.address }`
      return a
    }
    else {
      return null
    }
  }

  envString = () => {
    if (this.props.environment) {
      let e = this.props.environment
      return e
    }
    else {
      return null
    }
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
        <Space direction='vertical' style={{width: '100%', justifyContent: 'center', paddingLeft: 24, paddingRight: 24}}>
        <br/>
          <Row>
            <Form
              labelCol={{ span: 25 }}
              wrapperCol={{ span: 40 }}
              layout="inline"
              initialValues={{
                size: 'default'
              }}
              size={'default'}
            >
              <Form.Item name='environment' label="Environment">
                <Select onChange={e => this.setEnvironment(e)} style={{ width: 200 }}>

                  {this.state.environments.map((n, i) => {
                  return (
                    <Select.Option  key={i} value={n}>{n}</Select.Option>
                  )
                })}
                </Select>

              </Form.Item>

              <Form.Item name='asset' label="Asset">
                <Select onChange={a => this.setAsset(a)} style={{ width: 350 }}>

                  {this.state.envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                  )
                })}
                </Select>

              </Form.Item>

              <Form.Item name='partition' label="Partition">
                <Select onChange={p => this.setPartition(p)} style={{ width: 200 }}>

                  {this.props.assetPartitions ? this.props.assetPartitions.map((p, i) => {
                  return (
                    <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                  )
                }) : null}
                </Select>
              </Form.Item>

            </Form>

          </Row>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}

        </Space>
      )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  environment: state.f5.environment,
  assetList: state.f5.assetList,
  asset: state.f5.asset,
  assetPartitions: state.f5.assetPartitions,
  partition: state.f5.partition,
}))(AssetSelector);
