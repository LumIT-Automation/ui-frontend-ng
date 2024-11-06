import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';
import '../table.css'

import Rest from '../_helpers/Rest';
import JsonHelper from '../_helpers/jsonHelper';
import CommonFunctions from '../_helpers/commonFunctions'
import Error from '../concerto/error';
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Radio, Checkbox, Select, Spin } from 'antd';
import { LoadingOutlined, ReloadOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { err } from './store';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const permLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function PermissionWorkflow(props) {
  let [loading, setLoading] = useState(false);
  let [assets, setAssets] = useState([]);
  let [gotAssets, setGotAssets] = useState(false);
  let [identityGroups, setIdentityGroups] = useState([]);
  let [workflows, setWorkflows] = useState([]);

  let [gotPermissions, setGotPermissions] = useState(false);

  let [permissionsRefresh, setPermissionsRefresh] = useState(false);
  let [permissions, setPermissions] = useState([]);
  let [origPermissions, setOrigPermissions] = useState([]);
  
  


  
  let [expandedRowKeys, setExpandedRowKeys] = useState([]); // Stato per le righe espanse

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  useEffect(() => {
    if (props.vendor || permissionsRefresh) {
      setPermissionsRefresh(false)
      assetsGet()
      igsGet()
      workflowsGet()
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

  const igsGet = async () => {
    setLoading(true);
    let data = await dataGet('identity-groups/')
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'permissionWorkflow',
          vendor: 'concerto',
          errorType: 'identityGroupsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        console.log(data)
        let list = data.data.items.map(item => {
          // Crea una copia dell'oggetto principale
          const updatedItem = { ...item };
      
          // Cicla su "technologies" per rinominare "tehnology" in "technology"
          updatedItem.technologies = updatedItem.technologies.map(tech => {
              const updatedTech = { ...tech };
      
              // Se c'è la chiave errata "tehnology", rinominala
              if (updatedTech.tehnology) {
                  updatedTech.technology = updatedTech.tehnology;
                  delete updatedTech.tehnology;
              }
      
              return updatedTech;  // Restituisce l'oggetto aggiornato
          });
      
          return updatedItem;  // Restituisce l'oggetto principale con "technologies" corretto
      });
        console.log(list)
        setIdentityGroups(list)
      }
  }

  const workflowsGet = async () => {
    setLoading(true);
    let data = await dataGet('workflows/')
      if (data.status && data.status !== 200 ) {
        let error = Object.assign(data, {
          component: 'permissionWorkflow',
          vendor: 'concerto',
          errorType: 'workflowsError'
        })
        props.dispatch(err(error))
        setLoading(false)
        return
      }
      else {
        setWorkflows(data.data.items)
      }
  }

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
            //console.log(asset);
            if (asset) {
              entry.asset = { ...asset }; 
              entry.assetFqdn = asset.fqdn
              entry.existent = true
              entry.isModified = {}
            }
          });
        }
      });
    });

    copyPermissions.forEach((item, i) => {
      item.existent = true
      item.isModified = {}
    });


    console.log(copyPermissions);
    setPermissions([...copyPermissions]);
    setOrigPermissions([...copyPermissions]);
  }

  let itemAdd = async (items, type) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(items, type);
    setPermissions([...list]);  
  };

  let itemRemove = async (item, items) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, items);
    setPermissions([...list]);  
  };

  let set = async (key, value, permission, child) => { 
    
    let permissionsCopy = [...permissions]
    let perm = permissionsCopy.find(p => p.id === permission.id)
    let identityGroupsCopy = [...identityGroups]
    let workflowsCopy = [... workflows]

    if (key === 'workflow') {
      if (value) {
        let w = workflowsCopy.find(i => i.name === value)
        perm.workflow = w.name
        delete perm.workflowError
      }
    }

    if (key === 'identity_group_identifier') {
      if (value) {
        let ig = identityGroupsCopy.find(i => i.identity_group_identifier === value)
        perm.identity_group_identifier = ig.identity_group_identifier
        if (ig.technologies && ig.technologies.length > 0) {
          ig.technologies.forEach(item => {
            console.log(item)
            let tech = item.technology;
            console.log(tech)
            if (tech && !(tech in perm)) {
                perm[tech] = []; 
            }
        });
        }
        delete perm.identity_group_identifierError
      }
    }

    if (key === 'toDelete') {
      if (value) {
        perm.toDelete = true
      }
      else {
        delete perm.toDelete
      }
    }
    setPermissions([...permissionsCopy]);
  }

  let validationCheck = async () => {
    let permissionsCopy = [...permissions]
    let errors = 0
    let jsonHelper = new JsonHelper()

    for (const perm of Object.values(permissionsCopy)) {

    }
    setPermissions([...permissionsCopy]);
    return errors
  }

  let validation = async () => {
    let errors = await validationCheck()
    if (errors === 0) {
      cudManager()
    }
  }

  let cudManager = async () => {
    let permissionsCopy = [...permissions]
    let toDelete = []
    let toPatch = []
    let toPost = []
  
    for (const perm of Object.values(permissionsCopy)) {
      if (perm.toDelete) {
        toDelete.push(perm)
      }
      if (perm.isModified && Object.keys(perm.isModified).length > 0) {
        toPatch.push(perm)
      }
      if (!perm.existent) {
        toPost.push(perm)
      }
    }

    if (toDelete.length > 0) {
      for await (const perm of toDelete) {
        //let per = permissions.find(p => p.id === perm.id)
        perm.loading = true
        setPermissions([...permissionsCopy]);

        let p = await permissionDelete(`${perm.workflow}/${perm.identity_group_identifier}/`)
        if (p.status && p.status !== 200 ) {
          let error = Object.assign(p, {
            component: 'permission',
            vendor: 'concerto',
            errorType: 'permissionDeleteError'
          })
          props.dispatch(err(error))
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }
        else {
          perm.loading = false
          setPermissions([...permissionsCopy]);
        }

      }
    }

    setPermissionsRefresh(true)

  }

  let permissionDelete = async (endpoint) => {
    let r
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`workflow-permission/${endpoint}d/`, props.token )
    return r
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
      align: 'center',
      dataIndex: 'assetFqdn',
      key: 'assetFqdn',
      ...getColumnSearchProps(
        'assetFqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      /*render: (name, obj)  => (
        <Select
          value={obj.assetFqdn}
          showSearch
          style=
          { obj.assetIdError ?
            {width: '100%', border: `1px solid red`}
          :
            {width: '100%'}
          }
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          filterSort={(optionA, optionB) =>
            optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
          }
          onSelect={value => set('assetId', value, obj )}
        >
          { assets.f5.map((ass, i) => {
              return (
                <Select.Option key={i} value={ass.id}>{ass.fqdn}</Select.Option>
              )
            })
          }
        </Select>
      ),*/
    },
    {
      title: 'Partition Name',
      dataIndex: ['partition', 'name'],
      key: 'partition_name',
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <Space size="small">
          {obj.existent ?
            <Checkbox
              checked={obj.toDelete}
              //onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type='danger'
              //onClick={(e) => permissionRemove(obj)}
              onClick={(e) => console.log(obj)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
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
      render: (name, obj)  => (
        <>
          {obj.existent ?
            name
          :
            <Select
              value={obj.name}
              showSearch
              style=
              { obj.assetIdError ?
                {width: '100%', border: `1px solid red`}
              :
                {width: '100%'}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={value => set('workflow', value, obj )}
            >
              { workflows.map((w, i) => {
                  return (
                    <Select.Option key={i} value={w.name}>{w.name}</Select.Option>
                  )
                })
              }
            </Select>
          }
        </>
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
      render: (name, obj)  => (
        <>
          {obj.existent ?
            name
          :
            <Select
              value={obj.identity_group_identifier}
              showSearch
              style=
              { obj.assetIdError ?
                {width: '100%', border: `1px solid red`}
              :
                {width: '100%'}
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={value => set('identity_group_identifier', value, obj )}
            >
              { identityGroups.map((w, i) => {
                  return (
                    <Select.Option key={i} value={w.identity_group_identifier}>{w.identity_group_identifier}</Select.Option>
                  )
                })
              }
            </Select>
          }
        </>
      ),
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <Space size="small">
          {obj.existent ?
            <Checkbox
              checked={obj.toDelete}
              onChange={e => set('toDelete', e.target.checked, obj)}
            />
          :
            <Button
              type='danger'
              onClick={(e) => itemRemove(obj, permissions)}
            >
              -
            </Button>
          }
        </Space>
      ),
    }
  ];

  return (
    <>
    {console.log(identityGroups)}
    {console.log(workflows)}
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

          <Radio.Group
            buttonStyle="solid"
          >
            <Radio.Button
              style={{marginLeft: 16 }}
              onClick={() => itemAdd(permissions)}
            >
              Add permission
            </Radio.Button>

          </Radio.Group>
        <br/>
        <br/>
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
          <Button
            type="primary"
            style={{float: 'right', marginRight: 15}}
            onClick={() => validation()}
          >
            Commit
          </Button>
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
