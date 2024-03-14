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
  irulesLoading,
  irules,
  irulesFetch,
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
        this.props.dispatch(irulesFetch(false))
        if (!this.props.irules) {
          this.irulesGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.partition && !prevProps.error && !this.props.error) ) {
      if (!this.props.irules) {
        this.irulesGet()
      }
      if (this.props.irulesFetch) {
        this.irulesGet()
        this.props.dispatch(irulesFetch(false))
      }
      if ( ((prevProps.partition !== this.props.partition) && (this.props.partition !== null)) ) {
        this.irulesGet()
      }
    }
  }

  componentWillUnmount() {
  }


  irulesGet = async () => {
    this.props.dispatch(irulesLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(irules(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'irules',
          vendor: 'f5',
          errorType: 'irulesError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/irules/`, this.props.token)
    this.props.dispatch(irulesLoading(false))
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
      if (this.props.error && this.props.error.component === 'irules') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'irules_post')) ? 
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

  irules: state.f5.irules,
  irulesFetch: state.f5.irulesFetch,
}))(Manager);
