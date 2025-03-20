import React, { useState } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import CommonFunctions from '../../_helpers/commonFunctions'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Alert, Divider, Input, Button, Spin, Table, Space, Card } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Meta } = Card;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

/*

<Card
  hoverable
  style={{
    width: 240,
  }}
  cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
>
  <Meta title="Europe Street beat" description="www.instagram.com" />
</Card>

*/

function ReleaseIp(props) {

  let [visible, setVisible] = useState(false);
  let [requests, setRequests] = useState([{id:1}]);
  let [request, setRequest] = useState({});

  let itemAdd = async (items, type) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(items, type);
    setRequests([...list]);  
  };

  let itemRemove = async (item, items) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, items);
    if (list && list.length < 1) {
      list.push({id:1})
    }
    setRequests([...list]);  
  };

  let setIp = (e, id) => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let requestCopy = requestsCopy.find( r => r.id === id )
    requestCopy.ip = e.target.value
    setRequests(requestsCopy)
  }

  let validateIp = async () => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))
    let validators = new Validators()
    let error = false

    requestsCopy.forEach((r, i) => {
      if (validators.ipv4(r.ip)) {
        r.ipError = null
      }
      else {
        r.ipError = 'Please input a valid ip'
        error = true
      }
      setRequests(requestsCopy)
    })

    if (!error) {
      releaseHandler()
    }
  }

  let releaseHandler = async () => {
    let requestsCopy = JSON.parse(JSON.stringify(requests))

    requestsCopy.forEach((r, i) => {
      delete r.isReleased
    })
    setRequests(requestsCopy)

    for await (const r of requestsCopy) {
      r.isLoading = true
      setRequests([...requestsCopy])
      try {
        const resp = await releaseIp(r)
        if (resp.status === 404) {
          r.isReleased = 'NOT FOUND, NOT RELEASED'
          r.isLoading = false
          setRequests([...requestsCopy])
        }
        else if (resp.status !== 200) {
          r.isReleased = 'NOT RELEASED'
          let error = Object.assign(resp, {
            component: 'releaseIp',
            vendor: 'infoblox',
            errorType: 'ipReleaseError'
          })
          props.dispatch(err(error));
          r.isLoading = false
          setRequests([...requestsCopy])
        }
        else {
          r.isReleased = 'RELEASED'
          r.isLoading = false
          setRequests([...requestsCopy])
        }
      } catch(error) {
        console.log(error)
        r.isReleased = false
        r.isLoading = false
        setRequests([...requestsCopy])
      }
    }
  }

  let releaseIp = async request => {
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
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${request.ip}/`, props.token )
    return r
  }

  //Close and Error
  let closeModal = () => {
    setVisible(false);
    setRequests([{id:1}]);
    setRequest({});
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'releaseIp') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  const requestsColumns = [
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
          <Input
            id='ip'
            defaultValue={obj.ip}
            onBlur={e => setIp(e, obj.id)}
            onPressEnter={() => validateIp()}
          />
          {obj.ipError ?
            <p style={{color: 'red'}}>{obj.ipError}</p>
          :
            null
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
        <Button type="danger" onClick={() => itemRemove(obj, requests)}>
          -
        </Button>
      ),
    },

  ]

  return (
    <React.Fragment>

      <Button type="primary" onClick={() => setVisible(true)}>RELEASE IP</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>RELEASE IP</p>}
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

          <React.Fragment>
            <Button type="primary" onClick={() => itemAdd(requests)}>
              +
            </Button>
            <br/>
            <br/>
            <Table
              columns={requestsColumns}
              dataSource={requests}
              bordered
              rowKey="id"
              scroll={{x: 'auto'}}
              pagination={false}
              style={{marginBottom: 10}}
            />
            <Button type="primary" style={{float: "right", marginRight: '20px'}} onClick={() => validateIp()}>
              Release Ip
            </Button>
            <br/>
          </React.Fragment>

            <Divider/>

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
}))(ReleaseIp);
