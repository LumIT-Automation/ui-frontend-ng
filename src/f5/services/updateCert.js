import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';

import { err } from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Checkbox } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function UpdateCert(props) {

  const [visible, setVisible] = useState(false);
  const [virtualServers, setVirtualServers] = useState([]);
  const [virtualServer, setVirtualServer] = useState(null);
  const [clientProfiles, setClientProfiles] = useState([]);
  const [clientProfile, setClientProfile] = useState(false);
  const [clientSSLChecked, setClientSSLChecked] = useState(null);
  const [serverSSLChecked, setServerSSLChecked] = useState(null);
  const [errors, setErrors] = useState({});
  const [certName, setCertName] = useState('');
  const [certificate, setCertificate] = useState('');
  const [key, setKey] = useState('');
  const [vsLoading, setVsLoading] = useState(false);
  const [profLoading, setProfLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);


  useEffect(() => {
    if (visible && props.asset && props.partition) {
      main();
    }
  }, [visible, props.asset, props.partition]);

  useEffect(() => {
    if (visible && props.asset && props.partition && virtualServer && (clientSSLChecked)) {
    getProfiles();
    }
  }, [clientSSLChecked]);

  const main = async () => {
    try {
      setVsLoading(true);
      const vsFetched = await dataGet('virtualservers', props.partition);
      setVsLoading(false);
      if (vsFetched.status && vsFetched.status !== 200) {
        const error = { 
          ...vsFetched, 
          component: 'updateCert', 
          vendor: 'f5', 
          errorType: 'vsError' 
        };
        props.dispatch(err(error));
        return;
      }
      setVirtualServers(vsFetched.data.items);
    } catch (error) {
      console.log(error);
    }
  };

  const getProfiles = async () => {
    setProfLoading(true);
    setClientProfile('');
    const data = await dataGet('', props.partition);
    setProfLoading(false);
    console.log(data)
    if (data.status && data.status !== 200) {
      const error = { 
        ...data, 
        component: 'updateCert', 
        vendor: 'f5', 
        errorType: 'clientProfilesError' 
      };
      props.dispatch(err(error));
      return;
    }
    setClientProfiles(data.data.profiles);
  };

  const dataGet = async (entity, partition) => {
    let r;
    const rest = new Rest(
      'GET',
      resp => { r = resp; },
      error => { r = error; }
    );

    if (entity === 'virtualservers') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/${entity}/`, props.token);
    }
    if (clientSSLChecked && !clientProfile) {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/virtualserver/${virtualServer.name}/?related=policies,profiles&profileType=client-ssl`, props.token);
    }
    return r;
  };

  const set = (value, key, obj) => {
    if (key === 'virtualServer') {
      const foundVirtualServer = virtualServers.find(v => v.name === value);
      setVirtualServer(foundVirtualServer);
    } else if (key === 'clientSSLChecked') {
      setClientSSLChecked(!clientSSLChecked);
    } else if (key === 'clientProfile') {
      const foundProfile = clientProfiles.find(p => p.name === value);
      setClientProfile(foundProfile);
    } else {
      // handle other cases if needed
      if (key === 'certName') setCertName(value);
      if (key === 'certificate') setCertificate(value);
      if (key === 'key') setKey(value);
    }
  };
  

  const validationCheck = async () => {
    let updatedErrors = { ...errors };
    let valid = true;

    if (!certName) {
      updatedErrors.certNameError = true;
      valid = false
    } else {
      delete updatedErrors.certNameError;
    }

    if (!certificate) {
      updatedErrors.certificateError = true;
      valid = false
    } else {
      delete updatedErrors.certificateError;
    }

    if (!key) {
      updatedErrors.keyError = true;
      valid = false
    } else {
      delete updatedErrors.keyError;
    }

    setErrors(updatedErrors);
    return valid
  };

  const validation = async () => {
    let valid = await validationCheck();
    if (valid) {
      updateHandler();
    }
  };

  const updateHandler = async () => {
    setLoading(true);
    const update = await updateProfile();
    if (update.status && update.status !== 200) {
      const error = { 
        ...update, 
        component: 'updateCert', 
        vendor: 'f5', 
        errorType: 'updateError' 
      };
      setLoading(false);
      props.dispatch(err(error));
      return;
    }
    setLoading(false);
    setResponse(true);
    setTimeout(() => setResponse(false), 2000);
    setTimeout(() => closeModal(), 2050);
  };

  const updateProfile =  async (file) => {
    let body
    let r

    body = {
      "data": {
        "virtualServerName": virtualServer.name,
        "certificate": {
          "name": certName,
          "content_base64": btoa(certificate)
        },
        "key": {
          "name": certName,
          "content_base64": btoa(key)
        }
      }
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
    await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/workflow/profile/client-ssl/${clientProfile.name}/`, props.token, body )
    return r
  }

  const closeModal = () => {
    setVisible(false);
    setResponse(false);
    setErrors({});
  };

  const errorsComponent = () => {
    if (props.error && props.error.component === 'updateCert') {
      return <Error error={[props.error]} visible={true} />;
    }
    return null;
  };

  const createElement = (element, key, choices, obj, action) => {
    switch (element) {
      case 'input':
        return (
          <Input
            defaultValue={obj ? obj[key] : ''}
            style={errors[`${key}Error`] ? { borderColor: 'red' } : {}}
            onChange={event => set(event.target.value, key)}
          />
        );
      case 'textArea':
        return (
          <TextArea
            defaultValue={obj ? obj[key] : ''}
            style={errors[`${key}Error`] ? { borderColor: 'red' } : {}}
            onChange={event => set(event.target.value, key)}
            rows={7}
          />
        );
      case 'checkbox':
        return (
          <>
          <Checkbox
            checked={obj}
            disabled={!virtualServer}
            onChange={event => set(event.target.checked, key)}
          />
          </>
          
        )
        break;
      case 'select':
        return (
          <>
          {console.log(obj)}
          <Select
            value={`${key}` ? `${key}`?.name : ''}
            showSearch
            style={errors[`${key}Error`] ? { width: '100%', border: '1px solid red' } : { width: '100%' }}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={value => set(value, key, obj)}
          >
            {choices ? choices.map((choice, index) => (
              <Select.Option key={index} value={choice.name}>{choice.name}</Select.Option>
            )) : null }
          </Select>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>UPDATE CERT</Button>
      <Modal
        title={<p style={{ textAlign: 'center' }}>UPDATE CERT</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={null}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor='f5' />
        <Divider />
        {(props.asset && props.asset.id) && props.partition ? (
          <>
            {loading && <Spin indicator={spinIcon} style={{ margin: 'auto 48%' }} />}
            {!loading && response && <Result status="success" title="Profile Updated" />}
            {!loading && !response && (
              <>
                <Row>
                  <Col offset={5} span={3}>
                    <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>VirtualServer:</p>
                  </Col>
                  <Col span={8}>
                    {vsLoading ? (
                      <Spin indicator={spinIcon} style={{ margin: '0 10%' }} />
                    ) : (
                      <Col span={24}>
                        {createElement('select', 'virtualServer', virtualServers)}
                      </Col>
                    )}
                  </Col>
                </Row>
                <br />

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ClientSSL Profile:</p>
                  </Col>
                  <Col span={7} style={{marginTop: 5}}>
                    {createElement('checkbox', 'clientSSLChecked', '', clientSSLChecked)}
                  </Col>
                </Row>
                <br/>

                {
                  clientSSLChecked ?
                  <>
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Profilo Client SSL:</p>
                    </Col>
                    <Col span={8}>
                      {profLoading ? (
                        <Spin indicator={spinIcon} style={{ margin: '0 10%' }} />
                      ) : (
                        <Col span={24}>
                          {createElement('select', 'clientProfile', clientProfiles)}
                        </Col>
                      )}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Certificate Name:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('input', 'certName')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Certificate:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'certificate')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Key:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'key')}
                    </Col>
                  </Row>
                  <br />
                  </>
                  :
                  null
                }
                

                <Divider />
                <Row>
                  <Col offset={8} span={16}>
                    <Button
                      type="primary"
                      shape='round'
                      disabled={loading || !clientSSLChecked}
                      onClick={validation}
                    >
                      Update certificate
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </>
        ) : (
          <Alert message="Asset and Partition not set" type="error" />
        )}
      </Modal>
      {errorsComponent()}
    </>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,
}))(UpdateCert);
