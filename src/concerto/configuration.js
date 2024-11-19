import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import '../App.css'

import Rest from '../_helpers/Rest'
import Error from './error'
import CommonFunctions from '../_helpers/commonFunctions'

import { Space, Table, Input, Button, Spin, Checkbox } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import {
  err,
} from './store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />

//import List from './list'



function Manager(props) {

  const [configurations, setConfigurations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const myRefs = useRef({});
  const textAreaRefs = useRef({});


  //UPDATE
  useEffect(() => {
    if (!props.error) {
      start()
    }
  }, [props.vendor]);

  const start = async () => {
    setLoading(true)
    let configurationsFetched = await dataGet('configurations/')
    console.log(configurationsFetched)
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
        //
        item.value = item.configuration
        list.push(item)
      });
      setConfigurations(list)
    }
    setLoading(false)
  }

  /*const start = async () => {
    setLoading(true)
    let confs = []
    let configurationsFetched = await dataGet('/configuration/AWS%20Regions/')
    console.log(configurationsFetched)
    if (configurationsFetched.status && configurationsFetched.status !== 200 ) {
      let error = Object.assign(configurationsFetched, {
        component: 'configuration',
        vendor: 'concerto',
        errorType: 'configurationsError'
      })
      props.dispatch(err(error))
      setLoading(false)
      return
    }
    else {
      confs = configurationsFetched.data.configuration

      if (configurationsFetched.data.configuration.length > 0) {
        confs.forEach((item, i) => {
          item.existent = true
        });
        //conf = JSON.parse(configurationsFetched.data.configuration)
      }
      setLoading(false)
      setConfigurations(confs)
    }
  }*/

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
          let ref = myRefs.current[`${record.id}_key`];
  
          if (ref && ref.input) {
            start = ref.input.selectionStart
            end = ref.input.selectionEnd
          }
  
          configuration.config_type = value || '';
          delete configuration.config_typeError;
          setConfigurations(configurationsCopy)
          //ref = myRefs.current[`${record.id}_key`];
  
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
          let ref = textAreaRefs.current[`${record.id}_value`];
  
          if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
            start = ref.resizableTextArea.textArea.selectionStart
            end = ref.resizableTextArea.textArea.selectionEnd
          }
  
          configuration.value = value || '';
          delete configuration.valueError;
          setConfigurations(configurationsCopy);
          //ref = textAreaRefs.current[`${record.id}_value`];
  
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
            setConfigurations(configurationsCopy);
          }
        }
  
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  const validationCheck = async () => {
    let configurationsCopy = JSON.parse(JSON.stringify(configurations));
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
    }

    setConfigurations(configurationsCopy);
    return errorsCount;
  };

  const validation = async () => {
    let errorsCount = await validationCheck();
    if (errorsCount === 0) {
      let configurationsCopy = configurations.filter(configuration => !configuration.toDelete);
      modifyConfiguration(configurationsCopy);
    }
  };


  const modifyConfiguration = async (configurations) => {
    setLoading(true)

    let b = {}
    b.data = {
      "configuration": configurations
    }

    let rest = new Rest(
      "PUT",
      resp => {
        setLoading(false)
        start()
      },
      error => {
        setLoading(false)
        error = Object.assign(error, {
          component: 'configurations',
          vendor: 'concerto',
          errorType: 'modifyConfigurationError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`${props.vendor}/configuration/global/`, props.token, b )
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
