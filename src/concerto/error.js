import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { err } from './store';
import { Modal, Table, Result } from 'antd';

const Error = (props) => {
  const dispatch = useDispatch();
  const [component, setComponent] = useState('');
  const [vendor, setVendor] = useState('');
  const [errorType, setErrorType] = useState('');

  useEffect(() => {
    console.log(props.error)
    if (props.error && props.error[0]) {
      setComponent(props.error[0].component);
      setVendor(props.error[0].vendor);
      setErrorType(props.error[0].errorType);
    }
  }, []);

  useEffect(() => {
    console.log(props.error)
    if (props.error && props.error[0]) {
      setComponent(props.error[0].component);
      setVendor(props.error[0].vendor);
      setErrorType(props.error[0].errorType);
    }
  }, [props]);

  const onCancel = async () => {
    dispatch(err(null));
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    } catch (e) {
      console.log(e);
    }
  };

  const columns = [
    {
      title: 'FROM',
      align: 'left',
      dataIndex: 'url',
      key: 'url',
    },
    {
      title: 'Type',
      align: 'left',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'STATUS',
      align: 'left',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'MESSAGE',
      align: 'left',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'REASON',
      align: 'left',
      width: 300,
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  const renderError = () => {
    if (props.error && props.error[0]) {
      const statusCode = props.error[0].status;

      switch (statusCode) {
        case 400:
          return <Result title={'400 - Bad Request'} />;
        case 401:
          logout();
          break;
        case 403:
          return <Result status={'403'} title={'403 - Forbidden'} />;
          case 404:
          return <Result status={'404'} title={'404 - Not Found'} />;
          case 409:
          return <Result title={'409 - Conflict'} />;
          case 412:
          return <Result title={'412 - Precondition Failed'} />;
          case 422:
          return <Result title={'422 - Unprocessable Entity'} />;
          case 423:
          return <Result title={'423 - Locked'} />;
          case 429:
          return <Result title={'429 - Too Many Requests'} />;
          case 500:
          return <Result title={'500'} />;
          case 502:
          return <Result title={'502'} />;
          case 503:
          return <Result title={'503'} />;
          default:
          return <Result status="error" />;
        }
    } else {
      return null;
    }
  };
      
  return (
    <Modal
      title={<p style={{ textAlign: 'center' }}>{vendor} - {component} - {errorType}</p>}
      centered
      destroyOnClose
      visible={props.visible}
      footer={null}
      onCancel={onCancel}
      width={1500}
      maskClosable={false}
    >
      <React.Fragment>
        {renderError()}
        <Table
          dataSource={props.error}
          columns={columns}
          pagination={false}
          rowKey="message"
          scroll={{ x: 'auto' }}
        />
      </React.Fragment>
    </Modal>
  );
};
  
export default Error;
