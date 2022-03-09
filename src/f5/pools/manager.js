import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  poolsLoading,
  pools,
  poolsFetch,
  poolsError,

  monitorTypes,
  monitorTypesError,

  monitorsLoading,
  monitors,
  monitorsError
} from '../store.f5'

import List from './list'
import Add from './add'



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    if (this.props.asset && this.props.partition) {
      if (!this.props.poolsError) {
        this.props.dispatch(poolsFetch(false))
        if (!this.props.pools) {
          this.poolsGet()
          this.monitorsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.partition) {
      if (!this.props.pools) {
        this.poolsGet()
        this.monitorsGet()
      }
      if (this.props.poolsFetch) {
        this.poolsGet()
        this.monitorsGet()
        this.props.dispatch(poolsFetch(false))
      }
      if ( (prevProps.partition !== this.props.partition) && (this.props.partition !== null) ) {
          this.poolsGet()
          this.monitorsGet()
      }
    }
  }

  componentWillUnmount() {
  }

  monitorsGet = async () => {
    this.props.dispatch(monitorsLoading(true))

    let monTypes = await this.monitorsTypeListGet()

    if (monTypes.status && monTypes.status !== 200 ) {
      this.props.dispatch(monitorTypesError(monTypes))
    }
    else {
      this.props.dispatch(monitorTypes(monTypes.data.items))
    }


    let mons = await this.monitorsAnyGet()

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

  monitorsTypeListGet = async () => {
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

  monitorsAnyGet = async () => {
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


  poolsGet = async () => {
    this.props.dispatch(poolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(pools(resp))
      },
      error => {
        this.props.dispatch(poolsError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
    this.props.dispatch(poolsLoading(false))
  }

  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.pools_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }

        <React.Fragment>
          { this.props.poolsError ? <Error component={'pools manager'} error={[this.props.poolsError]} visible={true} type={'poolsError'} /> : null }
          { this.props.monitorTypesError ? <Error component={'pools manager'} error={[this.props.monitorTypesError]} visible={true} type={'monitorTypesError'} /> : null }
          { this.props.monitorsError ? <Error component={'pools manager'} error={[this.props.monitorsError]} visible={true} type={'monitorsError'} /> : null }
        </React.Fragment>
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  pools: state.f5.pools,
  poolsFetch: state.f5.poolsFetch,
  poolsError: state.f5.poolsError,
  monitorTypes: state.f5.monitorTypes,
  monitorTypesError: state.f5.monitorTypesError,
  monitorsError: state.f5.monitorsError
}))(Manager);
