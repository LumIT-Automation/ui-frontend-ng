import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Card from '../../_components/card'

import {
  err
} from '../../concerto/store'

import {
  f5objects,
} from '../store'

import AssetSelector from '../../concerto/assetSelector'

import { Modal, Alert, Result, Button, Spin, Divider, Row, Col, Select } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const spinGetIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


function DeleteF5Node(props) {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});  
  const [loading, setLoading] = useState(false);
  const [f5objectsLoading, setF5objectsLoading] = useState(false);
  const [request, setRequest] = useState({});
  const [response, setResponse] = useState(false);

  useEffect(() => {
    if (visible && props.asset && props.partition) {
      f5objectsGet();
    }
  }, [visible, props.asset, props.partition]);


  let f5objectsGet = async () => {
    let f5object = props.f5object
    setF5objectsLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        props.dispatch(f5objects(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'f5deleteObject',
          vendor: 'f5',
          errorType: 'f5objectsError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/${f5object}s/`, props.token)
    setF5objectsLoading(false)
  }

  let f5objectNameSet = async e => {
    try {
      let requestCopy = JSON.parse(JSON.stringify(request))
      requestCopy.f5objectName = e
      setRequest(requestCopy)
    }
    catch (error) {
      console.log(error)
    }
    
  }

  //VALIDATION
  let validationCheck = async () => {
    let requestCopy = JSON.parse(JSON.stringify(request))
    let errorsCopy = JSON.parse(JSON.stringify(errors))

    if (!requestCopy.f5objectName) {
      errorsCopy.f5objectNameError = true
      setErrors(errorsCopy)
    }
    else {
      delete errorsCopy.f5objectNameError
      setErrors(errorsCopy)
    }
    return errors
  }

  let validation = async () => {
    let e = await validationCheck()

    if (Object.keys(e).length === 0) {
      f5objectDelete()
    }

  }

  let f5objectDelete = async () => {
    let f5object = props.f5object
    setLoading(true)

    let rest = new Rest(
      "DELETE",
      resp => {
        setLoading(false)
        setResponse(true)
        responseHandler()
      },
      error => {
        error = Object.assign(error, {
          component: 'f5deleteObject',
          vendor: 'f5',
          errorType: 'f5objectDeleteError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/workflow/${f5object}/${request.f5objectName}/`, props.token )

  }

  let responseHandler = () => {
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
    setErrors({});  
    setLoading(false);
    setF5objectsLoading(false);
    setRequest(false);
    setResponse(false);
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'f5deleteObject') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let f5object = props.f5object
    
  return (
    <React.Fragment>

      <Card 
        props={{
          width: 200, 
          title: `Delete ${f5object}`, 
          details: `Delete an existent ${f5object}.`,
          color: '#DC3E2F',
          onClick: function () { setVisible(true) },
        }}
      />

      <Modal
        title={<p style={{textAlign: 'center'}}>DELETE {f5object.toUpperCase()}</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <AssetSelector vendor='f5'/>
        <Divider/>

        { ( (props.asset && props.asset.id) && props.partition ) ?
          <React.Fragment>
            { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
            { !loading && response &&
              <Result
                  status="success"
                  title={`${f5object} deleted`}
                />
            }

            {!loading && !response ?
              <React.Fragment>
                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>{f5object} Name:</p>
                  </Col>
                  <Col span={16}>
                    { f5objectsLoading ?
                      <Spin indicator={spinGetIcon} style={{ margin: '0 10%'}}/>
                    :
                      <React.Fragment>
                        { props.f5objects && props.f5objects.length > 0 ?
                          <Select
                            defaultValue={request.f5objectName}
                            value={request.f5objectName}
                            showSearch
                            style={errors.f5objectNameError ? {width: 450, border: `1px solid red`} : {width: 450}}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            filterSort={(optionA, optionB) =>
                              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                            }
                            onSelect={n => f5objectNameSet(n)}
                          >
                            <React.Fragment>
                              {props.f5objects.map((n, i) => {
                                return (
                                  <Select.Option key={i} value={n.name}>{n.name}</Select.Option>
                                )
                              })
                              }
                            </React.Fragment>
                          </Select>
                        :
                          null
                        }
                      </React.Fragment>
                    }
                  </Col>
                </Row>

                <br/>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Remove {f5object}:</p>
                  </Col>
                  <Col span={16}>
                    <Button 
                      type="primary"
                      danger
                      onClick={() => validation()}
                    >
                      Delete {f5object}
                    </Button>
                  </Col>
                </Row>

                <br/>

              </React.Fragment>
            :
              null
            }
          </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }
      </Modal>

      {errorsComponent()}

    </React.Fragment>

  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  f5objects: state.f5.f5objects,
}))(DeleteF5Node);
