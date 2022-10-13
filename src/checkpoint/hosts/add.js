import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from '../../_helpers/Rest'
import Error from '../error'
import Validators from '../../_helpers/validators'

import {
  hostsFetch,
  hostAddError
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Divider, Table, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />



class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      interfaces: [],
      request: {}
    };
  }

  componentDidMount() {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    interfaces.push({id:1})
    this.setState({interfaces: interfaces})
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {

    if (this.state.visible === true){
      if (this.state.interfaces && this.state.interfaces.length === 0) {
        let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
        interfaces.push({id:1})
        this.setState({interfaces: interfaces})
      }
      if (this.props.asset && (this.props.asset !== prevProps.asset) ) {
        this.main()
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main()
  }

  main = async () => {

  }


  //FETCH


  //SETTERS
  interfaceAdd = () => {
    let id = 0
    let n = 0
    this.state.interfaces.forEach(r => {
      if (r.id > id) {
        id = r.id
      }
    });
    n = id + 1

    let r = {id: n}
    let list = JSON.parse(JSON.stringify(this.state.interfaces))
    list.push(r)
    this.setState({interfaces: list})
  }

  interfaceRemove = r => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let newList = interfaces.filter(n => {
      return r.id !== n.id
    })
    this.setState({interfaces: newList})
  }
  nameSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.name = e.target.value
    this.setState({request: request})
  }
  addressSet = e => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    request.address = e.target.value
    this.setState({request: request})
  }
  nicNameSet = (nicName, id) => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let nic = interfaces.find( r => r.id === id )
    nic.nicName = nicName
    delete nic.nicNameError
    this.setState({interfaces: interfaces})
  }
  subnet4Set = (subnet4, id) => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let nic = interfaces.find( r => r.id === id )
    nic.subnet4 = subnet4
    delete nic.subnet4Error
    this.setState({interfaces: interfaces})
  }
  mask_length4Set = (mask_length4, id) => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let nic = interfaces.find( r => r.id === id )
    nic.mask_length4 = mask_length4
    delete nic.mask_length4Error
    this.setState({interfaces: interfaces})
  }
  subnet6Set = (subnet6, id) => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let nic = interfaces.find( r => r.id === id )
    nic.subnet6 = subnet6
    delete nic.subnet6Error
    this.setState({interfaces: interfaces})
  }
  mask_length6Set = (mask_length6, id) => {
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let nic = interfaces.find( r => r.id === id )
    nic.mask_length6 = mask_length4
    delete nic.mask_length6Error
    this.setState({interfaces: interfaces})
  }


  //VALIDATION
  validationCheck = async () => {
    let request = JSON.parse(JSON.stringify(this.state.request))
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let errors = JSON.parse(JSON.stringify(this.state.errors))
    let validators = new Validators()
    let ok = true

    if (!request.name) {
      errors.nameError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.nameError
      await this.setState({errors: errors})
    }

    if (!request.address || !validators.ipv4(request.address)) {
      errors.addressError = true
      await this.setState({errors: errors})
    }
    else {
      delete errors.addressError
      await this.setState({errors: errors})
    }

    interfaces.forEach((nic, i) => {
      if (!nic.nicName) {
        nic.nicNameError = 'nicName missing'
        ok = false
      }
      if (!validators.ipv4(nic.subnet4)) {
        nic.subnet4Error = 'subnet4 error'
        ok = false
      }
      if (!validators.mask_length4(nic.mask_length4)) {
        nic.mask_length4Error = 'mask_length4 error'
        ok = false
      }
      if (request.address && nic.mask_length4 && nic.subnet4) {
        if (!validators.ipInSubnet(nic.subnet4+'/'+nic.mask_length4, [request.address])) {
          nic.subnet4Error = 'address out of network'
          ok = false
        }
        else {
          delete nic.subnet4Error
        }
      }
    });

    await this.setState({interfaces: interfaces})

    return ok
  }

  validation = async () => {
    let nicsOk = await this.validationCheck()
    console.log(nicsOk)

    if ((Object.keys(this.state.errors).length === 0) && nicsOk) {
      this.hostAdd()
    }
  }


  //DISPOSAL ACTION
  hostAdd = async () => {
    let request = Object.assign({}, this.state.request)
    let interfaces = JSON.parse(JSON.stringify(this.state.interfaces))
    let b = {}
    let nics = []

    b.data = {
      "ipv4-address": this.state.request.address,
      "name": this.state.request.name,
    }
    interfaces.forEach((nic, i) => {
      let o = {
        name: nic.nicName,
        subnet4: nic.subnet4,
        subnet6: nic.subnet6
      }
      o['mask-length4'] = nic.mask_length4
      o['mask-length6'] = nic.mask_length6
      nics.push(o)
    });

    b.data.interfaces = nics
    console.log(b)

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(hostAddError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/hosts/`, this.props.token, b)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(hostsFetch(true)), 2030)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      errors: {},
      interfaces: [],
      request: {}
    })
  }


  render() {
    console.log(this.state.interfaces)
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
        title: 'Name',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.nicNameError ?
              <React.Fragment>
                <Input
                  id='nicName'
                  defaultValue={obj.nicName}
                  style={{borderColor: 'red' }}
                  onChange={e => this.nicNameSet(e.target.value, obj.id)}
                />
                <p style={{color: 'red'}}>{obj.nicNameError}</p>
              </React.Fragment>
            :
              <Input
                id='nicName'
                defaultValue={obj.nicName}
                onChange={e => this.nicNameSet(e.target.value, obj.id)}
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
          <Button type="danger" onClick={() => this.interfaceRemove(obj)}>
            -
          </Button>
        ),
      }
    ]
    return (
      <Space direction='vertical'>

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

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
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
          { !this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Host Added"
             />
          }
          { !this.state.loading && !this.state.response &&
            <React.Fragment>
              <Row>
                <Col offset={4} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
                </Col>
                <Col span={4}>
                  {this.state.errors.nameError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  :
                    <Input defaultValue={this.state.request.name} style={{width: 250}} name="name" id='name' onChange={e => this.nameSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Row>
                <Col offset={4} span={6}>
                  <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
                </Col>
                <Col span={4}>
                  {this.state.errors.addressError ?
                    <Input style={{width: 250, borderColor: 'red'}} name="address" id='address' onChange={e => this.addressSet(e)} />
                  :
                    <Input defaultValue={this.state.request.address} style={{width: 250}} name="address" id='name' onChange={e => this.addressSet(e)} />
                  }
                </Col>
              </Row>
              <br/>

              <Divider/>


              <Button type="primary" onClick={() => this.interfaceAdd()}>
                +
              </Button>
              <br/>
              <br/>
              <Table
                columns={columns}
                dataSource={this.state.interfaces}
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
                    Add Host
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.hostAddError ? <Error component={'add host'} error={[this.props.hostAddError]} visible={true} type={'hostAddError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  hostAddError: state.checkpoint.hostAddError
}))(Add);
