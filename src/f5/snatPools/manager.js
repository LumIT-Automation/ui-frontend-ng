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
  snatPoolsLoading,
  snatPools,
  snatPoolsFetch,
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
        this.props.dispatch(snatPoolsFetch(false))
        if (!this.props.snatPools) {
          this.snatPoolsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
      if (!this.props.snatPools) {
        this.snatPoolsGet()
      }
      if (this.props.snatPoolsFetch) {
        this.snatPoolsGet()
        this.props.dispatch(snatPoolsFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.snatPoolsGet()
      }
    }
  }

  componentWillUnmount() {
  }


  snatPoolsGet = async () => {
    this.props.dispatch(snatPoolsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(snatPools(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'snatPoolManager',
          vendor: 'f5',
          errorType: 'snatPoolsError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/snatpools/`, this.props.token)
    this.props.dispatch(snatPoolsLoading(false))
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
      if (this.props.error && this.props.error.component === 'snatPoolManager') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'snatPools_post')) ? 
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Partition not set" type="error" />
        }

        {errors()}

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

  snatPools: state.f5.snatPools,
  snatPoolsFetch: state.f5.snatPoolsFetch,
}))(Manager);
