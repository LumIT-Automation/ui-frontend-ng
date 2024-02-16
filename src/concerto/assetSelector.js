import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Select, Row, Col, Spin, Input, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from './error'

import { asset as infobloxAsset } from '../infoblox/store'
import { asset as checkpointAsset } from '../checkpoint/store'
import { domain as checkpointDomain } from '../checkpoint/store'
import { asset as f5Asset } from '../f5/store'
import { partition as f5Partition } from '../f5/store'
import { asset as vmwareAsset } from '../vmware/store'
import { asset as proofpointAsset } from '../proofpoint/store'

import { assetToken } from '../proofpoint/store'

import {
  err
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class AssetSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      environments: [],
      environment: '',
      assets: [],
      asset: '',
      error: null,
    };
  }

  componentDidMount() {
    this.main()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ((this.props.vendor === 'checkpoint') && this.state.asset && (this.state.asset !== prevState.asset)) {
      this.domainsGet()
    }

    if ((this.props.vendor === 'f5') && this.state.asset && (this.state.asset !== prevState.asset)) {
      this.partitionsGet()
    }

  }

  componentWillUnmount() {
    this.setState({
      environments: [],
      environment: ''
    })

    this.props.dispatch(infobloxAsset(null))
    this.props.dispatch(checkpointAsset(null))
    this.props.dispatch(checkpointDomain(null))
    this.props.dispatch(f5Asset(null))
    this.props.dispatch(f5Partition(null))
    this.props.dispatch(vmwareAsset(null))
    this.props.dispatch(proofpointAsset(null))
  }

  main = async() => {
    this.setState({envloading: true})
    await this.assetsGet()

    let envList = await this.environmentList()

    await this.setState({environments: envList})
    
    this.setState({envloading: false})
  }

  assetsGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({assets: resp.data.items})
      },
      error => {
        error = Object.assign(error, {
          component: 'asset selector',
          vendor: this.props.vendor,
          errorType: 'assetsError'
        })
        this.props.dispatch(err(error))
      }
    )
    if (this.props.vendor === 'f5') {
      await rest.doXHR(`${this.props.vendor}/assets/?includeDr`, this.props.token)
    }
    else {
      await rest.doXHR(`${this.props.vendor}/assets/`, this.props.token)
    }
    
  }

  environmentList = async () => {
    const list = this.state.assets.map( e => { return e.environment })
    const newList = list.filter((v, i, a) => a.indexOf(v) === i);
    return newList
  }

  environmentSet = async e => {

    let envAssets = this.state.assets.filter( a => {
      return a.environment === e
    })

    await this.setState({ 
      environment: e, 
      envAssets: envAssets,
      asset: '', 
      partitions: '',
      domains: ''
    })

    await this.props.dispatch(infobloxAsset(null))
    await this.props.dispatch(checkpointAsset(null))
    await this.props.dispatch(checkpointDomain(null))
    await this.props.dispatch(f5Asset(null))
    await this.props.dispatch(f5Partition(null))
    await this.props.dispatch(vmwareAsset(null))
    await this.props.dispatch(proofpointAsset(null))
  }

  assetSet = async val => {
    let assets = JSON.parse(JSON.stringify(this.state.envAssets))
    let asset = assets.find( a => a.fqdn === val )

    if (this.props.vendor === 'proofpoint') {
      asset = assets.find( a => a.name ===  val)
    }

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

  setToken = async val => {

    try {
      await this.props.dispatch(assetToken(this.state.assetToken))
    } 
    catch(e) {
      console.log(e)
    }
    
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
          error = Object.assign(error, {
            component: 'asset selector',
            vendor: this.props.vendor,
            errorType: 'domainsError'
          })
          this.props.dispatch(err(error))
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
        error = Object.assign(error, {
          component: 'asset selector',
          vendor: this.props.vendor,
          errorType: 'partitionsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.state.asset.id}/partitions/`, this.props.token)
    await this.setState({partitionsLoading: false})
  }

  domainSet = async d => {
    await this.props.dispatch(checkpointDomain(d))
  }

  partitionSet = async p => {
    await this.props.dispatch(f5Partition(p))
  }


  render() {
    return (
      <React.Fragment>
        <br/>
        <Row>
          <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 2}} >
            <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Environment:</p>
          </Col>
          <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 3}} xxl={{offset: 0, span: 3}}>
            <React.Fragment>
              {this.state.envloading ?
                <Spin indicator={spinIcon} style={{margin: '0 10%'}}/>
              :
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
              }
            </React.Fragment>
            
          </Col>

          { (this.props.vendor && this.props.vendor === 'proofpoint')  ?
            <React.Fragment>
              <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 1}}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Cliente:</p>
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
                        <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                      )
                    })}
                  </Select>
                :
                  <Select disabled value={null} onChange={null} style={{width: '100%'}}>
                  </Select>
                }
              </Col>
            </React.Fragment>
          :
            <React.Fragment>
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
            </React.Fragment>
          }

          { (this.props.vendor && this.props.vendor === 'proofpoint') ?
            <React.Fragment>
              <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Token:</p>
              </Col>
              <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
                <Input
                  value={this.state.assetToken}
                  onChange={event => this.setState({assetToken: event.target.value})}
                />              
              </Col>

              <Col xs={{offset: 1}} sm={{offset: 1}} md={{offset: 1}} lg={{offset: 1}} xl={{offset: 1}} xxl={{offset: 1}}>
              </Col>

              <Col xs={{offset: 4, span: 18}} sm={{offset: 4, span: 18}} md={{offset: 4, span: 18}} lg={{offset: 4, span: 2}} xl={{offset: 0, span: 2}} xxl={{offset: 0, span: 2}}>
                <Button
                  type="primary"
                  disabled={(this.state.assetToken) ? false : true}
                  onClick={() => this.setToken()}
                >
                  Set Asset Token
                </Button>
              </Col>

             
            </React.Fragment>
          :
            null
          }

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
          (this.props.error && 
            this.props.error.component === 'asset selector') ? 
            <Error error={[this.props.error]} visible={true}/> 
          : 
            null        
        }

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  infobloxAssets: state.infoblox.assets,
  infobloxAsset: state.infoblox.asset,

  checkpointAssets: state.checkpoint.assets,
  checkpointAsset: state.checkpoint.asset,
  checkpointDomains: state.checkpoint.domains,
  checkpointDomain: state.checkpoint.domain,
  

  f5Assets: state.f5.assets,
  f5Asset: state.f5.asset,
  f5Partitions: state.f5.partitions,
  f5Partition: state.f5.partition,

  vmwareAssets: state.vmware.assets,
  vmwareAsset: state.vmware.asset,

  proofpointAssets: state.proofpoint.assets,
  proofpointAsset: state.proofpoint.asset,
  assetToken: state.proofpoint.assetToken

}))(AssetSelector);
