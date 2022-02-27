import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error/f5Error'
import Rest from '../../_helpers/Rest'

import {
  configurationFetch,
  configurationError,

} from '../store.f5'

import { Spin, Button, Table, Input } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



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
      if (!this.state.configuration) {
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
    this.setState({loading: true})

    let fetchedConfiguration = await this.fetchConfiguration()
    if (fetchedConfiguration.status && fetchedConfiguration.status !== 200 ) {
      this.props.dispatch(configurationError(fetchedConfiguration))
      this.setState({loading: false})
      return
    }
    else {
      //this.props.dispatch(configuration( JSON.parse(fetchedConfiguration.data.configuration) ))
      this.setState({configuration: JSON.parse(fetchedConfiguration.data.configuration)} )
      this.setState({loading: false})
    }
  }

  fetchConfiguration = async () => {
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
    await rest.doXHR("f5/configuration/global/", this.props.token)
    return r
  }


  addRecord = () => {
    let list = []
    let n
    if (this.state.configuration.length === 0) {
      n = 1
    }
    this.state.configuration.forEach(r => {
      list.push(Number(r.id))

    });

    let m = Math.max(...list)
    if ( !n ) {
      n = m + 1
    }

    let l = JSON.parse(JSON.stringify(this.state.configuration))
    let r = {id: n}
    l.push(r)
    this.setState({configuration: l} )
  }

  removeRecord = r => {
    let configuration = JSON.parse(JSON.stringify(this.state.configuration))
    let newList = configuration.filter(n => {
      return r.id !== n.id
    })
    this.setState({configuration: newList})
  }

  setNetwork = (e, id) => {
    let configuration = JSON.parse(JSON.stringify(this.state.configuration))
    let record = configuration.find( r => r.id === id )
    record.network = e.target.value
    this.setState({configuration: configuration})
  }

  setSnat = (e, id) => {
    let configuration = JSON.parse(JSON.stringify(this.state.configuration))
    let record = configuration.find( r => r.id === id )
    record.snat = e.target.value
    this.setState({configuration: configuration})
  }




  modifyConfiguration = async () => {
    let conf = JSON.stringify(this.state.configuration)
    console.log(conf)
    const b = {
      "data":
        {
          "configuration": conf
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "PUT",
      resp => {
        this.main()
      },
      error => {
        this.props.dispatch(configurationError(error))
        this.setState({loading: false})
      }
    )
    await rest.doXHR(`f5/configuration/global/`, this.props.token, b )

  }



  render() {

    console.log(this.state.configuration)

    const columns = [
      {
        title: 'Network',
        align: 'center',
        dataIndex: 'network',
        key: 'network',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.networkError ?
              <Input id='network' defaultValue={obj.network} style={{ width: '250px', borderColor: 'red' }} onBlur={e => this.setNetwork(e, obj.id)} />
            :
              <Input id='network' defaultValue={obj.network} style={{ width: '250px'}} onBlur={e => this.setNetwork(e, obj.id)} />
            }
          </React.Fragment>
        ),

      },
      {
        title: 'Snat',
        align: 'center',
        dataIndex: 'snat',
        key: 'snat',
        render: (name, obj)  => (
          <React.Fragment>
            {obj.snatError ?
              <Input id='snat' defaultValue={obj.snat} style={{ width: '250px', borderColor: 'red' }} onBlur={e => this.setSnat(e, obj.id)} />
            :
              <Input id='snat' defaultValue={obj.snat} style={{ width: '250px'}} onBlur={e => this.setSnat(e, obj.id)} />
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

      {this.state.loading ?
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
            dataSource={this.state.configuration}
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

  configurationError: state.f5.configurationError,
  configurationFetch: state.f5.configurationFetch,
}))(Manager);
