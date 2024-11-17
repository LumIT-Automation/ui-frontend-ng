import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  poolMembersFetch,
} from '../store'

import { Button, Space, Modal, Col, Row, Spin, Result } from 'antd';
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const deleteIcon = <DeleteOutlined style={{color: 'white' }}  />


function Delete(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [response, setResponse] = useState(false);

  useEffect(() => {
    if (visible && response) {
      setTimeout( () => setResponse(false), 2000)
      setTimeout( () => props.dispatch(poolMembersFetch(true)), 2030)
      setTimeout( () => closeModal(), 2050)
    }
  }, [visible, response]);

  let poolMemberDelete = async pool => {
    setLoading(true)
    let rest = new Rest(
      "DELETE",
      resp => {
        setLoading(false)
        setResponse(true)
      },
      error => {
        error = Object.assign(error, {
          component: 'poolMembersDelete',
          vendor: 'f5',
          errorType: 'poolMemberDeleteError'
        })
        props.dispatch(err(error))
        setLoading(false)
      }
    )
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/pool/${props.poolName}/member/${props.obj.name}/`, props.token )
  }


  //Close and Error
  let closeModal = () => {
    setVisible(false)
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'poolMembersDelete') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <Space direction='vertical'>

    <Button icon={deleteIcon} type='primary' danger onClick={() => setVisible(true)} shape='round'/>

      <Modal
        title={<div><p style={{textAlign: 'center'}}>DELETE</p> <p style={{textAlign: 'center'}}>{props.obj.name}</p></div>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={null}
        onCancel={() => closeModal()}
        width={750}
        maskClosable={false}
      >
        { loading && <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/> }
          {!loading && response &&
            <Result
               status="success"
               title="Deleted"
             />
          }
          {!loading && !response &&
            <div>
              <Row>
                <Col span={5} offset={10}>
                  <h2>Are you sure?</h2>
                </Col>
              </Row>
              <br/>
              <Row>
                <Col span={2} offset={10}>
                  <Button type="primary" onClick={() => poolMemberDelete(props.obj)}>
                    YES
                  </Button>
                </Col>
                <Col span={2} offset={1}>
                  <Button type="primary" onClick={() => closeModal()}>
                    NO
                  </Button>
                </Col>
              </Row>
            </div>
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
}))(Delete);
