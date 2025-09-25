import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/reset.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import JsonToCsv from '../../_helpers/jsonToCsv'

import Card from '../../_components/card'
import { getColumnSearchProps, handleSearch, handleReset } from '../../_helpers/tableUtils';

import { err } from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

import { Input, Button, Space, Modal, Spin, Result, Alert, Row, Col, Select, Divider, Table} from 'antd';
import { LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function UrlInApplicationSite(props) {

  let [visible, setVisible] = useState(false);
  let [changeRequestId, setChangeRequestId] = useState('');
  let [applicationSites, setApplicationSites] = useState([]);
  let [applicationSite, setApplicationSite] = useState({});
  let [toRemove, setToRemove] = useState([]);
  let [errors, setErrors] = useState({});
  let [applicationSiteError, setApplicationSiteError] = useState('');
  let [urlInputList, setUrlInputList] = useState('');
  let [loading, setLoading] = useState(false);
  let [response, setResponse] = useState(null);

  let [base64, setBase64] = useState(null);
  let [csvBase64, setCsvBase64] = useState('');
  let [jsonBeauty, setJsonBeauty] = useState('')
  let [csvError, setCsvError] = useState(null);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let [pageSize, setPageSize] = useState(10);

  let myRefs = useRef({});
  let prevDomainRef = useRef();

  useEffect(() => {
    if (visible && props.asset && props.domain && (prevDomainRef.current !== props.domain)) {
      setApplicationSite('');
      dataGet();
    }
    prevDomainRef.current = props.domain;
  }, [visible, props.asset, props.domain]);


  useEffect(() => {
    // Resetta gli stati di errore e output all'inizio di ogni esecuzione per pulizia
    setJsonBeauty('');
    setBase64('');
    setCsvBase64('');
    setCsvError('');
    

    // Condizione di "guardia": se i dati base non sono pronti o non c'è una selezione valida, esci.
    if (!Array.isArray(applicationSites) || applicationSites.length === 0 || !applicationSite?.name) {
        setCsvError("No selected application"); 
        return; 
    }

    // --- LOGICA DI GENERAZIONE JSON ---
    const foundApplicationSite = applicationSites.find(o => o.name === applicationSite.name);
    
    let dataForConversion;

    // Modifica qui: estrai solo le stringhe 'url' dalla lista
    if (foundApplicationSite && Array.isArray(foundApplicationSite['url-list'])) {
        // Mappa l'array per ottenere solo le stringhe URL
        dataForConversion = foundApplicationSite['url-list'].map(item => item.url);
    } else {
        // Se 'url-list' non esiste o non è un array, usiamo un array vuoto.
        dataForConversion = [];
    }

    let beauty;
    let base64Data;
    try {
        beauty = JSON.stringify(dataForConversion, null, 2);
        base64Data = btoa(unescape(encodeURIComponent(beauty)));
        
        setBase64(base64Data);
        setJsonBeauty(beauty); 
    } catch (e) {
        setCsvError(`Error: ${e.message}`);
        return;
    }


    // --- LOGICA DI GENERAZIONE CSV ---
    let parsedData;
    try {
        // Parsifica il JSON appena generato, che ora sarà un array di stringhe URL
        parsedData = JSON.parse(beauty);

        // Ora parsedData dovrebbe essere un array di stringhe, potenzialmente vuoto.
        if (!Array.isArray(parsedData) || parsedData.length === 0) { 
            setCsvError("No url available.");
            return; 
        }

        let list = []
        parsedData.forEach(element => {
          let o = {url: element}
          list.push(o)
        });
        const converter = new JsonToCsv(); 
        const generatedCsv = converter.convertToCsv(list); 

        const encodedCsv = btoa(unescape(encodeURIComponent(generatedCsv)));
        setCsvBase64(encodedCsv); 

    } catch (e) {
        setCsvError(`Error: ${e.message}`);
    }

}, [applicationSite?.name, applicationSites, setJsonBeauty, setBase64, setCsvBase64, setCsvError]);

  let dataGet = async () => {
    setLoading(true);

    let data = await getData('custom-application-sites');
    if (data.status && data.status !== 200) {
      let errorData = Object.assign(data, {
        component: 'urlInApplicationSite',
        vendor: 'checkpoint',
        errorType: 'applicationSitesError'
      });
      props.dispatch(err(errorData));
      setLoading(false);
      return;
    } else {
      let list = data.data.items.map(a => {
        if (a['meta-info'] && a['meta-info']['creation-time'] && a['meta-info']['creation-time']['iso-8601']) {
          a['creation-time'] = a['meta-info']['creation-time']['iso-8601'];
          return a;
        } else {
          a['creation-time'] = '';
          return a;
        }
      });

      list = list.map(a => {
        let id = 1;
        if (a['url-list']) {
          a['url-list'] = a['url-list'].map(url => {
            let o = { id: id, url: url };
            id++;
            return o;
          });
        }
        return a;
      });

      setApplicationSites(list);
    }

    setLoading(false);
  };

  let getData = async (entity) => {
    let r;
    let endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/`;

    let rest = new Rest(
      "GET",
      resp => {
        r = resp;
      },
      error => {
        r = error;
      }
    );
    await rest.doXHR(endpoint, props.token);
    return r;
  };

  let set = async (value, key, obj) => {
    let errorsCopy = { ...errors };

    try {
      if (key === 'applicationSite') {
        let selectedApplicationSite = applicationSites.find(as => as.name === value);
        setApplicationSite(selectedApplicationSite);
        setUrlInputList('');
      }

      if (key === 'change-request-id') {
        delete errorsCopy['change-request-idError'];
        setChangeRequestId(value);
        setErrors(errorsCopy);
      }

      if (key === 'urlInputList') {
        setUrlInputList(value);
      }

      if (key === 'replaceUrl') {
        let applicationSiteCopy = { ...applicationSite };
        let urlObj = applicationSiteCopy['url-list'].find(url => url.id === obj.id);
        urlObj.url = value;
        delete urlObj.urlError;
        setApplicationSite(applicationSiteCopy);

        let ref = myRefs.current[`${obj.id}_url`];
        if (ref && ref.input) {
          ref.input.focus();
        }
      }

      if (key === 'removeUrl') {
        let applicationSiteCopy = { ...applicationSite };
        let urlObj = applicationSiteCopy['url-list'].find(url => url.id === obj.id);
        let toRemoveCopy = [...toRemove, urlObj];
        applicationSiteCopy['url-list'] = applicationSiteCopy['url-list'].filter(url => url.id !== obj.id);
        setApplicationSite(applicationSiteCopy);
        setToRemove(toRemoveCopy);
      }
    } catch (error) {
      console.error(error);
    }
  };

  let urlListSet = async () => {
    let input = urlInputList;
    let applicationSiteCopy = { ...applicationSite };
    let n = Math.max(...applicationSiteCopy['url-list'].map(o => o.id), 0);

    let list = [];
    let list2 = [];
    let id = n + 1;

    let regexp = new RegExp(/^[*]/g);

    try {
      input = input.replaceAll('https://', '');
      input = input.replaceAll('http://', '');
      /*
        /[\/\\]/: È un'espressione regolare che cerca i caratteri / e \.
        [\/\\]: Definisce una classe di caratteri che include la barra normale (/) e la barra rovesciata (\). Nota che per la barra rovesciata (\) è necessario un doppio backslash (\\) perché il backslash è un carattere di escape nelle espressioni regolari.
        g: È un flag globale che indica che la sostituzione deve avvenire su tutte le occorrenze del pattern nella stringa, non solo sulla prima.
        '': È la stringa di sostituzione, che in questo caso è vuota, quindi i caratteri / e \ vengono rimossi dalla stringa originale.
      */  
      input = input.replaceAll(/[\/\\]/g, '');
      input = input.replaceAll(/[\t]/g, ' ');
      input = input.replaceAll(/[,&£#+()$~%'":;~?!<>{}|@$€^]/g, ' ');
      input = input.replaceAll(/[\r\n]/g, ' ');
      input = input.replaceAll(/[\n]/g, ' ');
      /*
        /[/\s]{1,}/g: È una espressione regolare che cerca determinati pattern nella stringa.
        [/\s]: Cerca qualsiasi carattere che sia una barra (/) o uno spazio (\s).
        {1,}: Indica che deve trovare uno o più (1 o più) di quei caratteri.
        g: È il flag per la sostituzione globale, il che significa che sostituirà tutte le occorrenze del pattern trovato nella stringa, non solo la prima.
        ,'': È il carattere con cui sostituire i pattern trovati. In questo caso, è una virgola.
      */
      input = input.replace(/[\s]{1,}/g, ',');

      list = input.split(',');
      list.forEach(x => {
        if (x.length !== 0) {
          list2.push(x);
        }
      });

      list = [...new Set(list2)];
      list2 = []
      list.forEach(url => {
        let obj = applicationSiteCopy['url-list'].find(u => u.url === url);

        if (!obj) {
          let o = {
            id: id,
            url: url,
            toAdd: true
          };
          list2.push(o);
        }
        id++;
      });

      applicationSiteCopy['url-list'] = applicationSiteCopy['url-list'].concat(list2);
      setApplicationSite(applicationSiteCopy);
    } catch (error) {
      console.error(error);
    }
  };

  let validationCheck = async () => {
    let applicationSiteCopy = { ...applicationSite };
    setErrors({});
    let validators = new Validators();
    let regexp = new RegExp(/^[*]/g);
    let errorsCopy = {};
    let ok = true;

    if (!changeRequestId) {
      ok = false;
      errorsCopy['change-request-idError'] = true;
    }

    if (!((changeRequestId.length >= 11) && (changeRequestId.length <= 23))) {
      ok = false;
      errorsCopy['change-request-idError'] = true;
    }

    for (let url of applicationSiteCopy['url-list']) {
      if (regexp.test(url.url)) {
        continue;
      }
      if (!url.url) {
        url.urlError = true;
        ok = false;
        errorsCopy.urlListError = url.url;
      }
      if (!validators.fqdn(url.url)) {
        url.urlError = true;
        ok = false;
        errorsCopy.urlListError = url.url;
      }
    }

    setApplicationSite(applicationSiteCopy);
    setErrors(errorsCopy);
    return ok;
  };

  let validation = async () => {
    let valid = await validationCheck();

    if (Object.keys(errors).length === 0 && valid) {
      reqHandler();
    }
  };

  let reqHandler = async () => {
    let applicationSiteCopy = { ...applicationSite };
    let toRemoveCopy = [...toRemove];
    let toAdd = applicationSiteCopy['url-list'].filter(url => url.toAdd);

    if (toRemoveCopy.length > 0) {
      setLoading(true);
      let data = await toDel(toRemoveCopy);
      setLoading(false);
      if (data.status && data.status !== 200) {
        let errorData = Object.assign(data, {
          component: 'urlInApplicationSite',
          vendor: 'checkpoint',
          errorType: 'deleteUrlError'
        });
        props.dispatch(err(errorData));
        return;
      }
    }

    if (toAdd.length > 0) {
      setLoading(true);
      let data = await toAddUrls(toAdd);
      setLoading(false);
      if (data.status && data.status !== 200) {
        let errorData = Object.assign(data, {
          component: 'urlInApplicationSite',
          vendor: 'checkpoint',
          errorType: 'addUrlError'
        });
        props.dispatch(err(errorData));
        return;
      }
    }

    setUrlInputList('');
    dataGet();
  };

  let toDel = async (list) => {
    let body = {};
    let urlList = list.map(url => url.url);
    body.data = {
      "url-list": urlList,
      "change-request-id": changeRequestId
    };

    let r;
    let rest = new Rest(
      "DELETE",
      resp => {
        r = resp;
      },
      error => {
        r = error;
      }
    );
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/custom-application-site/${applicationSite.uid}/urls/`, props.token, body);
    return r;
  };

  let toAddUrls = async (list) => {
    let body = {};
    let urlList = list.map(url => url.url);
    body.data = {
      "url-list": urlList,
      "change-request-id": changeRequestId
    };

    let r;
    let rest = new Rest(
      "PUT",
      resp => {
        r = resp;
      },
      error => {
        r = error;
      }
    );
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/custom-application-site/${applicationSite.uid}/urls/`, props.token, body);
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
    setChangeRequestId('');
    setApplicationSites([]);
    setApplicationSite({});
    setToRemove([]);
    setErrors({});
    setApplicationSiteError('');
  };

  let errorsComponent = () => {
    if (props.error && props.error.component === 'urlInApplicationSite') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  let urlColumns = [
    {
      title: 'Url',
      align: 'center',
      width: 'auto',
      dataIndex: 'url',
      key: 'url',
      ...getColumnSearchProps(
        'url', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
      render: (name, obj) => (
        <Input
          value={obj.url}
          ref={ref => (myRefs.current[`${obj.id}_url`] = ref)}
          style={
            obj.urlError
              ? { borderColor: 'red', textAlign: 'center', width: 200 }
              : { textAlign: 'center', width: 200 }
          }
          onChange={e => set(e.target.value, 'replaceUrl', obj)}
        />
      ),
    },
    {
      title: 'Remove',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj) => (
        <CloseCircleOutlined onClick={() => set(obj.url, 'removeUrl', obj)} />
      ),
    },
  ];

  return (
    <Space direction='vertical'>

      <Card 
        props={{
          width: 200, 
          title: 'URL Filtering', 
          details: 'URL Filtering',
          color: '#e8b21e',
          onClick: function () { setVisible(true) } 
        }}
      />

      <Modal
        title={<p style={{ textAlign: 'center' }}>URL Filtering</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={null}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={'100%'}
        maskClosable={false}
      >
        <AssetSelector vendor='checkpoint' domain={props.domain} />
        <Divider />

        {props.asset && props.asset.id && props.domain ? (
          <>
            {loading && <Spin indicator={spinIcon} style={{ margin: 'auto 50%' }} />}
            {!loading && response && (
              <Result status="success" title="Updated" />
            )}
            {!loading && !response && (
              <>
                <Row>
                  <Col offset={6} span={3}>
                    Change request id
                  </Col>

                  <Col span={6}>
                    <Input
                      defaultValue={changeRequestId}
                      placeholder="Format: ITIO-<number> (where number is min 6 digits and max 18 digits)"
                      style={errors['change-request-idError'] ? { borderColor: 'red' } : null}
                      onBlur={e => set(e.target.value, 'change-request-id')}
                    />
                  </Col>
                </Row>

                <br />

                <Row>
                  <Col offset={6} span={3}>
                    AppSite
                  </Col>
                  <Col span={6}>
                    <Select
                      value={applicationSite ? applicationSite.name : ''}
                      showSearch
                      style={
                        applicationSiteError
                          ? { width: '100%', border: `1px solid red` }
                          : { width: '100%' }
                      }
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                      }
                      onSelect={g => set(g, 'applicationSite')}
                    >
                      <>
                        {applicationSites.map((as, i) => (
                          <Select.Option key={i} value={as.name}>
                            {as.name.replace(/CA_/g,'').replace(/_G/g,'')}
                          </Select.Option>
                        ))}
                      </>
                    </Select>
                  </Col>
                </Row>

                <br />
                <br />

                {applicationSite ? (
                  <>
                    <Row>
                      <Col offset={1} span={9}>
                        <Input.TextArea
                          rows={7}
                          placeholder="Insert your url's list"
                          defaultValue={urlInputList}
                          onBlur={e => set(e.target.value, 'urlInputList')}
                        />
                      </Col>

                      <Col offset={1} span={2}>
                        <Button type="primary" shape='round' onClick={() => urlListSet()}>
                          Normalize
                        </Button>
                      </Col>

                      <Col offset={1} span={9}>
                        <div style={{float: 'right'}}>
                          {csvError ? 
                          
                            <p style={{ color: 'red' }}>{csvError}</p>
                          :
                            <>
                              <a download={`Url filtering - ${applicationSite.name}.csv`} href={`data:text/csv;charset=utf-8;base64,${csvBase64}`}>Download CSV</a>
                              <br/>
                              <a download={`Url filtering - ${applicationSite.name}.json`} href={`data:application/octet-stream;charset=utf-8;base64,${base64}`}>Download JSON</a>
                              <br/>
                              <br/>
                            </>
                            
                          }
                        </div>
                        <Table
                          columns={urlColumns}
                          dataSource={
                            applicationSite && applicationSite['url-list']
                              ? applicationSite['url-list']
                              : []
                          }
                          bordered
                          rowKey={record => record.url}
                          scroll={{ x: 'auto' }}
                          pagination={{
                            pageSize: pageSize,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'], 
                            onShowSizeChange: (current, size) => setPageSize(size), 
                          }}
                          style={{ marginBottom: 10 }}
                        />

                        {errors.urlListError && errors.urlListError.length > 0 ? (
                          <>
                            <p>
                              Seems there are invalid fqdn. Check{' '}
                              <a href="https://www.ietf.org/rfc/rfc952.txt" target="_blank" rel="noreferrer">
                                rfc952
                              </a>{' '}
                              or{' '}
                              <a href="https://www.ietf.org/rfc/rfc1123.txt" target="_blank" rel="noreferrer">
                                rfc1123
                              </a>{' '}
                              for more details.
                            </p>
                          </>
                        ) : null}
                      </Col>
                    </Row>
                  </>
                ) : null}

                <br />

                <Row>
                  <Col offset={11} span={2}>
                    {loading || !applicationSite || !changeRequestId ? (
                      <Button type="primary" shape='round' disabled>
                        Modify ApplicationSite
                      </Button>
                    ) : (
                      <Button type="primary" shape='round' onClick={() => validation()}>
                        Modify ApplicationSite
                      </Button>
                    )}
                  </Col>
                </Row>
              </>
            )}
          </>
        ) : (
          <Alert message="Asset and Domain not set" type="error" />
        )}
      </Modal>

      {errorsComponent()}
    </Space>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
}))(UrlInApplicationSite);
