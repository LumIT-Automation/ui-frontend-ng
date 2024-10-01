import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../_helpers/Rest'
import Error from '../concerto/error'

import { err } from '../concerto/store';

import {
  fetchItems,
} from './store'

import { Input, Button, Space, Modal, Spin, Result, Select, Row, Col, Radio, Checkbox, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />
const datacenterServerLoading = <LoadingOutlined style={{ fontSize: 25 }} spin />

function Add(props) {
  let [visible, setVisible] = useState(false);
  let [datacenterServers, setDatacenterServers] = useState([]);
  let [defaultCheckedList, setDefaultCheckedList] = useState([]);
  let [checkedList, setCheckedList] = useState([]);
  let [indeterminate, setIndeterminate] = useState(true);
  let [checkAll, setCheckAll] = useState(false);

  let [keyTypes, setKeyTypes] = useState(['predefined', 'tag']);
  let [predefinedKeys, setPredefinedKeys] = useState(['type-in-data-center', 'name-in-data-center', 'ip-address']);
  let [tagKeys, setTagKeys] = useState(['tag']);
  let [detailsLevels, setDetailsLevels] = useState(['uid', 'standard', 'full']);
      
  let [loading, setLoading] = useState(false);
  let [datacenterServersLoading, setDatacenterServersLoading] = useState(false);
  let [request, setRequest] = useState({});
  let [errors, setErrors] = useState({});
  let [valid, setValid] = useState(false);
  let [response, setResponse] = useState(null);

  const prevRequest = useRef(request);

  useEffect(() => {
    if (prevRequest.current['keyType'] !== request['keyType']) {
      const newRequest = { ...request };
      delete newRequest['key'];
      delete newRequest['values'];
      setRequest(newRequest);
    } else if (prevRequest.current['key'] !== request['key']) {
      const newRequest = { ...request };
      delete newRequest['values'];
      setRequest(newRequest);
    }
    
    // Aggiorna prevRequest dopo che il rendering è stato completato
    prevRequest.current = request;
  }, [request['keyType'], request['key']]); // Dipendenze

  useEffect(() => {
    if (visible) {
      datacenterServersGet()
    }
  }, [visible]);

  useEffect(() => {
    if (Object.keys(errors).length === 0 && valid) {
      datacenterQueryAdd()
      setValid(false)
    }
  }, [valid]);

  let datacenterServersGet = async () => {
    setDatacenterServersLoading(true)
    let rest = new Rest(
      "GET",
      resp => {
        let list = []
        resp.data.items.forEach((item, i) => {
          list.push(item.name)
        });
        setDatacenterServers(list)
        setDatacenterServersLoading(false)
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterQuerysAdd',
          vendor: 'checkpoint',
          errorType: 'datacenterQuerysError'
        })
        props.dispatch(err(error))
        setDatacenterServersLoading(false)
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/datacenter-servers/?local`, props.token)

  }

  let set = async (e, key) => {
    let requestCopy = {...request}
    requestCopy[key] = e
    setRequest(requestCopy)
  }

  let validationCheck = async () => {
    setErrors({});
    let requestCopy = {...request}
    let errorsCopy = {...errors}
    let ok = true;

    if (!requestCopy['name']) {
      errorsCopy['nameError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['nameError']
    }

    if (!requestCopy['keyType']) {
      errorsCopy['keyTypeError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['keyTypeError']
    }

    if (requestCopy['keyType']) {
      if (!requestCopy['key']) {
        errorsCopy['keyError'] = true
        ok = false;
      }
      else {
        delete errorsCopy['keyError']
      }

      if (!requestCopy['values']) {
        errorsCopy['valuesError'] = true
        ok = false;
      }
      else {
        delete errorsCopy['valuesError']
      }
    }

    if (!requestCopy['tags']) {
      errorsCopy['tagsError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['tagsError']
    }

    if (!requestCopy['detailsLevel']) {
      errorsCopy['detailsLevelError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['detailsLevelError']
    }

    setErrors(errorsCopy)
    return ok;
  }

  let validation = async () => {
    let valid = await validationCheck();
    setValid(valid)
  }

  //DISPOSAL ACTION
  let datacenterQueryAdd = async () => {
    let requestCopy = {...request}
    let tags = []
    let values = []
    let l = []

    try {
      l = requestCopy.tags.split(',')
      l.forEach((item, i) => {
        tags.push(item.trim())
      });

      l = requestCopy.values.split(',')
      l.forEach((item, i) => {
        values.push(item.trim())
      });

    }
    catch (error) {
      console.log(error)
    }

    let b = {}
    b.data = {
      "name": requestCopy.name,
      "query-rules": {
        "key-type": requestCopy['keyType'],
        "key": requestCopy.key,
        "values": values
      },

      "tags": tags,
      "color": "orange",
      "comments": requestCopy.comments,
      "details-level": requestCopy['detailsLevel'],
      "ignore-warnings": true,
      "ignore-errors": false
    }

    if (checkedList.length === 0) {
      b.data["data-centers"] = 'All'
    } else {
      b.data["data-centers"] = checkedList
    }

    setLoading(true)

    let rest = new Rest(
      "POST",
      resp => {
        setLoading(false)
        setResponse(true)
        hanldeResponse()
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterQuerysAdd',
          vendor: 'checkpoint',
          errorType: 'datacenterQueryAddError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/datacenter-queries/`, props.token, b)
  }

  let hanldeResponse = () => {
    setTimeout( () => setResponse(false), 2000)
    setTimeout( () => props.dispatch(fetchItems(true)), 2030)
    setTimeout( () => closeModal(), 2050)
  }

  //Close and Error
  //const \[\s*\w+\s*,\s*
  /*
  const \[ corrisponde alla stringa const [.
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
  \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
  ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
  */
  let closeModal = () => {
    setVisible(false);
    setDatacenterServers([]);
    setDefaultCheckedList([]);
    setCheckedList([]);
    setIndeterminate(true);
    setCheckAll(false);

    setKeyTypes(['predefined', 'tag']);
    setPredefinedKeys(['type-in-data-center', 'name-in-data-center', 'ip-address']);
    setTagKeys(['tag']);
    setDetailsLevels(['uid', 'standard', 'full']);
        
    setLoading(false);
    setDatacenterServersLoading(false);
    setRequest({});
    setErrors({});
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'datacenterQuerysAdd') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let onChangeCustom = (list) => {
    setCheckedList(list)
    setIndeterminate(!!list.length && list.length < datacenterServers.length)
    setCheckAll(list.length === datacenterServers.length)
  };

  let onCheckAllChange = (e) => {
    setCheckedList((e.target.checked ? datacenterServers : []))
    setIndeterminate(false)
    setCheckAll()
  };

  let createElement = (component, key, choices) => {

    switch (component) {
      case 'input':
        return (
          <Input
            style=
            {errors[`${key}Error`] ?
              {borderColor: 'red'}
            :
              {}
            }
            onChange={event => set(event.target.value, key)}
          />
        )
        break;

      case 'checkbox':
        return (
          <Checkbox
            checked={request[`${key}`]}
            onChange={event => set(event.target.checked, key)}
          />
        )
        break;

      case 'checkboxGroup':
        return (
          <React.Fragment>
            <Checkbox 
              indeterminate={indeterminate} 
              onChange={onCheckAllChange} 
              checked={checkAll}
            >
              Check all
            </Checkbox>
            <Divider />
            <Checkbox.Group 
              options={datacenterServers} 
              value={checkedList} 
              onChange={onChangeCustom}
            />
          </React.Fragment>
        )
        break;

      case 'radio':
        return (
          <Radio.Group
            onChange={event => set(event.target.value, key)}
            value={request[`${key}`]}
            style={errors[`${key}Error`] ?
              {border: `1px solid red`}
            :
              {}
            }
          >
            <React.Fragment>
              {choices.map((n, i) => {
                return (
                  <Radio.Button key={i} value={n}>{n}</Radio.Button>
                )
              })
              }
            </React.Fragment>
        </Radio.Group>
        )
        break;

      case 'textArea':
        return (
          <Input.TextArea
            rows={7}
            placeholder={
            (key === 'tags') ? "Insert your tags' list, each one comma separated. \nExample: tag1, tag2, ..., tagN" :
            (key === "values") ? "The value(s) of the Data Center property to match the Query Rule. Values are case-insensitive. There is an 'OR' operation between multiple values. \n\nFor key-type 'predefined' and key 'ip-address', the values must be an IPv4 or IPv6 address. \nFor key-type 'tag', the values must be the Data Center tag values. \n\nInsert your values' list, each one comma separated. \nExample: val1, val2, ..., valN" :
            ""
            }
            value={request[`${key}`]}
            onChange={event => set(event.target.value, key)}
            style=
            { errors[`${key}Error`] ?
              {borderColor: `red`}
            :
              {}
            }
          />
        )
        break;

      case 'select':
        return (
          <Select
            value={request[`${key}`]}
            showSearch
            style=
            { errors[`${key}Error`] ?
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
            onSelect={event => set(event, key)}
          >
            <React.Fragment>
            { choices === 'AWS Regions' ?
              ['AWS Regions'].map((v,i) => {
                let str = `${v[0].toString()} - ${v[1].toString()}`
                return (
                  <Select.Option key={i} value={v[1]}>{str}</Select.Option>
                )
              })
            :
              choices.map((n, i) => {
                return (
                  <Select.Option key={i} value={n}>{n}</Select.Option>
                )
              })
            }
            </React.Fragment>
          </Select>
        )

      default:

    }

  }

  return (
    <Space direction='vertical'>

      <Button icon={addIcon} type='primary' onClick={() => setVisible(true)} shape='round'/>

      <Modal
        title={<p style={{textAlign: 'center'}}>ADD DATACENTER SERVER</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >
        { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !loading && response &&
          <Result
             status="success"
             title="Datacenter Query addedd"
           />
        }
        { !loading && !response &&
          <React.Fragment>
            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
              </Col>
              <Col span={8}>
                {createElement('input', 'name')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key Type:</p>
              </Col>
              <Col span={8}>
                {createElement('radio', 'keyType', keyTypes)}
              </Col>
            </Row>
            <br/>

            {request['keyType'] === 'predefined' ?
              <React.Fragment>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                  </Col>
                  <Col span={7}>
                    {createElement('radio', 'key', predefinedKeys)}
                  </Col>
                </Row>
                <br/>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Values:</p>
                  </Col>
                  <Col span={7}>
                    {createElement('textArea', 'values')}
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            {request['keyType'] === 'tag' ?
              <React.Fragment>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Key:</p>
                  </Col>
                  <Col span={7}>
                    {createElement('radio', 'key', tagKeys)}
                  </Col>
                </Row>
                <br/>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Values:</p>
                  </Col>
                  <Col span={7}>
                    {createElement('textArea', 'values')}
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Datacenters:</p>
              </Col>
              {datacenterServersLoading ?
                <Col span={8}>
                  <Spin indicator={datacenterServerLoading} style={{margin: 'auto 48%'}}/>
                </Col>
              :
              <Col span={8}>
                {createElement('checkboxGroup')}
              </Col>
              }

            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags:</p>
              </Col>
              <Col span={8}>
                {createElement('textArea', 'tags')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Comments:</p>
              </Col>
              <Col span={8}>
                {createElement('textArea', 'comments')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Details-level:</p>
              </Col>
              <Col span={8}>
                {createElement('radio', 'detailsLevel', detailsLevels)}
              </Col>
            </Row>
            <br/>



            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => validation()} >
                  Add Datacenter Query
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

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain
}))(Add);


