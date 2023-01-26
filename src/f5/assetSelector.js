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
  partition,
  partitionsError,
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
    this.props.dispatch(partition(null))
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
    this.setState({ environment: e, envAssets: null, partitions: null }, () => this.setEnvAssets(e))
    this.props.dispatch(environment(e))
    this.props.dispatch(asset(null))
    this.props.dispatch(partition(null))
  }

  setEnvAssets = e => {
    let envAssets = this.props.assets.filter( a => {
      return a.environment === e
    })
    this.setState({ envAssets: envAssets })
  }

  asset = async address => {
    let fetchedAsset = await this.assetSelect(address)
    this.partitionsGet(fetchedAsset)
    this.props.dispatch(asset(fetchedAsset))
    this.props.dispatch(partition(null))
  }

  assetSelect = async (address) => {
    let asset = this.props.assets.find( a => {
      return a.address === address
    })
    this.setState({partitions: null})
    return asset
  }

  partitionsGet = async (asset) => {
    this.setState({partitionsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ partitions: resp.data.items })
      },
      error => {
        this.props.dispatch(partitionsError(error))
      }
    )
    await rest.doXHR(`f5/${asset.id}/partitions/`, this.props.token)
    this.setState({partitionsLoading: false})
  }

  partition = p => {
    this.props.dispatch(partition(p))
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
                //console.log(optionA)
                //console.log(optionB)
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
                  optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
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

            { this.state.partitionsLoading ?
              <React.Fragment>
                Partition:  <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              </React.Fragment>
              :
              <React.Fragment>
              Partition:
              {this.state.partitions ?
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  filterSort={(optionA, optionB) =>
                    optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                  }
                  onChange={p => this.partition(p)}
                  style={{ width: 200, marginLeft: '10px' }}
                >
                   {this.state.partitions.map((p, i) => {
                  return (
                    <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                  )
                })}
                </Select>
                :
                <Select disabled value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
                </Select>
              }
              </React.Fragment>
            }
          </Col>
        </Row>

        { this.props.partitionsError ? <Error component={'f5 asset selector'} error={[this.props.partitionsError]} visible={true} type={'partitionsError'} /> : null }

      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  environment: state.f5.environment,
  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,

  partitionsError: state.f5.partitionsError,
}))(AssetSelector);
