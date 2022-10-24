import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  ipReleaseError,
} from '../store'

import AssetSelector from '../assetSelector'

import { Modal, Alert, Divider, Input, Button, Spin, Table, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class ReleaseIp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      request: {},
      requests: []
    };
  }

  componentDidMount() {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    requests.push({id:1})
    this.setState({requests: requests})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible === true){
      if (this.state.requests && this.state.requests.length === 0) {
        let requests = JSON.parse(JSON.stringify(this.state.requests))
        requests.push({id:1})
        this.setState({requests: requests})
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }

  setRequests = () => {
    //let n = this.state.counter + 1
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
    this.setState({requests: list})
  }

  removeRequest = r => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let newList = requests.filter(n => {
      return r.id !== n.id
    })
    this.setState({requests: newList})
  }

  setIp = (e, id) => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let request = requests.find( r => r.id === id )
    request.ip = e.target.value
    this.setState({requests: requests})
  }

  validateIp = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))
    let validators = new Validators()
    let error = false

    requests.forEach((request, i) => {
      if (validators.ipv4(request.ip)) {
        request.ipError = null
      }
      else {
        request.ipError = 'Please input a valid ip'
        error = true
      }
      this.setState({requests: requests})
    })

    if (!error) {
      this.releaseHandler()
    }
  }

  releaseHandler = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))

    requests.forEach((request, i) => {
      request.isReleased = null
    })
    this.setState({requests: requests})


    for await (const request of requests) {
      request.isLoading = true
      this.setState({requests: requests})
      try {
        const resp = await this.releaseIp(request)
        request.isLoading = false
        if (resp.status !== 200) {
          request.isReleased = 'NOT RELEASED'
          this.setState({requests: requests})
          this.props.dispatch(ipReleaseError(resp))
        }
        else {
          request.isReleased = 'RELEASED'
          this.setState({requests: requests})
        }
      } catch(resp) {
        request.isLoading = false
        request.isReleased = false
        this.props.dispatch(ipReleaseError(resp))
        this.setState({requests: requests})
      }
    }
  }

  releaseIp = async request => {
    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`infoblox/${this.props.asset.id}/ipv4/${request.ip}/`, this.props.token )
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
                  onChange={e => this.setIp(e, obj.id)}
                  onPressEnter={() => this.validateIp()}
                />
                <p style={{color: 'red'}}>{obj.ipError}</p>
              </React.Fragment>
            :
              <Input
                id='ip'
                defaultValue={obj.ip}
                onChange={e => this.setIp(e, obj.id)}
                onPressEnter={() => this.validateIp()}
              />
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

        <Button type="primary" onClick={() => this.details()}>RELEASE IP</Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>RELEASE IP</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >

          <AssetSelector/>
          <Divider/>

          { ( this.props.asset && this.props.asset.id ) ?
            <React.Fragment>

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
              <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => this.validateIp()}>
                Release Ip
              </Button>
              <br/>
            </React.Fragment>

              <Divider/>

            {/* this.state.ipDetails.length < 1 ?
              null
              :
              <React.Fragment>
                <Table
                  columns={columns}
                  dataSource={this.state.ipDetails}
                  bordered
                  rowKey="ip"
                  scroll={{x: 'auto'}}
                  pagination={false}
                  style={{marginBottom: 10}}
                />
                { ( this.state.ipDetails[0].status === 'USED' ) ?
                  <Button type="primary" onClick={() => this.validateMac()}>
                    Modify Ip
                  </Button>
                :
                  <Button type="primary" disabled>
                    Modify Ip
                  </Button>
                }
              </React.Fragment>

            */}
            </React.Fragment>
            :
            <Alert message="Asset and Partition not set" type="error" />
          }

        </Modal>

      {this.state.visible ?
        <React.Fragment>
          { this.props.ipReleaseError ? <Error component={'ipRelease'} error={[this.props.ipReleaseError]} visible={true} type={'ipReleaseError'} /> : null }
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

  authorizations: state.authorizations.infoblox,
  asset: state.infoblox.asset,

  ipReleaseError: state.infoblox.ipReleaseError,
}))(ReleaseIp);
