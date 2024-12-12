import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Alert, Row, Col, Select, Divider, Checkbox, Radio } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function DatacenterAccount(props) {
  let [visible, setVisible] = useState(false);
  let [existent, setExistent] = useState(true);
  let [AWSRegions, setAWSRegions] = useState([]);
  let [loading, setLoading] = useState(false);

  let [changeRequestId, setChangeRequestId] = useState('');

  let [datacenterAccounts, setDatacenterAccounts] = useState([]);
  let [datacenterAccountsLoading, setDatacenterAccountsLoading] = useState(false);
  let [datacenterAccount, setDatacenterAccount] = useState({
    id: '',
    name: '',
    regions : []
  });
  let [datacenterAccountLoading, setDatacenterAccountLoading] = useState(false);
  let [originDca, setOriginDca] = useState({});
  let [mapRegions, setMapRegions] = useState(false)

  let [checkedList, setCheckedList] = useState([]);
  let indeterminate = checkedList.length > 0 && checkedList.length < AWSRegions.length;
  let checkAll = AWSRegions.length === checkedList.length;  
  
  let [valid, setValid] = useState(false);
  let [errors, setErrors] = useState({});
  let [refreshDca, setRefreshDca] = useState(false);

  //cambia asset, chiedi AWS Regions
  useEffect(() => {
    if (visible && props.asset) {
      AWSRegionsGet()
    }
  }, [props.asset]);

  //se AWS Regions, chiedi lista datacenterAccounts se existent true
  useEffect(() => {
    if (AWSRegions && AWSRegions.length > 0) {
      setDatacenterAccounts([]);
      setCheckedList([])
      if (existent) {
        dataGet('datacenter-accounts');
        if (datacenterAccount && datacenterAccount.name) {
          dataGet('datacenter-account');
        }
      }
    }
  }, [existent, AWSRegions]);

  //se cambia dcname, chiedi chiedi dati specifici, se existent true
  useEffect(async() => {
    if ( visible && props.asset && (datacenterAccounts && datacenterAccounts.length > 0) && existent) {
      await dataGet('datacenter-account');
    }
  }, [datacenterAccount.name]);

  //flagga le regioni esistenti
  useEffect(async() => {
    setMapRegions(false)
    let checkedListCopy = [...checkedList];
    checkedListCopy = datacenterAccount.regions
    setCheckedList(checkedListCopy)
  }, [mapRegions]);

  //renderizza le regioni esistenti
  useEffect(async() => {
    if (datacenterAccount && datacenterAccount.regions) {
      let datacenterAccountCopy = {...datacenterAccount};
      datacenterAccountCopy.regions = checkedList
      setDatacenterAccount(datacenterAccountCopy)
    }
  }, [checkedList]);

  //body valido, fai richiesta
  useEffect(() => {
    if (Object.keys(errors).length === 0 && valid) {
      reqHandler()
      setValid(false)
    }
  }, [valid]);

  //refresh
  useEffect(async() => {
    if ( visible && props.asset && refreshDca)  {
      setRefreshDca(false)
      setExistent(true)
    }
  }, [refreshDca]);



  let AWSRegionsGet = async () => {
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
              let list = []
              item.value.map((n, i) => {
                return (
                  //n[1]
                  list.push(n.regionCode)
                )
              })
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

  let dataGet = async (endpoint) => {
    if (endpoint === 'datacenter-accounts') {
      setDatacenterAccountsLoading(true)
    }

    if (endpoint === 'datacenter-account') {
      setDatacenterAccountLoading(true)
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
        setDatacenterAccountsLoading(false)
      }
      if (endpoint === 'datacenter-account') {
        setDatacenterAccountLoading(false)
      }
      return;
    }
    if (endpoint === 'datacenter-accounts') {
      setDatacenterAccounts(data.data.items)
      setDatacenterAccountsLoading(false)
    }
    else if (endpoint === 'datacenter-account') {
      let o = data.data
      o.name = data.data["Account Name"]
      o.id = data.data["Account ID"]
      setOriginDca(o)
      setDatacenterAccount(o)
      setDatacenterAccountLoading(false)
      setMapRegions(true)
    }
    
  };

  let getData = async (endpoint) => {
    let r
    
    if (endpoint === 'datacenter-accounts') {
      endpoint = `${props.vendor}/${props.asset.id}/${endpoint}/`
    }
    else if (endpoint === 'datacenter-account') {
      endpoint = `${props.vendor}/${props.asset.id}/${endpoint}/${datacenterAccount.name}/`
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
      if (key === 'name') {
        delete errorsCopy['nameError'];
        datacenterAccountCopy.name = value
        setDatacenterAccount(datacenterAccountCopy)
        setErrors(errorsCopy);
      }
      if (key === 'id') {
        delete errorsCopy['idError'];
        datacenterAccountCopy.id = value
        setDatacenterAccount(datacenterAccountCopy)
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
    if (!existent) {
      if (!datacenterAccount.name) {
        errorsCopy.nameError = true
        ok = false;
        setErrors(errorsCopy);
      } else {
        delete errorsCopy.nameError;
        setErrors(errorsCopy);
      }
      if (!datacenterAccount.id) {
        errorsCopy.idError = true
        ok = false;
        setErrors(errorsCopy);
      } else {
        delete errorsCopy.idError;
        setErrors(errorsCopy);
      }
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

    if (actual.difference(ori).size > 0) {      
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
        //return;
      }
    }
    if (ori.difference(actual).size > 0) {
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
        //return;
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
        "Account Name": datacenterAccount.name,
        "Account ID": datacenterAccount.id,
        "regions": list,
        "tags": []
      },
    };
    if (tags) {
      body.data.tags = tags
    }
    
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
    
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/datacenter-account/${datacenterAccount.name}/`, props.token, body )
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
    setExistent(true);
    setAWSRegions([]);
    setLoading(false);

    setChangeRequestId('');

    setDatacenterAccounts([]);
    setDatacenterAccountsLoading(false);
    setDatacenterAccount({
      id: '',
      name: '',
      regions : []
    });
    setDatacenterAccountLoading(false);
    setOriginDca({});
    setMapRegions(false)

    setCheckedList([]);
    let indeterminate = checkedList.length > 0 && checkedList.length < AWSRegions.length;
    let checkAll = AWSRegions.length === checkedList.length;  
    
    setValid(false);
    setErrors({});
    setRefreshDca(false);
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
        if (key === 'id') {
          return (
            <Input
              value={datacenterAccount && datacenterAccount.id ? 
                datacenterAccount.id 
              : 
                null
              }
              disabled
            />
          )
        }
        else if (key === 'changeRequestId' ) {
          return (
            <Input
              defaultValue={changeRequestId}
              placeholder={
                key === 'changeRequestId' ?
                  "Format: ITIO-<number> (where number is min 6 digits and max 18 digits)"
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
        else  {
          return (
            <Input
              
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


      case 'select':
        if (key === 'name') {
          return (
            <Select
              value={datacenterAccount.name}
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
        <AssetSelector vendor={props.vendor} noDomain={true}/>
        <Divider />

        {((props.asset && props.asset.id) ) ? (
            <React.Fragment>
              {loading && <Spin indicator={spinIcon} style={{ margin: 'auto 50%' }} />}
              {!loading && (
                <React.Fragment>
                  <Row>
                    <Radio.Group defaultValue="existent" buttonStyle="solid">
                      <Radio.Button 
                        value="existent"
                        onClick={() => setExistent(true)}
                      >
                        Existent Datacenter Account
                      </Radio.Button>
                      <Radio.Button 
                        value="new"
                        onClick={() => setExistent(false)}
                      >
                        New Datacenter Account
                      </Radio.Button>
                    </Radio.Group>
                  </Row>
                  <br />

                  <Row>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account Name</p>
                    </Col>
                    <Col span={6}>
                      {datacenterAccountsLoading ?
                        <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> 
                      :
                        existent ?
                          createElement('select', 'name', datacenterAccounts)
                        :
                          <Input
                            style=
                            {errors.nameError ?
                              {borderColor: 'red'}
                            :
                              {}
                            }
                            onBlur={event => set(event.target.value, 'name')}
                          />
                      }
                    </Col>
                    <Col span={3}>
                      <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Account ID</p>
                    </Col>
                    <Col span={6}>
                      {datacenterAccountLoading ?
                        <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> 
                      :
                        existent ?
                          createElement('input', 'id')
                        :
                          <Input
                            style=
                            {errors.idError ?
                              {borderColor: 'red'}
                            :
                              {}
                            }
                            onBlur={event => set(event.target.value, 'id')}
                          />
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
                      {datacenterAccountLoading ?
                        <Col span={6}>
                          <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
                        </Col>
                      :
                        <Col span={6}>
                          {(datacenterAccount && datacenterAccount.regions) ?
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
                    {(datacenterAccount && Object.keys(datacenterAccount).length > 0 ) ?
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