import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'
import Card from '../../_components/card'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function IpDetails(props) {

  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [errors, setErrors] = useState({});
  let [requestIp, setRequestIp] = useState('');
  let [response, setResponse] = useState([]);

  let validationChecks = async () => {
    let errorsCopy = JSON.parse(JSON.stringify(errors))
    let validators = new Validators()

    if (validators.ipv4(requestIp)) {
      delete errorsCopy.requestIpError
      setErrors({...errorsCopy})
    }
    else {
      errorsCopy.requestIpError = true
      setErrors({...errorsCopy})
    }

    return errorsCopy
  }

  let validation = async(action) => {
    let e = await validationChecks()

    if (Object.keys(e).length === 0) {
      ipDetail()
    }
  }

  let ipDetail = async () => {
    setLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        let r = JSON.parse(JSON.stringify(resp.data))

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
          component: 'ipDetails',
          vendor: 'infoblox',
          errorType: 'ipDetailError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${requestIp}/`, props.token)
    setLoading(false)
  }

  //Close and Error
  let closeModal = () => {
    setVisible(false);
    setLoading(false);
    setErrors({});
    setRequestIp('');
    setResponse([]);
  }

  const columns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {loading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
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
      dataIndex: 'serverName',
      key: 'serverName',
    },
    {
      title: 'Mac address',
      align: 'center',
      dataIndex: 'macAddress',
      key: 'macAddress',
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
    if (props.error && props.error.component === 'ipDetails') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      
      <Card 
        props={{
          width: 200, 
          title: 'Info IP', 
          details: 'Search for existent ip details.',
          color: '#1677FF',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{textAlign: 'center'}}>IP DETAILS</p>}
        centered
        destroyOnClose={true}
        open={visible}
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
                  onClick={() => validation()}
                >
                  ip details
                </Button>
              </Col>
            </Row>

            <Divider/>

          { (response.length < 1 || loading)?
            null
          :
            <Table
              columns={columns}
              dataSource={response}
              bordered
              rowKey="ip"
              scroll={{x: 'auto'}}
              pagination={false}
              style={{marginBottom: 10}}
            />
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
}))(IpDetails);
