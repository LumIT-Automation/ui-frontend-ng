import React from 'react';
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest";
import { setEnvironment, setAsset } from '../_store/store.f5'
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
    //this.fetchAssetPartitions(asset.id)
  }
/*
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
*/
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
              initialValues={{ size: 'default' }}
              size={'default'}
            >
              <Form.Item label="Environment">
                <Select onChange={e => this.setEnvironment(e)} style={{ width: 180 }}>

                  {this.state.environments.map((n, i) => {
                  return (
                    <Select.Option  key={i} value={n}>{n}</Select.Option>
                  )
                })}
                </Select>

              </Form.Item>

              <Form.Item label="Asset">
                <Select onChange={a => this.setAsset(a)} style={{ width: 350 }}>

                  {this.state.envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                  )
                })}
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
  assets: state.f5.assets,
  asset: state.f5.asset,
}))(AssetSelector);
