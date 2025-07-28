import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import 'antd/dist/reset.css';

import Rest from '../../_helpers/Rest';
import Error from '../../concerto/error';
import { err } from '../../concerto/store';
import JsonToCsv from '../../_helpers/jsonToCsv'

import Card from '../../_components/card'
import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

import AssetSelector from '../../concerto/assetSelector';

import { Modal, Input, Button, Spin, Divider, Table, Alert, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

function VpnToServices(props) {
  let [visible, setVisible] = useState(false);
  let [expandedKeys, setExpandedKeys] = useState([]);
  let [domain] = useState('SHARED-SERVICES');
  let [errors, setErrors] = useState({});
  let [vpnToServices, setVpnToServices] = useState([]);
  let [name, setName] = useState(null);

  let [base64, setBase64] = useState(null);
  let [csvBase64, setCsvBase64] = useState('');
  let [jsonBeauty, setJsonBeauty] = useState('')
  let [csvError, setCsvError] = useState(null);

  let [nameloading, setNameloading] = useState(false);

  let [pageSize, setPageSize] = useState(10);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let onTableRowExpand = (expanded, record) => {
    let keys = [...expandedKeys];
    if (expanded) {
      keys.push(record.uid);
    } else {
      keys = keys.filter(k => k !== record.uid)
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

        let newArray = parsedData.map(obj => {
          // Destruttura l'oggetto, escludendo 'uid'
          const { uid, ...restOfObject } = obj;

          // Mappa i servizi per rimuovere la chiave 'protocol'
          const newServices = restOfObject.services.map(service => {
            const { protocol, ...restOfService } = service;
            return restOfService;
          });

          // Restituisci il nuovo oggetto senza 'uid' e con i servizi modificati
          return { ...restOfObject, services: newServices };
        });

        // Assicurati che il dato parsato sia un oggetto o un array valido e non vuoto per la conversione
        if (typeof newArray !== 'object' || newArray === null ||
            (Array.isArray(newArray) && newArray.length === 0 && !Object.keys(newArray).length) ||
            (!Array.isArray(newArray) && Object.keys(newArray).length === 0)) {

          setCsvError("No data.");
          return; // Esci se i dati parsati non sono validi o sono vuoti
        }

        const converter = new JsonToCsv();
        // Converte l'oggetto JavaScript in una stringa CSV
        const generatedCsv = converter.convertToCsv(newArray);

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
    if (kName === 'name') {
      setName(e.target.value);
    }
  };

  let validationCheck = async () => {
    let currentErrors = { ...errors };
    if (!name) {
      currentErrors.nameError = true;
      setErrors(currentErrors);
    } else {
      delete currentErrors.nameError;
      setErrors(currentErrors);
    }
    return currentErrors;
  };

  let validation = async () => {
    await validationCheck();
    if (Object.keys(errors).length === 0) {
      vpnToService();
    }
  };

  let vpnToService = async () => {
    setNameloading(true);
    let b = { data: { name } };

    let rest = new Rest(
      'PUT',
      (resp) => {
        let beauty = JSON.stringify(resp.data.items, null, 2);
        let base64Data = btoa(beauty);

        let list = resp.data.items.map((item) => {
          let list2 = item.ipv4s.map(ip => ({ ip }));
          return { ...item, ipv4s: list2 };
        });
        setVpnToServices(list);
        setBase64(base64Data);
        setJsonBeauty(beauty)
      },
      (error) => {
        error = { 
          ...error, 
          component: 'vpnToService', 
          vendor: 'checkpoint', 
          errorType: 'vpnToServiceError' 
        };
        props.dispatch(err(error));
      }
    );
    await rest.doXHR(`checkpoint/${props.asset.id}/${domain}/vpn-to-services/`, props.token, b);
    setNameloading(false);
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
    setName(null);
    setVpnToServices([]);
    setErrors({});
  };

  let errorsComponent = () => {
    if (props.error && props.error.component === 'vpnToService') {
      return <Error error={[props.error]} visible={true} />;
    }
    return null;
  };

  let ipValueColumns = [
    {
      title: 'ipValue',
      align: 'center',
      dataIndex: 'ip',
      key: 'ip',
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
    }
  ];

  let expandedRowRender = (params) => {
    let columns = [
      {
        title: 'Port',
        align: 'center',
        dataIndex: 'port',
        key: 'port',
        ...getColumnSearchProps(
          'port', 
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
    return <Table columns={columns} dataSource={params.services} pagination={false} />;
  };

  let columns = [
    {
      title: 'Name',
      align: 'center',
      width: 300,
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
    },
    {
      title: 'Type',
      align: 'center',
      width: 300,
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
    },
    {
      title: 'IP',
      align: 'center',
      width: 300,
      dataIndex: '',
      key: 'ipv4s',
      render: (name, obj) => (
        <Table
          columns={ipValueColumns}
          dataSource={obj.ipv4s}
          bordered
          scroll={{ x: 'auto' }}
          style={{ marginLeft: -25 }}
          pagination={{
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'], 
            onShowSizeChange: (current, size) => setPageSize(size), 
          }}
          rowKey={(record) => record.uid}
        />
      ),
    }
  ];

  return (
    <React.Fragment>

      <Card 
        props={{
          width: 200, 
          title: 'VPN Flows by Profile', 
          details: 'VPN Flows by Profile',
          color: '#1677FF',
          onClick: function () { setVisible(true) } 
        }}
      />

        <Modal
          title={<p style={{textAlign: 'center'}}>VPN Flows by Profile</p>}
          centered
          destroyOnClose={true}
          open={visible}
          footer={''}
          onOk={() => setVisible(true)}
          onCancel={() => closeModal()}
          width={1500}
          maskClosable={false}
        >

          <AssetSelector vendor='checkpoint' noDomain={true}/>
          <Divider/>

          { (( props.asset && props.asset.id ) && domain) ?
            <React.Fragment>

              <React.Fragment>

                <Row>
                  <Col offset={2} span={6}>
                    <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Group Name:</p>
                  </Col>
                  <Col span={8}>

                    <Input
                      defaultValue={name}
                      style={errors.nameError ? {borderColor: 'red'} : null}
                      onChange={e => setKey(e, 'name')}
                      onPressEnter={() => validation()}
                    />

                  </Col>
                </Row>
                <Row>
                  <Col offset={8} span={16}>
                    <Button
                      type="primary"
                      disabled={name ? false : true}
                      onClick={() => validation()}
                    >
                      VPN Flows by Profile
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>

              <Divider/>

            { nameloading ?
              <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/>
            :
              <React.Fragment>
                { vpnToServices.length < 1 ?
                  null
                :
                  <React.Fragment>
                    <div style={{float: 'right'}}>
                      {csvError ? 
                        <p style={{ color: 'red' }}>{csvError}</p>
                      :
                        <>
                          <a download={`VPN Flows by Profile - ${name}.csv`} href={`data:text/csv;charset=utf-8;base64,${csvBase64}`}>Download CSV</a>
                          <br/>
                          <a download={`VPN Flows by Profile - ${name}.json`} href={`data:application/octet-stream;charset=utf-8;base64,${base64}`}>Download JSON</a>
                          <br/>
                          <br/>
                        </>
                      }
                    </div>
                    <Table
                      columns={columns}
                      dataSource={vpnToServices}
                      bordered
                      scroll={{x: 'auto'}}
                      pagination={{
                        pageSize: pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20', '50'], 
                        onShowSizeChange: (current, size) => setPageSize(size), 
                      }}
                      style={{marginBottom: 10}}
                      onExpand={onTableRowExpand}
                      expandedRowKeys={expandedKeys}
                      rowKey={record => record.uid}
                      expandedRowRender={ record => expandedRowRender(record)}
                    />
                  </React.Fragment>
                }
              </React.Fragment>
            }
            </React.Fragment>
            :
            <Alert message="Asset and Domain not set" type="error" />
          }

        </Modal>

        {errorsComponent()}

      </React.Fragment>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
}))(VpnToServices);
