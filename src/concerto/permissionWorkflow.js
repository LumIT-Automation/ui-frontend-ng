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
  let [gotAssets, setGotAssets] = useState(false);
  let [gotPermissions, setGotPermissions] = useState(false);
  
  let [assets, setAssets] = useState([]);
  let [permissionsRefresh, setPermissionsRefresh] = useState(false);

  let [permissions, setPermissions] = useState([]);
  let [expandedRowKeys, setExpandedRowKeys] = useState([]); // Stato per le righe espanse

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  useEffect(() => {
    if (props.vendor || permissionsRefresh) {
      setPermissionsRefresh(false)
      assetsGet()
    }
  }, [props.vendor, permissionsRefresh]);

  useEffect(() => {    
    if (gotAssets) {
      permissionsGet();
      setGotAssets(false)
    }
  }, [gotAssets]);

  useEffect(() => {    
    if (gotPermissions) {
      permsWithAsset();
      setGotPermissions(false)
    }
    
  }, [gotPermissions]);


  const assetsGet = async () => {
    setLoading(true);
    let vendors = ['infoblox', 'checkpoint', 'f5']
    let list = JSON.parse(JSON.stringify(assets));

    for await (const vendor of vendors) {
      let data = await dataGet(`${vendor}/assets/`);
      if (data.status && data.status !== 200) {
        let error = Object.assign(data, {
          component: 'permissionWorkflow',
          vendor: 'concerto',
          errorType: `get ${vendor} assets Error`,
        });
        props.dispatch(err(error));
      } else {
        let vendorAssets = data.data.items
        for await (const asset of vendorAssets) {
          let subAssets, saLabel
          if (vendor === 'infoblox'){
            subAssets = await networksGet(asset.id)
            saLabel = 'networks'
          }
          else if (vendor === 'checkpoint') {
            subAssets = await dataGet(`${vendor}/${asset.id}/domains/`, asset.id)
            saLabel = 'domains'
          }
          else if (vendor === 'f5') {
            subAssets = await dataGet(`${vendor}/${asset.id}/partitions/`, asset.id)
            saLabel = 'partitions'
          }
          if (subAssets.status && subAssets.status !== 200) {
            let error = Object.assign(subAssets, {
              component: 'permissionWorkflow',
              vendor: 'concerto',
              errorType: `get ${vendor} assets Error`,
            });
            props.dispatch(err(error));
          } else {
            if (subAssets.data && subAssets.data.items) {
              asset[saLabel] = subAssets.data.items
            }
            else {
              asset[saLabel] = subAssets
            }
          }
        }
        list.push({[vendor]: vendorAssets})   
      }
    }
    setAssets(list)
    setLoading(false);
    setGotAssets(true)
  };

  let networksGet = async (assetId) => {
    let nets = await dataGet(`infoblox/${assetId}/networks/`)
    if (nets.status && nets.status !== 200) {
      let error = Object.assign(nets, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'networksError'
      })
      props.dispatch(err(error))
      return
    }

    let containers = await dataGet(`infoblox/${assetId}/network-containers/`, assetId)
    if (containers.status && containers.status !== 200) {
      let error = Object.assign(containers, {
        component: 'permissionWorkflow',
        vendor: 'concerto',
        errorType: 'containersError'
      })
      props.dispatch(err(error))
      return
    }

    let networks = nets.data.concat(containers.data)
    return networks
  }

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
    setGotPermissions(true)
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

  function findAssetById(type, id) {
    const assetGroup = assets.find(asset => asset[type]);
    if (assetGroup) {
        return assetGroup[type].find(asset => asset.id === id) || null;
    }
    return null;
  }

  let permsWithAsset = async () => {
    let copyPermissions = JSON.parse(JSON.stringify(permissions));

    copyPermissions.forEach(copyPermission => {
      ['f5', 'infoblox', 'checkpoint'].forEach(type => {
        // Controlla se esiste e se è un array
        if (Array.isArray(copyPermission[type])) {
          copyPermission[type].forEach(entry => {
            const idAsset = entry[type === 'f5' ? 'partition' : type === 'infoblox' ? 'network' : 'domain'].id_asset;
            const asset = findAssetById(type, idAsset);
            console.log(asset);
            if (asset) {
              entry.asset = { ...asset }; 
            }
          });
        }
      });
    });

    console.log(copyPermissions);
    setPermissions([...copyPermissions]);
}


  // Colonne per la tabella F5
  const f5Columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Asset',
      dataIndex: ['asset', 'fqdn'],
      key: 'asset',
    },
    {
      title: 'Partition Name',
      dataIndex: ['partition', 'name'],
      key: 'partition_name',
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
      title: 'Asset',
      dataIndex: ['asset', 'fqdn'],
      key: 'asset',
    },
    {
      title: 'Network Name',
      dataIndex: ['network', 'name'],
      key: 'network_name',
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
      title: 'Asset',
      dataIndex: ['asset', 'fqdn'],
      key: 'asset',
    },
    {
      title: 'Domain Name',
      dataIndex: ['domain', 'name'],
      key: 'domain_name',
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
            <br/>
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
            <br/>
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
            <br/>
          </>
        )}
      </>
    );
  };

  const onTableRowExpand = (expanded, record) => {
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
    {console.log(permissions)}
      {loading ? (
        <Spin indicator={spinIcon} style={{ margin: '10% 45%' }} />
      ) : (
        <React.Fragment>
          <Radio.Group>
            <Radio.Button
              style={{marginLeft: 16 }}
              onClick={() => setPermissionsRefresh(true)}
            >
              <ReloadOutlined/>
            </Radio.Button>
          </Radio.Group>
          <Table
            columns={workflowColumns}
            style={{width: '100%', padding: 5}}
            dataSource={permissions}
            bordered
            rowKey={(record) => record.id}
            scroll={{x: 'auto'}}          
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
