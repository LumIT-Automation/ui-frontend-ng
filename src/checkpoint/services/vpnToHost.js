import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';
import JsonToCsv from '../../_helpers/jsonToCsv'

import { err } from '../../concerto/store';
import Card from '../../_components/card'

import AssetSelector from '../../concerto/assetSelector';

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

function VpnToHost(props) {
  let [visible, setVisible] = useState(false);
  let [domain, setDomain] = useState('SHARED-SERVICES');
  let [expandedKeys, setExpandedKeys] = useState([]);
  let [errors, setErrors] = useState({});
  let [vpnToHosts, setVpnToHosts] = useState([]);
  let [loading, setLoading] = useState(false);
  let [ipv4Address, setIpv4Address] = useState('');
  
  let [base64, setBase64] = useState('');
  let [csvBase64, setCsvBase64] = useState('');
  let [jsonBeauty, setJsonBeauty] = useState('')
  let [csvError, setCsvError] = useState(null);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let [pageSize, setPageSize] = useState(10);

  let onTableRowExpand = (expanded, record) => {
    let keys = [...expandedKeys];
    if (expanded) {
      keys.push(record.uid);
    } else {
      keys = keys.filter(k => k !== record.uid);
    }
    setExpandedKeys(keys);
  };

  useEffect(() => {
    // Resetta gli stati all'inizio di ogni esecuzione di useEffect
    setCsvBase64('');
    setCsvError(null)

    // Controlla se jsonBeauty è una stringa JSON non vuota
    // La logica di generazione del CSV ora dipende solo da jsonBeauty
    if (typeof jsonBeauty === 'string' && jsonBeauty.length > 0) {
      let parsedData;
      try {
        // Tenta di parsare la stringa JSON dal backend in un oggetto JavaScript
        parsedData = JSON.parse(jsonBeauty);

        // Assicurati che il dato parsato sia un oggetto o un array valido e non vuoto per la conversione
        if (typeof parsedData !== 'object' || parsedData === null ||
            (Array.isArray(parsedData) && parsedData.length === 0 && !Object.keys(parsedData).length) ||
            (!Array.isArray(parsedData) && Object.keys(parsedData).length === 0)) {

          setCsvError("No data.");
          return; // Esci se i dati parsati non sono validi o sono vuoti
        }

        const converter = new JsonToCsv();
        // Converte l'oggetto JavaScript in una stringa CSV
        const generatedCsv = converter.convertToCsv(parsedData);

        // Codifica la stringa CSV generata in Base64
        const encodedCsv = btoa(unescape(encodeURIComponent(generatedCsv)));
        setCsvBase64(encodedCsv); // Imposta lo stato con la stringa CSV Base64

      } catch (e) {
        // Gestione degli errori durante il parsing JSON o la conversione CSV
        console.error("Error processing JSON string or converting to CSV:", e);
        setCsvError(`Error: ${e.message}`);
        setCsvBase64(''); // In caso di errore, resetta lo stato Base64
      }
    }
    else {
      // Se jsonBeauty non è una stringa valida o è vuota, resetta tutto
      setCsvError("Invalid JSON.");
    }
  }, [jsonBeauty]);

  let setKey = (e, kName) => {
    if (kName === 'ipv4-address') {
      setIpv4Address(e.target.value);
    }
  };

  let validationCheck = async () => {
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

  let validation = async () => {
    await validationCheck();
    if (Object.keys(errors).length === 0) {
      vpnToHost();
    }
  };

  let vpnToHost = async () => {
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
        setJsonBeauty(beauty)
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
    setIpv4Address(null);
    setVpnToHosts([]);
    setErrors({});
  };

  let errorsRender = () => {
    if (props.error && props.error.component === 'vpnToHost') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  let expandedRowRender = (record) => {
    let columns = [
      {
        title: 'Port',
        align: 'center',
        dataIndex: 'port',
        key: 'port',
        ...getColumnSearchProps(
          'ip', 
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
        title: 'Type',
        align: 'center',
        dataIndex: 'type',
        key: 'type',
        ...getColumnSearchProps(
          'type', 
          searchInput, 
          (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
          (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
          searchText, 
          searchedColumn, 
          setSearchText, 
          setSearchedColumn
        ),
      }
    ];

    return <Table columns={columns} dataSource={record.services} pagination={false} />;
  };

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
    }
  ];

  return (
    <React.Fragment>

      <Card 
        props={{
          width: 200, 
          title: 'Get VPN Profiles', 
          details: 'Get VPN Profiles.',
          color: '#1677FF',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{ textAlign: 'center' }}>Get VPN Profiles</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={closeModal}
        width={1500}
        maskClosable={false}
      >
        <AssetSelector vendor='checkpoint' noDomain={true} />
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
                  {csvError ? 
                    <p style={{ color: 'red' }}>{csvError}</p>
                  :
                    <>
                      <a download='Get VPN Profiles.csv' href={`data:text/csv;charset=utf-8;base64,${csvBase64}`}>Download CSV</a>
                      <br/>
                      <a download='Get VPN Profiles.json' href={`data:application/octet-stream;charset=utf-8;base64,${base64}`}>Download JSON</a>
                      <br/>
                      <br/>
                    </>
                  }
                  
                  <Table
                    columns={columns}
                    dataSource={vpnToHosts}
                    bordered
                    scroll={{ x: 'auto' }}
                    pagination={{
                      pageSize: pageSize,
                      showSizeChanger: true,
                      pageSizeOptions: ['5', '10', '20', '50'], 
                      onShowSizeChange: (current, size) => setPageSize(size), 
                    }}
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

