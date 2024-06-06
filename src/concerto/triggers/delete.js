import React, { useState } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Button, Modal, Col, Row, Spin, Result } from 'antd'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  triggersFetch,
  err,
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const deleteIcon = <DeleteOutlined style={{color: 'white' }}  />



function Delete(props) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);

  const triggerDelete = async trigger => {
    setLoading(true)
    let rest = new Rest(
      "DELETE",
      resp => {
        setLoading(false)
        setResponse(true)
        props.dispatch(triggersFetch(true))
      },
      error => {
        error = Object.assign(error, {
          component: 'triggerDelete',
          vendor: 'concerto',
          errorType: 'triggerDeleteError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(true)
      }
    )
    await rest.doXHR(`${props.vendor}/trigger/${trigger.id}/`, props.token )

  }


  const showErrors = () => {
    if (props.error && props.error.component === 'triggerDelete') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>

      <Button icon={deleteIcon} type='primary' danger onClick={() => setVisible(true)} shape='round'/>

      <Modal
        title={<div><p style={{textAlign: 'center'}}>DELETE</p> <p style={{textAlign: 'center'}}>{props.obj.name}</p></div>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={null}
        onCancel={() => setVisible(false)}
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
                <Button type="primary" onClick={() => triggerDelete(props.obj)}>
                  YES
                </Button>
              </Col>
              <Col span={2} offset={1}>
                <Button type="primary" onClick={() => setVisible(false)}>
                  NO
                </Button>
              </Col>
            </Row>
          </div>
        }

      </Modal>

      {visible ?
        <React.Fragment>
          {showErrors()}
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
}))(Delete);
