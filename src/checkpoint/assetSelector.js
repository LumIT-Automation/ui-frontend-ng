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
  domain,
  domainsError,
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
    this.props.dispatch(domain(null))
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
    this.setState({ environment: e, envAssets: null, domains: null }, () => this.setEnvAssets(e))
    this.props.dispatch(environment(e))
    this.props.dispatch(asset(null))
    this.props.dispatch(domain(null))
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
    this.props.dispatch(domain(null))
    if (!this.props.workflow) {
      this.domainsGet(fetchedAsset)
    }

  }

  assetSelect = async (address) => {
    let asset = this.props.assets.find( a => {
      return a.address === address
    })
    this.setState({domains: null})
    return asset
  }

  domainsGet = async (asset) => {
    this.setState({domainsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ domains: resp.data.items })
      },
      error => {
        this.props.dispatch(domainsError(error))
      }
    )
    await rest.doXHR(`checkpoint/${asset.id}/domains/`, this.props.token)
    this.setState({domainsLoading: false})
  }

  domain = p => {
    this.props.dispatch(domain(p))
  }


  render() {
    return (
      <React.Fragment>
      <br/>
        <Row style={{paddingLeft: '100px'}}>
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

          <Col offset={1}>

            { this.state.domainsLoading ?
              <React.Fragment>
                Domain:  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              </React.Fragment>
              :
              <React.Fragment>
              Domain:
              {this.props.workflow ?
                <Select disabled value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
                </Select>
              :
                <React.Fragment>
                  {this.state.domains ?
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                      }
                      onChange={p => this.domain(p)}
                      style={{ width: 200, marginLeft: '10px' }}
                    >
                      {this.state.domains.map((p, i) => {
                        return (
                          <Select.Option key={i} value={p.name}>{p.name}</Select.Option>
                        )
                      })}
                    </Select>
                    :
                    <Select disabled value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
                    </Select>
                  }
                </React.Fragment>
              }
              </React.Fragment>
            }
          </Col>
        </Row>

        { this.props.domainsError ? <Error component={'checkpoint asset selector'} error={[this.props.domainsError]} visible={true} type={'domainsError'} /> : null }

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  environment: state.checkpoint.environment,
  assets: state.checkpoint.assets,
  asset: state.checkpoint.asset,
  domains: state.checkpoint.domains,
  domain: state.checkpoint.domain,

  domainsError: state.checkpoint.domainsError,
}))(AssetSelector);
