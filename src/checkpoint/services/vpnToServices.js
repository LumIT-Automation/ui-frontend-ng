import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';
import { err } from '../../concerto/store';
import AssetSelector from '../../concerto/assetSelector';
import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

const VpnToServices = (props) => {
  const [visible, setVisible] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [domain] = useState('SHARED-SERVICES');
  const [errors, setErrors] = useState({});
  const [vpnToServices, setVpnToServices] = useState([]);
  const [name, setName] = useState(null);
  const [base64, setBase64] = useState(null);
  const [nameloading, setNameloading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters, confirm)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        } else if (Array.isArray(dataIndex)) {
          let r = record[dataIndex[0]];
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase());
        } else {
          return '';
        }
      } catch (error) {}
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: (text) => {
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    }
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    confirm();
    setSearchText('');
  };

  const onTableRowExpand = (expanded, record) => {
    const keys = [...expandedKeys];
    if (expanded) {
      keys.push(record.uid);
    } else {
      keys.splice(keys.indexOf(record.uid), 1);
    }
    setExpandedKeys(keys);
  };

  const details = () => {
    setVisible(true);
  };

  const setKey = (e, kName) => {
    if (kName === 'name') {
      setName(e.target.value);
    }
  };

  const validationCheck = async () => {
    let currentErrors = { ...errors };
    if (!name) {
      currentErrors.nameError = true;
      setErrors(currentErrors);
    } else {
      delete currentErrors.nameError;
      setErrors(currentErrors);
    }
    return currentErrors;
  };

  const validation = async () => {
    await validationCheck();
    if (Object.keys(errors).length === 0) {
      vpnToService();
    }
  };

  const flatProperty = async (items) => {
    const list = items.map((item) => {
      const key = Object.keys(item.ipv4)[0];
      const value = Object.values(item.ipv4)[0];
      return { ...item, [key]: value, ipValue: value };
    });
    setVpnToServices(list);
  };

  const vpnToService = async () => {
    setNameloading(true);
    const b = { data: { name } };
    const rest = new Rest(
      'PUT',
      (resp) => {
        const beauty = JSON.stringify(resp.data.items, null, 2);
        const base64Data = btoa(beauty);
        const list = resp.data.items.map((item) => {
          const list2 = item.ipv4s.map(ip => ({ ip }));
          return { ...item, ipv4s: list2 };
        });
        setVpnToServices(list);
        setBase64(base64Data);
      },
      (error) => {
        error = { ...error, component: 'vpnToService', vendor: 'checkpoint', errorType: 'vpnToServiceError' };
        props.dispatch(err(error));
      }
    );
    await rest.doXHR(`checkpoint/${props.asset.id}/${domain}/vpn-to-services/`, props.token, b);
    setNameloading(false);
  };

  const closeModal = () => {
    setVisible(false);
    setName(null);
    setVpnToServices([]);
    setErrors({});
  };

  const errorsComponent = () => {
    if (props.error && props.error.component === 'vpnToService') {
      return <Error error={[props.error]} visible={true} />;
    }
    return null;
  };

  const ipValueColumns = [
    {
      title: 'ipValue',
      align: 'center',
      dataIndex: 'ip',
      key: 'ip',
      ...getColumnSearchProps('ip'),
    }
  ];

  const expandedRowRender = (params) => {
    const columns = [
      {
        title: 'Port',
        align: 'center',
        dataIndex: 'port',
        key: 'port',
        ...getColumnSearchProps('port'),
      },
      {
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...getColumnSearchProps('type'),
      }
    ];
    return <Table columns={columns} dataSource={params.services} pagination={false} />;
  };

  const columns = [
    {
      title: 'Name',
      align: 'center',
      width: 300,
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Type',
      align: 'center',
      width: 300,
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps('type'),
    },
    {
      title: 'IP',
      align: 'center',
      width: 300,
      dataIndex: '',
      key: 'ipv4s',
      render: (name, obj) => (
        <Table
          columns={ipValueColumns}
          dataSource={obj.ipv4s}
          bordered
          scroll={{ x: 'auto' }}
          style={{ marginLeft: -25 }}
          pagination={{ pageSize: 10 }}
          rowKey={(record) => record.uid}
        />
      ),
    }
  ];

  return (
    <React.Fragment>
      <Button type="primary" onClick={details}>VPN Flows by Profile</Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>VPN Flows by Profile</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor='checkpoint' domain={domain} />
        <Divider />

        {((props.asset && props.asset.id) && domain) ? (
          <React.Fragment>
            <Row>
              <Col offset={2} span={6}>
                <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>Group Name:</p>
              </Col>
              <Col span={8}>
                <Input
                  defaultValue={name}
                  style={errors.nameError ? { borderColor: 'red' } : null}
                  onChange={(e) => setKey(e, 'name')}
                  placeholder="Enter group name"
                />
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  loading={nameloading}
                  onClick={validation}
                  style={{ marginLeft: 10 }}
                >
                  Add
                </Button>
              </Col>
            </Row>
            {errorsComponent()}
            <Divider />

            {vpnToServices.length > 0 ? (
              <Table
                columns={columns}
                expandedRowRender={expandedRowRender}
                dataSource={vpnToServices}
                pagination={{ pageSize: 10 }}
                rowKey={(record) => record.uid}
                onExpand={onTableRowExpand}
                expandedRowKeys={expandedKeys}
              />
            ) : (
              <Alert message="No data available" type="info" />
            )}
          </React.Fragment>
        ) : (
          <Spin indicator={spinIcon} />
        )}
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => ({
  error: state.error,
  token: state.auth.token,
});

export default connect(mapStateToProps)(VpnToServices);
