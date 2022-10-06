import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Space, Alert } from 'antd'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  groupsLoading,
  groups,
  groupsFetch,
  groupsError
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
    if (this.props.asset && this.props.domain) {
      if (!this.props.groupsError) {
        this.props.dispatch(groupsFetch(false))
        if (!this.props.groups) {
          this.groupsGet()
        }
      }
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (this.props.asset && this.props.domain && !this.props.groupsError) ) {
      if (!this.props.groups) {
        this.groupsGet()
      }
      if (this.props.groupsFetch) {
        this.groupsGet()
        this.props.dispatch(groupsFetch(false))
      }
      if ( ((prevProps.domain !== this.props.domain) && (this.props.domain !== null)) ) {
        this.groupsGet()
      }
    }
  }

  componentWillUnmount() {
  }


  groupsGet = async () => {
    this.props.dispatch(groupsLoading(true))
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(groups(resp))
      },
      error => {
        this.props.dispatch(groupsError(error))
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/groups/?local`, this.props.token)
    this.props.dispatch(groupsLoading(false))
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <br/>
        { ((this.props.asset) && (this.props.asset.id && this.props.domain) ) ?
          <React.Fragment>
            {this.props.authorizations && (this.props.authorizations.groups_post || this.props.authorizations.any) ?
              <Add/>
            :
              null
            }
            <List/>
          </React.Fragment>
        :
          <Alert message="Asset and Domain not set" type="error" />
        }

        <React.Fragment>
          { this.props.groupsError ? <Error component={'group manager'} error={[this.props.groupsError]} visible={true} type={'groupsError'} /> : null }
        </React.Fragment>
      </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.checkpoint,

  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,

  groups: state.checkpoint.groups,
  groupsFetch: state.checkpoint.groupsFetch,
  groupsError: state.checkpoint.groupsError
}))(Manager);
