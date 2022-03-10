import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  poolMembersLoading,
  poolMembers,
  poolMembersFetch,
  poolMembersError
} from '../store.f5'

import List from './list'
import Add from './add'

import { Space, Spin, Alert, Button, Modal } from 'antd'
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
  }

  shouldComponentUpdate(newProps, newState) {
      return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if (this.props.poolMembersFetch) {
        console.log('manager didupdate')
        this.main(this.props.obj)
      }
    }
  }

  componentWillUnmount() {
  }

  details = () => {
    this.setState({visible: true})
    this.main(this.props.obj)
  }

  main = async(pool) => {
    this.props.dispatch(poolMembersLoading(true))
    let members = await this.poolMembersGet(pool)
    this.props.dispatch(poolMembersLoading(false))
    if (members.status && members.status !== 200) {
      this.props.dispatch(poolMembersError(members))
    }
    else {
      const membersConn = members.map( m => {
        let n =  Object.assign( {
            connections: 0,
            isMonitored: false,
            isLoading: false,
            intervalId: null
          }, m);
        return n
      })

      const membersState = membersConn.map( m => {
        let n
        if (m.state === 'up' && m.session === 'monitor-enabled') {
          n = Object.assign(m, {status: 'enabled', color: '#90ee90'})
        }
        else if (m.state === 'up' && m.session === 'user-disabled') {
          n = Object.assign(m, {status: 'disabled', color: 'black'})
        }
        else if (m.state === 'checking' && m.session === 'user-disabled') {
          n = Object.assign(m, {status: 'checking', color: 'blue'})
        }
        else if (m.state === 'down' && m.session === 'monitor-enabled') {
          n = Object.assign(m, {status: 'checking', color: 'red'})
        }
        else if (m.state === 'down' && m.session === 'user-enabled') {
          n = Object.assign(m, {status: 'rechecking', color: 'blue'})
        }
        else if (m.state === 'user-down' && m.session === 'user-disabled') {
          n = Object.assign(m, {status: 'Force offline', color: 'black'})
        }
        else {
          n = Object.assign(m, {status: 'other', color: 'grey' })
        }
        return n
      })

      this.setState({members: membersState})
    }
  }

  poolMembersGet = async (pool) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp.data.items
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${pool.name}/members/`, this.props.token)
    return r
  }


  render() {
    console.log(this.state.members)
    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
        <Button type="primary" onClick={() => this.details()}>
          Show Pool Members
        </Button>
        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.obj.name}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
        >

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
            this.props.poolMembersLoading ?
              <Spin indicator={antIcon} style={{margin: '10% 45%'}}/>
            :
              <List name={this.props.obj.name} poolMembers={this.state.members} />
          :
            <Alert message="Asset and Partition not set" type="error" />
          }
          </Modal>

          {this.state.visible ?
            <React.Fragment>
              { this.props.poolMembersError ? <Error component={'poolList '} error={[this.props.poolMembersError]} visible={true} type={'poolMembersError'} /> : null }
              { this.props.poolMemberEnableError ? <Error component={'poolList '} error={[this.props.poolMemberEnableError]} visible={true} type={'poolMemberEnableError'} /> : null }
              { this.props.poolMemberDisableError ? <Error component={'poolList '} error={[this.props.poolMemberDisableError]} visible={true} type={'poolMemberDisableError'} /> : null }
              { this.props.poolMemberForceOfflineError ? <Error component={'poolList '} error={[this.props.poolMemberForceOfflineError]} visible={true} type={'poolMemberForceOfflineError'} /> : null }
              { this.props.poolMemberStatsError ? <Error component={'poolList '} error={[this.props.poolMemberStatsError]} visible={true} type={'poolMemberStatsError'} /> : null }

            </React.Fragment>
          :
            null
          }

        </Space>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition,
  poolMembersLoading: state.f5.poolMembersLoading,
  poolMembersFetch: state.f5.poolMembersFetch,
  poolMembersError: state.f5.poolMembersError
}))(Manager);
