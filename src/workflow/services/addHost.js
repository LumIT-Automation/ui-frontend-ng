import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import CommonFunctions from '../../_helpers/commonFunctions'
import { err } from '../../concerto/store';

import { Modal, Input, Button, Spin, Table, Space, Radio, Select } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function AddHost(props) {
  let [visible, setVisible] = useState(false);
  let [assets, setAssets] = useState([]);
  let [errors, setErrors] = useState({});
  let [cpDomains, setCpDomains] = useState({});
  let [requests, setRequests] = useState([{ id: 1, asset: {} }]);
  let [loading, setLoading] = useState(false);
  let [cpDomainsLoading, setCpDomainsLoading] = useState(false);
  let [itemAdded, setItemAdded] = useState(false)
  let [itemRemoved, setItemRemoved] = useState(false)

  useEffect(() => {
    if (visible) {
      getCpAssets()
    }
  }, [visible]);

  useEffect(() => {
    checkedTheOnlyAsset();
  }, [assets]);

  useEffect(() => {
    if (itemAdded) {
      checkedTheOnlyAsset();
    }
    setItemAdded(false)
  }, [itemAdded]);

  useEffect(() => {
    if (itemRemoved) {
      if (requests.length < 1) {
        let newRequests = [...requests];
        if (assets && assets.length === 1) {
          newRequests.push({ id: 1, asset: assets[0] });
        } else {
          newRequests.push({ id: 1, asset: {} });
        }
        setRequests(newRequests);
      }
    }
    setItemRemoved(false)
  }, [itemRemoved]);

  let getCpAssets = async () => {
    setLoading(true);
    try {
      let cpAssets = await cpAssetsGet();
      if (cpAssets.status && cpAssets.status !== 200) {
        let error = Object.assign(cpAssets, {
          component: 'addHost',
          vendor: 'workflow',
          errorType: 'checkpointAssetsError',
        });
        props.dispatch(err(error));
        return;
      } else {
        setAssets(cpAssets.data.items)
      }
    } catch (error) {
      console.log('main error', error);
    }
    setLoading(false);
  };

  let itemAdd = async (items, type) => {
    let commonFunctions = new CommonFunctions();
    let list = await commonFunctions.itemAdd(items, type);
    setRequests(list);
    setItemAdded(true)
  };

  let itemRemove = async (item, items) => {
    let commonFunctions = new CommonFunctions();
    let list = await commonFunctions.itemRemove(item, items);
    setRequests(list);
    setItemRemoved(true)
  };

  let checkedTheOnlyAsset = async () => {
    
    try {
      let newRequests = [...requests];
      if (assets && assets.length === 1) {
        await cpDomainsGetHandler(assets[0]);
        newRequests.forEach((req) => {
          req.asset = assets[0];
        });
      } else {
        newRequests.forEach((req) => {
          if (!req.asset) {
            req.asset = {};
          }
        });
      }
      setRequests(newRequests);
    } catch (error) {
      console.log('checkedTheOnlyAsset error', error);
    }
  };

  let cpAssetsGet = async () => {
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
    await rest.doXHR('checkpoint/assets/', props.token);
    return r;
  };

  let cpDomainsGetHandler = async (asset) => {
    try {
      let domains = await cpDomainsGet(asset);
      if (!domains.status) {
        let doms = { ...cpDomains };
        doms[asset.id] = domains.data.items;
        setCpDomains(doms);
      } else {
        let error = Object.assign(domains, {
          component: 'addHost',
          vendor: 'workflow',
          errorType: 'checkpointDomainsError',
        });
        props.dispatch(err(error));
      }
    } catch (error) {
      console.log(error);
    }
  };

  let cpDomainsGet = async (asset) => {
    let r;
    setCpDomainsLoading(true);
    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(`checkpoint/${asset.id}/domains/`, props.token);
    setCpDomainsLoading(false);
    return r;
  };

  let nameSet = (e, id) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === id);
    request.name = e;
    setRequests(newRequests);
  };

  let ipSet = (e, id) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === id);
    request.ip = e.target.value;
    setRequests(newRequests);
  };

  let assetSet = async (e, requestId, asset) => {
    try {
      let newRequests = [...requests];
      let request = newRequests.find((r) => r.id === requestId);
      request.asset = asset;
      setRequests(newRequests);
      await cpDomainsGetHandler(asset);
    } catch (error) {
      console.log(error);
    }
  };

  let cpDomainSet = (e, requestId, domainName) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === requestId);
    request.cpDomain = domainName;
    setRequests(newRequests);
  };

  let validate = async () => {
    let newRequests = [...requests];
    let validators = new Validators();
    let error = false;

    newRequests.forEach((request) => {
      if (!request.name) {
        request.nameError = 'Please input a name';
        error = true;
      } else {
        delete request.nameError;
      }

      if (validators.ipv4(request.ip)) {
        delete request.ipError;
      } else {
        request.ipError = 'Please input a valid ip';
        error = true;
      }

      if (Object.keys(request.asset).length === 0 && request.asset.constructor === Object) {
        request.assetError = 'Please check asset(s)';
        error = true;
      } else {
        delete request.assetError;
      }

      if (!request.cpDomain) {
        request.cpDomainError = 'Please select a domain';
        error = true;
      } else {
        delete request.cpDomainError;
      }
    });

    setRequests(newRequests);

    if (!error) {
      addHostHandler();
    }
  };

  let addHostHandler = async () => {
    let newRequests = [...requests];
    newRequests.forEach((request) => {
      delete request.created;
    });
    setRequests(newRequests);

    for (let request of newRequests) {
      request.isLoading = true;
      setRequests([...newRequests]);
      try {
        let resp = await addHost(request);
        request.isLoading = false;
        if (!resp.status) {
          request.created = 'CREATED';
        } else {
          request.created = `${resp.status} ${resp.message}`;
          let error = Object.assign(resp, {
            component: 'addHost',
            vendor: 'workflow',
            errorType: 'hostAddError',
          });
          props.dispatch(err(error));
        }
      } catch (error) {
        request.isLoading = false;
        request.created = false;
        console.log(error);
      }
    }
    setRequests([...newRequests]);
  };

  let addHost = async (request) => {
    let r;
    let b = {
      "data": {
        "checkpoint_hosts_post": {
          "asset": request.asset.id,
          "data": {
            "name": request.name,
            "ipv4-address": request.ip
          },
          "urlParams": {
            "domain": request.cpDomain
          }
        }
      }
    }


    let rest = new Rest(
      'PUT',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR(`workflow/checkpoint-add-host/`, props.token, b);
    return r;
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
  let closeModal = () => {
    setVisible(false);
    setErrors({});
    setCpDomains({});
    setRequests([{ id: 1, asset: {} }]);
    setLoading(false);
    setCpDomainsLoading(false);
    setItemAdded(false)
    setItemRemoved(false)
  };

  let errorComponent = () => {
    if (props.error && props.error.component === 'addHost') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  let columns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      width: 50,
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.isLoading ? <Spin indicator={spinIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      width: 50,
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.created}
        </Space>
      ),
    },
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      width: 50,
      key: 'id',
      name: 'dable',
      description: '',
    },
    {
      title: 'Name',
      align: 'center',
      dataIndex: 'name',
      width: 200,
      key: 'name',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.nameError ?
            <React.Fragment>
              <Input
                placeholder={obj.name}
                onChange={e => nameSet(e.target.value, obj.id)}
              />
              <p style={{color: 'red'}}>{obj.nameError}</p>
              </React.Fragment>
          :
            <Input
              placeholder={obj.name}
              onChange={e => nameSet(e.target.value, obj.id)}
            />
          }
        </React.Fragment>
      )
    },
    {
      title: 'IP',
      align: 'center',
      dataIndex: 'ip',
      width: 150,
      key: 'ip',
      render: (name, obj)  => (
        <React.Fragment>
          {obj.ipError ?
            <React.Fragment>
              <Input
                id='ip'
                defaultValue={obj.ip}
                onChange={e => ipSet(e, obj.id)}
              />
              <p style={{color: 'red'}}>{obj.ipError}</p>
            </React.Fragment>
          :
            <Input
              id='ip'
              defaultValue={obj.ip}
              onChange={e => ipSet(e, obj.id)}
            />
          }
        </React.Fragment>
      ),
    },
    {
      title: 'ASSETS',
      align: 'center',
      dataIndex: 'assets',
      width: 150,
      key: 'assets',
      render: (name, obj)  => (
        <React.Fragment>
          { loading ?
            <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
          :
            <React.Fragment>
              {obj.assetError ?
                <React.Fragment>
                  {assets ?
                    <React.Fragment>
                      {assets.length === 1 ?
                        <Radio
                          onChange={e => assetSet(e.target.checked, obj.id, assets[0])}
                          checked
                        >
                          {assets[0].fqdn}
                        </Radio>
                      :
                        assets.map((n, i) => {
                          return (
                            <Radio
                              key={i}
                              onChange={e => assetSet(e.target.checked, obj.id, n)}
                              checked={obj && obj.asset && (obj.asset.id === n.id)}
                            >
                              {n.fqdn}
                            </Radio>
                          )
                        })
                      }
                    </React.Fragment>
                  :
                    <React.Fragment>
                      <p style={{color: 'red'}}>Assets Error</p>
                    </React.Fragment>
                  }
                  <p style={{color: 'red'}}>{obj.assetError}</p>
                </React.Fragment>
              :
              <React.Fragment>
                {assets ?
                  <React.Fragment>
                    {assets.length === 1 ?
                      <Radio
                        onChange={e => assetSet(e.target.checked, obj.id, assets[0])}
                        checked
                      >
                        {assets[0].fqdn}
                      </Radio>
                    :
                      assets.map((n, i) => {
                        return (
                          <Radio
                            key={i}
                            onChange={e => assetSet(e.target.checked, obj.id, n)}
                            checked={obj && obj.asset && (obj.asset.id === n.id)}
                          >
                            {n.fqdn}
                          </Radio>
                        )
                      })
                    }
                  </React.Fragment>
                :
                <React.Fragment>
                  <p style={{color: 'red'}}>Assets Error</p>
                </React.Fragment>
                }
              </React.Fragment>
              }
            </React.Fragment>
          }
        </React.Fragment>
      ),
    },
    {
      title: 'Domains',
      align: 'center',
      dataIndex: 'domains',
      width: 50,
      key: 'domains',
      render: (name, obj)  => (
        <React.Fragment>
        { cpDomainsLoading ?
          <Spin indicator={spinIcon} style={{margin: 'auto auto'}}/>
        :
          <React.Fragment>
            {cpDomains && obj.asset && obj.asset.id && cpDomains[obj.asset.id] ?
              <React.Fragment>
                {obj.cpDomainError ?
                  <React.Fragment>
                    <Select
                      key={obj.id}
                      style={{ width: '300px'}}
                      value={obj.cpDomain}
                      onChange={(value, event) => cpDomainSet(event, obj.id, value)}>
                      { cpDomains[obj.asset.id] ? cpDomains[obj.asset.id].map((d, i) => {
                        return (
                          <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                          )
                        })
                      :
                        null
                      }
                    </Select>
                    <p style={{color: 'red'}}>{obj.cpDomainError}</p>
                  </React.Fragment>
                :
                  <React.Fragment>
                    <Select
                      key={obj.id}
                      style={{ width: '300px'}}
                      value={obj.cpDomain}
                      onChange={(value, event) => cpDomainSet(event, obj.id, value)}>
                      { cpDomains[obj.asset.id] ? cpDomains[obj.asset.id].map((d, i) => {
                        return (
                          <Select.Option key={i} value={d.name}>{d.name}</Select.Option>
                          )
                        })
                      :
                        null
                      }
                    </Select>
                  </React.Fragment>
                }
              </React.Fragment>
            :
              <React.Fragment>
                {obj.cpDomainError ?
                  <React.Fragment>
                    <Select style={{ width: '300px'}} disabled/>
                    <p style={{color: 'red'}}>{obj.cpDomainError}</p>
                  </React.Fragment>
                :
                  <Select style={{ width: '300px'}} disabled/>
                }
              </React.Fragment>
            }
          </React.Fragment>
        }
        </React.Fragment>
      ),
    },
    {
      title: 'Remove request',
      align: 'center',
      dataIndex: 'remove',
      width: 50,
      key: 'remove',
      render: (name, obj)  => (
        <Button 
          type="danger" 
          onClick={() => itemRemove(obj, requests)}
        >
          -
        </Button>
      ),
    },
  ]

  return (
    <React.Fragment>

      <Button type="primary" onClick={() => setVisible(true)}>ADD HOST</Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>ADD HOST</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <React.Fragment>
          <Button type="primary" onClick={() => itemAdd(requests)}>
            +
          </Button>
          <br/>
          <br/>
          <Table
            columns={columns}
            dataSource={requests}
            bordered
            rowKey="id"
            scroll={{x: 'auto'}}
            pagination={false}
            style={{marginBottom: 10}}
          />
          <Button 
            type="primary" 
            style={{float: "right", marginRight: '20px'}} 
            onClick={() => validate()}
          >
            Add Host
          </Button>
          <br/>
        </React.Fragment>

      </Modal>

    {visible ?
      <React.Fragment>
        {errorComponent()}
      </React.Fragment>
    :
      null
    }

  </React.Fragment>

  )
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(AddHost);
