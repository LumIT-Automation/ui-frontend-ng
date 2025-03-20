import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
//import 'antd/dist/reset.css'

import Rest from '../_helpers/Rest'
import Validators from '../_helpers/validators'
import Error from '../concerto/error'
import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { err } from '../concerto/store';

import {
  fetchItems,
} from './store'

import { Input, Button, Space, Modal, Spin, Result, Row, Col, Table, Divider } from 'antd';

import { LoadingOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />


function AddUrlInApplicationSite(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [input, setInput] = useState('');
  let [errors, setErrors] = useState({});
  let [valid, setValid] = useState(false);
  let [request, setRequest] = useState({});
  let [response, setResponse] = useState(null);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  useEffect(() => {
    if (Object.keys(errors).length === 0 && valid) {
      application_siteAdd()
      setValid(false)
    }
  }, [valid]);

  //SETTERS
  let nameSet = value => {
    let requestCopy = {...request}
    requestCopy.name = value
    setRequest(requestCopy)
  }
  
  let descriptionSet = value => {
    let requestCopy = {...request}
    requestCopy.description = value
    setRequest(requestCopy)
  }
  
  let urlListInput = async value => {
    let inputCopy = value
    let requestCopy = {...request}
    let errorsCopy = {...errors}
    delete requestCopy.urlList
    delete errorsCopy.urlListError
    setRequest(requestCopy)
    setErrors(errorsCopy)
    setInput(inputCopy)
  }
  
  let urlListSet = async () => {
    let inputCopy = input
    let requestCopy = {...request}
    
    let list=[], nlist=[], urlsList=[]
    let regexp = new RegExp(/^[*]/g);

    try {
      inputCopy = inputCopy.replaceAll('https://','');
      inputCopy = inputCopy.replaceAll('http://','');   
      /*
        /[\/\\]/: È un'espressione regolare che cerca i caratteri / e \.
        [\/\\]: Definisce una classe di caratteri che include la barra normale (/) e la barra rovesciata (\). Nota che per la barra rovesciata (\) è necessario un doppio backslash (\\) perché il backslash è un carattere di escape nelle espressioni regolari.
        g: È un flag globale che indica che la sostituzione deve avvenire su tutte le occorrenze del pattern nella stringa, non solo sulla prima.
        '': È la stringa di sostituzione, che in questo caso è vuota, quindi i caratteri / e \ vengono rimossi dalla stringa originale.
      */   
      inputCopy = inputCopy.replaceAll(/[\/\\]/g,'');
      inputCopy = inputCopy.replaceAll(/[/\t]/g,' ');
      inputCopy = inputCopy.replaceAll(/[,&£#+()$~%'":;~?!<>{}|@$€^]/g,' ');
      inputCopy = inputCopy.replaceAll(/[/\r\n]/g,' ');
      inputCopy = inputCopy.replaceAll(/[/\n]/g,' ');
      /*
        /[/\s]{1,}/g: È una espressione regolare che cerca determinati pattern nella stringa.
        [/\s]: Cerca qualsiasi carattere che sia una barra (/) o uno spazio (\s).
        {1,}: Indica che deve trovare uno o più (1 o più) di quei caratteri.
        g: È il flag per la sostituzione globale, il che significa che sostituirà tutte le occorrenze del pattern trovato nella stringa, non solo la prima.
        ,'': È il carattere con cui sostituire i pattern trovati. In questo caso, è una virgola.
      */
      inputCopy = inputCopy.replace(/[/\s]{1,}/g, ',' )

      list = inputCopy.split(',')
      list = list.forEach(x => {
        if (x.length !== 0) {
          nlist.push(x)
        }
      });

      nlist.forEach(x => {
        if (regexp.test(x)) {
          let father = x.replace('*.', '')
          nlist.push(father)
        }
      });

      let unique = [...new Set(nlist)];

      unique.sort().forEach((item, i) => {
        urlsList.push({url: item})
      });


      requestCopy.urlList = urlsList
    } catch (error) {
      console.log(error)
    }

    setRequest(requestCopy)
  }
  
  let removeUrl = async obj => {
    let requestCopy = {...request}
    let list = []
    requestCopy.urlList.map( o => {
      if (o.url !== obj.url) {
        list.push(o)
      }
    })
    requestCopy.urlList = list
    setRequest(requestCopy)
  }

  //VALIDATION
  let validationCheck = async () => {
    setErrors({});
    let requestCopy = {...request}
    let errorsCopy = {...errors}
    let validators = new Validators()
    let regexp = new RegExp(/^[*]/g);
    let ok = true;

    if (!requestCopy.name) {
      ok = false;
      errorsCopy.nameError = true
    }
    else {
      delete errorsCopy.nameError
    }
    if (!requestCopy.description) {
      ok = false;
      errorsCopy.descriptionError = true
    }
    else {
      delete errorsCopy.descriptionError
    }
    if (!requestCopy.hasOwnProperty('urlList') /*|| requestCopy.urlList.length < 1*/) {
      ok = false;
      errorsCopy.urlListError = true
    }
    else {
      for await (let item of requestCopy.urlList) {
        if (regexp.test(item.url)) {
          continue
        }
        if (!validators.fqdn(item.url)) {
          ok = false;
          errorsCopy.urlListError = item.url
          break
        }
        else {
          delete errorsCopy.urlListError
        }
      }
    }

    setErrors(errorsCopy)
    return ok;
  }

  let validation = async () => {
    let valid = await validationCheck();
    setValid(valid)
  }
  
  
  //DISPOSAL ACTION
  let application_siteAdd = async () => {
    let requestCopy = {...request}
    let list = []
    requestCopy.urlList.map( o => {
      list.push(o.url)
    })
    let b = {}
    b.data = {
      "name": requestCopy.name,
      "description": requestCopy.description,
      "url-list": list,
      "primary-category": "Custom_Application_Site",
      "urls-defined-as-regular-expression": false
    }

    setLoading(true)

    let rest = new Rest(
      "POST",
      resp => {
        setLoading(false)
        setResponse(true)
        hanldeResponse()
      },
      error => {
        error = Object.assign(error, {
          component: 'application_sitesAdd',
          vendor: 'checkpoint',
          errorType: 'application_siteAddError'
        })
        props.dispatch(err(error))
        setLoading(false)
        setResponse(false)
      }
    )
    await rest.doXHR(`checkpoint/${props.asset.id}/${props.domain}/application-sites/`, props.token, b)
  }
  
  let hanldeResponse = () => {
    setTimeout( () => setResponse(false), 2000)
    setTimeout( () => props.dispatch(fetchItems(true)), 2030)
    setTimeout( () => closeModal(), 2050)
  }

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
    setLoading(false);
    setInput('');
    setErrors({});
    setRequest({});
    setResponse(null);
  }

  let errorsComponent = () => {
    if (props.error && props.error.component === 'application_sitesAdd') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  let columns = [
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
    },
    {
      title: 'Remove',
      align: 'center',
      dataIndex: 'delete',
      key: 'delete',
      render: (name, obj)  => (
        <CloseCircleOutlined onClick={() => removeUrl(obj)}/>
      ),
    }
  ]

  return (
    <Space direction='vertical'>

      <Button icon={addIcon} type='primary' onClick={() => setVisible(true)} shape='round'/>

      <Modal
        title={<p style={{textAlign: 'center'}}>ADD CUSTOM APPLICATION SITES</p>}
        centered
        destroyOnClose={true}
        open={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >
        { loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !loading && response &&
          <Result
             status="success"
             title="Custom application sites added"
           />
        }
        { !loading && !response &&
          <React.Fragment>
            <Row>
              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Name:</p>
              </Col>
              <Col span={16}>
                {errors.nameError ?
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => nameSet(e.target.value)} />
                :
                  <Input defaultValue={request.name} style={{width: 250}} onChange={e => nameSet(e.target.value)} />
                }
              </Col>
            </Row>
            <br/>

            <Row>
              <Col span={2}>
                <p style={{marginRight: 10, marginTop: 5, float: 'right'}}>Description:</p>
              </Col>
              <Col span={16}>
                {errors.descriptionError ?
                  <Input style={{width: 250, borderColor: 'red'}} onChange={e => descriptionSet(e.target.value)} />
                :
                  <Input defaultValue={request.description} style={{width: 250}} onChange={e => descriptionSet(e.target.value)} />
                }
              </Col>
            </Row>

            <Divider/>

            {/* radio button  per text area o tabella */}
            <Row>
              <Col offset={1} span={9}>
                <Input.TextArea
                  rows={7}
                  placeholder="Insert your url's list"
                  value={input}
                  onChange={e => urlListInput(e.target.value)}
                />
              </Col>

              <Col offset={1} span={2}>
                <Button type="primary" shape='round' onClick={() => urlListSet()} >
                  Normalize
                </Button>
              </Col>

              <Col offset={1} span={9}>
                {errors.urlListError ?
                  <React.Fragment>
                    <Table
                      columns={columns}
                      dataSource={request.urlList}
                      bordered
                      rowKey="name"
                      scroll={{x: 'auto'}}
                      pagination={{ pageSize: 10 }}
                      rowClassName={ (record, index) => (record.url === errors.urlListError) ? "rowClassName1" : "" }
                      style={{marginBottom: 10}}
                    />
                    {errors.urlListError && (errors.urlListError.length > 0) ?
                      <React.Fragment>
                        <p><span style={{color: 'red'}}>{errors.urlListError}</span> is not a valid fqdn. <a href="https://www.ietf.org/rfc/rfc952.txt" target="_blank">rfc952</a> or <a href="https://www.ietf.org/rfc/rfc1123.txt" target="_blank">rfc1123</a> for more details.</p>
                      </React.Fragment>
                    :
                      null
                    }

                  </React.Fragment>
                :
                  <Table
                    columns={columns}
                    dataSource={request.urlList}
                    bordered
                    rowKey="name"
                    scroll={{x: 'auto'}}
                    pagination={{ pageSize: 10 }}
                    style={{marginBottom: 10}}
                  />
                }
              </Col>
            </Row>
            <br/>

            <Row>

            </Row>

            <Row>
              <Col offset={10} span={3}>
                <Button type="primary" shape='round' onClick={() => validation()} >
                  Add Custom Application Sites
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        }
      </Modal>

      {errorsComponent()}

    </Space>

  )
}


export default connect((state) => ({
token: state.authentication.token,
error: state.concerto.err,

asset: state.checkpoint.asset,
domain: state.checkpoint.domain,
}))(AddUrlInApplicationSite);
