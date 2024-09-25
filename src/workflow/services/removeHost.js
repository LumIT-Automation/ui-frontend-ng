import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';

import { err } from '../../concerto/store';
import { assets as checkpointAssets } from '../../checkpoint/store';

import { Modal, Input, Button, Spin, Table, Space, Checkbox } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

const RemoveHost = (props) => {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [request, setRequest] = useState({});
  const [requests, setRequests] = useState([{ id: 1, assets: [] }]);
  const [cpAssetsLoading, setCpAssetsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (requests.length === 0) {
        let newRequests = JSON.parse(JSON.stringify(requests));
        if (props.checkpointAssets && props.checkpointAssets.length === 1) {
          newRequests.push({ id: 1, assets: [props.checkpointAssets[0].id] });
        } else {
          newRequests.push({ id: 1, assets: [] });
        }
        setRequests(newRequests);
      }
    }
  }, [visible, requests, props.checkpointAssets]);

  const details = async () => {
    setVisible(true);
    await main();
  };

  const main = async () => {
    setCpAssetsLoading(true);
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
        await props.dispatch(checkpointAssets(cpAssets));
      }
    } catch (error) {
      console.log('main error', error);
    }
    setCpAssetsLoading(false);
    await checkedTheOnlyAsset();
  };

  const checkedTheOnlyAsset = async () => {
    try {
      let newRequests = JSON.parse(JSON.stringify(requests));
      if (props.checkpointAssets && props.checkpointAssets.length === 1) {
        let assets = [props.checkpointAssets[0].id];
        newRequests.forEach((req) => {
          req.assets = [props.checkpointAssets[0].id];
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

  const cpAssetsGet = async () => {
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

  const addRequest = async () => {
    let id = requests.reduce((maxId, r) => Math.max(r.id, maxId), 0) + 1;
    let newRequest = { id };
    let newRequests = [...requests, newRequest];
    setRequests(newRequests);
    await checkedTheOnlyAsset();
  };

  const removeRequest = (r) => {
    let newRequests = requests.filter((req) => req.id !== r.id);
    setRequests(newRequests);
  };

  const ipSet = (e, id) => {
    let newRequests = JSON.parse(JSON.stringify(requests));
    let request = newRequests.find((r) => r.id === id);
    request.ip = e.target.value;
    setRequests(newRequests);
  };

  const assetsSet = (e, requestId, asset) => {
    let newRequests = JSON.parse(JSON.stringify(requests));
    let request = newRequests.find((r) => r.id === requestId);

    if (!e) {
      const index = request.assets.indexOf(asset.id);
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

  const validate = async () => {
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

  const removeHostHandler = async () => {
    let newRequests = JSON.parse(JSON.stringify(requests));

    for (let request of newRequests) {
      request.isLoading = true;
      setRequests([...newRequests]);

      try {
        const resp = await removeHost(request);
        request.isLoading = false;
        if (resp.status === 200) {
          request.isReleased = 'REMOVED';
        } else {
          request.isReleased = `${resp.status} ${resp.message}`;
          let error = Object.assign(resp, {
            component: 'removeHost',
            vendor: 'workflow',
            errorType: 'hostRemoveError',
          });
          props.dispatch(err(error));
        }
      } catch (error) {
        console.log(error);
      }
    }

    setRequests([...newRequests]);
  };

  const removeHost = async (request) => {
    let r;
    let b = {
      data: {
        asset: {
          checkpoint: request.assets,
        },
        'ipv4-address': `${request.ip}`,
      },
    };

    let rest = new Rest(
      'PUT',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );
    await rest.doXHR('workflow/checkpoint/remove-host/', props.token, b);
    return r;
  };

  const closeModal = () => {
    setVisible(false);
    setErrors({});
    setRequest({});
    setRequests([]);
  };

  let errorComponent = () => {
    if (props.error && props.error.component === 'removeHost') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  const columns = [
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
          {cpAssetsLoading ? (
            <Spin indicator={spinIcon} />
          ) : (
            <>
              {props.checkpointAssets &&
                props.checkpointAssets.map((n, i) => (
                  <Checkbox
                    key={i}
                    checked={obj.assets.includes(n.id)}
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
        <Button type="danger" onClick={() => removeRequest(obj)}>
          -
        </Button>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={details}>
        REMOVE HOST
      </Button>

      <Modal
        title="Remove Hosts"
        centered
        visible={visible}
        onOk={validate}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <Button type="dashed" onClick={addRequest}>
          ADD REMOVE HOST REQUEST
        </Button>

        {requests && requests.length > 0 && <Table columns={columns} dataSource={requests} pagination={false} />}

        {errorComponent()}
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  token: state.authentication.token,
  error: state.concerto.error,
  checkpointAssets: state.checkpoint.assets,
});

export default connect(mapStateToProps)(RemoveHost);
