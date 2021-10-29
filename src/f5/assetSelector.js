import React from 'react'
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'
import { setEnvironment, setAsset, setPartitions, setPartition, clearPartitions } from '../_store/store.f5'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Col, Divider, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons'

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
    this.props.dispatch(setPartition(null))
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
    this.setState({ environment: e, envAssets: null, partitions: null }, () => this.setEnvAssets(e))
    this.props.dispatch(setEnvironment(e))
    this.props.dispatch(setAsset(null))
    this.props.dispatch(setPartition(null))
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
    this.setState({partitions: null}, () => this.fetchAssetPartitions(asset))
    this.props.dispatch(setAsset(asset))
    this.props.dispatch(setPartition(null))
  }

  fetchAssetPartitions = async (asset) => {
    this.setState({partitionsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({ partitions: resp.data.items }, () => this.props.dispatch(setPartitions( resp )))
      },
      error => {
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`f5/${asset.id}/partitions/`, this.props.token)
    this.setState({partitionsLoading: false})
  }

  setPartition = p => {
    this.props.dispatch(setPartition(p))
  }


  render() {
    console.log(this.state.partitions)
    return (

      <React.Fragment>
      { this.props.error ?
        <Error error={[this.props.error]} visible={true} />
        :
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
                onChange={e => this.setEnvironment(e)}
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
                  onChange={n => this.setAsset(n)}
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
                    onChange={p => this.setPartition(p)}
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
        </React.Fragment>
      }
      </React.Fragment>
    )
  }
};

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  environment: state.f5.environment,
  assets: state.f5.assets,
  asset: state.f5.asset,
  partitions: state.f5.partitions,
  partition: state.f5.partition,
}))(AssetSelector);
