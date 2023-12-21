import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Select, Row, Col, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import InfobloxError from '../infoblox/error'
import CheckpointError from '../checkpoint/error'
import F5Error from '../f5/error'

import { environment as infobloxEnvironment } from '../infoblox/store'
import { asset as infobloxAsset } from '../infoblox/store'

import { environment as checkpointEnvironment } from '../checkpoint/store'
import { asset as checkpointAsset } from '../checkpoint/store'
import { domain as checkpointDomain } from '../checkpoint/store'
import { domainsError as checkpointDomainsError } from '../checkpoint/store'

import { environment as f5Environment } from '../f5/store'
import { asset as f5Asset } from '../f5/store'
import { partition as f5Partition } from '../f5/store'
import { partitionsError as f5PartitionsError } from '../f5/store'

import { environment as vmwareEnvironment } from '../vmware/store'
import { asset as vmwareAsset } from '../vmware/store'

import { environment as proofpointEnvironment } from '../proofpoint/store'
import { asset as proofpointAsset } from '../proofpoint/store'

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
    if (this.props.vendor) {
      switch (this.props.vendor) {
        case 'infoblox':
          if (this.props.infobloxAssets) {
            this.environmentList()
          }
          break;
        case 'checkpoint':
          if (this.props.checkpointAssets) {
            this.environmentList()
          }
          break;
        case 'f5':
          if (this.props.f5Assets) {
            this.environmentList()
          }
          break;
        case 'vmware':
          if (this.props.vmwareAssets) {
            this.environmentList()
          }
          break;
        case 'proofpoint':
          if (this.props.proofpointAssets) {
            this.environmentList()
          }
          break;

        default:

      }

    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.vendor) {
      switch (this.props.vendor) {
        case 'infoblox':
          if (this.props.infobloxAssets !== prevProps.infobloxAssets) {
            this.environmentList()
          }
          break;
        case 'checkpoint':
          if (this.props.checkpointAssets !== prevProps.checkpointAssets) {
            this.environmentList()
          }
          if (this.state.asset !== prevState.asset) {
            this.domainsGet()
          }
          break;
        case 'f5':
          if (this.props.f5Assets !== prevProps.f5Assets) {
            this.environmentList()
          }
          if (this.state.asset !== prevState.asset) {
            this.partitionsGet()
          }
          break;
        case 'vmware':
          if (this.props.vmwareAssets !== prevProps.vmwareAssets) {
            this.environmentList()
          }
          break;
        case 'proofpoint':
          if (this.props.proofpointAssets !== prevProps.proofpointAssets) {
            this.environmentList()
          }
          break;

        default:

      }
    }
  }

  componentWillUnmount() {
    console.log('componentWillUnmount')
    this.setState({
      environments: [],
      environment: ''
    })
    this.props.dispatch(infobloxEnvironment(null))
    this.props.dispatch(infobloxAsset(null))

    this.props.dispatch(checkpointEnvironment(null))
    this.props.dispatch(checkpointAsset(null))
    this.props.dispatch(checkpointDomain(null))

    this.props.dispatch(f5Environment(null))
    this.props.dispatch(f5Asset(null))
    this.props.dispatch(f5Partition(null))

    this.props.dispatch(vmwareEnvironment(null))
    this.props.dispatch(vmwareAsset(null))

    this.props.dispatch(proofpointEnvironment(null))
    this.props.dispatch(proofpointAsset(null))
  }

  environmentList = () => {
    let items
    switch (this.props.vendor) {
      case 'infoblox':
        items = JSON.parse(JSON.stringify(this.props.infobloxAssets))
        break;
      case 'checkpoint':
        items = JSON.parse(JSON.stringify(this.props.checkpointAssets))
        break;
      case 'f5':
        items = JSON.parse(JSON.stringify(this.props.f5Assets))
        break;
      case 'vmware':
        items = JSON.parse(JSON.stringify(this.props.vmwareAssets))
        break;
      case 'proofpoint':
        items = JSON.parse(JSON.stringify(this.props.proofpointAssets))
        break;

      default:
    }

    const list = items.map( e => {
      return e.environment
    })
    const newList = list.filter((v, i, a) => a.indexOf(v) === i);

    this.setState({
      environments: newList
    })
  }

  environmentSet = async e => {
    let assets, envAssets
    switch (this.props.vendor) {
      case 'infoblox':
        assets = JSON.parse(JSON.stringify(this.props.infobloxAssets))
        break;
      case 'checkpoint':
        assets = JSON.parse(JSON.stringify(this.props.checkpointAssets))
        break;
      case 'f5':
        assets = JSON.parse(JSON.stringify(this.props.f5Assets))
        break;
      case 'vmware':
        assets = JSON.parse(JSON.stringify(this.props.vmwareAssets))
        break;
      case 'proofpoint':
        assets = JSON.parse(JSON.stringify(this.props.proofpointAssets))
        break;

      default:
    }

    envAssets = assets.filter( a => {
      return a.environment === e
    })

    await this.setState({ environment: e, envAssets: envAssets, partitions: '' })
  }

  assetSet = async fqdn => {
    let assets = JSON.parse(JSON.stringify(this.state.envAssets))
    let asset = assets.find( a => a.fqdn === fqdn )

    switch (this.props.vendor) {
      case 'infoblox':
          await this.props.dispatch(infobloxAsset(asset))
        break;
      case 'checkpoint':
          await this.props.dispatch(checkpointAsset(asset))
        break;
      case 'f5':
          await this.props.dispatch(f5Asset(asset))
        break;
      case 'vmware':
          await this.props.dispatch(vmwareAsset(asset))
        break;
      case 'proofpoint':
        await this.props.dispatch(proofpointAsset(asset))
      break;

      default:
    }

    await this.setState({ asset: asset})
  }

  domainsGet = async () => {
    if (!this.props.domain) {
      await this.setState({domainsLoading: true})
      let rest = new Rest(
        "GET",
        resp => {
          this.setState({ domains: resp.data.items })
        },
        error => {
          this.props.dispatch(checkpointDomainsError(error))
        }
      )
      await rest.doXHR(`checkpoint/${this.state.asset.id}/domains/`, this.props.token)
      await this.setState({domainsLoading: false})
    }
  }

  partitionsGet = async () => {
    await this.setState({partitionsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ partitions: resp.data.items })
      },
      error => {
        this.props.dispatch(f5PartitionsError(error))
      }
    )
    await rest.doXHR(`f5/${this.state.asset.id}/partitions/`, this.props.token)
    await this.setState({partitionsLoading: false})
  }

  domainSet = async p => {
    await this.props.dispatch(checkpointDomain(p))
  }

  partitionSet = async p => {
    await this.props.dispatch(f5Partition(p))
  }


  render() {
    console.log(this.props.domain)
    return (
      <React.Fragment>
        <br/>
        <Row>
          <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 2}} >
            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Environment:</p>
          </Col>
          <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
            <Select
              style={{width: '100%'}}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onChange={e => this.environmentSet(e)}
            >
              {this.state.environments.map((n, i) => {
                return (
                  <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })}
            </Select>
          </Col>

          <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 1}}>
            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Asset:</p>
          </Col>
          <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
            {this.state.envAssets ?
              <Select
                style={{width: '100%'}}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
                }
                onChange={n => this.assetSet(n)}
              >
                {this.state.envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.fqdn}>{n.fqdn}</Select.Option>
                  )
                })}
              </Select>
            :
              <Select disabled value={null} onChange={null} style={{width: '100%'}}>
              </Select>
            }
          </Col>

          { ((this.props.vendor && this.props.vendor === 'checkpoint') && !this.props.domain) ?
            <React.Fragment>
              <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Domain:</p>
              </Col>
              <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
                {this.state.domainsLoading ?
                  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
                :
                  <React.Fragment>
                    {this.state.domains ?
                      <Select
                        style={{width: '100%'}}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onChange={p => this.domainSet(p)}
                      >
                        {this.state.domains.map((p, i) => {
                          return (
                            <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                          )
                        })}
                      </Select>
                    :
                      <Select disabled value={null} onChange={null} style={{width: '100%'}}>
                      </Select>
                    }
                  </React.Fragment>
                }
              </Col>
            </React.Fragment>
          :
            null
          }

          { (this.props.vendor && this.props.vendor === 'f5') ?
            <React.Fragment>
              <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Partition:</p>
              </Col>
              <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
                {this.state.partitionsLoading ?
                  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
                :
                  <React.Fragment>
                    {this.state.partitions ?
                      <Select
                        style={{width: '100%'}}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onChange={p => this.partitionSet(p)}
                      >
                        {this.state.partitions.map((p, i) => {
                          return (
                            <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                          )
                        })}
                      </Select>
                    :
                      <Select disabled value={null} onChange={null} style={{width: '100%'}}>
                      </Select>
                    }
                  </React.Fragment>
                }
              </Col>
            </React.Fragment>
          :
            null
          }
        </Row>

        {
          this.props.f5PartitionsError ? <F5Error component={'f5 asset selector'} error={[this.props.f5PartitionsError]} visible={true} type={'partitionsError'} /> : null
        }
        {
          this.props.checkpointDomainsError ? <CheckpointError component={'checkpoint asset selector'} error={[this.props.checkpointDomainsError]} visible={true} type={'domainsError'} /> : null
        }

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,

  infobloxEnvironment: state.infoblox.environment,
  infobloxAssets: state.infoblox.assets,
  infobloxAsset: state.infoblox.asset,

  checkpointEnvironment: state.checkpoint.environment,
  checkpointAssets: state.checkpoint.assets,
  checkpointAsset: state.checkpoint.asset,
  checkpointDomains: state.checkpoint.domains,
  checkpointDomain: state.checkpoint.domain,
  checkpointDomainsError: state.checkpoint.domainsError,

  f5Environment: state.f5.environment,
  f5Assets: state.f5.assets,
  f5Asset: state.f5.asset,
  f5Partitions: state.f5.partitions,
  f5Partition: state.f5.partition,
  f5PartitionsError: state.f5.partitionsError,

  vmwareEnvironment: state.vmware.environment,
  vmwareAssets: state.vmware.assets,
  vmwareAsset: state.vmware.asset,

  proofpointEnvironment: state.proofpoint.environment,
  proofpointAssets: state.proofpoint.assets,
  proofpointAsset: state.proofpoint.asset,

}))(AssetSelector);
