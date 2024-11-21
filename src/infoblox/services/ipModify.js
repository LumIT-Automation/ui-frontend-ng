import React, { useState, useEffect } from 'react';
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


function IpModify(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [ipModifyLoading, setIpModifyLoading] = useState(false);
  
  let [errors, setErrors] = useState({});
  let [requestIp, setRequestIp] = useState('');
  let [response, setResponse] = useState([]);
  let [ipModifyRequest, setIpModifyRequest] = useState({ip: ''});
  let [ipModifyResponse, setIpModifyResponse] = useState([]);

  useEffect(() => {
    if (response && response.length > 0 ) {
      let ipModifyRequestCopy = response[0]
      setIpModifyRequest(ipModifyRequestCopy)
    }
  }, [response]);

  let ipDetailsHanldler = async() => {
    setResponse([])
    validation()
  }

  let set = async (e, key) => {
    let ipModifyRequestCopy = JSON.parse(JSON.stringify(ipModifyRequest))

    ipModifyRequestCopy[key] = e

    if (key === 'serverName' && ipModifyRequestCopy.options) {
      ipModifyRequestCopy.options.forEach((item, i) => {
        if (item.num === 12) {
          item.value = e
        }
      });
    }
    setIpModifyRequest(ipModifyRequestCopy)
  }

  let validationChecks = async () => {
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    let validators = new Validators()
    let ipModifyRequestCopy = JSON.parse(JSON.stringify(ipModifyRequest))

    if (validators.ipv4(requestIp)) {
      delete errorsCopy.requestIpError
      setErrors({...errorsCopy})
    }
    else {
      errorsCopy.requestIpError = true
      setErrors({...errorsCopy})
    }

    if (response && response.length > 1 ) {
      if (key === 'macAddress') {
        if (ipModifyRequestCopy.macAddress === '' || ipModifyRequestCopy.macAddress === undefined) {
          ipModifyRequestCopy.macAddress = '00:00:00:00:00:00'
          setIpModifyRequest(ipModifyRequestCopy)
        }
        if (!validators.macAddress(ipModifyRequestCopy.macAddress)) {
          errorsCopy.macAddressError = true
          setErrors({...errorsCopy})
        }
        else {
          delete errorsCopy.macAddressError
          setErrors({...errorsCopy})
        }
      }
      if (key === 'serverName') {
        if (!ipModifyRequestCopy.serverName) {
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
    let e = await validationChecks()
    console.log(response)
    console.log(response.length)
    if (response.length < 1 ) {
      if (requestIp && Object.keys(e).length === 0) {
        console.log('details')
        ipDetail()
      }
    }
    else {
      console.log('modify')
      ipModify()
    }
  }

  let ipDetail = async () => {
    setLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        let r = JSON.parse(JSON.stringify(resp.data))
        //console.log(r)

        if (r.extattrs && r.extattrs['Name Server']) {
          r.serverName = r.extattrs['Name Server'].value
        }
        r.macAddress = r.mac_address

        if (r.objects && r.objects[0] && r.objects[0].options) {
          r.objects[0].options.forEach((item, i) => {
            if (item.num === 12) {
              r.option12 = item.value
            }
          });

        }
        let list = []
        list.push(r)

        setResponse([...list])
      },
      error => {
        error = Object.assign(error, {
          component: 'ipModify',
          vendor: 'infoblox',
          errorType: 'ipDetailError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${requestIp}/`, props.token)
    setLoading(false)
  }

  let ipModify = async () => {
    let ipModifyRequestCopy = JSON.parse(JSON.stringify(ipModifyRequest))
    let b = {}
    b.data = {
      "mac": `${ipModifyRequestCopy.macAddress}`,
      "extattrs": {
          "Name Server": {
              "value": `${ipModifyRequestCopy.serverName}`
          }
      },
    }

    if (ipModifyRequestCopy.options) {
      b.data.options = ipModifyRequestCopy.options
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
          component: 'ipModify',
          vendor: 'infoblox',
          errorType: 'ipModifyError'
        })
        props.dispatch(err(error))
        setIpModifyLoading(false)
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${ipModifyRequestCopy.ip_address}/`, props.token, b )
  }

  //Close and Error
  let closeModal = () => {
    //let \[\s*\w+\s*,\s*
    /*
    let \[ corrisponde alla stringa const [.
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
    \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
    ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
    */
    setVisible(false);
    setLoading(false);
    setErrors({});
    setRequestIp('');
    setResponse([]);
  }

  let createElement = (element, key, choices, obj) => {
    if (element === 'input') {
      return (
        <Input
          style=
          {errors[`${key}Error`] ?
            {borderColor: 'red'}
          :
            {}
          }
          defaultValue={obj ? obj[key] : ''}
          onChange={event => set(event.target.value, key)}
          onPressEnter={() => validation()}
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
    {
      title: 'Server Name',
      align: 'center',
      width: 200,
      dataIndex: ['extattrs', 'Name Server', 'value'],
      key: 'nameServer',
      render: (name, obj)  => (
        <React.Fragment>
          {createElement('input', 'serverName', '', obj)}
        </React.Fragment>
      ),
    },
    {
      title: 'Mac address',
      align: 'center',
      width: 200,
      dataIndex: 'mac_address',
      key: 'mac_address',
      render: (name, obj)  => (
        <React.Fragment>
          {createElement('input', 'macAddress', '', obj)}
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
    }

  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'ipModify') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>IP MODIFY</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>IP MODIFY</p>}
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
              { loading ?
                <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
              :
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      <Input
                        style=
                        {errors.requestIpError ?
                          {borderColor: 'red'}
                        :
                          {}
                        }
                        defaultValue={requestIp ? requestIp : ''}
                        onBlur={event => setRequestIp(event.target.value)}
                      />
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
                  onClick={() => ipDetailsHanldler()}
                >
                  ip details
                </Button>
              </Col>
            </Row>

              
            <Divider/>

          { (response.length < 1 || loading)?
            null
          :
            <>
              <Table
              columns={columns}
              dataSource={response}
              bordered
              rowKey="ip"
              scroll={{x: 'auto'}}
              pagination={false}
              style={{marginBottom: 10}}
            />
            <br/>
            <Button
              type="primary"
              onClick={() => validation()}
            >
              ip modify
            </Button>
            </>
            
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
}))(IpModify);
