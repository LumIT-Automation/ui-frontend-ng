import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Select, Row, Col, Spin } from 'antd'

import Error from '../error/infobloxError'
import { environment, asset } from '../infoblox/store.infoblox'



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
    const items = JSON.parse(JSON.stringify(this.props.assets))
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


  render() {
    return (
      <React.Fragment>
      <br/>
        <Row style={{paddingLeft: '300px'}}>
        <Col>
          Environment:
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
            style={{ width: 200, marginLeft: '10px' }}
          >
            {this.state.environments.map((n, i) => {
            return (
              <Select.Option key={i} value={n}>{n}</Select.Option>
            )
          })}
          </Select>
        </Col>

        <Col offset={1}>
          Asset:
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
              style={{ width: 350, marginLeft: '10px' }}
            >
            {this.state.envAssets.map((n, i) => {
              return (
                <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
              )
            })}
            </Select>
            :
            <Select disabled value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
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
  authorizations: state.authorizations.infoblox,

  environment: state.infoblox.environment,
  assets: state.infoblox.assets,
  asset: state.infoblox.asset,
}))(AssetSelector);
