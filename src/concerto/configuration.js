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
      main()
    }
  }, [props.vendor]);


  const main = async () => {
    setLoading(true)
    let confs = []
    let configurationsFetched = await dataGet('/configuration/global/')
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
  }

  const dataGet = async (entities) => {
    let endpoint = `${props.vendor}${entities}`
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


  const set = async (key, value, record) => {
    let commonFunctions = new CommonFunctions()
    let confs = JSON.parse(JSON.stringify(configurations));
    let conf

    try {
      if (key === 'recordAdd') {
        const list = await commonFunctions.itemAdd(configurations)
        setConfigurations(list)
      } 
      if (key === 'recordRemove') {
        const list = await commonFunctions.itemRemove(record, configurations)
        if (list.length === 0) {
          setConfigurations([{id:1}])
        } else {
          setConfigurations(list)
        }
      }
  
      if (record) {
        conf = confs.find(cn => cn.id === record.id);
  
        if (key === 'key') {
          let start = 0
          let end = 0
          let ref = myRefs.current[`${record.id}_key`];
  
          if (ref && ref.input) {
            start = ref.input.selectionStart
            end = ref.input.selectionEnd
          }
  
          conf['key'] = value || '';
          delete conf['keyError'];
          setConfigurations(confs)
          //ref = myRefs.current[`${record.id}_key`];
  
          if (ref && ref.input) {
            ref.input.selectionStart = start
            ref.input.selectionEnd = end
          }
  
          ref.focus()
        }
  
        if (key === 'value') {
          let start = 0
          let end = 0
          let ref = textAreaRefs.current[`${record.id}_value`];
  
          if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
            start = ref.resizableTextArea.textArea.selectionStart
            end = ref.resizableTextArea.textArea.selectionEnd
          }
  
          conf['value'] = value || '';
          delete conf['valueError'];
          setConfigurations(confs);
          //ref = textAreaRefs.current[`${record.id}_value`];
  
          if (ref && ref.resizableTextArea && ref.resizableTextArea.textArea) {
            ref.resizableTextArea.textArea.selectionStart = start;
            ref.resizableTextArea.textArea.selectionEnd = end;
          }
  
          ref.focus();
        }
  
        if (key === 'toDelete') {
          if (value) {
            conf.toDelete = true
          }
          else {
            delete conf.toDelete
          }
          setConfigurations(confs);
        }
  
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  const validationCheck = async () => {
    let confs = JSON.parse(JSON.stringify(configurations));
    let errorsCount = 0;

    for (let conf of Object.values(confs)) {
      if (!conf.key) {
        ++errorsCount;
        conf.keyError = true;
      }
      if (!conf.value) {
        ++errorsCount;
        conf.valueError = true;
      }
    }

    setConfigurations(confs);
    return errorsCount;
  };

  const validation = async () => {
    let errorsCount = await validationCheck();
    if (errorsCount === 0) {
      let confs = configurations.filter(conf => !conf.toDelete);
      modifyConfiguration(confs);
    }
  };


  const modifyConfiguration = async (configurations) => {
    await setLoading(true)

    let b = {}
    b.data = {
      "configuration": configurations
    }

    let rest = new Rest(
      "PUT",
      resp => {
        setLoading(false)
        main()
      },
      error => {
        setLoading(false)
        error = Object.assign(error, {
          component: 'configuration',
          vendor: 'concerto',
          errorType: 'modifyConfigurationError'
        })
        props.dispatch(err(error))
      }
    )
    await rest.doXHR(`${props.vendor}/configuration/global/`, props.token, b )
  }



  const createElement = (element, key, choices, record, action) => {
    switch (element) {

      case 'input':
        return (
          <Input
            value={record[key]}
            style=
              {record[`${key}Error`] ?
                {borderColor: 'red', width: 200}
              :
                {width: 200}
              }
            ref={ref => (myRefs.current[`${record.id}_${key}`] = ref)}
            onChange={event => set(key, event.target.value, record)}
          />
        )

      case 'textArea':
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

      case 'button':
        return (
          <Button
            type="danger"
            onClick={() => set('recordRemove', '', record)}
          >
            -
          </Button>
        )

      case 'checkbox':
        return (
          <Checkbox
            checked={record[key]}
            onChange={e => set('toDelete', e.target.checked, record)}
          />
        )

      default:
        return null;
    }
  }

  const columns = [
    {
      title: 'Key',
      align: 'center',
      dataIndex: 'key',
      key: 'key',
      render: (name, record)  => (
        createElement('input', 'key', '', record, '')
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

  const showErrors = () => {
    if (props.error && props.error.component === 'configuration') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <React.Fragment>
      {loading ?
        <Spin indicator={spinIcon} style={{margin: '10% 45%'}}/>
      :
        <Space direction="vertical" style={{width: '100%', padding: 15, marginBottom: 10}}>

          <Space wrap>
            <Button
              onClick={() => main()}
            >
              <ReloadOutlined/>
            </Button>
            <Button
              type="primary"
              onClick={() => set('recordAdd')}
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

      {showErrors()}

    </React.Fragment>
  )
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(Manager);
