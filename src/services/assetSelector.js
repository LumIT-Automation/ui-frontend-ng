import React from 'react';
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest";
import { setEnvironment, setAssets, setAsset, setPartitions, setPartition } from '../_store/store.f5'
import Error from '../error'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;




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
    if (this.props.assets) {
      this.setEnvironmentList()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assets !== prevProps.assets) {
      this.setEnvironmentList()
    }
  }

  componentWillUnmount() {
    this.props.dispatch(setEnvironment(null))
    this.props.dispatch(setAsset(null))
    this.props.dispatch(setPartition(null))
  }

  setEnvironmentList = () => {
    const items = Object.assign([], this.props.assets)
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
    let envAssets = this.props.assets.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  setAsset = address => {
    let asset = this.props.assets.find( a => {
      return a.address === address
    })
    this.props.dispatch(setAsset(asset))
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
    this.props.dispatch(setPartition(p))
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

                  {this.props.partitions ? this.props.partitions.map((p, i) => {
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
  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,
}))(AssetSelector);
