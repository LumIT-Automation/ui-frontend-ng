import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Select, Row, Col, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import InfobloxError from '../infoblox/error'
import F5Error from '../f5/error'

import { environment as infobloxEnvironment } from '../infoblox/store'
import { asset as infobloxAsset } from '../infoblox/store'

import { environment as f5Environment } from '../f5/store'
import { asset as f5Asset } from '../f5/store'
import { partition as f5Partition } from '../f5/store'
import { partitionsError as f5PartitionsError } from '../f5/store'

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
        case 'f5':
          if (this.props.f5Assets) {
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
        case 'f5':
          if (this.props.f5Assets !== prevProps.f5Assets) {
            this.environmentList()
          }
          if (this.state.asset !== prevState.asset) {
            this.partitionsGet()
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

    this.props.dispatch(f5Environment(null))
    this.props.dispatch(f5Asset(null))
    this.props.dispatch(f5Partition(null))
  }

  environmentList = () => {
    let items
    switch (this.props.vendor) {
      case 'infoblox':
        items = JSON.parse(JSON.stringify(this.props.infobloxAssets))
        break;
      case 'f5':
        items = JSON.parse(JSON.stringify(this.props.f5Assets))
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
      case 'f5':
        assets = JSON.parse(JSON.stringify(this.props.f5Assets))
        break;

      default:
    }

    envAssets = assets.filter( a => {
      return a.environment === e
    })

    await this.setState({ environment: e, envAssets: envAssets, partitions: '' })
  }

  assetSet = async address => {
    let assets = JSON.parse(JSON.stringify(this.state.envAssets))
    let asset = assets.find( a => a.address === address )

    switch (this.props.vendor) {
      case 'infoblox':
          await this.props.dispatch(infobloxAsset(asset))
        break;
      case 'f5':
          await this.props.dispatch(f5Asset(asset))
        break;

      default:
    }

    await this.setState({ asset: asset})
  }

  partitionsGet = async () => {
    this.setState({partitionsLoading: true})
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
    this.setState({partitionsLoading: false})
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
            <p style={{width: '100%', marginTop: '4px'}}>Environment:</p>
          </Col>
          <Col xs={{offset: 7, span: 13}} sm={{offset: 7, span: 13}} md={{offset: 5, span: 15}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
            <Select
              style={{width: '100%'}}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                //console.log(optionA)
                //console.log(optionB)
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
            <p style={{width: '100%', marginTop: '4px'}}>Asset:</p>
          </Col>
          <Col xs={{offset: 7, span: 13}} sm={{offset: 7, span: 13}} md={{offset: 5, span: 15}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
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
                    <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                  )
                })}
              </Select>
            :
              <Select disabled value={null} onChange={null} style={{width: '100%'}}>
              </Select>
            }
          </Col>

          { (this.props.vendor && this.props.vendor === 'f5') ?
            <React.Fragment>
              <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
                <p style={{width: '100%', marginTop: '4px' }}>Partition:</p>
              </Col>
              <Col xs={{offset: 7, span: 13}} sm={{offset: 7, span: 13}} md={{offset: 5, span: 15}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
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

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,

  infobloxEnvironment: state.infoblox.environment,
  infobloxAssets: state.infoblox.assets,
  infobloxAsset: state.infoblox.asset,

  f5Environment: state.f5.environment,
  f5Assets: state.f5.assets,
  f5Asset: state.f5.asset,
  f5Partitions: state.f5.partitions,
  f5Partition: state.f5.partition,
  f5PartitionsError: state.f5.partitionsError,

}))(AssetSelector);
