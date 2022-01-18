import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import { monitorTypes, monitorTypesError, monitorsLoading, monitors, monitorsFetch, monitorsError } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Alert } from 'antd'



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
      if (!this.props.monitorsError) {
        this.props.dispatch(monitorsFetch(false))
        if (!this.props.monitors) {
          this.fetchMonitors()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition) && (prevProps.partition !== this.props.partition) ) {
      if (!this.props.monitors) {
        this.fetchMonitors()
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.fetchMonitors()
      }

    }
    if (this.props.asset && this.props.partition) {
      if (this.props.monitorsFetch) {
        this.fetchMonitors()
        this.props.dispatch(monitorsFetch(false))
      }
    }
  }

  componentWillUnmount() {
  }

  fetchMonitors = async () => {
    this.props.dispatch(monitorsLoading(true))

    let monTypes = await this.fetchMonitorsTypeList()

    if (monTypes.status && monTypes.status !== 200 ) {
      this.props.dispatch(monitorTypesError(monTypes))
    }
    else {
      this.props.dispatch(monitorTypes(monTypes.data.items))
    }


    let mons = await this.fetchMonitorsAny()

    if (mons.status && mons.status !== 200 ) {
      this.props.dispatch(monitorsError(mons))
      this.props.dispatch(monitorsLoading(false))
    }
    else {
      let list = []

      for (let t in mons.data) {
        let type = t
        let values = Object.values(mons.data[t])

        values.forEach(o => {
          o.forEach(m => {
            Object.assign(m, {type: type});
            list.push(m)
          })
        })
      }

      this.props.dispatch(monitorsLoading(false))
      this.props.dispatch(monitors(list))
    }

  }

  fetchMonitorsTypeList = async () => {
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
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/monitors/ANY/`, this.props.token)
    return r
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


        <React.Fragment>
          { this.props.monitorTypesError ? <Error component={'manager monitors'} error={[this.props.monitorTypesError]} visible={true} type={'monitorTypesError'} /> : null }
          { this.props.monitorsError ? <Error component={'manager monitors'} error={[this.props.monitorsError]} visible={true} type={'monitorsError'} /> : null }
        </React.Fragment>
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  monitors: state.f5.monitors,
  monitorsFetch: state.f5.monitorsFetch,
  monitorsError: state.f5.monitorsError,
  monitorTypesError: state.f5.monitorTypesError
}))(Manager);
