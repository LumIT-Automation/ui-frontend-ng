import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setMonitorTypes, setMonitorsLoading, setMonitors, setMonitorsFetch } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd'
import Highlighter from 'react-highlight-words'





class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null,
      monitorFullList: []
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.monitors) {
        this.fetchMonitors()
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.monitors) {
        this.fetchMonitors()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchMonitors()
      }
      if (this.props.monitorsFetch) {
        this.fetchMonitors()
        this.props.dispatch(setMonitorsFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchMonitors = async () => {
    this.props.dispatch(setMonitorsLoading(true))

    let monitorTypes = await this.fetchMonitorsTypeList()
    this.props.dispatch(setMonitorTypes(monitorTypes.data.items))
    //let monitors = await this.monitorsLoop(monitorTypes.data.items)

    let monitors = await this.fetchMonitorsAny()
    let list = []

    monitors.data.forEach(t => {
      let type = Object.keys(t)
      type = type[0]
      let values = Object.values(t)

      values.forEach(o => {
        o.items.forEach(m => {
          Object.assign(m, {type: type});
          list.push(m)
        })
      })
    })

    this.props.dispatch(setMonitorsLoading(false))
    this.props.dispatch(setMonitors(list))
  }

  fetchMonitorsTypeList = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/`, this.props.token)
    return r
  }

  fetchMonitorsAny = async () => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/ANY/`, this.props.token)
    return r
  }
/*
  monitorsLoop = async types => {

    const promises = types.map(async type => {
      const resp = await this.fetchMonitorsByType(type)
      resp.data.items.forEach(item => {
        Object.assign(item, {type: type});
      })
      return resp
    })

    const response = await Promise.all(promises)

    let list = []
    response.forEach(r => {
      r.data.items.forEach(m => {
       list.push(m)
      })
    })
    return list
  }

  fetchMonitorsByType = async (type) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        this.setState({error: error})
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/${type}/`, this.props.token)
    return r
  }
*/
  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
           this.props.authorizations && (this.props.authorizations.monitors_post || this.props.authorizations.any) ?
              <Add/>
            :
            null
          :
          null
        }

        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <List/>
          :
          <Alert message="Asset and Partition not set" type="error" />
        }


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors,
  monitorsFetch: state.f5.monitorsFetch
}))(Manager);
