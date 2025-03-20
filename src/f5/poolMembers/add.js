import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Validators from '../../_helpers/validators'
import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  poolMembersFetch,
} from '../store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function Add(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [nodesLoading, setNodesLoading] = useState(false);
  let [poolMembersLoading, setPoolMembersLoading] = useState(false);
  let [states, setStates] = useState(['enabled', 'disabled', 'forced offline']);
  let [status, setStatus] = useState('')
  let [statusError, setStatusError] = useState(false)
  let [session, setSession] = useState('')
  let [nodeState, setNodeState] = useState('')

  let [nodes, setNodes] = useState([])
  let [node, setNode] = useState({})
  let [existentNode, setExistentNode] = useState({})
  let [existentNodeError, setExistentNodeError] = useState('')

  let [name, setName] = useState('')
  let [nameError, setNameError] = useState('')
  let [address, setAddress] = useState('')
  let [addressError, setAddressError] = useState('')
  let [port, setPort] = useState('')
  let [portError, setPortError] = useState('')

  let [response, setResponse] = useState(false);


  useEffect(() => {
    if (visible && !props.error) {
      main()
    }
  }, [visible, props.error]);


  let main = async () => {
    setNodesLoading(true)
    let nodesFetched = await nodesGet()
    setNodesLoading(false)
    if (nodesFetched.status && nodesFetched.status !== 200 ) {
      let error = Object.assign(nodesFetched, {
        component: 'poolMembersAdd',
        vendor: 'f5',
        errorType: 'nodesError'
      })
      props.dispatch(err(error))
      return
    }
    else {
      setNodes(nodesFetched.data.items)
    }
  }


  //FETCH
  let nodesGet = async () => {
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
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/nodes/`, props.token)
    return r
  }


  //SETTERS
  let set = async (value, key, obj) => {

    if (key === 'existentNode') {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      let nodeCopy = nodesCopy.find(n => n.name === value)
      console.log(nodeCopy)
      setNode(nodeCopy)
      setExistentNode(nodeCopy)
      setExistentNodeError('')

      setName(nodeCopy.name)
      setNameError('')

      setAddress(nodeCopy.address)
      setAddressError('')
    }

    if (key === 'name') {
      setName(value)
      setNameError('')
      setExistentNode(null)
    }

    if (key === 'address') {
      setAddress(value)
      setAddressError('')
    }

    if (key === 'port') {
      setPort(value)
      setPortError('')
    }

    if (key === 'status') {
      if (value === 'enabled') {
        setStatus(value)
        setSession('user-enabled')
        setNodeState('user-up')
      }
      else if (value === 'disabled') {
        setStatus(value)
        setSession('user-disabled')
        setNodeState('user-down')
      }
      else if (value === 'forced offline') {
        setStatus(value)
        setSession('user-disabled')
        setNodeState('')
      }
      setStatusError(false)
    }
  }

  //VALIDATION
  let validationCheck = async () => {
    let validators = new Validators()
    let errorsCopy = {}

    if (!name) {
      setNameError(true)
      errorsCopy.nameError = true
    }

    if (!address) {
      setAddressError(true)
      errorsCopy.addressError = true
    }
    else if (!validators.ipv4(address)) {
      setAddressError(true)
      errorsCopy.addressError = true
    }

    if (!port) {
      setPortError(true)
      errorsCopy.portError = true
    }
    else if (!validators.port(port)) {
      setPortError(true)
      errorsCopy.portError = true
    }

    if (!status) {
      setStatusError(true)
      errorsCopy.statusError = true
    }

    return errorsCopy
  }

  let validation = async () => {
    let e = await validationCheck()

    if (Object.keys(e).length === 0) {
      poolMemberAdd()
    }
  }


  //DISPOSAL ACTION
  let poolMemberAdd = async () => {
    let b = {}
    b.data = {
        "name": `/${props.partition}/${name}:${port}`,
        "address": address,
        "connectionLimit": 0,
        "dynamicRatio": 1,
        "ephemeral": "false",
        "inheritProfile": "enabled",
        "logging": "disabled",
        "monitor": "default",
        "priorityGroup": 0,
        "rateLimit": "disabled",
        "ratio": 1,
        "state": nodeState,
        "session": session, 
        "fqdn": {
            "autopopulate": "disabled"
        }
      }

    setPoolMembersLoading(true)

    let rest = new Rest(
        "POST",
        resp => {
          setPoolMembersLoading(false)
          setResponse(true)
          responseHandler()
        },
        error => {
          setPoolMembersLoading(false)
          error = Object.assign(error, {
            component: 'poolMembersAdd',
            vendor: 'f5',
            errorType: 'poolMemberAddError'
          })
          props.dispatch(err(error))
        }
      )
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/members/`, props.token, b)
  }

  let responseHandler = () => {
    setTimeout( () => setResponse(false), 2000)
    setTimeout( () => props.dispatch(poolMembersFetch(true)), 2030)
    setTimeout( () => closeModal(), 2050)
  }

  //Close and Error
  let closeModal = () => {
    //const \[\s*\w+\s*,\s*
    /*
    const \[ corrisponde alla stringa const [.
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
    \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
    ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
    */
    setVisible(false);
    setLoading(false);
    setNodesLoading(false);
    setPoolMembersLoading(false);
    setStates(['enabled', 'disabled', 'forced offline']);
    setStatus('')
    setStatusError(false)
    setSession('')
    setNodeState('')

    setNodes([])
    setNode({})
    setExistentNode({})
    setExistentNodeError('')

    setName('')
    setNameError('')
    setAddress('')
    setAddressError('')
    setPort('')
    setPortError('')

    setResponse(false);
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'poolMembersAdd') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }
    
  let createElement = (element, key, choices, obj, action) => {
    if (element === 'input') {
      if (key === 'name') {
        return (
          <Input
            value={name || ''}
            style=
            {nameError ?
              {borderColor: 'red'}
            :
              {}
            }
            //onBlur={event => set(event.target.value, key)}
            onChange={event => set(event.target.value, key)}
          />
        )
      }
      else if (key === 'address') {
        return (
          <Input
            //defaultValue={address ? address : ''}
            value={address || ''}
            style=
            {addressError ?
              {borderColor: 'red'}
            :
              {}
            }
            onChange={event => set(event.target.value, key)}
          />
        )
      }
      else if (key === 'port') {
        return (
          <Input
            //defaultValue={port ? port : ''}
            value={port || ''}
            style=
            {portError ?
              {borderColor: 'red'}
            :
              {}
            }
            onChange={event => set(event.target.value, key)}
          />
        )
      }
    }
    else if (element === 'select') {
      if (key === 'status') {
        return (
          <Select
            value={status ? status : ''}
            showSearch
            style=
            { statusError ?
              {width: "100%", border: `1px solid red`}
            :
              {width: "100%"}
            }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={n => set(n, key, obj)}
          >
            <React.Fragment>
              
            { states ?
              states.map((n, i) => {
                return (
                  <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })
              :
              null
            }
            </React.Fragment>
          </Select>
        )
      }
      else if (key === 'existentNode') {
        return (
          <Select
            value={existentNode && existentNode.name ? existentNode.name : ''}
            showSearch
            style={ {width: "100%"} }
            
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={n => set(n, key, obj)}
          >
            <React.Fragment>
              
            { nodes ?
              nodes.map((n, i) => {
                return (
                  <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                )
              })
              :
              null
            }
            </React.Fragment>
          </Select>
        )
      }
    }

  }

  return (
    <Space direction='vertical'>
      {console.log(name)}
      <Button type="primary" onClick={() => setVisible(true)}>Add Member</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>Add Pool Member</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={750}
        maskClosable={false}
      >
        { poolMembersLoading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !poolMembersLoading && response &&
          <Result
              status="success"
              title="Member Added"
            />
        }
        { !poolMembersLoading && !response &&
          <React.Fragment>

            <Row>
              <Col offset={4} span={4}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Existent Node:</p>
              </Col>
              <Col span={8}>
                { nodesLoading ?
                  <Spin indicator={spinIcon} style={{ margin: '0 10%'}}/>
                :
                  <Col span={24}>
                    {createElement('select', 'existentNode', 'nodes')}
                  </Col>
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'name', '')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Address:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'address', '')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Port:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'port', '')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={5} span={3}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>State:</p>
              </Col>
              <Col span={8}>
                {createElement('select', 'status', 'states')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => validation()} >
                  Add Node
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
      </Modal>

      {errorsComponent()}

    </Space>

  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  nodes: state.f5.nodes,
}))(Add);
