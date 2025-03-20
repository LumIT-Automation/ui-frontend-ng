import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

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


function Add(props) {
  let [visible, setVisible] = useState(false);
  let [AWSRegions, setAWSRegions] = useState([]);
  let [types, setTypes] = useState(['aws', 'azure', 'gcp']);

  let [awsAuthenticationMethods, setAwsAuthenticationMethods] = useState(['user-authentication', 'role-authentication'])
  let [azureAuthenticationMethods, setAzureAuthenticationMethods] = useState(['user-authentication', 'service-principal-authentication'])
  let [gcpAuthenticationMethods, setGcpAuthenticationMethods] = useState(['key-authentication', 'vm-instance-authentication'])
  let [azureEnvironment, setAzureEnvironment] = useState(['AzureCloud', 'AzureChinaCloud', 'AzureUSGovernment'])
  let [detailsLevels, setDetailsLevels] = useState(['uid', 'standard', 'full'])

  let [loading, setLoading] = useState(false);
  let [request, setRequest] = useState({});
  let [errors, setErrors] = useState({});
  let [valid, setValid] = useState(false);
  let [response, setResponse] = useState(null);

  useEffect(() => {
    if (visible) {
      start()
    }
  }, [visible]);

  useEffect(() => {
    if (Object.keys(errors).length === 0 && valid) {
      datacenterServerAdd()
      setValid(false)
    }
  }, [valid]);

  let start = async () => {
    setLoading(true)
    let data = await configurationGet()
    if (data.status && data.status !== 200 ) {
      let error = Object.assign(data, {
        component: 'datacenterServersAdd',
        vendor: 'checkpoint',
        errorType: 'configurationsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      if (data.data.items.length > 0) {
        try {
          data.data.items.forEach((item, i) => {
            if (item.config_type === 'AWS Regions') {
              //item.value = JSON.stringify(item.value, null, 2)
              let list = item.value
              setAWSRegions(list)
            }
          });
        } catch (error) {
          console.log(error)
        }
      }
      setLoading(false)
    }
  }

  let configurationGet = async () => {
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
    await rest.doXHR('checkpoint/configurations/', props.token)
    return r
  }

  let set = async (e, key) => {
    let requestCopy = {...request}
    requestCopy[key] = e
    setRequest(requestCopy)
  }

  //VALIDATION
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

    if (!requestCopy['type']) {
      errorsCopy['typeError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['typeError']
    }

    if (!requestCopy['authentication-method']) {
      errorsCopy['authentication-methodError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['authentication-methodError']
    }

    if (requestCopy.type !== 'aws') {
      delete errorsCopy['access-key-idError']
      delete errorsCopy['secret-access-keyError']
      delete errorsCopy['regionError']
      delete errorsCopy['sts-roleError']
    }

    if (requestCopy.type !== 'azure') {
      delete errorsCopy['application-idError']
      delete errorsCopy['application-keyError']
      delete errorsCopy['directory-idError']
      delete errorsCopy['usernameError']
      delete errorsCopy['passwordError']
      delete errorsCopy['password-base64Error']
      delete errorsCopy['environmentError']
    }

    if (requestCopy.type !== 'gcp') {
      delete errorsCopy['private-keyError']
    }

    if (requestCopy.type === 'aws') {
      if (!requestCopy['access-key-id']) {
        errorsCopy['access-key-idError'] = true
        ok = false;
      }
      else {
        delete errorsCopy['access-key-idError']
      }

      if (!requestCopy['secret-access-key']) {
        errorsCopy['secret-access-keyError'] = true
        ok = false;
      }
      else {
        delete errorsCopy['secret-access-keyError']
      }

      if (!requestCopy['region']) {
        errorsCopy['regionError'] = true
        ok = false;
      }
      else {
        delete errorsCopy['regionError']
      }

      if (requestCopy['enable-sts-assume-role']) {
        if (!requestCopy['sts-role']) {
          errorsCopy['sts-roleError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['sts-roleError']
        }
      } else {
        delete errorsCopy['sts-roleError']
      }
    }

    if (requestCopy.type === 'azure') {
      if (requestCopy['authentication-method'] === 'user-authentication') {
        if (!requestCopy['username']) {
          errorsCopy['usernameError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['usernameError']
        }

        if (!requestCopy['password'] && !requestCopy['password-base64']) {
          errorsCopy['passwordError'] = true
          errorsCopy['password-base64Error'] = true
          ok = false;
        }
        else {
          delete errorsCopy['passwordError']
          delete errorsCopy['password-base64Error']
        }
      }
      else {
        delete errorsCopy['usernameError']
        delete errorsCopy['passwordError']
        delete errorsCopy['password-base64Error']
      }

      if (requestCopy['authentication-method'] === 'service-principal-authentication') {
        if (!requestCopy['application-id']) {
          errorsCopy['application-idError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['application-idError']
        }

        if (!requestCopy['application-key']) {
          errorsCopy['application-keyError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['application-keyError']
        }

        if (!requestCopy['directory-id']) {
          errorsCopy['directory-idError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['directory-idError']
        }
      } else {
        delete errorsCopy['application-idError']
        delete errorsCopy['application-keyError']
        delete errorsCopy['directory-idError']
      }

    }

    if (requestCopy.type === 'gcp') {
      if (requestCopy['authentication-method'] === 'key-authentication') {
        if (!requestCopy['private-key']) {
          errorsCopy['private-keyError'] = true
          ok = false;
        }
        else {
          delete errorsCopy['private-keyError']
        }
      } else {
        delete errorsCopy['private-keyError']
      }
    }

    if (!requestCopy['details-level']) {
      errorsCopy['details-levelError'] = true
      ok = false;
    }
    else {
      delete errorsCopy['details-levelError']
    }
    setErrors(errorsCopy)
    return ok;
  }

  let validation = async () => {
    let valid = await validationCheck();
    setValid(valid)
  }

  //DISPOSAL ACTION
  let datacenterServerAdd = async () => {
    let requestCopy = {...request}
    let list = []
    let l = []
    try {
      l = requestCopy.tags.split(',')

      l.forEach((item, i) => {
        list.push(item)
      });
    }
    catch (error) {
      console.log(error)
    }


    let b = {}
    b.data = {
      "name": requestCopy.name,
      "type": requestCopy.type,
      "authentication-method": requestCopy['authentication-method'],
      "tags": list,
      "color": "orange",
      "comments": requestCopy.comments,
      "details-level": requestCopy['details-level'],
      "ignore-warnings": true,
      "ignore-errors": false
    }

    if (requestCopy.type === 'aws') {
      b.data["access-key-id"] = requestCopy["access-key-id"]
      b.data["secret-access-key"] = requestCopy["secret-access-key"]
      b.data["region"] = requestCopy["region"]
      if (requestCopy["enable-sts-assume-role"]) {
        b.data["enable-sts-assume-role"] = requestCopy["enable-sts-assume-role"]
        b.data["sts-role"] = requestCopy["sts-role"]
        if (requestCopy["sts-external-id"]) {
          b.data["sts-external-id"] = requestCopy["sts-external-id"]
        }
      }
    }

    if (requestCopy.type === 'azure') {
      if (requestCopy['authentication-method'] === 'user-authentication') {
        b.data["username"] = requestCopy["username"]

        if (requestCopy["password"]) {
          b.data["password"] = requestCopy["password"]
        }
        else {
          b.data["password-base64"] = requestCopy["password-base64"]
        }
      }

      if (requestCopy['authentication-method'] === 'service-principal-authentication') {
        b.data["application-id"] = requestCopy["application-id"]
        b.data["application-key"] = requestCopy["application-key"]
        b.data["directory-id"] = requestCopy["directory-id"]
      }

      if (!requestCopy["environment"]) {
        b.data["environment"] = "AzureCloud"
      }
      else {
        b.data["environment"] = requestCopy["environment"]
      }

    }

    if (requestCopy.type === 'gcp') {
      if (requestCopy["authentication-method"] === "key-authentication") {
        b.data["private-key"] = requestCopy["private-key"]
      }
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
          component: 'datacenterServersAdd',
          vendor: 'checkpoint',
          errorType: 'datacenterServerAddError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/datacenter-servers/`, props.token, b)
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
    setAWSRegions([]);
    setTypes(['aws', 'azure', 'gcp']);

    setAwsAuthenticationMethods(['user-authentication', 'role-authentication'])
    setAzureAuthenticationMethods('user-authentication', 'service-principal-authentication')
    setGcpAuthenticationMethods(['key-authentication', 'vm-instance-authentication'])
    setAzureEnvironment(['AzureCloud', 'AzureChinaCloud', 'AzureUSGovernment'])
    setDetailsLevels(['uid', 'standard', 'full'])

    setRequest({});
    setErrors({});
    setValid(false);
    setResponse(null);
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'datacenterServersAdd') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let createComponent = (component, key, choices) => {

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

      case 'radio':
        return (
          <Radio.Group
            onChange={event => set(event.target.value, key)}
            defaultValue={key === 'environment' ? 'AzureCloud' : null}
            value={request[`${key}`]}
            style={errors[`${key}Error`] ?
              {border: `1px solid red`}
            :
              {}
            }
          >
            <React.Fragment>
              {choices && (choices.length > 1) && choices.map((n, i) => {
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
            placeholder={key === 'tags' ? "Insert your tags's list. Example: tag1, tag2, ..., tagN" : ""}
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
            { choices === 'AWSRegions' ?
              AWSRegions.map((region,i) => {
                let str = `${region.regionName.toString()} - ${region.regionCode.toString()}`
                return (
                  <Select.Option key={i} value={region.regionCode}>{str}</Select.Option>
                )
              })
            :
              [`${choices}`].map((n, i) => {
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
        open={visible}
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
             title="Datacenter Server addedd"
           />
        }
        { !loading && !response &&
          <React.Fragment>
            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
              </Col>
              <Col span={8}>
                {createComponent('input', 'name')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Type:</p>
              </Col>
              <Col span={8}>
                {createComponent('radio', 'type', types)}
              </Col>
            </Row>
            <br/>

            {request.type === 'aws' ?
              <React.Fragment>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('radio', 'authentication-method', awsAuthenticationMethods)}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Access-key-id:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('input', 'access-key-id')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Secret-access-key:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('input', 'secret-access-key')}
                  </Col>
                </Row>
                <br/>

                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Enable-sts-assume-role:</p>
                  </Col>
                  <Col span={7} style={{marginTop: 5}}>
                    {createComponent('checkbox', 'enable-sts-assume-role')}
                  </Col>
                </Row>
                <br/>

                {request['enable-sts-assume-role'] ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Sts-role:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'sts-role')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Sts-external-id:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'sts-external-id')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Region:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('select', 'region', 'AWSRegions')}
                  </Col>
                </Row>
                <br/>
              </React.Fragment>
            :
              null
            }

            {request.type === 'azure' ?
              <React.Fragment>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('radio', 'authentication-method', azureAuthenticationMethods)}
                  </Col>
                </Row>
                <br/>

                { request['authentication-method'] === 'service-principal-authentication' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Application-id:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'application-id')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Application-key:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'application-key')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Directory-id:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'directory-id')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }
                { request['authentication-method'] === 'user-authentication' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Username:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'username')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'password')}
                      </Col>
                    </Row>
                    <br/>

                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Password-base64:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('input', 'password-base64')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }

                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('radio', 'environment', azureEnvironment)}
                  </Col>
                </Row>
                <br/>

              </React.Fragment>
            :
              null
            }

            {request.type === 'gcp' ?
              <React.Fragment>
                <Row>
                  <Col offset={3} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Authentication-method:</p>
                  </Col>
                  <Col span={7}>
                    {createComponent('radio', 'authentication-method', gcpAuthenticationMethods)}
                  </Col>
                </Row>
                <br/>

                { request['authentication-method'] === 'key-authentication' ?
                  <React.Fragment>
                    <Row>
                      <Col offset={3} span={6}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Private-key:</p>
                      </Col>
                      <Col span={7}>
                        {createComponent('textArea', 'private-key')}
                      </Col>
                    </Row>
                    <br/>
                  </React.Fragment>
                :
                  null
                }
              </React.Fragment>
            :
              null
            }

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags:</p>
              </Col>
              <Col span={8}>
                {createComponent('textArea', 'tags')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Comments:</p>
              </Col>
              <Col span={8}>
                {createComponent('textArea', 'comments')}
              </Col>
            </Row>
            <br/>

            <Row>
              <Col offset={2} span={6}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Details-level:</p>
              </Col>
              <Col span={8}>
                {createComponent('radio', 'details-level', detailsLevels)}
              </Col>
            </Row>
            <br/>



            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" shape='round' onClick={() => validation()} >
                  Add Datacenter Server
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
  domain: state.checkpoint.domain,
}))(Add);
