import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  irulesLoading,
  irules,
  irulesFetch,
  irulesError
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
      if (!this.props.irulesError) {
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
    if ( (this.props.asset && this.props.partition && !prevProps.irulesError && !this.props.irulesError) ) {
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
        this.props.dispatch(irulesError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/irules/`, this.props.token)
    this.props.dispatch(irulesLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.irules_post || this.props.authorizations.any) ?
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
          { this.props.irulesError ? <Error component={'irule manager'} error={[this.props.irulesError]} visible={true} type={'irulesError'} /> : null }
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

  irules: state.f5.irules,
  irulesFetch: state.f5.irulesFetch,
  irulesError: state.f5.irulesError
}))(Manager);
