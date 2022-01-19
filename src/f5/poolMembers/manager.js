import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import {
  poolMembersLoading,
  poolMembers,
  poolMembersFetch,
  poolMembersError
} from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Space, Spin, Alert } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchedColumn: '',
      error: null
    };
  }

  componentDidMount() {
    if (this.props.obj) {
      this.props.dispatch(poolMembersLoading(true))
      this.fetchPoolMembers(this.props.obj.name)
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.poolMembersFetch  === true) {
      this.props.dispatch(poolMembersLoading(true))
      this.fetchPoolMembers(this.props.obj.name)
      this.props.dispatch(poolMembersFetch(false))
    }
  }

  componentWillUnmount() {
  }


  fetchPoolMembers = async (name) => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(poolMembersLoading(false))
        this.setState({error: false}, () => this.props.dispatch(poolMembers(resp)))
      },
      error => {
        this.props.dispatch(poolMembersLoading(false))
        this.props.dispatch(poolMembersError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${name}/members/`, this.props.token)
  }


  render() {
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
         this.props.authorizations && (this.props.authorizations.poolMembers_post || this.props.authorizations.any) ?
          <div>
            <br/>
            <Add obj={this.props.obj}/>
          </div>
          :
          null
        :
        null
      }

      { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
        this.props.poolMembersLoading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> : <List obj={this.props.obj}/>
        :
        <Alert message="Asset and Partition not set" type="error" />
      }

      <React.Fragment>
        { this.props.poolMembersError ? <Error component={'poolMembers manager'} error={[this.props.poolMembersError]} visible={true} type={'poolMembersError'} /> : null }
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
  poolMembersLoading: state.f5.poolMembersLoading,
  poolMembersFetch: state.f5.poolMembersFetch,
  poolMembersError: state.f5.poolMembersError
}))(Manager);
