import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';

import { err } from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

import { Modal, Alert, Row, Col, Input, Result, Button, Select, Spin, Divider, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function UpdateCert(props) {

  const [visible, setVisible] = useState(false);
  const [vsLoading, setVsLoading] = useState(false);
  const [virtualServers, setVirtualServers] = useState([]);
  const [virtualServer, setVirtualServer] = useState({});

  const [clientSSLChecked, setClientSSLChecked] = useState(false);
  const [clientProileLoading, setClientProileLoading] = useState(false);  
  const [clientProfiles, setClientProfiles] = useState([]);
  const [clientProfile, setClientProfile] = useState({});
  const [clientCertName, setClientCertName] = useState('');
  const [clientCertificate, setClientCertificate] = useState('');
  const [clientKey, setClientKey] = useState('');

  const [serverSSLChecked, setServerSSLChecked] = useState(false);
  const [serverProileLoading, setServerProileLoading] = useState(false);
  const [serverProfiles, setServerProfiles] = useState([]);
  const [serverProfile, setServerProfile] = useState({});
  const [serverCertName, setServerCertName] = useState('');
  const [serverCertificate, setServerCertificate] = useState('');
  const [serverKey, setServerKey] = useState('');

  const [errors, setErrors] = useState({});  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(false);


  useEffect(() => {
    if (visible && props.asset && props.partition) {
      main();
    }
  }, [visible, props.asset, props.partition]);

  useEffect(() => {
    if (visible && props.asset && props.partition && virtualServer && clientSSLChecked ) {
      getProfiles('client');
    }
  }, [clientSSLChecked]);

  useEffect(() => {
    if (visible && props.asset && props.partition && virtualServer && serverSSLChecked ) {
      getProfiles('server');
    }
  }, [serverSSLChecked]);

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

  const getProfiles = async (type) => {
    if (type === 'client') {
      setClientProileLoading(true);
      setClientProfile({});
      const data = await dataGet(type, props.partition);
      setClientProileLoading(false);
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
    }

    if (type === 'server') {
      setServerProileLoading(true);
      setServerProfile({});
      const data = await dataGet(type, props.partition);
      setServerProileLoading(false);
      if (data.status && data.status !== 200) {
        const error = { 
          ...data, 
          component: 'updateCert', 
          vendor: 'f5', 
          errorType: 'serverProfilesError' 
        };
        props.dispatch(err(error));
        return;
      }
      setServerProfiles(data.data.profiles);
    }
    
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
    if (entity === 'client') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/virtualserver/${virtualServer.name}/?related=policies,profiles&profileType=client-ssl`, props.token);
    }
    if (entity === 'server') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${partition}/virtualserver/${virtualServer.name}/?related=policies,profiles&profileType=server-ssl`, props.token);
    }
    return r;
  };

  const set = (value, key, obj) => {
    if (key === 'virtualServer') {
      const foundVirtualServer = virtualServers.find(v => v.name === value);
      setVirtualServer(foundVirtualServer);
    } else if (key === 'clientSSLChecked') {
      setClientSSLChecked(!clientSSLChecked);
    } else if (key === 'serverSSLChecked') {
      setServerSSLChecked(!serverSSLChecked);
    } else if (key === 'clientProfile') {
      const foundProfile = clientProfiles.find(p => p.name === value);
      setClientProfile(foundProfile);
    } else if (key === 'serverProfile') {
      const foundProfile = serverProfiles.find(p => p.name === value);
      setServerProfile(foundProfile);
    } else {
      // handle other cases if needed
      if (key === 'clientCertName') setClientCertName(value);
      if (key === 'clientCertificate') setClientCertificate(value);
      if (key === 'clientKey') setClientKey(value);

      if (key === 'serverCertName') setServerCertName(value);
      if (key === 'serverCertificate') setServerCertificate(value);
      if (key === 'serverKey') setServerKey(value);
    }
  };
  

  const validationCheck = async () => {
    let updatedErrors = { ...errors };
    let valid = true;

    if (clientSSLChecked) {
      if (!clientCertName) {
        updatedErrors.clientCertNameError = true;
        valid = false
      } else {
        delete updatedErrors.clientCertNameError;
      }
  
      if (!clientCertificate) {
        updatedErrors.clientCertificateError = true;
        valid = false
      } else {
        delete updatedErrors.clientCertificateError;
      }
  
      if (!clientKey) {
        updatedErrors.clientKeyError = true;
        valid = false
      } else {
        delete updatedErrors.clientKeyError;
      }
    }
    
    if (serverSSLChecked) {
      if (!serverCertName) {
        updatedErrors.serverCertNameError = true;
        valid = false
      } else {
        delete updatedErrors.serverCertNameError;
      }
  
      if (!serverCertificate) {
        updatedErrors.serverCertificateError = true;
        valid = false
      } else {
        delete updatedErrors.serverCertificateError;
      }
  
      if (!serverKey) {
        updatedErrors.serverKeyError = true;
        valid = false
      } else {
        delete updatedErrors.serverKeyError;
      }
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

    if (clientSSLChecked && clientProfile) {
      const update = await updateProfile('client');
      if (update.status && update.status !== 200) {
        const error = { 
          ...update, 
          component: 'updateCert', 
          vendor: 'f5', 
          errorType: 'updateClientProfileError' 
        };
        setLoading(false);
        props.dispatch(err(error));
        return;
      }
    }
    
    if (serverSSLChecked && serverProfile) {
      const update = await updateProfile('server');
      if (update.status && update.status !== 200) {
        const error = { 
          ...update, 
          component: 'updateCert', 
          vendor: 'f5', 
          errorType: 'updateServerProfileError' 
        };
        setLoading(false);
        props.dispatch(err(error));
        return;
      }
    }

    setLoading(false);

    setResponse(true);
    setTimeout(() => setResponse(false), 2000);
    setTimeout(() => closeModal(), 2050);
  };

  const updateProfile =  async (type) => {
    let body
    let r

    if (type === 'client') {
      body = {
        "data": {
          "virtualServerName": virtualServer.name,
          "certificate": {
            "name": clientCertName,
            "content_base64": btoa(clientCertificate)
          },
          "key": {
            "name": clientCertName,
            "content_base64": btoa(clientKey)
          }
        }
      }
    }

    if (type === 'server') {
      body = {
        "data": {
          "virtualServerName": virtualServer.name,
          "certificate": {
            "name": serverCertName,
            "content_base64": btoa(serverCertificate)
          },
          "key": {
            "name": serverCertName,
            "content_base64": btoa(serverKey)
          }
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
    if (type === 'client') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/workflow/profile/client-ssl/${clientProfile.name}/`, props.token, body )
    }
    if (type === 'server') {
      await rest.doXHR(`${props.vendor}/${props.asset.id}/${props.partition}/workflow/profile/server-ssl/${serverProfile.name}/`, props.token, body )
    }
    
    return r
  }

  const closeModal = () => {
    //const \[\s*\w+\s*,\s*
    /*
    const \[ corrisponde alla stringa const [.
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
    \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
    \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
    ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
    */
    setVisible(false);
    setVsLoading(false);
    setVirtualServers([]);
    setVirtualServer({});

    setClientSSLChecked(false);
    setClientProileLoading(false);  
    setClientProfiles([]);
    setClientProfile({});
    setClientCertName('');
    setClientCertificate('');
    setClientKey('');

    setServerSSLChecked(false);
    setServerProileLoading(false);
    setServerProfiles([]);
    setServerProfile({});
    setServerCertName('');
    setServerCertificate('');
    setServerKey('');

  	setErrors({});  
  	setLoading(false);
  	setResponse(false);
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
            disabled={Object.keys(virtualServer).length === 0}
            onChange={event => set(event.target.checked, key)}
          />
          </>
          
        )
        break;
      case 'select':
        return (
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
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ClientSSL Profile?</p>
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
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Client SSL Profile:</p>
                    </Col>
                    <Col span={8}>
                      {clientProileLoading ? (
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
                      {createElement('input', 'clientCertName')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Certificate:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'clientCertificate')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Key:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'clientKey')}
                    </Col>
                  </Row>
                  <br />
                  </>
                  :
                  null
                }

                <Row>
                  <Col offset={5} span={3}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>ServerSSL Profile?</p>
                  </Col>
                  <Col span={7} style={{marginTop: 5}}>
                    {createElement('checkbox', 'serverSSLChecked', '', serverSSLChecked)}
                  </Col>
                </Row>
                <br/>

                {
                  serverSSLChecked ?
                  <>
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Server SSL Profile:</p>
                    </Col>
                    <Col span={8}>
                      {serverProileLoading ? (
                        <Spin indicator={spinIcon} style={{ margin: '0 10%' }} />
                      ) : (
                        <Col span={24}>
                          {createElement('select', 'serverProfile', serverProfiles)}
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
                      {createElement('input', 'serverCertName')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Certificate:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'serverCertificate')}
                    </Col>
                  </Row>
                  <br />
                  <Row>
                    <Col offset={5} span={3}>
                      <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Key:</p>
                    </Col>
                    <Col span={8}>
                      {createElement('textArea', 'serverKey')}
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
                      disabled={loading}
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
