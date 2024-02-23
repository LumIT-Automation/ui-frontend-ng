import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  networksFetch,
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Table, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      nets: [],
      request: {}
    };
  }

  componentDidMount() {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    nets.push({id:1})
    this.setState({nets: nets})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (this.state.visible === true){
      if (this.state.nets && this.state.nets.length === 0) {
        let nets = JSON.parse(JSON.stringify(this.state.nets))
        nets.push({id:1})
        this.setState({nets: nets})
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
  }


  //SETTERS
  netAdd = () => {
    let id = 0
    let n = 0
    this.state.nets.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n}
    let list = JSON.parse(JSON.stringify(this.state.nets))
    list.push(r)
    this.setState({nets: list})
  }
  netRemove = r => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let newList = nets.filter(n => {
      return r.id !== n.id
    })
    this.setState({nets: newList})
  }

  nameSet = (name, id) => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let net = nets.find( r => r.id === id )
    net.name = name
    delete net.nameError
    this.setState({nets: nets})
  }
  subnet4Set = (subnet4, id) => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let net = nets.find( r => r.id === id )
    net.subnet4 = subnet4
    delete net.subnet4Error
    this.setState({nets: nets})
  }
  mask_length4Set = (mask_length4, id) => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let net = nets.find( r => r.id === id )
    net.mask_length4 = mask_length4
    delete net.mask_length4Error
    this.setState({nets: nets})
  }
  subnet6Set = (subnet6, id) => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let net = nets.find( r => r.id === id )
    net.subnet6 = subnet6
    delete net.subnet6Error
    this.setState({nets: nets})
  }
  mask_length6Set = (mask_length6, id) => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let net = nets.find( r => r.id === id )
    net.mask_length6 = mask_length6
    delete net.mask_length6Error
    this.setState({nets: nets})
  }


  //VALIDATION
  validationCheck = async () => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))
    let validators = new Validators()
    let ok = true

    nets.forEach((net, i) => {
      if (!net.name) {
        net.nameError = 'name missing'
        ok = false
      }
      if (!validators.ipv4(net.subnet4)) {
        net.subnet4Error = 'subnet4 error'
        ok = false
      }
      if (!validators.mask_length4(net.mask_length4)) {
        net.mask_length4Error = 'mask_length4 error'
        ok = false
      }
    });

    await this.setState({nets: nets})

    return ok
  }

  validation = async () => {
    let netsOk = await this.validationCheck()

    if ((Object.keys(this.state.errors).length === 0) && netsOk) {
      this.sendRequests()
    }
  }

  sendRequests = async () => {
    let nets = JSON.parse(JSON.stringify(this.state.nets))

    for await (const net of nets) {
      net.isLoading = true
      await this.setState({nets: nets})
      try {
        const resp = await this.networkAdd(net)
        if (resp.status && resp.status !== 201 ) {
          net.status = resp.status
        }
        else {
          net.status = '201'
        }
        net.isLoading = false
        await this.setState({nets: nets})
      } catch(resp) {
        net.status = resp.status
        net.isLoading = false
        await this.setState({nets: nets})
      }
    }
  }


  //DISPOSAL ACTION
  networkAdd = async net => {
    let b = {}
    let r
    b.data = {
      "name": net.name,
      "subnet4": net.subnet4,
      "mask-length4": net.mask_length4,
      "subnet6": net.subnet6,
      "mask-length6": net.mask_length6
    }

    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        error = Object.assign(error, {
          component: 'networksAdd',
          vendor: 'checkpoint',
          errorType: 'networkAddError'
        })
        this.props.dispatch(err(error))
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/networks/`, this.props.token, b)
    return r
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(networksFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      nets: [],
      request: {}
    })
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'networksAdd') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    const columns = [
      {
        title: 'id',
        align: 'center',
        dataIndex: 'id',
        key: 'id',
        name: 'dable',
        description: '',
      },
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
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
            {obj.status}
          </Space>
        ),
      },
      {
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.nameError ?
              <React.Fragment>
                <Input
                  id='name'
                  defaultValue={obj.name}
                  style={{borderColor: 'red' }}
                  onChange={e => this.nameSet(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.nameError}</p>
              </React.Fragment>
            :
              <Input
                id='name'
                defaultValue={obj.name}
                onChange={e => this.nameSet(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Subnet4',
        align: 'center',
        dataIndex: 'subnet4',
        key: 'subnet4',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.subnet4Error ?
              <React.Fragment>
                <Input
                  id='subnet4'
                  defaultValue={obj.subnet4}
                  style={{borderColor: 'red' }}
                  onChange={e => this.subnet4Set(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.subnet4Error}</p>
              </React.Fragment>
            :
              <Input
                id='subnet4'
                defaultValue={obj.subnet4}
                onChange={e => this.subnet4Set(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Mask-length4',
        align: 'center',
        dataIndex: 'mask-length4',
        key: 'mask-length4',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.mask_length4Error ?
              <React.Fragment>
                <Input
                  id='mask_length4'
                  defaultValue={obj.mask_length4}
                  style={{borderColor: 'red' }}
                  onChange={e => this.mask_length4Set(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.mask_length4Error}</p>
              </React.Fragment>
            :
              <Input
                id='mask_length4'
                defaultValue={obj.mask_length4}
                onChange={e => this.mask_length4Set(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Subnet6',
        align: 'center',
        dataIndex: 'subnet6',
        key: 'subnet6',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.subnet6Error ?
              <React.Fragment>
                <Input
                  id='subnet6'
                  defaultValue={obj.subnet6}
                  style={{borderColor: 'red' }}
                  onChange={e => this.subnet6Set(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.subnet6Error}</p>
              </React.Fragment>
            :
              <Input
                id='subnet6'
                defaultValue={obj.subnet6}
                onChange={e => this.subnet6Set(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Mask-length6',
        align: 'center',
        dataIndex: 'mask-length6',
        key: 'mask-length6',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.mask_length6Error ?
              <React.Fragment>
                <Input
                  id='mask_length6'
                  defaultValue={obj.mask_length6}
                  style={{borderColor: 'red' }}
                  onChange={e => this.mask_length6Set(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.mask_length6Error}</p>
              </React.Fragment>
            :
              <Input
                id='mask_length6'
                defaultValue={obj.mask_length6}
                onChange={e => this.mask_length6Set(e.target.value, obj.id)}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Remove request',
        align: 'center',
        dataIndex: 'remove',
        key: 'remove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.netRemove(obj)}>
            -
          </Button>
        ),
      }
    ]

    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD NETWORK</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Network Added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>

              <Button type="primary" onClick={() => this.netAdd()}>
                +
              </Button>
              <br/>
              <br/>
              <Table
                columns={columns}
                dataSource={this.state.nets}
                bordered
                rowKey="id"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />

              <br/>


              <Row>
                <Col offset={11} span={2}>
                  <Button type="primary" shape='round' onClick={() => this.validation()} >
                    Add Network
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {errors()}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  rror: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
}))(Add);
