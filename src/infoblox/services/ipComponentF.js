import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function IpComponent(props) {

  let [visible, setVisible] = useState(false);
  let [ipRequestLoading, setIpRequestLoading] = useState(false);
  let [ipModifyLoading, setIpModifyLoading] = useState(false);
  let [errors, setErrors] = useState({});
  let [request, setRequest] = useState({ip:''});
  let [ipDetailsResponse, setIpDetailsResponse] = useState([]);
  let [ipModifyResponse, setIpModifyResponse] = useState([]);

  

  useEffect(() => {
    let requestCopy = JSON.parse(JSON.stringify(request))
    if (requestCopy.macAddress === '' || requestCopy.macAddress === undefined) {
      requestCopy.macAddress = '00:00:00:00:00:00'
      setRequest(requestCopy)
    }
  }, [request]);


  let set = async (e, key) => {
    let requestCopy = JSON.parse(JSON.stringify(request))
    requestCopy[key] = e
    if (key === 'serverName' && requestCopy.options) {
      requestCopy.options.forEach((item, i) => {
        if (item.num === 12) {
          item.value = e
        }
      });
    }
    setRequest({...requestCopy})
  }

  let validationChecks = async () => {
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    let requestCopy = JSON.parse(JSON.stringify(request))
    let validators = new Validators()

    for (const key in requestCopy) {
      if (key === 'ip') {
        if (validators.ipv4(requestCopy[key])) {
          delete errorsCopy[`${key}Error`]
          setErrors({...errorsCopy})
        }
        else {
          errorsCopy[`${key}Error`] = true
          setErrors({...errorsCopy})
        }
      }
      if (key === 'macAddress') {
        if (!validators.macAddress(requestCopy.macAddress)) {
          errorsCopy.macAddressError = true
          setErrors({...errorsCopy})
        }
        else {
          delete errorsCopy.macAddressError
          setErrors({...errorsCopy})
        }
      }
      if (key === 'serverName') {
        if (!requestCopy.serverName) {
          errorsCopy.serverNameError = true
          setErrors({...errorsCopy})
        }
        else {
          delete errorsCopy.serverNameError
          setErrors({...errorsCopy})
        }
      }
    }
    return errorsCopy
  }

  let validation = async(action) => {
    await validationChecks()

    if (Object.keys(errors).length === 0) {
      if (action === 'ip details') {
        ipDetail()
      }
      if (action === 'ip modify') {
        ipModify()
      }
    }
  }

  let ipDetail = async () => {
    setIpRequestLoading(true)
    let requestCopy = JSON.parse(JSON.stringify(request))
    let rest = new Rest(
      "GET",
      resp => {
        let r = JSON.parse(JSON.stringify(resp.data))
        if (props.service === 'ip modify') {
          if (r.extattrs && r.extattrs['Name Server']) {
            r.serverName = r.extattrs['Name Server'].value
          }
          r.macAddress = r.mac_address

          requestCopy.serverName = r.serverName
          requestCopy.macAddress = r.macAddress
          requestCopy.status = r.status
          requestCopy.options = r.objects[0].options

        }
        if (r.objects && r.objects[0] && r.objects[0].options) {
          r.objects[0].options.forEach((item, i) => {
            if (item.num === 12) {
              r.option12 = item.value
            }
          });

        }
        let list = []
        list.push(r)

        setIpDetailsResponse([...list])
        setRequest({...requestCopy})
      },
      error => {
        error = Object.assign(error, {
          component: 'ipComponent',
          vendor: 'infoblox',
          errorType: 'ipDetailError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${request.ip}/`, props.token)
    setIpRequestLoading(false)
  }

  let ipModify = async () => {
    let requestCopy = JSON.parse(JSON.stringify(request))
    //console.log(requestCopy)
    let b = {}
    b.data = {
      "mac": `${requestCopy.macAddress}`,
      "extattrs": {
          "Name Server": {
              "value": `${requestCopy.serverName}`
          }
      },
    }

    if (requestCopy.options) {
      b.data.options = requestCopy.options
    }

    setIpModifyLoading(true)

    let rest = new Rest(
      "PATCH",
      resp => {
        setIpModifyLoading(false)
        ipDetail()
      },
      error => {
        error = Object.assign(error, {
          component: 'ipComponent',
          vendor: 'infoblox',
          errorType: 'ipModifyError'
        })
        props.dispatch(err(error))
        setIpModifyLoading(false)
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${requestCopy.ip}/`, props.token, b )
  }

  //Close and Error
  let closeModal = () => {
    setVisible(false);
    setIpRequestLoading(false);
    setIpModifyLoading(false);
    setErrors({});
    setRequest({ip:''});
    setIpDetailsResponse([]);
    setIpModifyResponse([]);
  }

  let createElement = (element, key, choices, obj, action) => {
    if (key === 'macAddress') {
      return (
        <Input
          style=
          {errors[`${key}Error`] ?
            {borderColor: 'red'}
          :
            {}
          }
          disabled={props.service === 'ip details' ? true : false}
          defaultValue={request ? request[key] : ''}
          onBlur={event => set(event.target.value, key)}
          //onPressEnter={() => validation(action)}
        />
      )
    }
    else {
      return (
        <Input
          style=
          {errors[`${key}Error`] ?
            {borderColor: 'red'}
          :
            {}
          }
          defaultValue={obj ? obj[key] : request ? request[key] : ''}
          onBlur={event => set(event.target.value, key)}
          //onPressEnter={() => validation(action)}
        />
      )
    }

  }

  const columns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {ipModifyLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'IP address',
      align: 'center',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    props.service === 'ip details' ?
      {
        title: 'Name Server',
        align: 'center',
        dataIndex: ['extattrs', 'Name Server', 'value'],
        key: 'nameServer',
      }
    :
      {
        title: 'Server Name',
        align: 'center',
        dataIndex: ['extattrs', 'Name Server', 'value'],
        key: 'nameServer',
        render: (name, obj)  => (
          <React.Fragment>
            {createElement('input', 'serverName', '', obj, 'ip modify')}
          </React.Fragment>
        ),
      },
    {
      title: 'Mac address',
      align: 'center',
      dataIndex: 'macAddress',
      key: 'macAddress',
      render: (name, obj)  => (
        <React.Fragment>
          {createElement('input', 'macAddress', '', obj, 'ip modify')}
        </React.Fragment>
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Gateway',
      align: 'center',
      dataIndex: ['extattrs', 'Gateway', 'value'],
      key: 'gateway',
    },
    {
      title: 'Mask',
      align: 'center',
      dataIndex: ['extattrs', 'Mask', 'value'],
      key: 'mask',
    },
    {
      title: 'Record A',
      align: 'center',
      dataIndex: 'names',
      key: 'recordA',
    },
    {
      title: 'Option 12 (DHCP)',
      align: 'center',
      dataIndex: 'option12',
      key: 'option12',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.option12 ? obj.option12 : null}
        </React.Fragment>
      ),
    },
    {
      title: 'Assignee',
      align: 'center',
      width: 200,
      //dataIndex: ['extattrs', 'Reference', 'value'],
      key: 'reference',
      render: (name, obj)  => (
        <React.Fragment>
        {obj.extattrs && obj.extattrs && obj.extattrs.Reference && obj.extattrs.Reference.value ?
          obj.extattrs.Reference.value
        :
          '-'
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Requester',
      align: 'center',
      width: 200,
      //dataIndex: ['objects', 'extattrs', 'Reference', 'value'],
      key: 'reference',
      render: (name, obj)  => (
        <React.Fragment>
        {obj.objects && obj.objects[0] && obj.objects[0].extattrs && obj.objects[0].extattrs.Reference && obj.objects[0].extattrs.Reference.value ?
          obj.objects[0].extattrs.Reference.value
        :
          '-'
        }
        </React.Fragment>
      ),
    },

  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'ipComponent') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      
      <Button type="primary" onClick={() => setVisible(true)}>{props.service.toUpperCase()}</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>{props.service.toUpperCase()}</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <AssetSelector vendor='infoblox'/>
        <Divider/>

        { ( props.asset && props.asset.id ) ?
          <React.Fragment>
            <Row>
              <Col offset={6} span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>IP address:</p>
              </Col>
              <Col span={15}>
              { ipRequestLoading ?
                <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
              :
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      {createElement('input', 'ip', '', '', 'ip details')}
                    </Col>
                  </Row>
                  <br/>
                </React.Fragment>
              }
              </Col>
            </Row>
            <Row>
              <Col offset={8} span={16}>
                <Button
                  type="primary"
                  onClick={() => validation('ip details')}
                >
                  ip details
                </Button>
              </Col>
            </Row>

            <Divider/>

          { (ipDetailsResponse.length < 1 || ipRequestLoading)?
            null
          :
            <React.Fragment>
              <Table
                columns={columns}
                dataSource={ipDetailsResponse}
                bordered
                rowKey="ip"
                scroll={{x: 'auto'}}
                pagination={false}
                style={{marginBottom: 10}}
              />
                {(props.service === 'ip details') ?
                  null
                :
                  (( ipDetailsResponse && ipDetailsResponse[0] && ipDetailsResponse[0].status === 'USED' ) ?
                  <Button
                    type="primary"
                    onClick={() => validation('ip modify')}
                  >
                    ip modify
                  </Button>
                :
                  <Button
                    type="primary"
                    disabled
                  >
                    ip modify
                  </Button>
                )
                }
            </React.Fragment>
          }
          </React.Fragment>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }

      </Modal>

      {visible ?
        <React.Fragment>
          {errorsComponent()}
        </React.Fragment>
      :
        null
      }

    </React.Fragment>

  )
  
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.infoblox.asset,
}))(IpComponent);
