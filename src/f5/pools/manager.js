import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store'

import {
  poolsLoading,
  pools,
  poolsFetch,

  monitorsLoading,
  monitorTypes,  
  monitors,
} from '../store'

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
      if (!this.props.error) {
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
    if (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) {
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
      let error = Object.assign(monTypes, {
        component: 'poolManager',
        vendor: 'f5',
        errorType: 'monitorTypesError'
      })
      this.props.dispatch(err(error))
    }
    else {
      this.props.dispatch(monitorTypes(monTypes.data.items))
    }


    let mons = await this.monitorsAnyGet()

    if (mons.status && mons.status !== 200 ) {
      let error = Object.assign(mons, {
        component: 'poolManager',
        vendor: 'f5',
        errorType: 'monitorsError'
      })
      this.props.dispatch(err(error))
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
        error = Object.assign(error, {
          component: 'poolManager',
          vendor: 'f5',
          errorType: 'poolsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pools/`, this.props.token)
    this.props.dispatch(poolsLoading(false))
  }

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'poolManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'pools_post')) ? 
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
          {errors()}
        </React.Fragment>
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  pools: state.f5.pools,
  poolsFetch: state.f5.poolsFetch,
  monitorTypes: state.f5.monitorTypes,
}))(Manager);
