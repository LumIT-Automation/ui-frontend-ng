import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';
import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';

import { err } from '../../concerto/store';
import AssetSelector from '../../concerto/assetSelector';

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function IpModify(props) {
  /** -------------------- State Management -------------------- **/
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ipModifyLoading, setIpModifyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestIp, setRequestIp] = useState('');
  const [response, setResponse] = useState([]);
  const [ipModifyRequest, setIpModifyRequest] = useState({ ip: '' });

  /** -------------------- Hooks -------------------- **/
  useEffect(() => {
    if (response.length > 0) {
      setIpModifyRequest(response[0]);
    }
  }, [response]);

  /** -------------------- Handlers -------------------- **/
  const ipDetailsHandler = async () => {
    setResponse([]);
    if (await validateRequest()) {
      fetchIpDetails();
    }
  };

  const fetchIpDetails = async () => {
    setLoading(true);
    const rest = new Rest(
      'GET',
      (resp) => {
        const data = transformResponseData(resp.data);
        setResponse([data]);
      },
      (error) => handleError(error, 'ipModify', 'infoblox', 'ipDetailError')
    );
    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${requestIp}/`, props.token);
    setLoading(false);
  };

  const ipModifyHandler = async () => {
    // Se il macAddress è vuoto, impostiamo un valore di default
    if (!ipModifyRequest.macAddress || ipModifyRequest.macAddress.trim() === '') {
      updateRequest('00:00:00:00:00:00', 'macAddress');
    }
  
    // Verifica che la richiesta sia valida e procedi con la modifica
    if (await validateRequest()) {
      ipModify();
    }
  };
  

  const ipModify = async () => {
    const { macAddress, serverName, options, ip_address } = ipModifyRequest;

    const body = {
      data: {
        mac: macAddress,
        extattrs: {
          'Name Server': { value: serverName },
        },
        ...(options && { options }),
      },
    };

    setIpModifyLoading(true);
    const rest = new Rest(
      'PATCH',
      () => {
        setIpModifyLoading(false);
        ipDetailsHandler();
      },
      (error) => handleError(error, 'ipModify', 'infoblox', 'ipModifyError')
    );

    await rest.doXHR(`infoblox/${props.asset.id}/ipv4/${ip_address}/`, props.token, body);
    setIpModifyLoading(false);
  };

  const validateRequest = async () => {
    const validators = new Validators();
    const validationErrors = {};

    if (!validators.ipv4(requestIp)) {
      validationErrors.requestIpError = true;
    }

    if (response.length > 0) {
      const { macAddress, serverName } = ipModifyRequest;

      // Check macAddress
      if (!validators.macAddress(macAddress)) {
        validationErrors.macAddressError = true;
      }

      // Check serverName
      if (!serverName || serverName.trim() === '') {
        validationErrors.serverNameError = true;
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const updateRequest = (value, key) => {
    setIpModifyRequest((prev) => ({ ...prev, [key]: value }));
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (key === 'macAddress' && value !== '' && new Validators().macAddress(value)) {
        delete updatedErrors.macAddressError;
      } else if (key === 'serverName' && value !== '') {
        delete updatedErrors.serverNameError;
      }
      return updatedErrors;
    });
    setResponse((prev) => prev.map((item, index) => (index === 0 ? { ...item, [key]: value } : item)));
  };

  const resetState = () => {
    setVisible(false);
    setLoading(false);
    setIpModifyLoading(false);
    setErrors({});
    setRequestIp('');
    setResponse([]);
    setIpModifyRequest({ ip: '' });
  };

  /** -------------------- Utilities -------------------- **/
  const handleError = (error, component, vendor, errorType) => {
    props.dispatch(err({ ...error, component, vendor, errorType }));
  };

  const transformResponseData = (data) => ({
    ...data,
    serverName: data.extattrs?.['Name Server']?.value || '',
    macAddress: data.mac_address || '',
    option12: data.objects?.[0]?.options?.find((opt) => opt.num === 12)?.value || '',
  });

  /** -------------------- Table Columns -------------------- **/
  const columns = [
    {
      title: 'Loading',
      align: 'center',
      key: 'loading',
      render: () => (ipModifyLoading ? <Spin indicator={spinIcon} style={{ margin: '10% 10%' }} /> : null),
    },
    {
      title: 'IP Address',
      align: 'center',
      dataIndex: 'ip_address',
      key: 'ip_address',
    },
    {
      title: 'Server Name',
      align: 'center',
      key: 'serverName',
      render: (_, obj) => (
        <Input
          value={obj.serverName}
          onChange={(e) => updateRequest(e.target.value, 'serverName')}
          style={errors.serverNameError ? { borderColor: 'red' } : {}}
        />
      ),
    },
    {
      title: 'Mac Address',
      align: 'center',
      key: 'macAddress',
      render: (_, obj) => (
        <Input
          value={obj.macAddress}
          onChange={(e) => updateRequest(e.target.value, 'macAddress')}
          style={errors.macAddressError ? { borderColor: 'red' } : {}}
        />
      ),
    },
    {
      title: 'Option 12 (DHCP)',
      align: 'center',
      dataIndex: 'option12',
      key: 'option12',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.option12 ? obj.option12 : null}
        </React.Fragment>
      ),
    },
    {
      title: 'Assignee',
      align: 'center',
      width: 200,
      //dataIndex: ['extattrs', 'Reference', 'value'],
      key: 'reference',
      render: (name, obj)  => (
        <React.Fragment>
        {obj.extattrs && obj.extattrs && obj.extattrs.Reference && obj.extattrs.Reference.value ?
          obj.extattrs.Reference.value
        :
          '-'
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Requester',
      align: 'center',
      width: 200,
      //dataIndex: ['objects', 'extattrs', 'Reference', 'value'],
      key: 'reference',
      render: (name, obj)  => (
        <React.Fragment>
        {obj.objects && obj.objects[0] && obj.objects[0].extattrs && obj.objects[0].extattrs.Reference && obj.objects[0].extattrs.Reference.value ?
          obj.objects[0].extattrs.Reference.value
        :
          '-'
        }
        </React.Fragment>
      ),
    }
  ];

  /** -------------------- Render -------------------- **/
  return (
    <React.Fragment>
      <Button type="primary" onClick={() => setVisible(true)}>
        IP MODIFY
      </Button>
      <Modal
        title={<p style={{ textAlign: 'center' }}>IP MODIFY</p>}
        centered
        destroyOnClose
        visible={visible}
        footer={null}
        onCancel={resetState}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor="infoblox" />
        <Divider />
        {props.asset?.id ? (
          <>
            <Row>
              <Col offset={6} span={2}>
                <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>IP Address:</p>
              </Col>
              <Col span={15}>
              { loading ?
                <Spin indicator={spinIcon} style={{margin: 'auto 10%'}}/>
              :
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      <Input
                        style=
                        {errors.requestIpError ?
                          {borderColor: 'red'}
                        :
                          {}
                        }
                        defaultValue={requestIp ? requestIp : ''}
                        onBlur={event => setRequestIp(event.target.value)}
                      />
                    </Col>
                  </Row>
                  <br/>
                </React.Fragment>
              }
              </Col>
            </Row>
            <Row>
              <Col offset={8} span={16}>
                <Button type="primary" onClick={ipDetailsHandler}>IP Details</Button>
              </Col>
            </Row>
            <Divider />
            {response.length > 0 && (
              <>
                <Table 
                  columns={columns} 
                  dataSource={response} 
                  rowKey="ip" 
                  bordered 
                  pagination={false} 
                />
                <br/>
                <Button type="primary" onClick={ipModifyHandler}>
                  IP Modify
                </Button>
              </>
            )}
          </>
        ) : (
          <Alert message="Asset and Partition not set" type="error" />
        )}
      </Modal>
      {visible && props.error?.component === 'ipModify' && <Error error={[props.error]} visible />}
    </React.Fragment>
  );
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
  asset: state.infoblox.asset,
}))(IpModify);
