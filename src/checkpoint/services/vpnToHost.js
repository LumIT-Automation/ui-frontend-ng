import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';

import {
  err
} from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col, Space } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

const VpnToHost = (props) => {
  const [visible, setVisible] = useState(false);
  const [domain, setDomain] = useState('SHARED-SERVICES');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [errors, setErrors] = useState({});
  const [vpnToHosts, setVpnToHosts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [ipv4Address, setIpv4Address] = useState('');
  const [base64, setBase64] = useState('');

  const searchInput = useRef(null);

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string') {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        } else if (Array.isArray(dataIndex)) {
          let r = record[dataIndex[0]];
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase());
        } else {
          return '';
        }
      } catch (error) {
        return '';
      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: text => searchedColumn === dataIndex ? (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    ) : (
      text
    ),
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
    let keys = [...expandedKeys];
    if (expanded) {
      keys.push(record.uid);
    } else {
      keys = keys.filter(k => k !== record.uid);
    }
    setExpandedKeys(keys);
  };

  const details = () => {
    setVisible(true);
  };

  const setKey = (e, kName) => {
    if (kName === 'ipv4-address') {
      setIpv4Address(e.target.value);
    }
  };

  const validationCheck = async () => {
    let validators = new Validators();
    let newErrors = { ...errors };

    if (!ipv4Address || !validators.ipv4(ipv4Address)) {
      newErrors['ipv4-addressError'] = true;
      setErrors(newErrors);
    } else {
      delete newErrors['ipv4-addressError'];
      setErrors(newErrors);
    }

    return newErrors;
  };

  const validation = async () => {
    await validationCheck();
    if (Object.keys(errors).length === 0) {
      vpnToHost();
    }
  };

  const vpnToHost = async () => {
    setLoading(true);
    let b = {
      data: {
        "ipv4-address": ipv4Address,
        "rule-package": "FWRAVPN_PKG",
      }
    };

    let rest = new Rest(
      "PUT",
      resp => {
        let beauty = JSON.stringify(resp.data.items, null, 2);
        let base64Data = btoa(beauty);
        setVpnToHosts(resp.data.items);
        setBase64(base64Data);
      },
      error => {
        let errData = Object.assign(error, {
          component: 'vpnToHost',
          vendor: 'checkpoint',
          errorType: 'vpnToHostError'
        });
        props.dispatch(err(errData));
      }
    );
    await rest.doXHR(`checkpoint/${props.asset.id}/${domain}/vpn-to-host/`, props.token, b);
    setLoading(false);
  };

  const closeModal = () => {
    setVisible(false);
    setIpv4Address(null);
    setVpnToHosts([]);
    setErrors({});
  };

  const errorsRender = () => {
    if (props.error && props.error.component === 'vpnToHost') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  const expandedRowRender = (record) => {
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

    return <Table columns={columns} dataSource={record.services} pagination={false} />;
  };

  const columns = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
    }
  ];

  return (
    <React.Fragment>
      <Button type="primary" onClick={details}>Get VPN Profiles</Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>Get VPN Profiles</p>}
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

        {((props.asset && props.asset.id) && domain) ?
          <React.Fragment>
            <React.Fragment>
              <Row>
                <Col offset={2} span={6}>
                  <p style={{ marginRight: 10, marginTop: 5, float: 'right' }}>ipv4-address:</p>
                </Col>
                <Col span={8}>
                  <Input
                    defaultValue={ipv4Address}
                    style={errors['ipv4-addressError'] ? { borderColor: 'red' } : null}
                    onChange={e => setKey(e, 'ipv4-address')}
                    onPressEnter={validation}
                  />
                </Col>
              </Row>
              <Row>
                <Col offset={8} span={16}>
                  <Button
                    type="primary"
                    onClick={validation}
                  >
                    Get VPN Profiles
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
            <Divider />
            {loading ?
              <Spin indicator={spinIcon} style={{ margin: 'auto 48%' }} />
              :
              vpnToHosts.length < 1 ?
                null
                :
                <React.Fragment>
                  <a download='Get VPN Profiles.txt' href={`data:application/octet-stream;charset=utf-8;base64,${base64}`}>Download data</a>
                  <br /><br />
                  <Table
                    columns={columns}
                    dataSource={vpnToHosts}
                    bordered
                    scroll={{ x: 'auto' }}
                    pagination={{ pageSize: 10 }}
                    style={{ marginBottom: 10 }}
                    onExpand={onTableRowExpand}
                    expandedRowKeys={expandedKeys}
                    rowKey={record => record.uid}
                    expandedRowRender={record => expandedRowRender(record)}
                  />
                </React.Fragment>
            }
          </React.Fragment>
            :
            <Alert message="Asset and Domain not set" type="error" />
          }
      </Modal>

      {errorsRender()}
    </React.Fragment>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,
  asset: state.checkpoint.asset,
}))(VpnToHost);

