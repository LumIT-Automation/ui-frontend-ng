import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';
import '../table.css'

import Rest from '../_helpers/Rest';
import JsonHelper from '../_helpers/jsonHelper';
import Error from '../concerto/error';
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin } from 'antd';
import { LoadingOutlined, ReloadOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { err } from './store';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const permLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function PermissionWorkflow(props) {
  let [loading, setLoading] = useState(false);
  let [permissions, setPermissions] = useState([]);
  let [expandedRowKeys, setExpandedRowKeys] = useState([]); // Stato per le righe espanse

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  useEffect(() => {
    if (props.vendor) {
      permissionsGet();
    }
  }, [props.vendor]);

  const permissionsGet = async () => {
    setLoading(true);
    let data = await dataGet('workflow-permissions/');
    if (data.status && data.status !== 200) {
      let error = Object.assign(data, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'permissionWorkflowError',
      });
      props.dispatch(err(error));
    } else {
      const itemsWithIds = data.data.items.map((item, index) => ({
        ...item,
        id: index + 1, // L'id parte da 1 invece che da 0
      }));
      setPermissions(itemsWithIds);
    }
    setLoading(false);
  };

  const dataGet = async (endpoint) => {
    let r;

    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(endpoint, props.token);
    return r;
  };

    // Colonne per la tabella F5
    const f5Columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Nome Gruppo',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
      },
      {
        title: 'Identificatore Gruppo',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
      },
      {
        title: 'Partition Name',
        dataIndex: ['partition', 'name'],
        key: 'partition_name',
      },
      {
        title: 'Partition ID Asset',
        dataIndex: ['partition', 'id_asset'],
        key: 'partition_id_asset',
      },
    ];
  
    // Colonne per la tabella Infoblox
    const infobloxColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Nome Gruppo',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
      },
      {
        title: 'Identificatore Gruppo',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
      },
      {
        title: 'Network Name',
        dataIndex: ['network', 'name'],
        key: 'network_name',
      },
      {
        title: 'Network ID Asset',
        dataIndex: ['network', 'id_asset'],
        key: 'network_id_asset',
      },
    ];
  
    // Colonne per la tabella Checkpoint
    const checkpointColumns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Nome Gruppo',
        dataIndex: 'identity_group_name',
        key: 'identity_group_name',
      },
      {
        title: 'Identificatore Gruppo',
        dataIndex: 'identity_group_identifier',
        key: 'identity_group_identifier',
      },
      {
        title: 'Domain Name',
        dataIndex: ['domain', 'name'],
        key: 'domain_name',
      },
      {
        title: 'Domain ID Asset',
        dataIndex: ['domain', 'id_asset'],
        key: 'domain_id_asset',
      },
      {
        title: 'Tag',
        dataIndex: 'tag',
        key: 'tag',
      },
    ];

  const expandedRowRender = (record) => {
    return (
      <>
        {record.f5 && record.f5.length > 0 && (
          <>
            <h4>F5</h4>
            <Table 
              columns={f5Columns} 
              dataSource={record.f5} 
              pagination={false} 
              rowKey="id" 
              className="f5-table"
            />
          </>
        )}
        {record.infoblox && record.infoblox.length > 0 && (
          <>
            <h4>Infoblox</h4>
            <Table 
              columns={infobloxColumns} 
              dataSource={record.infoblox} 
              pagination={false} 
              rowKey="id" 
              className="infoblox-table"
            />
          </>
        )}
        {record.checkpoint && record.checkpoint.length > 0 && (
          <>
            <h4>Checkpoint</h4>
            <Table 
              columns={checkpointColumns} 
              dataSource={record.checkpoint} 
              pagination={false} 
              rowKey="id"
              className="checkpoint-table"
            />
          </>
        )}
      </>
    );
  };

  const onTableRowExpand = (expanded, record) => {
    console.log(expanded)
    console.log(record)
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
    }
  };

  let workflowColumns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj) => (
        <Space size="small">
          {obj.loading ? <Spin indicator={permLoadIcon} style={{ margin: '10% 10%' }} /> : null}
        </Space>
      ),
    },
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Workflow Name',
      align: 'center',
      dataIndex: 'workflow',
      key: 'workflow',
      ...getColumnSearchProps(
        'workflow',
        searchInput,
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText),
        searchText,
        searchedColumn,
        setSearchText,
        setSearchedColumn
      ),
    },
    {
      title: 'Distinguished name',
      align: 'center',
      dataIndex: 'identity_group_identifier',
      key: 'identity_group_identifier',
      ...getColumnSearchProps(
        'identity_group_identifier',
        searchInput,
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText),
        searchText,
        searchedColumn,
        setSearchText,
        setSearchedColumn
      ),
    },
  ];

  return (
    <>
      {loading ? (
        <Spin indicator={spinIcon} style={{ margin: '10% 45%' }} />
      ) : (
        <React.Fragment>
          <Table
            columns={workflowColumns}
            dataSource={permissions}
            rowKey={(record) => record.id}
            expandedRowKeys={expandedRowKeys}
            onExpand={(expanded, record) => onTableRowExpand(expanded, record)}
            expandable={{ expandedRowRender }}
            pagination={{ pageSize: 10 }}
          />
        </React.Fragment>
      )}
      {props.error && props.error.component === 'permissionWorkflow' && <Error error={[props.error]} visible={true} />}
    </>
  );
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(PermissionWorkflow);
