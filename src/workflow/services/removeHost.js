import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../error'

import {
  hostRemoveError,
} from '../store'

import { Modal, Alert, Divider, Input, Button, Spin, Table, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


class RemoveHost extends React.Component {

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
      this.removeHandler()
    }
  }

  removeHandler = async () => {
    let requests = JSON.parse(JSON.stringify(this.state.requests))

    requests.forEach((request, i) => {
      request.isReleased = null
    })
    this.setState({requests: requests})


    for await (const request of requests) {
      request.isLoading = true
      this.setState({requests: requests})
      try {
        const resp = await this.removeHost(request)
        request.isLoading = false
        if (resp.status !== 200) {
          request.isReleased = 'NOT REMOVED'
          this.setState({requests: requests})
          this.props.dispatch(hostRemoveError(resp))
        }
        else {
          request.isReleased = 'REMOVED'
          this.setState({requests: requests})
        }
      } catch(resp) {
        request.isLoading = false
        request.isReleased = false
        this.props.dispatch(hostRemoveError(resp))
        this.setState({requests: requests})
      }
    }
  }

  removeHost = async request => {
    let r
    let b = {}
    b.data = {
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
                />
                <p style={{color: 'red'}}>{obj.ipError}</p>
              </React.Fragment>
            :
              <Input
                id='ip'
                defaultValue={obj.ip}
                onChange={e => this.setIp(e, obj.id)}
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
            <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => this.validateIp()}>
              Remove Host
            </Button>
            <br/>
          </React.Fragment>

        </Modal>

      {this.state.visible ?
        <React.Fragment>
          { this.props.hostRemoveError ? <Error component={'hostRemove'} error={[this.props.hostRemoveError]} visible={true} type={'hostRemoveError'} /> : null }
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

  hostRemoveError: state.checkpoint.hostRemoveError,
}))(RemoveHost);
