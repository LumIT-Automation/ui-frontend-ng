import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';

import Rest from '../../_helpers/Rest';
import Validators from '../../_helpers/validators';
import Error from '../../concerto/error';
import CommonFunctions from '../../_helpers/commonFunctions';

import {
  err
} from '../../concerto/store';

import AssetSelector from '../../concerto/assetSelector';

import { Input, Button, Space, Modal, Spin, Radio, Result, Alert, Row, Col, Select, Divider, Table, Checkbox } from 'antd';
import Highlighter from 'react-highlight-words';
import { LoadingOutlined, ReloadOutlined, SearchOutlined, FormOutlined, CloseCircleOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;

function UrlInApplicationSite(props) {

  const [visible, setVisible] = useState(false);
  const [changeRequestId, setChangeRequestId] = useState('ITIO-');
  const [applicationSites, setApplicationSites] = useState([]);
  const [applicationSite, setApplicationSite] = useState({});
  const [toRemove, setToRemove] = useState([]);
  const [errors, setErrors] = useState({});
  const [applicationSiteError, setApplicationSiteError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [urlInputList, setUrlInputList] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const myRefs = useRef({});
  const searchInput = useRef(null);
  const prevDomainRef = useRef();

  useEffect(() => {
    if (visible && props.asset && props.domain && (prevDomainRef.current !== props.domain)) {
      setApplicationSite('');
      dataGet();
    }
    prevDomainRef.current = props.domain;
  }, [visible, props.asset, props.domain]);

  const details = () => {
    setVisible(true);
  };

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

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      try {
        if (typeof dataIndex === 'string' || dataIndex instanceof String) {
          return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        } else if (Array.isArray(dataIndex)) {
          let r = record[dataIndex[0]];
          return r[dataIndex[1]].toString().toLowerCase().includes(value.toLowerCase());
        } else {
          return '';
        }
      } catch (error) {
        return '';
      }
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.current.select(), 100);
      }
    },
    render: text => {
      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      );
    }
  });

  const dataGet = async () => {
    setLoading(true);

    let data = await getData('application-sites');
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

  const getData = async (entity) => {
    let r;
    let endpoint = '';

    if (entity === 'application-sites') {
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/?custom&local`;
    } else {
      endpoint = `checkpoint/${props.asset.id}/${props.domain}/${entity}/`;
    }

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

  const set = async (value, key, obj) => {
    let errorsCopy = { ...errors };

    try {
      if (key === 'applicationSite') {
        const selectedApplicationSite = applicationSites.find(as => as.name === value);
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

        const ref = myRefs.current[`${obj.id}_url`];
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
      console.log(error);
    }
  };

  const urlListSet = async () => {
    let input = urlInputList;
    let applicationSiteCopy = { ...applicationSite };
    let n = Math.max(...applicationSiteCopy['url-list'].map(o => o.id), 0);

    let urlList = [];
    let list = [];
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
      input = input.replaceAll(/[,&#+()$~%'":;~?!<>{}|@$€^]/g, ' ');
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

      let nlist = [];
      list = input.split(',');
      list.forEach(x => {
        if (x.length !== 0) {
          nlist.push(x);
        }
      });

      urlList = nlist;

      urlList.forEach(x => {
        if (regexp.test(x)) {
          let father = x.replace('*.', '');
          list.push(father);
        }
      });

      urlList = [...new Set(urlList)];

      let newUrls = [];
      urlList.forEach(url => {
        let obj = applicationSiteCopy['url-list'].find(u => u.url === url);

        if (!obj) {
          let o = {
            id: id,
            url: url,
            toAdd: true
          };
          newUrls.push(o);
        }
        id++;
      });

      applicationSiteCopy['url-list'] = applicationSiteCopy['url-list'].concat(newUrls);
      setApplicationSite(applicationSiteCopy);
    } catch (error) {
      console.log(error);
    }
  };

  const validationCheck = async () => {
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

    if (changeRequestId.length < 11) {
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

  const validation = async () => {
    let valid = await validationCheck();

    if (Object.keys(errors).length === 0 && valid) {
      reqHandler();
    }
  };

  const reqHandler = async () => {
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

  const toDel = async (list) => {
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

  const toAddUrls = async (list) => {
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

  const closeModal = () => {
    setVisible(false);
    setChangeRequestId('ITIO-');
    setApplicationSites([]);
    setApplicationSite({});
    setToRemove([]);
    setErrors({});
    setApplicationSiteError('');
  };

  const errorsComponent = () => {
    if (props.error && props.error.component === 'urlInApplicationSite') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  const urlColumns = [
    {
      title: 'Url',
      align: 'center',
      width: 'auto',
      dataIndex: 'url',
      key: 'url',
      ...getColumnSearchProps('url'),
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
      <Button type="primary" onClick={() => details()}>Url In ApplicationSite</Button>

      <Modal
        title={<p style={{ textAlign: 'center' }}>Url In ApplicationSite</p>}
        centered
        destroyOnClose={true}
        visible={visible}
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
                      placeholder='ITIO-6 to 18 numbers'
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
                            {as.name}
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
                          pagination={{ pageSize: 30 }}
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
