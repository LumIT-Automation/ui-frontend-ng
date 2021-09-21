import React from 'react';
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest";
import { setInfobloxEnvironment, setInfobloxAsset, resetObjects } from '../_store/store.infoblox'
import Error from '../error'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;


class InfobloxAssetSelector extends React.Component {

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
    if (this.props.infobloxAssets) {
      this.setEnvironmentList()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.infobloxAssets !== prevProps.infobloxAssets) {
      this.setEnvironmentList()
    }
  }

  componentWillUnmount() {
    this.props.dispatch(setInfobloxEnvironment(null))
    this.props.dispatch(setInfobloxAsset(null))
    //this.props.dispatch(resetObjects())
  }

  setEnvironmentList = () => {
    const items = Object.assign([], this.props.infobloxAssets)
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
    this.props.dispatch(setInfobloxEnvironment(e))
  }

  setEnvAssets = e => {
    let envAssets = this.props.infobloxAssets.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  setAsset = address => {
    let asset = this.props.infobloxAssets.find( a => {
      return a.address === address
    })
    this.props.dispatch(setInfobloxAsset(asset))
  }

  assetString = () => {
    if (this.props.infobloxAsset) {
      let a = `${this.props.infobloxAsset.fqdn} - ${this.props.infobloxAsset.address }`
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
                size: 'default',
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

            </Form>

          </Row>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}

        </Space>
      )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.infoblox,
  environment: state.infoblox.environment,
  infobloxAssets: state.infoblox.infobloxAssets,
  infobloxAsset: state.infoblox.infobloxAsset,
}))(InfobloxAssetSelector);
