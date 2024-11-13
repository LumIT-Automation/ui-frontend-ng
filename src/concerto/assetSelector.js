import React, { useState, useEffect } from 'react';
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



function AssetSelector(props) {

  const [envLoading, setEnvLoading] = useState(true);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [partitionsLoading, setPartitionsLoading] = useState(false);
  const [environments, setEnvironments] = useState(null);
  const [environment, setEnvironment] = useState('');
  const [assets, setAssets] = useState(null);
  const [asset, setAsset] = useState('');
  const [assToken, setAssToken] = useState('');
  const [envAssets, setEnvAssets] = useState([]);
  const [partitions, setPartitions] = useState([]);
  const [domains, setDomains] = useState([]);
  const [error, setError] = useState('');

  //MOUNT
  useEffect( async () => { 
    assetsGet()
  }, [] );

  //UPDATE
  useEffect( () => { 
    if (assets) {
      const list = assets.map( e => { return e.environment })
      const newList = list.filter((v, i, a) => a.indexOf(v) === i);
      setEnvironments(newList)
      setEnvLoading(false)
    }
  }, [assets] );

  useEffect( () => { 
    if (asset) {
      if (props.vendor === 'checkpoint') {
        domainsGet()
      }
      else if (props.vendor === 'f5') {
        partitionsGet()
      }
    }
  }, [asset] );

  //UNMOUNT
  useEffect( () => () => {
    setEnvironments(null)
    setEnvironment('')

    props.dispatch(infobloxAsset(null))
    props.dispatch(checkpointAsset(null))
    props.dispatch(checkpointDomain(null))
    props.dispatch(f5Asset(null))
    props.dispatch(f5Partition(null))
    props.dispatch(vmwareAsset(null))
    props.dispatch(proofpointAsset(null))
  }, [] );

  
  //GET
  const assetsGet = async () => {
    let endpoint 

    if (props.vendor === 'f5') {
      endpoint = `${props.vendor}/assets/?includeDr`
    }
    else {
      endpoint = `${props.vendor}/assets/`
    }

    let rest = new Rest(
      "GET",
      resp => {
        setAssets(resp.data.items)
      },
      error => {
        error = Object.assign(error, {
          component: 'asset selector',
          vendor: props.vendor,
          errorType: 'assetsError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(endpoint, props.token)
  }

  const domainsGet = async () => {
    if (!props.domain) {
      setDomainsLoading(true)
      let rest = new Rest(
        "GET",
        resp => {
          setDomains(resp.data.items)
        },
        error => {
          error = Object.assign(error, {
            component: 'asset selector',
            vendor: props.vendor,
            errorType: 'domainsError'
          })
          props.dispatch(err(error))
        }
      )
      await rest.doXHR(`checkpoint/${asset.id}/domains/`, props.token)
      setDomainsLoading(false)
    }
  }

  const partitionsGet = async () => {
    setPartitionsLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        setPartitions(resp.data.items)
      },
      error => {
        error = Object.assign(error, {
          component: 'asset selector',
          vendor: props.vendor,
          errorType: 'partitionsError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${asset.id}/partitions/`, props.token)
    setPartitionsLoading(false)
  }

  const environmentSet = async e => {

    let envAssets = assets.filter( a => {
      return a.environment === e
    })

    await setEnvironment(e)
    await setEnvAssets(envAssets)
    await setAsset('')
    await setPartitions([])
    await setDomains([])

    await props.dispatch(infobloxAsset(null))
    await props.dispatch(checkpointAsset(null))
    await props.dispatch(checkpointDomain(null))
    await props.dispatch(f5Asset(null))
    await props.dispatch(f5Partition(null))
    await props.dispatch(vmwareAsset(null))
    await props.dispatch(proofpointAsset(null))
  }

  const assetSet = async val => {
    //let assets = JSON.parse(JSON.stringify(envAssets))
    let asset = envAssets.find( a => a.fqdn === val )

    if (props.vendor === 'proofpoint') {
      asset = envAssets.find( a => a.name ===  val)
    }

    switch (props.vendor) {
      case 'infoblox':
          await props.dispatch(infobloxAsset(asset))
        break;
      case 'checkpoint':
          await props.dispatch(checkpointAsset(asset))
        break;
      case 'f5':
          await props.dispatch(f5Asset(asset))
        break;
      case 'vmware':
          await props.dispatch(vmwareAsset(asset))
        break;
      case 'proofpoint':
        await props.dispatch(proofpointAsset(asset))
      break;

      default:
    }

    await setAsset(asset)
  }

  const setToken = async val => {

    try {
      await props.dispatch(assetToken(assToken))
    } 
    catch(e) {
      console.log(e)
    }
    
  }



  const domainSet = async d => {
    await props.dispatch(checkpointDomain(d))
  }

  const partitionSet = async p => {
    await props.dispatch(f5Partition(p))
  }

  let errors = () => {
    if (props.error && props.error.component === 'asset selector') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <br/>
      <Row>
        <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 2}} >
          <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Environment:</p>
        </Col>
        <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 3}} xxl={{offset: 0, span: 3}}>
          <React.Fragment>
            {envLoading ?
              <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              //<Spin indicator={spinIcon} style={{margin: '0 10%'}}/>
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
                onChange={e => environmentSet(e)}
              >
                {environments.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })}
              </Select>
            }
          </React.Fragment>
          
        </Col>

        { (props.vendor && props.vendor === 'proofpoint')  ?
          <React.Fragment>
            <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 1}}>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Cliente:</p>
            </Col>
            <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
              <Select
                style={{width: '100%'}}
                showSearch
                disabled={environment ? false : true }
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
                }
                onChange={n => assetSet(n)}
              >
                {envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                  )
                })}
              </Select>
            </Col>
          </React.Fragment>
        :
          <React.Fragment>
            <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 1, span: 1}}>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Asset:</p>
            </Col>
            <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
              <Select
                style={{width: '100%'}}
                showSearch
                disabled={environment ? false : true }
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.children.toString().toLowerCase().localeCompare(optionB.children.toString().toLowerCase())
                }
                onChange={n => assetSet(n)}
              >
                {envAssets.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n.fqdn}>{n.fqdn}</Select.Option>
                  )
                })}
              </Select>
            </Col>
          </React.Fragment>
        }

        { (props.vendor && props.vendor === 'proofpoint') ?
          <React.Fragment>
            <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Token:</p>
            </Col>
            <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
              <Input
                value={assToken}
                
                onChange={event => setAssToken(event.target.value)}
              />              
            </Col>

            <Col xs={{offset: 1}} sm={{offset: 1}} md={{offset: 1}} lg={{offset: 1}} xl={{offset: 1}} xxl={{offset: 1}}>
            </Col>

            <Col xs={{offset: 4, span: 18}} sm={{offset: 4, span: 18}} md={{offset: 4, span: 18}} lg={{offset: 4, span: 2}} xl={{offset: 0, span: 2}} xxl={{offset: 0, span: 2}}>
              <Button
                type="primary"
                disabled={assToken ? false : true}
                onClick={() => setToken()}
              >
                Set Asset Token
              </Button>
            </Col>

            
          </React.Fragment>
        :
          null
        }

        { (props.vendor && props.vendor === 'checkpoint' && props.useCase !== 'datacenterAccount') ?
          <React.Fragment>
            <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Domain:</p>
            </Col>
            <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
              {domainsLoading ?
                <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              :
                <React.Fragment>
                  <Select
                    style={{width: '100%'}}
                    showSearch
                    disabled={asset ? false : true }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onChange={p => domainSet(p)}
                  >
                    {domains.map((p, i) => {
                      return (
                        <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                      )
                    })}
                  </Select>
                </React.Fragment>
              }
            </Col>
          </React.Fragment>
        :
          null
        }

        { (props.vendor && props.vendor === 'f5') ?
          <React.Fragment>
            <Col xs={{offset: 1, span: 2}} sm={{offset: 1, span: 2}} md={{offset: 1, span: 2}} lg={{offset: 1, span: 2}} xl={{offset: 1, span: 2}} xxl={{offset: 2, span: 1}}>
              <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Partition:</p>
            </Col>
            <Col xs={{offset: 1, span: 18}} sm={{offset: 1, span: 18}} md={{offset: 1, span: 18}} lg={{offset: 1, span: 18}} xl={{offset: 0, span: 4}} xxl={{offset: 0, span: 4}}>
              {partitionsLoading ?
                <Spin indicator={spinIcon} style={{margin: '0 50px', display: 'inline'}}/>
              :
                <React.Fragment>
                  <Select
                    style={{width: '100%'}}
                    showSearch
                    disabled={asset ? false : true }
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    filterSort={(optionA, optionB) =>
                      optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                    }
                    onChange={p => partitionSet(p)}
                  >
                    {partitions.map((p, i) => {
                      return (
                        <Select.Option  key={i} value={p.name}>{p.name}</Select.Option>
                      )
                    })}
                  </Select>
                </React.Fragment>
              }
            </Col>
          </React.Fragment>
        :
          null
        }
      </Row>

      {errors()}

    </React.Fragment>
  )

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
