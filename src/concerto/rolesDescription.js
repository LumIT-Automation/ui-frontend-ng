import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Table, List, Spin } from 'antd'

import { QuestionCircleOutlined, LoadingOutlined } from '@ant-design/icons';

import Rest from '../_helpers/Rest'
import Error from './error'

import {
  err,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

function RolesDescription(props) {

  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [request, setRequest] = useState({});
  const [loading, setLoading] = useState(false);
  const [rolesAndPrivileges, setRolesAndPrivileges] = useState([]);

  useEffect(() => {
    // componentDidMount logic
    return () => {
      // componentWillUnmount logic
    }
  }, []);

  const details = async () => {
    setVisible(true);
    setLoading(true);

    const fetchedRoles = await dataGet('/roles/?related=privileges');
    if (fetchedRoles.status && fetchedRoles.status !== 200) {
      const error = Object.assign(fetchedRoles, {
        component: 'rolesDescription',
        vendor: 'concerto',
        errorType: 'rolesError'
      });
      props.dispatch(err(error));
      setLoading(false);
      return;
    } else {
      setRolesAndPrivileges(fetchedRoles.data.items);
      setLoading(false);
    }
  }

  const dataGet = async (entities) => {
    let r;
    let rest = new Rest(
      "GET",
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(`${props.vendor}${entities}`, props.token);
    return r;
  }

  const closeModal = () => {
    setVisible(false);
  }

  const columns = [
    {
      title: 'Role',
      align: 'center',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Description',
      align: 'center',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Privileges',
      align: 'center',
      dataIndex: ['privileges', 'privilege'],
      key: 'privilege',
      render: (name, obj) => (
        <List
          size="small"
          dataSource={obj.privileges}
          renderItem={(item) => <List.Item>{item.privilege ? item.privilege : item}</List.Item>}
        />
      )
    },
  ];

  const renderErrors = () => {
    if (props.error && props.error.component === 'rolesDescription') {
      return <Error error={[props.error]} visible={true} />
    }
  }

  return (
    <React.Fragment>

      <div>
        <QuestionCircleOutlined style={{ marginRight: '10px', marginTop: '12px', marginBottom: '12px' }} onClick={details} /> Role
      </div>

      <Modal
        title={<p style={{ textAlign: 'center' }}>{props.vendor} {props.title}</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={null}
        onCancel={closeModal}
        width={1000}
        maskClosable={false}
      >
        {loading ? (
          <Spin indicator={spinIcon} style={{ margin: '10% 48%' }} />
        ) : (
          <Table
            columns={columns}
            dataSource={rolesAndPrivileges}
            bordered
            rowKey="role"
            scroll={{ x: 'auto' }}
            pagination={{ pageSize: 10 }}
            style={{ marginBottom: 10 }}
          />
        )}
      </Modal>

      {visible && (
        <React.Fragment>
          {renderErrors()}
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(RolesDescription);
