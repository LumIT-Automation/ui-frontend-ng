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
  monitorTypes,
  monitorsLoading,
  monitors,
  monitorsFetch,
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
        this.props.dispatch(monitorsFetch(false))
        if (!this.props.monitors) {
          this.monitorsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
      if (!this.props.monitors) {
        this.monitorsGet()
      }
      if (this.props.monitorsFetch) {
        this.monitorsGet()
        this.props.dispatch(monitorsFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.monitorsGet()
      }
    }
  }

  componentWillUnmount() {
  }

  monitorsGet = async () => {
    this.props.dispatch(monitorsLoading(true))

    let monTypes = await this.monitorsGetTypeList()

    if (monTypes.status && monTypes.status !== 200 ) {
      let error = Object.assign(monTypes, {
        component: 'monitor',
        vendor: 'f5',
        errorType: 'monitorTypesError'
      })
      this.props.dispatch(err(error))
    }
    else {
      this.props.dispatch(monitorTypes(monTypes.data.items))
    }


    let mons = await this.monitorsGetAny()

    if (mons.status && mons.status !== 200 ) {
      let error = Object.assign(mons, {
        component: 'monitor',
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

  monitorsGetTypeList = async () => {
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

  monitorsGetAny = async () => {
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
      if (this.props.error && this.props.error.component === 'monitor') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
           { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'monitors_post')) ? 
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

  monitors: state.f5.monitors,
  monitorsFetch: state.f5.monitorsFetch,
}))(Manager);
