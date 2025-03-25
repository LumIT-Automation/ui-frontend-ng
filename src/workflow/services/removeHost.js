import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import CommonFunctions from '../../_helpers/commonFunctions'
import { err } from '../../concerto/store';
import Card from '../../_components/card'

import { Modal, Input, Button, Spin, Table, Space, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function RemoveHost(props) {
  let [visible, setVisible] = useState(false);
  let [assets, setAssets] = useState([]);
  let [errors, setErrors] = useState({});
  let [request, setRequest] = useState({});
  let [requests, setRequests] = useState([{ id: 1, assets: [] }]);
  let [loading, setLoading] = useState(false);
  let [itemAdded, setItemAdded] = useState(false)
  let [itemRemoved, setItemRemoved] = useState(false)

  useEffect(() => {
    if (visible) {
      getCpAssets()
    }
  }, [visible]);

  useEffect(() => {
    if (assets && assets.length > 0) {
      checkedTheOnlyAsset();
    }
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
        let newRequests = [];
        if (assets && assets.length === 1) {
          newRequests.push({ id: 1, assets: [assets[0].id] });
        } else {
          newRequests.push({ id: 1, assets: [] });
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
          component: 'removeHost',
          vendor: 'workflow',
          errorType: 'checkpointAssetsError',
        });
        props.dispatch(err(error));
        return;
      } else {
        setAssets(cpAssets.data.items);
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
      let newRequests = JSON.parse(JSON.stringify(requests));
      if (assets && assets.length === 1) {
        newRequests.forEach((req) => {
          req.assets = [assets[0].id];
        });
      } else {
        newRequests.forEach((req) => {
          if (!req.assets) {
            req.assets = [];
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

  let ipSet = (e, id) => {
    let newRequests = JSON.parse(JSON.stringify(requests));
    let request = newRequests.find((r) => r.id === id);
    request.ip = e.target.value;
    setRequests(newRequests);
  };

  let assetsSet = (e, requestId, asset) => {
    let newRequests = JSON.parse(JSON.stringify(requests));
    let request = newRequests.find((r) => r.id === requestId);

    if (!e) {
      let index = request.assets.indexOf(asset.id);
      if (index !== -1) {
        request.assets.splice(index, 1);
      }
    } else {
      if (!request.assets.includes(asset.id)) {
        request.assets.push(asset.id);
      }
    }
    setRequests(newRequests);
  };

  let validate = async () => {
    let newRequests = JSON.parse(JSON.stringify(requests));
    let validators = new Validators();
    let error = false;

    newRequests.forEach((request) => {
      if (!validators.ipv4(request.ip)) {
        request.ipError = 'Please input a valid ip';
        error = true;
      } else {
        delete request.ipError;
      }

      if (request.assets.length < 1) {
        request.assetsError = 'Please check asset(s)';
        error = true;
      } else {
        delete request.assetsError;
      }
    });

    setRequests(newRequests);

    if (!error) {
      await removeHostHandler();
    }
  };

  let removeHostHandler = async () => {
    let newRequests = JSON.parse(JSON.stringify(requests));

    for (let request of newRequests) {
      delete request.isReleased
      request.isLoading = true;
      setRequests([...newRequests]);

      try {
        let resp = await removeHost(request);
        request.isLoading = false;
        if (resp.status === 200) {
          request.isReleased = 'REMOVED';
        }
        else if (resp.status === 404) {
          request.isReleased = `${resp.status} NOT FOUND`
          setRequests([...newRequests]);
        }
        else if (resp.status === 412) {
          request.isReleased = `${resp.status} ${resp.message}: IS A GATEWAY`
          setRequests([...newRequests]);
        }
        else {
          request.isReleased = `${resp.status} ${resp.message}`
          let error = Object.assign(resp, {
            component: 'addHost',
            vendor: 'workflow',
            errorType: 'hostRemoveError'
          })
          props.dispatch(err(error))
          setRequests([...newRequests]);
        }
      } catch (error) {
        delete request.isLoading
        delete request.isReleased
        console.log(error);
      }
    }

    setRequests([...newRequests]);
  };

  let removeHost = async (request) => {
    let r;

    let b = {
      "data": {
        "checkpoint_remove_host": {
          "asset": `${request.assets}`,
          "data": {
            "ipv4-address": `${request.ip}`
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
    await rest.doXHR('workflow/checkpoint-remove-host/', props.token, b);
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
    setRequest({});
    setRequests([{ id: 1, asset: {} }]);
    setLoading(false);
    setItemAdded(false)
    setItemRemoved(false)
  };

  let errorComponent = () => {
    if (props.error && props.error.component === 'removeHost') {
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
      render: (name, obj) => (
        <Space size="small">{obj.isLoading ? <Spin indicator={spinIcon} /> : null}</Space>
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      width: 50,
      key: 'status',
      render: (name, obj) => <Space size="small">{obj.isReleased}</Space>,
    },
    {
      title: 'id',
      align: 'center',
      dataIndex: 'id',
      width: 50,
      key: 'id',
    },
    {
      title: 'IP',
      align: 'center',
      dataIndex: 'ip',
      width: 150,
      key: 'ip',
      render: (name, obj) => (
        <>
          <Input defaultValue={obj.ip} onChange={(e) => ipSet(e, obj.id)} />
          {obj.ipError && <p style={{ color: 'red' }}>{obj.ipError}</p>}
        </>
      ),
    },
    {
      title: 'ASSETS',
      align: 'center',
      dataIndex: 'assets',
      width: 150,
      key: 'assets',
      render: (name, obj) => (
        <>
          {loading ? (
            <Spin indicator={spinIcon} />
          ) : (
            <>
              {assets &&
                assets.map((n, i) => (
                  <Checkbox
                    key={i}
                    checked={obj && obj.assets && obj.assets.includes(n.id)}
                    onChange={(e) => assetsSet(e.target.checked, obj.id, n)}
                  >
                    {n.fqdn}
                  </Checkbox>
                ))}
              {obj.assetsError && <p style={{ color: 'red' }}>{obj.assetsError}</p>}
            </>
          )}
        </>
      ),
    },
    {
      title: 'Remove request',
      align: 'center',
      dataIndex: 'remove',
      width: 50,
      key: 'remove',
      render: (name, obj) => (
        <Button 
          type="danger" 
          onClick={() => itemRemove(obj, requests)}
        >
          -
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>

      <Card 
        props={{
          width: 200, 
          title: 'Remove host', 
          details: 'Remove host from firewall (no for gateway).',
          color: '#DC3E2F',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{textAlign: 'center'}}>REMOVE HOST</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >

        <React.Fragment>
          <Button type="primary" onClick={() => itemAdd(requests, 'workflowRemoveHost')}>
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
            Remove Host
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
}))(RemoveHost);
