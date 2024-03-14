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
  profilesLoading,
  profiles,
  profilesFetch,
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
        this.props.dispatch(profilesFetch(false))
        if (!this.props.profiles) {
          this.profilesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
      if (!this.props.profiles) {
        this.profilesGet()
      }
      if (this.props.profilesFetch) {
        this.profilesGet()
        this.props.dispatch(profilesFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.profilesGet()
      }
    }
  }

  componentWillUnmount() {
  }

  profilesGet = async () => {
    this.props.dispatch(profilesLoading(true))

    let profs = await this.profilesAnyGet()

    if (profs.status && profs.status !== 200 ) {
      let error = Object.assign(profs, {
        component: 'profileManager',
        vendor: 'f5',
        errorType: 'profilesError'
      })
      this.props.dispatch(err(error))
      this.props.dispatch(profilesLoading(false))
    }
    else {
      let list = []

      for (let t in profs.data) {
        let type = t
        let values = Object.values(profs.data[t])

        values.forEach(o => {
          o.forEach(p => {
            Object.assign(p, {type: type});
            list.push(p)
          })
        })
      }

      this.props.dispatch(profilesLoading(false))
      this.props.dispatch(profiles(list))
    }

  }

  profilesAnyGet = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/ANY/`, this.props.token)
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
      if (this.props.error && this.props.error.component === 'profileManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'profiles_post')) ? 
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

  profiles: state.f5.profiles,
  profilesFetch: state.f5.profilesFetch,
}))(Manager);
