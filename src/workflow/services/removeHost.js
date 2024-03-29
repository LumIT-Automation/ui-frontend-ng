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

import { Modal, Input, Button, Spin, Table, Space, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class RemoveHost extends React.Component {

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

  componentDidMount() {
    //this.checkedTheOnlyAsset()
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
    this.main()
  }

  main = async () => {
    await this.setState({cpAssetsLoading: true})
    try {
      let cpAssets = await this.cpAssetsGet()
      if (cpAssets.status && cpAssets.status !== 200 ) {
        let error = Object.assign(cpAssets, {
          component: 'removeHost',
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

      if (!e) {
        if (request.assets.find( a => a === asset.id )) {
          const index = request.assets.indexOf(asset.id)
          request.assets.splice(index, 1)
        }
      }
      else {
        if (!request.assets.find( a => a === asset.id )) {
          request.assets.push(asset.id)
        }
      }
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
      list.push(request)
    })
    await this.setState({requests: list})
    if (!error) {
      this.removeHostHandler()
    }
  }

  removeHostHandler = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))

    requests.forEach((request, i) => {
      delete request.isReleased
    })
    this.setState({requests: requests})


    for await (const request of requests) {
      request.isLoading = true
      this.setState({requests: requests})
      try {
        const resp = await this.removeHost(request)
        request.isLoading = false
        if (resp.status === 200) {
          request.isReleased = 'REMOVED'
          this.setState({requests: requests})
        }
        else if (resp.status === 404) {
          request.isReleased = `${resp.status} NOT FOUND`
          this.setState({requests: requests})
        }
        else if (resp.status === 412) {
          request.isReleased = `${resp.status} ${resp.message}: IS A GATEWAY`
          this.setState({requests: requests})
        }
        else {
          request.isReleased = `${resp.status} ${resp.message}`
          let error = Object.assign(resp, {
            component: 'addHost',
            vendor: 'workflow',
            errorType: 'hostRemoveError'
          })
          this.props.dispatch(err(error))
          this.setState({requests: requests})
        }
      } catch(error) {
        delete request.isLoading
        delete request.isReleased
        console.log(error)
        this.setState({requests: requests})
      }
    }
  }

  removeHost = async request => {
    let r
    let b = {}
    b.data = {
      "asset": {
        "checkpoint": request.assets
       },
      "ipv4-address": `${request.ip}`
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
    await rest.doXHR(`workflow/checkpoint/remove-host/`, this.props.token, b )
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
      if (this.props.error && this.props.error.component === 'removeHost') {
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
            {obj.isReleased}
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
                {obj.assetsError ?
                  <React.Fragment>
                    {this.props.checkpointAssets ? this.props.checkpointAssets.map((n, i) => {
                      return (
                      <Checkbox
                        key={i}
                        onChange={e => this.assetsSet(e.target.checked, obj.id, n)}
                        checked={obj && obj.assets && obj.assets.includes(n.id)}
                      >
                        {n.fqdn}
                      </Checkbox>
                      )
                    })
                    :
                    null
                    }
                    <p style={{color: 'red'}}>{obj.assetsError}</p>
                  </React.Fragment>
                :
                  <React.Fragment>
                    {this.props.checkpointAssets ? this.props.checkpointAssets.map((n, i) => {
                      return (
                      <Checkbox
                        key={i}
                        onChange={e => this.assetsSet(e.target.checked, obj.id, n)}
                        checked={obj && obj.assets && obj.assets.includes(n.id)}
                      >
                        {n.fqdn}
                      </Checkbox>
                      )
                    })
                    :
                    null
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

        <Button type="primary" onClick={() => this.details()}>REMOVE HOST</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>REMOVE HOST</p>}
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
              Remove Host
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
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  checkpointAssets: state.checkpoint.assets,
}))(RemoveHost);
