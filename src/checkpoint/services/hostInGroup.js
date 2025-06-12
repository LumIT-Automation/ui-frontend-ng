import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'
import Card from '../../_components/card'
import CommonFunctions from '../../_helpers/commonFunctions'
import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Radio, Alert, Row, Col, Select, Divider, Table, Checkbox } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

function HostInGroup(props) {
  const [visible, setVisible] = useState(false);
  const [changeRequestId, setChangeRequestId] = useState('');
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [isGroupHostsFetched, setIsGroupHostsFetched] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [changeRequestIdError, setChangeRequestIdError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  let [pageSize, setPageSize] = useState(10);

  let myRefs = useRef({});

  useEffect(() => {
    if (visible && props.asset && props.domain) {
      setGroup(null);
      setGroups([]);
      dataGet();
    }
  }, [props.domain]);

  useEffect(() => {
    if (group && !isGroupHostsFetched) {
      getGroupHosts(); // Chiama getGroupHosts solo una volta
      setIsGroupHostsFetched(true); // Imposta che è stata chiamata
    }
  }, [group, isGroupHostsFetched]);

  const dataGet = async () => {
    setLoading(true);
    let data = await getData('groups');
    if (data.status && data.status !== 200) {
      
      let error = Object.assign(data, {
        component: 'hostInGroup',
        vendor: 'checkpoint',
        errorType: 'groupsError'
      })
      props.dispatch(err(error))
      setLoading(false);
      return;
    }
    setGroups(data.data.items);

    data = await getData('hosts');
    if (data.status && data.status !== 200) {
      let error = Object.assign(data, {
        component: 'hostInGroup',
        vendor: 'checkpoint',
        errorType: 'hostsError'
      })
      props.dispatch(err(error))
      setLoading(false);
      return;
    }
    let list = data?.data?.items.map((item, i) => ({...item, existent: true, str: `${item.name} - ${item['ipv4-address']}`}))
    console.log(list)
    setHosts(list);
    setLoading(false);
  };

  const getGroupHosts = async () => {
    setGhLoading(true);
    let data = await getData('group-hosts', group.uid);
    if (data.status && data.status !== 200) {
      let error = Object.assign(data, {
        component: 'hostInGroup',
        vendor: 'checkpoint',
        errorType: 'groupHostsError'
      })
      props.dispatch(err(error))
      setGhLoading(false);
      return;
    }
    let updatedGroup = { ...group, members: data.data.items.map((item, i) => ({ ...item, groupMember: true, flagged: true, id: i + 1 })) };
    setGroup(updatedGroup);
    setGhLoading(false);
  };

  const getData = async (entity, id) => {
    let r
    let endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/`;

    if (entity === 'groups') {
      
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/?local&logout`;
      console.log('groups', entity)
      console.log('groups', endpoint)
    }
    if (entity === 'hosts') {
      
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/?logout`;
      console.log('hosts', entity)
      console.log('hosts', endpoint)
    }
    if (id) {
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/${id}/`
    }
    
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(endpoint, props.token)
    return r
  };

  const itemAdd = async (items, type) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemAdd(items, type);
    setGroup(prevGroup => ({ ...prevGroup, members: list }));
  };

  const itemRemove = async (item, items) => {
    const commonFunctions = new CommonFunctions();
    const list = await commonFunctions.itemRemove(item, items);
    setGroup(prevGroup => ({ ...prevGroup, members: list }));
  };

  const set = async (value, key, obj) => {
    const updatedGroups = [...groups];
    const updatedHosts = [...hosts];

    if (key === 'group') {
      let selectedGroup = updatedGroups.find(g => g.name === value);
      setGroup(selectedGroup);
      setGroupError(false);
      setIsGroupHostsFetched(false);
    }
    if (key === 'flag') {
      let updatedGroup = { ...group };
      let host = updatedGroup.members.find(h => h.name === obj.name);
      host.flagged = !host.flagged;
      setGroup(updatedGroup);
    }
    if (key === 'name') {
      let updatedGroup = { ...group };
      let member = updatedGroup.members.find(m => m.id === obj.id);
      delete member.nameError;
      member.name = value
      setGroup(updatedGroup);
      let ref = myRefs.current.name;
      if (ref?.input && ref.input.value === value) {
        ref.input.focus();
      }
    }
    if (key === 'ipv4-address') {
      let updatedGroup = { ...group };
      let member = updatedGroup.members.find(m => m.id === obj.id);
      delete member.ipError;
      member['ipv4-address'] = value
      setGroup(updatedGroup);
      let ref = myRefs.current['ipv4-address']
      if (ref?.input && ref.input.value === value) {
        ref.input.focus();
      }
    }
    if (key === 'str') {
      let updatedGroup = { ...group };
      let [name, ip] = value.split(' - ')
      console.log(name)
      console.log(ip) 

      let host = updatedHosts.find(h => h['ipv4-address'] === ip);
      let member = updatedGroup.members.find(m => m.id === obj.id);
      member = Object.assign(member, host);
      delete member.ipError;
      delete member.nameError;
      setGroup(updatedGroup);
    }
    if (key === 'change-request-id') {
      setChangeRequestId(value);
      setChangeRequestIdError(false);
    }
  };

  const validationCheck = async () => {
    const validators = new Validators();
    let valid = true;
    const updatedGroup = { ...group };

    if (!changeRequestId) {
      setChangeRequestIdError(true);
      valid = false;
    }

    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      setChangeRequestIdError(true);
      valid = false;
    }

    if (!group) {
      setGroupError(true);
      valid = false;
    }

    updatedGroup.members.forEach(member => {
      if (!member.name) {
        member.nameError = true;
        valid = false;
      }
      if (!validators.ipv4(member['ipv4-address'])) {
        member.ipError = true;
        valid = false;
      }
    });

    setGroup(updatedGroup);
    return valid;
  };

  const validation = async () => {
    const isValid = await validationCheck();
    if (isValid) {
      reqHandler();
    }
  };

  const reqHandler = async () => {
    const updatedGroup = { ...group };
    const toRemove = [];
    const toAdd = [];

    updatedGroup.members.forEach(member => {
      if (member.groupMember && !member.flagged) {
        toRemove.push(member.uid);
      }
      if (!member.groupMember) {
        toAdd.push({name: member.name, "ipv4-address": member["ipv4-address"]});
      }
    });

    try {
      if (toRemove.length > 0 || toAdd.length > 0) {
        if (toRemove.length > 0) {
          setLoading(true);
          const data = await del(toRemove);
          setLoading(false);
          if (data.status && data.status !== 200) {
            let error = Object.assign(data, {
              component: 'hostInGroup',
              vendor: 'checkpoint',
              errorType: 'deleteHostsError'
            })
            props.dispatch(err(error))
            return;
          }
        }
  
        if (toAdd.length > 0) {
          setLoading(true);
          const data = await add(toAdd);
          setLoading(false);
          if (data.status && data.status !== 200) {
            let error = Object.assign(data, {
              component: 'hostInGroup',
              vendor: 'checkpoint',
              errorType: 'addHostsError'
            })
            props.dispatch(err(error))
            return;
          }
        }
  
        await getGroupHosts();
      }
    } catch(e) {
      console.log(e)
    }
    
  };

  const del = async (list) => {
    const body = {
      data: {
        'host-list': list,
        'change-request-id': changeRequestId,
      },
    };
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
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/group-hosts/${group.uid}/`, props.token, body )
    return r
  };

  const add = async (list) => {
    const body = {
      data: {
        'host-list': list,
        'change-request-id': changeRequestId,
      },
    };
    let r
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/group-hosts/${group.uid}/`, props.token, body )
    return r
  };

  //Close and Error
  //const \[\s*\w+\s*,\s*
  /*
  const \[ corrisponde alla stringa const [.
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra [ e l'identificatore).
  \w+ corrisponde a uno o più caratteri alfanumerici (l'identificatore xyz).
  \s* corrisponde a zero o più spazi bianchi (per gestire gli spazi tra l'identificatore e ,).
  ,\s* corrisponde alla virgola seguita da zero o più spazi bianchi.
  */
  const closeModal = () => {
    setVisible(false);
    setChangeRequestId('');
    setGroups([]);
    setGroup(null);
    setIsGroupHostsFetched(false);
    setHosts([]);
    setLoading(false);
    setGhLoading(false);
    setGroupError('');
    setChangeRequestIdError('');
  };

  let renderError = () => {
    if (props.error && props.error.component === 'hostInGroup') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let columns = [
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps(
        'name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj)  => (
        <React.Fragment>
          {obj.groupMember ? 
            name
          :
            <Input
              value={obj.name}
              ref={ref => (myRefs.current['name'] = ref)}
              style=
              {obj.nameError ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => set(event.target.value, 'name', obj)}
            />
          }
        </React.Fragment>
      )
    },
    {
      title: 'IPv4-address',
      align: 'center',
      dataIndex: 'ipv4-address',
      key: 'ipv4-address',
      //...getColumnSearchProps('ipv4-address'),
      ...getColumnSearchProps(
        'ipv4-address', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
     render: (name, obj)  => (
      <React.Fragment>
          {obj.groupMember ? 
            name
          :
            <Input
              value={obj['ipv4-address']}
              ref={ref => (myRefs.current['ipv4-address'] = ref)}
              style=
              {obj.ipError ?
                {borderColor: 'red'}
              :
                {}
              }
              onChange={event => set(event.target.value, 'ipv4-address', obj)}
            />
          }
        </React.Fragment>
    )
    },
    /*{
      title: 'Existent Node',
      align: 'center',
      dataIndex: 'str',
      key: 'str',
      //...getColumnSearchProps('ipv4-address'),
      ...getColumnSearchProps(
        'str', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
     render: (name, obj)  => (
      <React.Fragment>
        {obj.groupMember ? 
          obj['str']
        :
          <Select
            value={obj['str']}
            showSearch
            style={obj.ipError ? {width: '80%', border: `1px solid red`} : {width: '80%'} }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={n => set(n, 'str', obj)}
          >
            <React.Fragment>
              {hosts.map((h, i) => {
                return (
                  <Select.Option key={i} value={h['str']}>{h['str']}</Select.Option>
                )
              })
              }
            </React.Fragment>
          </Select>
        }
      </React.Fragment>
    )
    },*/
    {
      title: 'Domain',
      align: 'center',
      dataIndex: ['domain', 'name'],
      key: 'domain',
      //...getColumnSearchProps(['domain', 'name']),
      ...getColumnSearchProps(
        ['domain', 'name'], 
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
      title: 'Group member',
      align: 'center',
      dataIndex: 'groupMember',
      key: 'groupMember',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.groupMember ? 
            <Checkbox checked={obj.flagged} onChange={e => set(e, 'flag', obj)}/>
          :
            <Button
              type="primary"
              danger
              onClick={() => itemRemove(obj, group.members)}
            >
              -
            </Button>
          }
        </React.Fragment>
      ),
    },
  ]

  const returnColumns = () => columns;

  return (
    <Space direction="vertical">
      <Card 
        props={{
          width: 200, 
          title: 'Node in Group', 
          details: 'Node in Group',
          color: '#e8b21e',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{ textAlign: 'center' }}>Node in Group</p>}
        centered
        destroyOnClose
        open={visible}
        footer={null}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor="checkpoint" domain={props.domain} />
        <Divider />

        {((props.asset && props.asset.id) && props.domain ) ? (
            <React.Fragment>
              {loading && <Spin indicator={spinIcon} style={{ margin: 'auto 50%' }} />}
              {!loading && (
                <React.Fragment>
                  <Row>
                    <Col offset={6} span={3}>Change request id</Col>
                    <Col span={6}>
                      <Input
                        defaultValue={changeRequestId}
                        placeholder="Format: ITIO-<number> (where number is min 6 digits and max 18 digits)"
                        style={changeRequestIdError ? { borderColor: 'red' } : null}
                        onBlur={e => set(e.target.value, 'change-request-id')}
                      />
                    </Col>
                  </Row>

                  <br />

                  <Row>
                    <Col offset={6} span={3}>Group</Col>
                    <Col span={6}>
                      <Select
                        value={group ? group.name : ''}
                        showSearch
                        style={groupError ? { width: '100%', border: '1px solid red' } : { width: '100%' }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        filterSort={(optionA, optionB) =>
                          optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                        }
                        onSelect={g => set(g, 'group')}
                      >
                        {groups.map((g, i) => (
                          <Select.Option key={i} value={g.name}>{g.name}</Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>

                  <br />

                  {group && (
                    <Row>
                      <Col span={24}>
                        {ghLoading ? (
                          <Spin indicator={spinIcon} style={{ margin: 'auto 50%' }} />
                        ) : (
                          <React.Fragment>
                            <Radio.Group>
                              <Radio.Button style={{ marginLeft: 10 }} onClick={getGroupHosts}>
                                <ReloadOutlined />
                              </Radio.Button>
                            </Radio.Group>

                            <Radio.Group buttonStyle="solid">
                              <Radio.Button
                                buttonStyle="solid"
                                style={{ marginLeft: 10 }}
                                onClick={() => itemAdd(group.members)}
                              >
                                +
                              </Radio.Button>
                            </Radio.Group>

                            <br />
                            <br />
                            <Table
                              columns={returnColumns()}
                              style={{ width: '100%', padding: 15 }}
                              dataSource={group.members}
                              bordered
                              rowKey={r => r.id}
                              scroll={{ x: 'auto' }}
                              pagination={{
                                pageSize: pageSize,
                                showSizeChanger: true,
                                pageSizeOptions: ['5', '10', '20', '50'], 
                                onShowSizeChange: (current, size) => setPageSize(size), 
                              }}
                            />
                          </React.Fragment>
                        )}
                      </Col>
                    </Row>
                  )}

                  <br />

                  <Row>
                    <Col offset={11} span={2}>
                      {loading || ghLoading || !group || !changeRequestId ? (
                        <Button type="primary" shape="round" disabled>
                          Modify Group
                        </Button>
                      ) : (
                        <Button type="primary" shape="round" onClick={validation}>
                          Modify Group
                        </Button>
                      )}
                    </Col>
                  </Row>
                </React.Fragment>
              )}
            </React.Fragment>
            ) 
          : (
            <Alert message="Asset and Domain not set" type="error" />
          )}
      </Modal>

        {renderError()}
    </Space>
  );
};


export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
}))(HostInGroup);