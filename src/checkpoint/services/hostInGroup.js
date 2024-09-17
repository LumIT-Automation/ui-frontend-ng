import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Validators from '../../_helpers/validators'
import Error from '../../concerto/error'
import CommonFunctions from '../../_helpers/commonFunctions'

import {
  err
} from '../../concerto/store'

import AssetSelector from '../../concerto/assetSelector'

import { Input, Button, Space, Modal, Spin, Radio, Result, Alert, Row, Col, Select, Divider, Table, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words'
import { LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

function HostInGroup(props) {
  const [visible, setVisible] = useState(false);
  const [changeRequestId, setChangeRequestId] = useState('ITIO-');
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [isGroupHostsFetched, setIsGroupHostsFetched] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [groupError, setGroupError] = useState('');
  const [changeRequestIdError, setChangeRequestIdError] = useState('');
  const searchInput = useRef(null);

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

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
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
        if (typeof dataIndex === 'string') {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        } else if (Array.isArray(dataIndex)) {
          return record[dataIndex[0]][dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase());
        }
      } catch (error) {}
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />
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
    setHosts(data.data.items);
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
    if (key === 'hostname') {
      let updatedGroup = { ...group };
      let host = updatedHosts.find(h => h.name === value);
      let member = updatedGroup.members.find(m => m.id === obj.id);
      member = Object.assign(member, host);
      delete member.nameError;
      delete member.ipError;
      setGroup(updatedGroup);
    }
    if (key === 'ipv4-address') {
      let updatedGroup = { ...group };
      let host = updatedHosts.find(h => h['ipv4-address'] === value);
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

    if (changeRequestId.length < 11) {
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
        toAdd.push(member.uid);
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


  const closeModal = () => {
    setVisible(false);
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
      ...getColumnSearchProps('name'),
      render: (name, obj)  => (
        <React.Fragment>
          {obj.groupMember ? 
            name
          :
            <Select
              value={obj.name}
              showSearch
              style={obj.nameError ? {width: '80%', border: `1px solid red`} : {width: '80%'} }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
              }
              onSelect={n => set(n, 'hostname', obj)}
            >
              <React.Fragment>
                {hosts.map((h, i) => {
                  return (
                    <Select.Option key={i} value={h.name}>{h.name}</Select.Option>
                  )
                })
                }
              </React.Fragment>
            </Select>
          }
        </React.Fragment>
      )
    },
    {
      title: 'IPv4-address',
      align: 'center',
      dataIndex: 'ipv4-address',
      key: 'ipv4-address',
     ...getColumnSearchProps('ipv4-address'),
     render: (name, obj)  => (
      <React.Fragment>
        {obj.groupMember ? 
          obj['ipv4-address']
        :
          <Select
            value={obj['ipv4-address']}
            showSearch
            style={obj.ipError ? {width: '80%', border: `1px solid red`} : {width: '80%'} }
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
              optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
            }
            onSelect={n => set(n, 'ipv4-address', obj)}
          >
            <React.Fragment>
              {hosts.map((h, i) => {
                return (
                  <Select.Option key={i} value={h['ipv4-address']}>{h['ipv4-address']}</Select.Option>
                )
              })
              }
            </React.Fragment>
          </Select>
        }
      </React.Fragment>
    )
    },
    {
      title: 'Domain',
      align: 'center',
      dataIndex: ['domain', 'name'],
      key: 'domain',
      ...getColumnSearchProps(['domain', 'name']),
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
              type='danger'
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
      <Button type="primary" onClick={() => setVisible(true)}>
        Host in Group
      </Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>Host in Group</p>}
        centered
        destroyOnClose
        visible={visible}
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
                        placeholder="ITIO-6 to 18 numbers"
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
                              pagination={{ pageSize: 10 }}
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