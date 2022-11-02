import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'
import CPError from '../../checkpoint/error'

import {
  hostAddError,
} from '../store'

import { assets as checkpointAssets } from '../../checkpoint/store'
import { assetsError as checkpointAssetsError } from '../../checkpoint/store'
import { domains as checkpointDomains } from '../../checkpoint/store'
import { domainsError as checkpointDomainsError } from '../../checkpoint/store'

import { Modal, Alert, Divider, Input, Button, Spin, Table, Space, Radio, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class AddHost extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
      requests: [
        {id:1, assets: []}
      ]
    };
  }

  async componentDidMount() {
    await this.main()
    this.checkedTheOnlyAsset()
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible === true){
      if (this.state.requests && this.state.requests.length === 0) {
        let requests = JSON.parse(JSON.stringify(this.state.requests))
        if (this.props.checkpointAssets && this.props.checkpointAssets.length === 1) {
          requests.push({id:1, assets: [this.props.checkpointAssets[0].id]})
          this.setState({requests: requests})
        }
        else {
          requests.push({id:1, assets: []})
          this.setState({requests: requests})
        }
      }
    }
  }

  componentWillUnmount() {
  }

  details = async () => {
    this.setState({visible: true})
  }

  main = async () => {
    try {
      let cpAssets = await this.cpAssetsGet()
      if (cpAssets.status && cpAssets.status !== 200 ) {
        if (this.state.visible) {
          this.props.dispatch(checkpointAssetsError(cpAssets))
          return
        }
      }
      else {
        await this.props.dispatch(checkpointAssets( cpAssets ))
      }
      await this.cpDomainsGetHandler()
    } catch(error) {
      console.log('main error', error)
    }
  }

  checkedTheOnlyAsset = async () => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      if (this.props.checkpointAssets && this.props.checkpointAssets.length === 1) {
        let assets = []
        assets.push(this.props.checkpointAssets[0].id)
        requests.forEach((req, i) => {
          req.assets = [this.props.checkpointAssets[0].id]
        });
      } else {
        requests.forEach((req, i) => {
          if (!req.assets) {
            req.assets = []
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

  cpDomainsGetHandler = async () => {
    try {
      let cpAssets = this.props.checkpointAssets
      for await (const asset of cpAssets) {
        try {
          const resp = await this.cpDomainsGet(asset)
          if (!resp.status ) {
            await this.setState({cpDomains: resp.data.items})
          }
          else {
            this.props.dispatch(checkpointDomainsError(resp))
          }
        } catch(error) {
          console.log(error)
        }
      }

    } catch(error) {
      console.log(error)
    }
  }

  cpDomainsGet = async (asset) => {
    let r
    let id = asset.id
    this.setState({cpDomainsLoading: true})
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${id}/domains/`, this.props.token)
    this.setState({cpDomainsLoading: false})
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

  assetsSet = async (e, requestId, asset) => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      let request = requests.find( r => r.id === requestId )
      request.assets = []
      request.assets.push(asset.id)
      await this.setState({requests: requests})
    } catch (error) {
      console.log(error)
    }
  }

  domainSet = async (e, requestId, domainName) => {
    try {
      let requests = JSON.parse(JSON.stringify(this.state.requests))
      let request = requests.find( r => r.id === requestId )
      request.domain = domainName
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
      if (request.assets.length < 1) {
        request.assetsError = 'Please check asset(s)'
        error = true
      }
      else {
        delete request.assetsError
      }
      if (!request.domain) {
        request.domainError = 'Please select a domain'
        error = true
      }
      else {
        delete request.domainError
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
        console.log(resp)
        request.isLoading = false
        if (!resp.status) {
          request.created = 'CREATED'
          this.setState({requests: requests})
        }
        else {
          request.created = `${resp.status} ${resp.message}`
          this.props.dispatch(hostAddError(resp))
          this.setState({requests: requests})
        }
      } catch(error) {
        request.isLoading = false
        request.created = false
        this.props.dispatch(hostAddError(resp))
        this.setState({requests: requests})
      }
    }
  }

  addHost = async request => {
    console.log(request.assets)
    let r
    let b = {}
    b.data = {
      "asset": {
        "checkpoint": request.assets
       },
       "name": request.name,
       "ipv4-address": request.ip,
       "domain": request.domain
    }
    console.log(b)

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
    let assId = a => {
      return a[0]
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
            {obj.assetsError ?
              <React.Fragment>
                {this.props.checkpointAssets ?
                  <React.Fragment>
                    {this.props.checkpointAssets.length === 1 ?
                      <Radio
                        onChange={e => this.assetsSet(e.target.checked, obj.id, this.props.checkpointAssets[0])}
                        checked
                      >
                        {this.props.checkpointAssets[0].fqdn}
                      </Radio>
                    :
                      this.props.checkpointAssets.map((n, i) => {
                        return (
                          <Radio
                            key={i}
                            onChange={e => this.assetsSet(e.target.checked, obj.id, n)}
                            checked = {obj && obj.assets && obj.assets.includes(n.id)}
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
                <p style={{color: 'red'}}>{obj.assetsError}</p>
              </React.Fragment>
            :
            <React.Fragment>
              {this.props.checkpointAssets ?
                <React.Fragment>
                  {this.props.checkpointAssets.length === 1 ?
                    <Radio
                      onChange={e => this.assetsSet(e.target.checked, obj.id, this.props.checkpointAssets[0])}
                      checked
                    >
                      {this.props.checkpointAssets[0].fqdn}
                    </Radio>
                  :
                    this.props.checkpointAssets.map((n, i) => {
                      return (
                        <Radio
                          key={i}
                          onChange={e => this.assetsSet(e.target.checked, obj.id, n)}
                          checked = {obj && obj.assets && obj.assets.includes(n.id)}
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
              {!this.state.cpDomains ?
                <Select style={{ width: '300px'}} disabled/>
              :
                <React.Fragment>
                  {obj.domainError ?
                    <React.Fragment>
                      <Select
                        key={obj.id}
                        style={{ width: '300px'}}
                        onChange={(value, event) => this.domainSet(event, obj.id, value)}>
                        { this.state.cpDomains.map((d, i) => {
                          return (
                            <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                            )
                          })
                        }
                      </Select>
                      <p style={{color: 'red'}}>{obj.domainError}</p>
                    </React.Fragment>
                  :
                    <React.Fragment>
                      <Select
                        key={obj.id}
                        style={{ width: '300px'}}
                        onChange={(value, event) => this.domainSet(event, obj.id, value)}>
                        { this.state.cpDomains.map((d, i) => {
                          return (
                            <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                            )
                          })
                        }
                      </Select>
                    </React.Fragment>
                  }
                </React.Fragment>
              }
            </React.Fragment>
          }
          </React.Fragment>
        ),
      },


/*

obj.assets.includes(n.id)



<React.Fragment>
  {this.props.routeDomains.map((n, i) => {
    return (
      <Select.Option key={i} value={n.id}>{n.name}</Select.Option>
    )
  })
  }
</React.Fragment>

<React.Fragment>
  {ass.map((n, i) => {
    return (
    <Checkbox
      onChange={e => this.assetsSet([e.target.checked], obj.id)}
    >
      {n.fqdn}
    </Checkbox>
    )
  })
  }
</React.Fragment>






*/

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
          { this.props.hostAddError ? <Error component={'hostAdd'} error={[this.props.hostAddError]} visible={true} type={'hostAddError'} /> : null }
          { this.props.checkpointAssetsError ? <CPError component={'hostAdd'} error={[this.props.checkpointAssetsError]} visible={true} type={'assetsError'} /> : null }
          { this.props.checkpointDomainsError ? <CPError component={'hostAdd'} error={[this.props.checkpointDomainsError]} visible={true} type={'domainsError'} /> : null }
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

  authorizations: state.authorizations.checkpoint,
  checkpointAssets: state.checkpoint.assets,

  checkpointAssetsError: state.checkpoint.assetsError,
  checkpointDomainsError: state.checkpoint.domainsError,
  hostAddError: state.workflow.hostAddError,
}))(AddHost);
