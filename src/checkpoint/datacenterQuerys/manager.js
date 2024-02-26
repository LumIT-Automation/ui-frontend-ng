import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'

import {
  err
} from '../../concerto/store'

import {
  datacenterQuerysLoading,
  datacenterQuerys,
  datacenterQuerysFetch,
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
    this.setState({moun: true})
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.asset && this.props.domain && this.props.datacenterQuerysFetch) {
      this.datacenterQuerysGet()
    }
    else if (this.props.asset && this.props.domain && (prevProps.domain !== this.props.domain)) {
      this.datacenterQuerysGet()
    }
    else if (this.props.asset && this.props.domain && !prevProps.error && !this.props.error) {
      if (!this.props.datacenterQuerys) {
        this.datacenterQuerysGet()
      }
    }
    else {}
  }

  componentWillUnmount() {
    this.setState({moun: false})
  }

  datacenterQuerysGet = async () => {
    this.props.dispatch(datacenterQuerysFetch(false))
    this.props.dispatch(datacenterQuerysLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(datacenterQuerys(resp))
      },
      error => {
        error = Object.assign(error, {
          component: 'datacenterQuerys',
          vendor: 'checkpoint',
          errorType: 'datacenterQuerysError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/datacenter-queries/?local`, this.props.token)
    this.props.dispatch(datacenterQuerysLoading(false))
  }


  render() {

    let errors = () => {
      if (this.props.error && this.props.error.component === 'datacenterQuerys') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.datacenterQuerys_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Domain not set" type="error" />
        }

        {errors()}

      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,
  error: state.concerto.err,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  datacenterQuerys: state.checkpoint.datacenterQuerys,
  datacenterQuerysFetch: state.checkpoint.datacenterQuerysFetch,
}))(Manager);
