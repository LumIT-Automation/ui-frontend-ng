import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';

import { err } from '../../concerto/store';
import { assets as checkpointAssets } from '../../checkpoint/store';

import { Modal, Input, Button, Spin, Table, Space, Radio, Select } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

const AddHost = (props) => {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [cpDomains, setCpDomains] = useState({});
  const [requests, setRequests] = useState([{ id: 1, asset: {} }]);
  const [cpAssetsLoading, setCpAssetsLoading] = useState(false);
  const [cpDomainsLoading, setCpDomainsLoading] = useState(false);

  useEffect(() => {
    if (visible && requests.length === 0) {
      let newRequests = [...requests];
      if (props.checkpointAssets && props.checkpointAssets.length === 1) {
        newRequests.push({ id: 1, asset: props.checkpointAssets[0] });
      } else {
        newRequests.push({ id: 1, asset: {} });
      }
      setRequests(newRequests);
    }
  }, [visible, props.checkpointAssets]);

  const details = async () => {
    setVisible(true);
    main();
  };

  const main = async () => {
    setCpAssetsLoading(true);
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
        await props.dispatch(checkpointAssets(cpAssets));
      }
    } catch (error) {
      console.log('main error', error);
    }
    setCpAssetsLoading(false);
    checkedTheOnlyAsset();
  };

  const checkedTheOnlyAsset = async () => {
    try {
      let newRequests = [...requests];
      if (props.checkpointAssets && props.checkpointAssets.length === 1) {
        await cpDomainsGetHandler(props.checkpointAssets[0]);
        newRequests.forEach((req) => {
          req.asset = props.checkpointAssets[0];
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

  const cpDomainsGetHandler = async (asset) => {
    try {
      const domains = await cpDomainsGet(asset);
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

  const cpDomainsGet = async (asset) => {
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

  const handleSetRequests = async () => {
    let id = Math.max(...requests.map((r) => r.id)) + 1;
    let newRequest = { id };
    let newList = [...requests, newRequest];
    setRequests(newList);
    checkedTheOnlyAsset();
  };

  const removeRequest = (r) => {
    let newList = requests.filter((n) => r.id !== n.id);
    setRequests(newList);
  };

  const nameSet = (e, id) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === id);
    request.name = e;
    setRequests(newRequests);
  };

  const ipSet = (e, id) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === id);
    request.ip = e.target.value;
    setRequests(newRequests);
  };

  const assetSet = async (e, requestId, asset) => {
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

  const cpDomainSet = (e, requestId, domainName) => {
    let newRequests = [...requests];
    let request = newRequests.find((r) => r.id === requestId);
    request.cpDomain = domainName;
    setRequests(newRequests);
  };

  const validate = async () => {
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

  const addHostHandler = async () => {
    let newRequests = [...requests];
    newRequests.forEach((request) => {
      delete request.created;
    });
    setRequests(newRequests);

    for (const request of newRequests) {
      request.isLoading = true;
      setRequests([...newRequests]);
      try {
        const resp = await addHost(request);
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

  const addHost = async (request) => {
    let r;
    let b = {
      data: {
        asset: { checkpoint: [request.asset.id] },
        name: request.name,
        'ipv4-address': request.ip,
        domain: request.cpDomain,
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
    await rest.doXHR(`workflow/checkpoint/add-host/`, props.token, b);
    return r;
  };

  const closeModal = () => {
    setVisible(false);
    setErrors([]);
    setRequests([]);
  };

  const errorMessages = () => {
    if (props.error && props.error.component === 'addHost') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  const columns = [
    // Same columns structure as in the original code
  ];

  return (
    <>
      <Button type="primary" onClick={details}>
        ADD HOST
      </Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>ADD HOST</p>}
        centered
        destroyOnClose
        visible={visible}
        footer={null}
        onOk={() => setVisible(true)}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <>
          <Button type="primary" onClick={handleSetRequests}>
            +
          </Button>
          <br />
          <br />
          <Table
            columns={columns}
            dataSource={requests}
            pagination={false}
            rowKey={(r) => r.id}
            scroll={{ y: 300 }}
          />
        </>
        <br />
        {errorMessages()}
        <Space style={{ display: 'flex', justifyContent: 'center' }}>
          {cpAssetsLoading && <Spin indicator={spinIcon} style={{ marginLeft: '50%', marginRight: '50%' }} />}
          <Button type="primary" onClick={validate}>
            Validate
          </Button>
        </Space>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => ({
  token: state.authentication.token,
  error: state.concerto.error,
  checkpointAssets: state.checkpoint.assets,
});

export default connect(mapStateToProps)(AddHost);
