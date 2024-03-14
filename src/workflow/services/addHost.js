import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import { assets as checkpointAssets } from '../../checkpoint/store'

import { Modal, Input, Button, Spin, Table, Space, Radio, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class AddHost extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      cpDomains: {},
      request: {},
      requests: [
        {id:1, asset: {}}
      ]
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible === true){
      if (this.state.requests && this.state.requests.length === 0) {
        let requests = JSON.parse(JSON.stringify(this.state.requests))
        if (this.props.checkpointAssets && this.props.checkpointAssets.length === 1) {
          requests.push({id:1, asset: this.props.checkpointAssets[0]})
          this.setState({requests: requests})
        }
        else {
          requests.push({id:1, asset: {}})
          this.setState({requests: requests})
        }
      }
    }
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
    this.main()
  }

  main = async () => {
    await this.setState({cpAssetsLoading: true})
    try {
      let cpAssets = await this.cpAssetsGet()
      if (cpAssets.status && cpAssets.status !== 200 ) {
        let error = Object.assign(cpAssets, {
          component: 'addHost',
          vendor: 'workflow',
          errorType: 'checkpointAssetsError'
        })
        this.props.dispatch(err(error))
        return
      }
      else {
        await this.props.dispatch(checkpointAssets( cpAssets ))
      }
    } catch(error) {
      console.log('main error', error)
    }
    await this.setState({cpAssetsLoading: false})
    await this.checkedTheOnlyAsset()
  }

  checkedTheOnlyAsset = async () => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      if (this.props.checkpointAssets && this.props.checkpointAssets.length === 1) {
        await this.cpDomainsGetHandler(this.props.checkpointAssets[0])
        requests.forEach((req, i) => {
          req.asset = this.props.checkpointAssets[0]
        });
      } else {
        requests.forEach((req, i) => {
          if (!req.asset) {
            req.asset = {}
          }
        });
      }
      await this.setState({requests: requests})
    } catch (error) {
        console.log('checkedTheOnlyAsset error', error)
    }
  }

  cpAssetsGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR("checkpoint/assets/", this.props.token)
    return r
  }

  cpDomainsGetHandler = async (asset) => {
    try {
      const domains = await this.cpDomainsGet(asset)
      if (!domains.status ) {
        let doms = JSON.parse(JSON.stringify(this.state.cpDomains))
        doms[asset.id] = domains.data.items
        await this.setState({cpDomains: doms})
      }
      else {
        let error = Object.assign(domains, {
          component: 'addHost',
          vendor: 'workflow',
          errorType: 'checkpointDomainsError'
        })
        this.props.dispatch(err(error))
      }
    } catch(error) {
      console.log(error)
    }
  }

  cpDomainsGet = async (asset) => {
    let r
    await this.setState({cpDomainsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${asset.id}/domains/`, this.props.token)
    await this.setState({cpDomainsLoading: false})
    return r
  }

  setRequests = async () => {
    let id = 0
    let n = 0
    this.state.requests.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n}
    let list = JSON.parse(JSON.stringify(this.state.requests))
    list.push(r)
    await this.setState({requests: list})
    await this.checkedTheOnlyAsset()
  }

  removeRequest = r => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let newList = requests.filter(n => {
      return r.id !== n.id
    })
    this.setState({requests: newList})
  }

  nameSet = async (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.name = e
    await this.setState({requests: requests})
  }

  ipSet = async (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.ip = e.target.value
    await this.setState({requests: requests})
  }

  assetSet = async (e, requestId, asset) => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      let request = requests.find( r => r.id === requestId )
      request.asset = asset
      await this.setState({requests: requests})
      await this.cpDomainsGetHandler(asset)
    } catch (error) {
      console.log(error)
    }
  }

  cpDomainSet = async (e, requestId, domainName) => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      let request = requests.find( r => r.id === requestId )
      request.cpDomain = domainName
      await this.setState({requests: requests})
    } catch (error) {
      console.log(error)
    }
  }

  validate = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let validators = new Validators()
    let error = false
    let list = []

    requests.forEach((request, i) => {
      if (!request.name) {
        request.nameError = 'Please input a name'
        error = true
      }
      else {
        delete request.nameError
      }

      if (validators.ipv4(request.ip)) {
        delete request.ipError
      }
      else {
        request.ipError = 'Please input a valid ip'
        error = true
      }
      if (Object.keys(request.asset).length === 0 && request.asset.constructor === Object) {
        request.assetError = 'Please check asset(s)'
        error = true
      }
      else {
        delete request.assetError
      }
      if (!request.cpDomain) {
        request.cpDomainError = 'Please select a domain'
        error = true
      }
      else {
        delete request.cpDomainError
      }
      list.push(request)
    })
    await this.setState({requests: list})

    if (!error) {
      this.addHostHandler()
    }
  }

  addHostHandler = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))

    requests.forEach((request, i) => {
      delete request.created
    })
    await this.setState({requests: requests})


    for await (const request of requests) {
      request.isLoading = true
      this.setState({requests: requests})
      try {
        const resp = await this.addHost(request)
        request.isLoading = false
        if (!resp.status) {
          request.created = 'CREATED'
          this.setState({requests: requests})
        }
        else {
          request.created = `${resp.status} ${resp.message}`
          let error = Object.assign(resp, {
            component: 'addHost',
            vendor: 'workflow',
            errorType: 'hostAddError'
          })
          this.props.dispatch(err(error))
          this.setState({requests: requests})
        }
      } catch(error) {
        request.isLoading = false
        request.created = false
        console.log(error)
        this.setState({requests: requests})
      }
    }
  }

  addHost = async request => {
    let r
    let b = {}
    b.data = {
      "asset": {
        "checkpoint": [request.asset.id]
       },
       "name": request.name,
       "ipv4-address": request.ip,
       "domain": request.cpDomain
    }

    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`workflow/checkpoint/add-host/`, this.props.token, b )
    return r

  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: [],
      request: {},
      requests: []
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'addHost') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const requests = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        width: 50,
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        width: 50,
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.created}
          </Space>
        ),
      },
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        width: 50,
        key: 'id',
        name: 'dable',
        description: '',
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        width: 200,
        key: 'name',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.nameError ?
              <React.Fragment>
                <Input
                  placeholder={obj.name}
                  onChange={e => this.nameSet(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.nameError}</p>
                </React.Fragment>
            :
              <Input
                placeholder={obj.name}
                onChange={e => this.nameSet(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        )
      },
      {
        title: 'IP',
        align: 'center',
        dataIndex: 'ip',
        width: 150,
        key: 'ip',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.ipError ?
              <React.Fragment>
                <Input
                  id='ip'
                  defaultValue={obj.ip}
                  onChange={e => this.ipSet(e, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.ipError}</p>
              </React.Fragment>
            :
              <Input
                id='ip'
                defaultValue={obj.ip}
                onChange={e => this.ipSet(e, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'ASSETS',
        align: 'center',
        dataIndex: 'assets',
        width: 150,
        key: 'assets',
        render: (name, obj)  => (
          <React.Fragment>
            { this.state.cpAssetsLoading ?
              <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
            :
              <React.Fragment>
                {obj.assetError ?
                  <React.Fragment>
                    {this.props.checkpointAssets ?
                      <React.Fragment>
                        {this.props.checkpointAssets.length === 1 ?
                          <Radio
                            onChange={e => this.assetSet(e.target.checked, obj.id, this.props.checkpointAssets[0])}
                            checked
                          >
                            {this.props.checkpointAssets[0].fqdn}
                          </Radio>
                        :
                          this.props.checkpointAssets.map((n, i) => {
                            return (
                              <Radio
                                key={i}
                                onChange={e => this.assetSet(e.target.checked, obj.id, n)}
                                checked={obj && obj.asset && (obj.asset.id === n.id)}
                              >
                                {n.fqdn}
                              </Radio>
                            )
                          })
                        }
                      </React.Fragment>
                    :
                      <React.Fragment>
                        <p style={{color: 'red'}}>Assets Error</p>
                      </React.Fragment>
                    }
                    <p style={{color: 'red'}}>{obj.assetError}</p>
                  </React.Fragment>
                :
                <React.Fragment>
                  {this.props.checkpointAssets ?
                    <React.Fragment>
                      {this.props.checkpointAssets.length === 1 ?
                        <Radio
                          onChange={e => this.assetSet(e.target.checked, obj.id, this.props.checkpointAssets[0])}
                          checked
                        >
                          {this.props.checkpointAssets[0].fqdn}
                        </Radio>
                      :
                        this.props.checkpointAssets.map((n, i) => {
                          return (
                            <Radio
                              key={i}
                              onChange={e => this.assetSet(e.target.checked, obj.id, n)}
                              checked={obj && obj.asset && (obj.asset.id === n.id)}
                            >
                              {n.fqdn}
                            </Radio>
                          )
                        })
                      }
                    </React.Fragment>
                  :
                  <React.Fragment>
                    <p style={{color: 'red'}}>Assets Error</p>
                  </React.Fragment>
                  }
                </React.Fragment>
                }
              </React.Fragment>
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Domains',
        align: 'center',
        dataIndex: 'domains',
        width: 50,
        key: 'domains',
        render: (name, obj)  => (
          <React.Fragment>
          { this.state.cpDomainsLoading ?
            <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
          :
            <React.Fragment>
              {this.state.cpDomains && obj.asset && obj.asset.id && this.state.cpDomains[obj.asset.id] ?
                <React.Fragment>
                  {obj.cpDomainError ?
                    <React.Fragment>
                      <Select
                        key={obj.id}
                        style={{ width: '300px'}}
                        value={obj.cpDomain}
                        onChange={(value, event) => this.cpDomainSet(event, obj.id, value)}>
                        { this.state.cpDomains[obj.asset.id] ? this.state.cpDomains[obj.asset.id].map((d, i) => {
                          return (
                            <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </Select>
                      <p style={{color: 'red'}}>{obj.cpDomainError}</p>
                    </React.Fragment>
                  :
                    <React.Fragment>
                      <Select
                        key={obj.id}
                        style={{ width: '300px'}}
                        value={obj.cpDomain}
                        onChange={(value, event) => this.cpDomainSet(event, obj.id, value)}>
                        { this.state.cpDomains[obj.asset.id] ? this.state.cpDomains[obj.asset.id].map((d, i) => {
                          return (
                            <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                            )
                          })
                        :
                          null
                        }
                      </Select>
                    </React.Fragment>
                  }
                </React.Fragment>
              :
                <React.Fragment>
                  {obj.cpDomainError ?
                    <React.Fragment>
                      <Select style={{ width: '300px'}} disabled/>
                      <p style={{color: 'red'}}>{obj.cpDomainError}</p>
                    </React.Fragment>
                  :
                    <Select style={{ width: '300px'}} disabled/>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          }
          </React.Fragment>
        ),
      },
      {
        title: 'Remove request',
        align: 'center',
        dataIndex: 'remove',
        width: 50,
        key: 'remove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.removeRequest(obj)}>
            -
          </Button>
        ),
      },
    ]

    return (
      <React.Fragment>

        <Button type="primary" onClick={() => this.details()}>ADD HOST</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD HOST</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >

          <React.Fragment>
            <Button type="primary" onClick={() => this.setRequests()}>
              +
            </Button>
            <br/>
            <br/>
            <Table
              columns={requests}
              dataSource={this.state.requests}
              bordered
              rowKey="id"
              scroll={{x: 'auto'}}
              pagination={false}
              style={{marginBottom: 10}}
            />
            <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => this.validate()}>
              Add Host
            </Button>
            <br/>
          </React.Fragment>

        </Modal>

      {this.state.visible ?
        <React.Fragment>
          {errors()}
        </React.Fragment>
      :
        null
      }

    </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  checkpointAssets: state.checkpoint.assets,
}))(AddHost);
