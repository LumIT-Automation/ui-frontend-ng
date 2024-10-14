import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'
import CommonFunctions from '../../_helpers/commonFunctions'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Alert, Row, Col, Select, Divider, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function DatacenterAccount(props) {
  let [visible, setVisible] = useState(false);
  let [AWSRegions, setAWSRegions] = useState([]);
  let [checkedList, setCheckedList] = useState([]);
  let indeterminate = checkedList.length > 0 && checkedList.length < AWSRegions.length;
  let checkAll = AWSRegions.length === checkedList.length;
  let [loading, setLoading] = useState(false);
  let [changeRequestId, setChangeRequestId] = useState('');
  let [datacenterAccounts, setDatacenterAccounts] = useState([]);
  let [dcasLoading, setDcasLoading] = useState(false);
  let [dcaName, setDcaName] = useState('');
  let [datacenterAccount, setDatacenterAccount] = useState({});
  let [originDca, setOriginDca] = useState({});
  let [dcaLoading, setDcaLoading] = useState(false);
  let [valid, setValid] = useState(false);
  let [errors, setErrors] = useState({});
  let [refreshDca, setRefreshDca] = useState(false);

  const prevdcaName = useRef(dcaName);

  useEffect(() => {
    if (visible && props.asset) {
      AWSRegionsGet()
      setDcaName();
      setDatacenterAccount();
      setDatacenterAccounts([]);
      dataGet('datacenter-accounts');
    }
  }, [props.asset]);

  useEffect(async() => {
    if ( visible && props.asset && (prevdcaName.current !== prevdcaName) && (datacenterAccounts && datacenterAccounts.length > 0)) {
      setDatacenterAccount();
      await dataGet('datacenter-account');
    }
    prevdcaName.current = dcaName;
  }, [dcaName]);

  useEffect(async() => {
    if ( visible && props.asset && refreshDca)  {
      setRefreshDca(false)
      await dataGet('datacenter-account');
    }
  }, [refreshDca]);

  useEffect(async() => {
    if (datacenterAccount && Object.keys(datacenterAccount).length > 0 ) {
      let checkedListCopy = [...checkedList];
      checkedListCopy = datacenterAccount.regions
      setCheckedList(checkedListCopy)
    }
  }, [datacenterAccount]);

  useEffect(async() => {
    if (datacenterAccount && datacenterAccount.regions) {
      let datacenterAccountCopy = {...datacenterAccount};
      datacenterAccountCopy.regions = checkedList
      setDatacenterAccount(datacenterAccountCopy)
    }
  }, [checkedList]);

  useEffect(() => {
    if (Object.keys(errors).length === 0 && valid) {
      reqHandler()
      setValid(false)
    }
  }, [valid]);



  let AWSRegionsGet = async () => {
    setLoading(true)
    let conf = []
    let configurationsFetched = await configurationGet()
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      let error = Object.assign(configurationsFetched, {
        component: 'datacenterServersAdd',
        vendor: 'checkpoint',
        errorType: 'configurationsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      if (configurationsFetched.data.configuration.length > 0) {
        try {
          conf = configurationsFetched.data.configuration
          conf.forEach((item, i) => {
            if (item.key === 'AWS Regions') {
              let list = JSON.parse(item.value)
              let list2 = list.map((n, i) => {
                return (
                  n[1]
                )
              })
              setAWSRegions(list2)
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
    await rest.doXHR('checkpoint/configuration/global/', props.token)
    return r
  }

  let dataGet = async (endpoint) => {
    if (endpoint === 'datacenter-accounts') {
      setDcasLoading(true)
    }

    if (endpoint === 'datacenter-account') {
      setDcaLoading(true)
    }

    let data = await getData(endpoint);
    if (data.status && data.status !== 200) {
      
      let error = Object.assign(data, {
        component: 'datacenterAccount',
        vendor: props.vendor,
        errorType: `${endpoint}Error`
      })
      props.dispatch(err(error))
      if (endpoint === 'datacenter-accounts') {
        setDcasLoading(false)
      }
      if (endpoint === 'datacenter-account') {
        setDcaLoading(false)
      }
      return;
    }
    if (endpoint === 'datacenter-accounts') {
      setDatacenterAccounts(data.data.items)
      setDcasLoading(false)
    }
    else if (endpoint === 'datacenter-account') {
      setOriginDca(data.data)
      setDatacenterAccount(data.data)
      setDcaLoading(false)
    }
    
  };

  let getData = async (endpoint) => {
    let r
    
    if (endpoint === 'datacenter-accounts') {
      endpoint = `${props.vendor}/${props.asset.id}/${endpoint}/`
    }
    else if (endpoint === 'datacenter-account') {
      endpoint = `${props.vendor}/${props.asset.id}/${endpoint}/${dcaName}/`
    }

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, props.token)
    return r
  };

  let set = async (value, key, obj) => {
    let errorsCopy = { ...errors };
    let datacenterAccountCopy = { ...datacenterAccount };

    try {
      if (key === 'changeRequestId') {
        delete errorsCopy['changeRequestIdError'];
        setChangeRequestId(value);
        setErrors(errorsCopy);
      }
      if (key === 'dcaName') {
        delete errorsCopy['dcaNameError'];
        setDcaName(value);
        setErrors(errorsCopy);
      }
      if (key === 'tags') {
        delete errorsCopy['tagsError'];
        datacenterAccountCopy.tags = value
        setDatacenterAccount(datacenterAccountCopy)
        setErrors(errorsCopy);
      }
    }
    catch(error) {
      console.log()
    }
  }

  let validationCheck = async () => {
    let errorsCopy = { ...errors };
    let ok = true;

    if (!changeRequestId) {
      errorsCopy.changeRequestIdError = true
      ok = false;
      setErrors(errorsCopy);
    } else {
      delete errorsCopy.changeRequestIdError;
      setErrors(errorsCopy);
    }

    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      errorsCopy.changeRequestIdError = true
      ok = false;
      setErrors(errorsCopy);
    } else {
      delete errorsCopy.changeRequestIdError;
      setErrors(errorsCopy);
    }

    return ok;
  };

  let validation = async () => {
    let valid = await validationCheck();
    setValid(valid)
  };

  let reqHandler = async () => {
    let ori = new Set(originDca.regions)
    let actual = new Set(datacenterAccount.regions)
    console.log('to del', ori.difference(actual))
    console.log('to add', actual.difference(ori))

    if (actual.difference(ori).size > 0) {
      console.log('to add')
      
      setLoading(true);
      const data = await add(Array.from(actual.difference(ori)))
      setLoading(false);
      if (data.status && data.status !== 200) {
        let error = Object.assign(data, {
          component: 'datacenterAccount',
          vendor: 'checkpoint',
          errorType: 'modifyError'
        })
        props.dispatch(err(error))
        return;
      }
    }
    if (ori.difference(actual).size > 0) {
      console.log('to del')
      setLoading(true);
      const data = await del(Array.from(ori.difference(actual)))
      setLoading(false);
      if (data.status && data.status !== 200) {
        let error = Object.assign(data, {
          component: 'datacenterAccount',
          vendor: 'checkpoint',
          errorType: 'modifyError'
        })
        props.dispatch(err(error))
        return;
      }
    }
    
    setRefreshDca(true)

  }

  const add = async (list) => {
    let tags
    let r

    try {
      tags = datacenterAccount.tags.split(',')
    }
    catch (e) {
      console.log(e)
    }
    
    const body = {
      data: {
        "change-request-id": changeRequestId,
        "Account Name": datacenterAccount['Account Name'],
        "Account ID": datacenterAccount['Account ID'],
        "regions": list,
        "tags": []
      },
    };
    if (tags) {
      body.data.tags = tags
    }
    console.log(body)
    
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/datacenter-accounts/`, props.token, body )
    return r
  };

  const del = async (list) => {
    let tags
    let r

    try {
      tags = datacenterAccount.tags.split(',')
    }
    catch (e) {
      console.log(e)
    }
    
    const body = {
      data: {
        "change-request-id": changeRequestId,
        "regions": list,
        "tags": []
      },
    };
    if (tags) {
      body.data.tags = tags
    }
    console.log(body)
    
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/datacenter-account/${dcaName}/`, props.token, body )
    return r
  };

  

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
  };

  let renderError = () => {
    if (props.error && props.error.component === 'datacenterAccount') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let onChangeCustom = (list) => {
    setCheckedList(list)
    //setIndeterminate(!!list.length && list.length < AWSRegions.length)
    //setCheckAll(list.length === AWSRegions.length)
  };

  let onCheckAllChange = (e) => {
    setCheckedList((e.target.checked ? AWSRegions : []))
    //setIndeterminate(false)
    //setCheckAll()
  };

  let createElement = (component, key, choices) => {

    switch (component) {
      case 'input':
        if (key === 'dcaId') {
          return (
            <Input
              value={datacenterAccount && datacenterAccount['Account ID'] ? 
                datacenterAccount['Account ID'] 
              : 
                null
              }
              disabled
            />
          )
        }
        else {
          return (
            <Input
              defaultValue={
                key === 'changeRequestId' ?
                  changeRequestId
                :
                  null
              }
              placeholder={
                key === 'changeRequestId' ?
                  "ITIO-6 to 18 numbers"
                :
                  null
                }
              style=
              {errors[`${key}Error`] ?
                {borderColor: 'red'}
              :
                {}
              }
              onBlur={event => set(event.target.value, key)}
            />
          )
        }
        
     case 'checkbox':
        return (
          <Checkbox
            checked={key}
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
              options={AWSRegions} 
              value={checkedList} 
              onChange={onChangeCustom}
            />
          </React.Fragment>
        )
        break;
      
      case 'textArea':
        return (
          <Input.TextArea
            rows={7}
            placeholder={key === 'tags' ? "Insert your tags's list. Example: tag1, tag2, ..., tagN" : ""}
            //value={datacenterAccount && datacenterAccount.tags}
            onBlur={event => set(event.target.value, key)}
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
        if (key === 'dcaName') {
          return (
            <Select
              value={dcaName}
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
                {choices.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })}
              </React.Fragment>
            </Select>
          )
        }
        else {
          return (
            <Select
              //value={`${key}`}
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
                {choices.map((n, i) => {
                  return (
                    <Select.Option key={i} value={n}>{n}</Select.Option>
                  )
                })}
              </React.Fragment>
            </Select>
          )
        }
        
        
        break;

      default:
    }
  }

  return (
    <>
    <Space direction="vertical">
      <Button type="primary" onClick={() => setVisible(true)}>
        Datacenter Account
      </Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>Datacenter Account</p>}
        centered
        destroyOnClose
        visible={visible}
        footer={null}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor={props.vendor} useCase={'datacenterAccount'}/>
        <Divider />

        {((props.asset && props.asset.id) ) ? (
            <React.Fragment>
              {loading && <Spin indicator={spinIcon} style={{ margin: 'auto 50%' }} />}
              {!loading && (
                <React.Fragment>
                  <Row>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name</p>
                    </Col>
                    <Col span={6}>
                      {dcasLoading ?
                        <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> 
                      :
                        createElement('select', 'dcaName', datacenterAccounts)
                      }
                    </Col>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID</p>
                    </Col>
                    <Col span={6}>
                      {dcaLoading ?
                        <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> 
                      :
                        createElement('input', 'dcaId')
                      }
                    </Col>
                  </Row>

                  <br />
                  <Row>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Change request id</p>
                    </Col>
                    <Col span={6}>
                      {createElement('input', 'changeRequestId')}
                    </Col>
                  </Row>

                  <br />
                  
                  <>
                    <Row>
                      <Col span={3}>
                        <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>AWS Regions</p>
                      </Col>
                      {dcaLoading ?
                        <Col span={6}>
                          <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                        </Col>
                      :
                        <Col span={6}>
                          {datacenterAccount && datacenterAccount.regions ?
                            createElement('checkboxGroup')
                          :
                            null
                          }
                        </Col>  
                      }
                    </Row>
                  <br/>
                  </>

                  <>
                  <Row>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Tags</p>
                    </Col>
                    {datacenterAccount && Object.keys(datacenterAccount).length > 0 ?
                      <Col span={6}>
                        {createElement('textArea', 'tags')}
                      </Col>
                    :
                      null
                    } 
                  </Row>
                  <br/>
                  </>

                  <br />

                  <Row>
                    <Col offset={11} span={2}>
                      {<Button 
                          type="primary" 
                          shape="round" 
                          disabled={loading || !changeRequestId || !datacenterAccount}
                          onClick={validation}
                        >
                          Modify Group
                        </Button>
                      }
                    </Col>
                  </Row>
                </React.Fragment>
              )}
            </React.Fragment>
            ) 
          : (
            <Alert message="Asset not set" type="error" />
          )}
      </Modal>

        {renderError()}
    </Space>
    </>
  );

};


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
}))(DatacenterAccount);