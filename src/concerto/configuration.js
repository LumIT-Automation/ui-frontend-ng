import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'
import CommonFunctions from '../_helpers/commonFunctions'
import JsonHelper from '../_helpers/jsonHelper'

import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Input, Button, Spin, Checkbox } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import {
  err,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const confLoadIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />


function Manager(props) {

  let [loading, setLoading] = useState(false);
  let [configurations, setConfigurations] = useState([]);
  let [ok, setOk] = useState(false);

  const myRefs = useRef({});
  const textAreaRefs = useRef({});

  const update = async (newValue) => {
    setConfigurations(newValue); 
    await new Promise((resolve) => setTimeout(resolve, 0)); 
  };
  
  //UPDATE
  useEffect(() => {
    if (!props.error) {
      start()
    }
  }, [props.vendor]);

  useEffect(() => {
    if (ok) {
      setOk(false); 
      cudHandler();  
    }
  }, [configurations, ok]); 

  const start = async () => {
    setLoading(true)
    let configurationsFetched = await dataGet('configurations/')
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      let error = Object.assign(configurationsFetched, {
        component: 'configurations',
        vendor: 'concerto',
        errorType: 'configurationsError'
      })
      props.dispatch(err(error))
    }
    else {
      let list = []
      configurationsFetched.data.items.forEach((item, i) => {
        item.existent = true
        item.value = JSON.stringify(item.value, null, 2)
        list.push(item)
      });
      setConfigurations(configurationsFetched.data.items)
    }
    setLoading(false)
  }

  const dataGet = async (entities) => {
    let endpoint = `${props.vendor}/${entities}`
    let r

    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${endpoint}`, props.token)
    return r
  }

  let recordAdd = async() => {
    let commonFunctions = new CommonFunctions()
    let configurationsCopy = await commonFunctions.itemAdd(configurations)
    setConfigurations(configurationsCopy)
  } 

  let recordRemove = async(record) => {
    let commonFunctions = new CommonFunctions()
    const configurationsCopy = await commonFunctions.itemRemove(record, configurations)
    if (configurationsCopy.length === 0) {
      setConfigurations([{id:1}])
    } else {
      setConfigurations(configurationsCopy)
    }
  }

  const set = async (key, value, record) => {
    
    let configurationsCopy = JSON.parse(JSON.stringify(configurations));
    let configuration

    try {
      
      if (record) {
        configuration = configurationsCopy.find(cn => cn.id === record.id);

        if (key === 'config_type') {
          if (configuration.existent) {
            configuration.isModified = true
          }
          let start = 0
          let end = 0
          let ref = myRefs.current[`${record.id}_${key}`];
  
          if (ref && ref.input) {
            start = ref.input.selectionStart
            end = ref.input.selectionEnd
          }
  
          configuration.config_type = value || '';
          delete configuration.config_typeError;
          setConfigurations([...configurationsCopy])
  
          if (ref && ref.input) {
            ref.input.selectionStart = start
            ref.input.selectionEnd = end
          }
  
          ref.focus()
        }
  
        if (key === 'value') {
          if (configuration.existent) {
            configuration.isModified = true
          }
          let start = 0
          let end = 0
          let ref = textAreaRefs.current[`${record.id}_${key}`];
  
          if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
            start = ref.resizableTextArea.textArea.selectionStart
            end = ref.resizableTextArea.textArea.selectionEnd
          }
  
          configuration.value = value || '';
          delete configuration.valueError;
          setConfigurations([...configurationsCopy])
  
          if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
            ref.resizableTextArea.textArea.selectionStart = start;
            ref.resizableTextArea.textArea.selectionEnd = end;
          }
  
          ref.focus();
        }
  
        if (key === 'toDelete') {
          if (configuration.existent) {
            if (value) {
              configuration.toDelete = true
            }
            else {
              delete configuration.toDelete
            }
            setConfigurations([...configurationsCopy])
          }
        }
  
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  function cleanObject(obj) {
    if (typeof obj === 'string') {
        return obj.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim(); // Rimuove \n e spazi extra
    } else if (Array.isArray(obj)) {
        return obj.map(cleanObject); // Pulisce ogni elemento dell'array
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, cleanObject(value)])
        );
    }
    return obj; // Restituisce il valore non stringa invariato
  }

  const deepCopy = (value) => {
    if (Array.isArray(value)) {
      // Se è un array, crea una copia profonda dell'array
      return value.map(item => deepCopy(item));
    } else if (value && typeof value === 'object') {
      // Se è un oggetto, crea una copia profonda dell'oggetto
      const copy = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          copy[key] = deepCopy(value[key]);
        }
      }
      return copy;
    } else {
      // Se è un tipo primitivo (stringa, numero, booleano), ritorna il valore così com'è
      return value;
    }
  };

  const validationCheck = async () => {
    let configurationsCopy = configurations.map(config => ({
      ...config,
      value: deepCopy(config.value), // Applica deepCopy al valore
    }));

    let jsonHelper = new JsonHelper()
    let errorsCount = 0;

    for (let configuration of Object.values(configurationsCopy)) {
      if (!configuration.config_type) {
        ++errorsCount;
        configuration.config_typeError = true;
      }
      if (!configuration.value) {
        ++errorsCount;
        configuration.valueError = true;
      }
      let j = jsonHelper.processJSON(configuration.value)
      if (j) {
        try {
          // Parsing della stringa JSON in un oggetto JavaScript
          let parsedObject = JSON.parse(configuration.value);
          
          // Pulizia dell'oggetto
          let cleanedObject = await cleanObject(parsedObject);

          // Aggiornamento del valore con l'oggetto pulito
          configuration.value = cleanedObject;  // Puoi lasciare l'oggetto qui

        } catch (error) {
            console.error("Errore nel parsing del JSON:", error);
        }
      }
      else {
        console.log('non è un json', j)
      }
    }

    await update(configurationsCopy)

    return {
      data: configurationsCopy,
      errorsCount: errorsCount
    };
  };

  const validation = async () => {
    let vc = await validationCheck();

    if (vc.errorsCount === 0) {
      setOk(true)
    }
  };

  let cudHandler = async () => {
    console.log(configurations)
    let configurationsCopy = [...configurations];
    
    let toDelete = []
    let toPatch = []
    let toPost = []

    for (const configurationCopy of Object.values(configurationsCopy)) {
      if (configurationCopy.toDelete) {
        toDelete.push(configurationCopy)
      }
      if (configurationCopy.isModified) {
        toPatch.push(configurationCopy)
      }
      if (!configurationCopy.existent) {
        toPost.push(configurationCopy)
      }
    }

    if (toDelete.length > 0) {
      for (const configurationCopy of toDelete) {
        configurationCopy.loading = true
        setConfigurations([...configurationsCopy])

        let a = await configurationDelete(configurationCopy.id)
        if (a.status && a.status !== 200 ) {
          let error = Object.assign(a, {
            component: 'configurations',
            vendor: 'concerto',
            errorType: 'deleteConfigurationError'
          })
          props.dispatch(err(error))
        }
        configurationCopy.loading = false
        setConfigurations([...configurationsCopy])
      }
    }

    if (toPost.length > 0) {
      for (const configurationCopy of toPost) {
        let body = {}

        body.data = {
          "config_type": configurationCopy.config_type,
          "value": configurationCopy.value
        }

        configurationCopy.loading = true
        setConfigurations([...configurationsCopy])

        let a = await configurationAdd(body)
        if (a.status && a.status !== 201 ) {
          let error = Object.assign(a, {
            component: 'configurations',
            vendor: 'concerto',
            errorType: 'configurationsAddError'
          })
          props.dispatch(err(error))
        }
        configurationCopy.loading = false
        setConfigurations([...configurationsCopy])
      }
    }

    if (toPatch.length > 0) {
      for (const configurationCopy of toPatch) {
        let body = {}

        body.data = {
          "config_type": configurationCopy.config_type,
          "value": configurationCopy.value
        }

        configurationCopy.loading = true
        setConfigurations([...configurationsCopy])

        let a = await configurationModify(configurationCopy.id, body)
        if (a.status && a.status !== 200 ) {
          let error = Object.assign(a, {
            component: 'configurations',
            vendor: 'concerto',
            errorType: 'configurationsModifyError'
          })
          props.dispatch(err(error))
        }
        configurationCopy.loading = false
        setConfigurations([...configurationsCopy])
      }
    }
    start()
  }

  let configurationDelete = async (id) => {
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
    await rest.doXHR(`${props.vendor}/configuration/${id}/`, props.token )
    return r
  }

  let configurationAdd = async (body) => {
    let r
    let rest = new Rest(
      "POST",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${props.vendor}/configurations/`, props.token, body )
    return r
  }

  const configurationModify = async (id, body) => {
    let r
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${props.vendor}/configuration/${id}/`, props.token, body )
    return r
  }

  const createElement = (element, key, choices, record, action) => {
    if (element === 'input') {
      return (
        <Input
          value={record.config_type}
          style=
            {record.config_typeError ?
              {borderColor: 'red', width: 200}
            :
              {width: 200}
            }
          ref={ref => (myRefs.current[`${record.id}_${key}`] = ref)}
          onChange={event => set(key, event.target.value, record)}
        />
      )
    }

    else if (element === 'textArea') {
      return (
        <Input.TextArea
          rows={12}
          value={record[key]}
          ref={ref => (textAreaRefs.current[`${record.id}_${key}`] = ref)}
          onChange={event => set(key, event.target.value, record)}
          style=
            { record[`${key}Error`] ?
              {borderColor: `red`, width: 350}
            :
              {width: 350}
            }
        />
      )
    }

    else if (element === 'button') {
      return (
        <Button
          type="danger"
          onClick={() => recordRemove(record)}
        >
          -
        </Button>
      )
    }

    else if (element === 'checkbox') {
      return (
        <Checkbox
          checked={record[key]}
          onChange={e => set('toDelete', e.target.checked, record)}
        />
      )
    }
  }

  const columns = [
    {
      title: 'Loading',
      align: 'center',
      dataIndex: 'loading',
      key: 'loading',
      render: (name, obj)  => (
        <Space size="small">
          {obj.loading ? <Spin indicator={confLoadIcon} style={{margin: '10% 10%'}}/> : null }
        </Space>
      ),
    },
    {
      title: 'Config type',
      align: 'center',
      dataIndex: 'config_type',
      key: 'config_type',
      render: (name, record)  => (
        createElement('input', 'config_type', '', record, '')
      )
    },
    {
      title: 'Value',
      align: 'center',
      width: 500,
      dataIndex: 'value',
      key: 'value',
      render: (name, record)  => (
        createElement('textArea', 'value', '', record, '')
      )
    },
    {
      title: 'Delete',
      align: 'center',
      dataIndex: 'delete',
      width: 150,
      key: 'delete',
      render: (name, record)  => (
        record.existent ?
          createElement('checkbox', 'toDelete', '', record, '')
        :
          createElement('button', '', '', record, '')
      )
    },
  ];

  const errorsComponent = () => {
    if (props.error && props.error.component === 'configurations') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {console.log(configurations)}
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
        <Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>

          <Space wrap>
            <Button
              onClick={() => start()}
            >
              <ReloadOutlined/>
            </Button>
            <Button
              type="primary"
              onClick={() => recordAdd()}
            >
              +
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={configurations}
            bordered
            rowKey={record => record.id}
            scroll={{x: 'auto'}}
            pagination={{ pageSize: 10 }}
          />

          <Button
            type="primary"
            style={{float: "right", marginTop: '15px'}}
            onClick={() => validation()}
          >
            Commit
          </Button>
        </Space>
      }

      {errorsComponent()}

    </React.Fragment>
  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(Manager);
