import React from 'react'
import { connect } from 'react-redux'

import Error from '../error/infobloxError'

import { environment, asset } from '../_store/store.infoblox'

import "antd/dist/antd.css"
import { Space, Form, Select, Row } from 'antd';



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
    if (this.props.assets) {
      this.environmentList()
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.assets !== prevProps.assets) {
      this.environmentList()
    }
  }

  componentWillUnmount() {
    this.props.dispatch(environment(null))
    this.props.dispatch(asset(null))
  }

  environmentList = () => {
    const items = Object.assign([], this.props.assets)
    const list = items.map( e => {
      return e.environment
    })
    const newList = list.filter((v, i, a) => a.indexOf(v) === i);

    this.setState({
      environments: newList
    })
  }

  environment = e => {
    this.setState({ environment: e }, () => this.setEnvAssets(e))
    this.props.dispatch(environment(e))
  }

  setEnvAssets = e => {
    let envAssets = this.props.assets.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  asset = address => {
    let fetchedAsset = this.props.assets.find( a => {
      return a.address === address
    })
    this.props.dispatch(asset(fetchedAsset))
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
                size: 'default',
              }}
              size={'default'}
            >
              <Form.Item name='environment' label="Environment">
                <Select onChange={e => this.environment(e)} style={{ width: 200 }}>

                  {this.state.environments.map((n, i) => {
                  return (
                    <Select.Option  key={i} value={n}>{n}</Select.Option>
                  )
                })}
                </Select>

              </Form.Item>

              <Form.Item name='asset' label="Asset">
                <Select onChange={a => this.asset(a)} style={{ width: 350 }}>

                  {this.state.envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                  )
                })}
                </Select>

              </Form.Item>

            </Form>

          </Row>


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

        </Space>
      )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  environment: state.infoblox.environment,
  assets: state.infoblox.assets,
  asset: state.infoblox.asset,
}))(InfobloxAssetSelector);
