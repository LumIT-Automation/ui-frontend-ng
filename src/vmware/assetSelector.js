import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Select, Row, Col, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from './error'

import {
  environment,
  asset,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class AssetSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      environments: [],
      environment: '',
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
    this.setState({ environment: e, envAssets: null }, () => this.setEnvAssets(e))
    this.props.dispatch(environment(e))
  }

  setEnvAssets = e => {
    let envAssets = this.props.assets.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  asset = async address => {
    let fetchedAsset = await this.assetSelect(address)
    this.props.dispatch(asset(fetchedAsset))
  }

  assetSelect = async (address) => {
    let asset = this.props.assets.find( a => {
      return a.address === address
    })
    return asset
  }


  render() {
    return (
      <React.Fragment>
      <br/>
        <Row >
          <Col offset={6} span={2}>
            <p style={{ marginTop: '5px' }}>Environment: </p>
          </Col>
          <Col span={4}>
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onChange={e => this.environment(e)}
              style={{ width: 200}}
            >
              {this.state.environments.map((n, i) => {
              return (
                <Select.Option key={i} value={n}>{n}</Select.Option>
              )
            })}
            </Select>
          </Col>

          <Col span={1}>
            <p style={{ marginTop: '5px' }}>Asset: </p>
          </Col>
          <Col span={4}>
            { this.state.envAssets ?
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                }
                onChange={n => this.asset(n)}
                style={{ width: 350}}
              >
              {this.state.envAssets.map((n, i) => {
                return (
                  <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                )
              })}
              </Select>
              :
              <Select disabled value={null} onChange={null} style={{ width: 200}}>
              </Select>
            }
          </Col>

        </Row>

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.vmware,

  environment: state.vmware.environment,
  assets: state.vmware.assets,
  asset: state.vmware.asset,
}))(AssetSelector);
