import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Spin, Button, Table, Input, Checkbox } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Error from '../../error/f5Error'
import Rest from '../../_helpers/Rest'

import {
  configurationLoading,
  configuration,
  configurationFetch,
  configurationError,
} from '../store.f5'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      request: []
    };
  }

  componentDidMount() {
    if (!this.props.configurationError) {
      this.props.dispatch(configurationFetch(false))
      if (!this.props.configuration) {
        this.main()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.configurationFetch) {
      this.main()
      this.props.dispatch(configurationFetch(false))
    }
  }

  componentWillUnmount() {
  }


  main = async () => {
    this.props.dispatch(configurationLoading(true))
    let fetchedConfiguration = await this.configurationGet()
    if (fetchedConfiguration.status && fetchedConfiguration.status !== 200 ) {
      this.props.dispatch(configurationError(fetchedConfiguration))
      this.props.dispatch(configurationLoading(false))
      return
    }
    else {
      this.props.dispatch(configuration(JSON.parse(fetchedConfiguration.data.configuration)))
      this.props.dispatch(configurationLoading(false))
    }
  }

  configurationGet = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        console.log(resp)
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR("f5/configuration/global/", this.props.token)
    return r
  }


  addRecord = () => {
    let list = []
    let n
    if (this.props.configuration.length === 0) {
      n = 1
    }
    this.props.configuration.forEach(r => {
      list.push(Number(r.id))
    });

    let m = Math.max(...list)
    if ( !n ) {
      n = m + 1
    }

    let l = JSON.parse(JSON.stringify(this.props.configuration))
    let r = {id: n}
    l.push(r)
    this.props.dispatch(configuration((l)))
  }

  removeRecord = r => {
    let conf = JSON.parse(JSON.stringify(this.props.configuration))
    let newList = conf.filter(n => {
      return r.id !== n.id
    })
    this.props.dispatch(configuration((newList)))
  }

  keySet = (e, id) => {
    let conf = JSON.parse(JSON.stringify(this.props.configuration))
    let record = conf.find( r => r.id === id )
    record.key = e.target.value
    this.props.dispatch(configuration((conf)))
  }

  valueSet = (e, id) => {
    let conf = JSON.parse(JSON.stringify(this.props.configuration))
    let record = conf.find( r => r.id === id )
    record.value = e.target.checked
    this.props.dispatch(configuration((conf)))
  }


  modifyConfiguration = async () => {
    let conf = JSON.stringify(this.props.configuration)

    const b = {
      "data":
        {
          "configuration": conf
        }
      }

    this.props.dispatch(configurationLoading(true))

    let rest = new Rest(
      "PUT",
      resp => {
        this.main()
      },
      error => {
        this.props.dispatch(configurationError(error))
        this.props.dispatch(configurationLoading(false))
      }
    )
    await rest.doXHR(`f5/configuration/global/`, this.props.token, b )
  }



  render() {

    console.log(this.props.configuration)

    const columns = [
      {
        title: 'Key',
        align: 'center',
        dataIndex: 'key',
        key: 'key',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.keyError ?
              <Input id='key' defaultValue={obj.key} style={{ width: '250px', borderColor: 'red' }} onBlur={e => this.keySet(e, obj.id)} />
            :
              <Input id='key' defaultValue={obj.key} style={{ width: '250px'}} onBlur={e => this.keySet(e, obj.id)} />
            }
          </React.Fragment>
        ),

      },
      {
        title: 'Value',
        align: 'center',
        dataIndex: 'value',
        key: 'value',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.valueError ?
              <Checkbox style={{ borderColor: 'red' }} checked={obj.value} onChange={e => this.valueSet(e, obj.id)}/>
            :
              <Checkbox style={{ borderColor: 'red' }} checked={obj.value} onChange={e => this.valueSet(e, obj.id)}/>
            }
          </React.Fragment>
        ),
      },
      {
        title: 'Remove record',
        align: 'center',
        dataIndex: 'remove',
        width: 150,
        key: 'remove',
        render: (name, obj)  => (
          <Button type="danger" onClick={() => this.removeRecord(obj)}>
            -
          </Button>
        ),
      },
    ];

    let randomKey = () => {
      return Math.random().toString()
    }
    return (
      <React.Fragment>
        {this.props.configurationLoading ?
          <Spin indicator={spinIcon} style={{margin: '20% 48%'}}/>
        :
          <React.Fragment>
            <br/>
            <Button type="primary" onClick={() => this.addRecord()}>
              +
            </Button>
            <br/>
            <br/>

            <Table
              columns={columns}
              dataSource={this.props.configuration}
              bordered
              rowKey={randomKey}
              scroll={{x: 'auto'}}
              pagination={{ pageSize: 10 }}
              style={{marginBottom: 10}}
            />

            <Button type="primary" style={{float: "right", marginTop: '15px'}} onClick={() => this.modifyConfiguration()} >
              modifyConfiguration
            </Button>
          </React.Fragment>
        }

        { this.props.configurationError ? <Error component={'manager f5'} error={[this.props.configurationError]} visible={true} type={'configurationError'} /> : null }

      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,

  configurationLoading: state.f5.configurationLoading,
  configuration: state.f5.configuration,
  configurationError: state.f5.configurationError,
  configurationFetch: state.f5.configurationFetch,
}))(Manager);
