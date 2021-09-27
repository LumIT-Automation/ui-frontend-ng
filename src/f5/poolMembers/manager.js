import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"

import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setPoolMembersLoading, setPoolMembers, setPoolMembersFetchStatus } from '../../_store/store.f5'

import List from './list'
import Add from './add'

import { Table, Input, Button, Space, Spin, Alert } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;



/*

*/


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
      this.props.dispatch(setPoolMembersLoading(true))
      this.fetchPoolMembers(this.props.obj.name)
    }
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.poolMembersFetchStatus  === 'updated') {
      this.props.dispatch(setPoolMembersLoading(true))
      this.fetchPoolMembers(this.props.obj.name)
      this.props.dispatch(setPoolMembersFetchStatus(''))
    }
  }

  componentWillUnmount() {
  }

  resetError = () => {
    this.setState({ error: null})
  }


  fetchPoolMembers = async (name) => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setPoolMembersLoading(false))
        this.setState({error: false}, () => this.props.dispatch(setPoolMembers(resp)))
      },
      error => {
        this.setState({error: error}, () => this.props.dispatch(setPoolMembersLoading(false)))
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

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}
      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  poolMembersLoading: state.f5.poolMembersLoading,
  poolMembersFetchStatus: state.f5.poolMembersFetchStatus
}))(Manager);
