import React from 'react'
import { connect } from 'react-redux'

import Rest from "../_helpers/Rest"
import Error from '../error'

import { setError } from '../_store/store.error'
import { setEnvironment, setAsset, setPartitions, setPartition } from '../_store/store.f5'

import "antd/dist/antd.css"
import { Space, Form, Select, Button, Row, Col, Divider, Spin } from 'antd';



class AssetSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      environments: [],
      environment: '',
      envAssets: [],
      partitions: [],
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
    this.setState({ partitions: null, partition: null }, () => this.fetchAssetPartitions(asset))
    this.props.dispatch(setAsset(asset))
    this.props.dispatch(setPartition(null))
  }

  fetchAssetPartitions = async (asset) => {
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
  }

  setPartition = p => {
    //this.props.dispatch(resetObjects())
    //this.setState({partition: p})
    this.props.dispatch(setPartition(p))
    //this.props.dispatch(setPartition('bla'))
  }


  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
        <React.Fragment>
        <br/>
          <Row style={{paddingLeft: '100px'}}>
            <Col>
              Environment:
              <Select onChange={e => this.setEnvironment(e)} style={{ width: 200, marginLeft: '10px' }} >
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
                <Select onChange={n => this.setAsset(n)} style={{ width: 350, marginLeft: '10px' }}>
                {this.state.envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.address}>{n.fqdn} - {n.address}</Select.Option>
                  )
                })}
                </Select>
                :
                <Select value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
                </Select>
              }
            </Col>

            <Col offset={1}>
              Partition:
              {this.state.partitions ?
                <Select onChange={p => this.setPartition(p)} style={{ width: 200, marginLeft: '10px' }}>
                   {this.state.partitions.map((p, i) => {
                  return (
                    <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                  )
                })}
                </Select>
                :
                <Select value={null} onChange={null} style={{ width: 200, marginLeft: '10px' }}>
                </Select>
            }
            </Col>
          </Row>


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error error={null} visible={false} />}

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
