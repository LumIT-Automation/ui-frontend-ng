import React from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Space, Table, Spin} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'
import Add from './add'
import Delete from './delete'

import {
  poolMembersLoading,
  poolMembersFetch,
  poolMembersError,

  poolMemberEnableError,
  poolMemberDisableError,
  poolMemberForceOfflineError,
  poolMemberStatsError
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const memberIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />

class PoolDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      members: [],
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.visible) {
      if (!this.props.poolMembersError) {
        if (this.props.poolMembersFetch) {
          this.props.dispatch(poolMembersFetch(false))
          this.main(this.props.obj)
        }
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
        if (m.state === 'up' && m.session === 'monitor-enabled' && m.parentState === 'enabled') {
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
        console.log('resp', resp.data.items)
        r = resp.data.items
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${pool.name}/members/`, this.props.token)
    return r
  }




  statusAndSession = async (member, state, session, parentState) => {
    console.log(member)
    console.log(state)
    console.log(session)
    console.log(parentState)
    let members = JSON.parse(JSON.stringify(this.state.members))

    const index = this.state.members.findIndex(m => {
      return m.name === member.name
    })

    members[index].state = state
    members[index].session = session
    members[index].parentState = parentState

    if (state === 'up' && session === 'monitor-enabled' && parentState === 'enabled') {
      members[index].status = 'enabled'
      members[index].color = '#90ee90'
    }
    else if (state === 'up' && session === 'user-disabled') {
      members[index].status = 'disabled'
      members[index].color = 'black'
    }
    else if (state === 'checking' && session === 'user-disabled') {
      members[index].status = 'checking'
      members[index].color = 'blue'
    }
    else if (state === 'down' && session === 'monitor-enabled') {
      members[index].status = 'checking'
      members[index].color = 'red'
    }
    else if (state === 'down' && session === 'user-enabled') {
      members[index].status = 'rechecking'
      members[index].color = 'blue'
    }
    else if (state === 'user-down' && session === 'user-disabled') {
      members[index].status = 'force offline'
      members[index].color = 'black'
    }
    else {
      members[index].status = 'other'
      members[index].color = 'grey'
    }

    this.setState({members: members})
    return members
  }


  poolMemberEnableHandler = async (member) => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    const index = this.state.members.findIndex(m => {
      return m.name === member.name
    })

    members[index].isLoading = true
    await this.setState({members: members})

    let enable = await this.poolMemberEnable(member.name)
    if (enable.status && enable.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberEnableError(enable))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberEnableError(fetchedMember))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberStatsError(memberStats))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)
    console.log(sas)

    members = JSON.parse(JSON.stringify(this.state.members))
    members[index].isLoading = false
    await this.setState({members: members})
  }

  poolMemberDisableHandler = async (member) => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    const index = this.state.members.findIndex(m => {
      return m.name === member.name
    })

    members[index].isLoading = true
    await this.setState({members: members})

    let disable = await this.poolMemberDisable(member)
    if (disable.status && disable.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberDisableError(disable))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberEnableError(fetchedMember))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberStatsError(memberStats))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)
    console.log(sas)

    members = JSON.parse(JSON.stringify(this.state.members))
    members[index].isLoading = false
    await this.setState({members: members})
  }

  poolMemberForceOfflineHandler = async (member) => {
    let members = JSON.parse(JSON.stringify(this.state.members))
    const index = this.state.members.findIndex(m => {
      return m.name === member.name
    })

    members[index].isLoading = true
    await this.setState({members: members})

    let forceOffline = await this.poolMemberForceOffline(member)
    if (forceOffline.status && forceOffline.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberForceOfflineError(forceOffline))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberEnableError(fetchedMember))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      this.props.dispatch(poolMemberStatsError(memberStats))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)
    console.log(sas)

    members = JSON.parse(JSON.stringify(this.state.members))
    members[index].isLoading = false
    await this.setState({members: members})
  }

  poolMemberEnable = async (memberName) => {
    let r
    let b = {}
    b.data = {
      "state": "user-up",
      "session":"user-enabled"
    }

    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${memberName}/`, this.props.token, b)
    return r
  }

  poolMemberDisable = async (member) => {
    let r
    let b = {}
    b.data = {
      "state":"user-up",
      "session":"user-disabled"
    }

    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b )
    return r
  }

  poolMemberForceOffline = async (member) => {
    let r
    let b = {}
    b.data = {
      "state":"user-down",
      "session":"user-disabled"
    }

    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b )
    return r
  }

  poolMemberGet = async member => {
    let r
    let rest = new Rest(
      'GET',
      resp => {
        r = resp.data
      },
      error => {
        r = error
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token)
    return r
  }



  //MONITORING
  monitoringToggle = (memb) => {
    const index = this.state.members.findIndex(m => {
      return m.name === memb.name
    })
    const members = JSON.parse(JSON.stringify(this.state.members))
    const isMonitored = members[index].isMonitored
    let list = []


    if (!isMonitored) {
      const member = members[index]

      this.interval = setInterval( () => this.poolMemberStatsInterval(member), 3000)

      const memberModified = Object.assign(member, {
        isMonitored: true,
        intervalId: this.interval
      })

      list = members.map( m => {
        if (m.name === memberModified.name) {
          return memberModified
        }
        return m
      })
    }
    else {
      const member = members[index]

      clearInterval(member.intervalId)

      const memberModified = Object.assign(member, {
        isMonitored: false,
        intervalId: null
      })

      list = members.map( m => {
        if (m.name === memberModified.name) {
          return memberModified
        }
        return m
      })
    }
    this.setState({members: list})
  }

  poolMemberStats = async member => {
    let r
    let rest = new Rest(
      'GET',
      resp => {
        r = resp.data
        //this.refreshStats(member, resp.data)
      },
      error => {
        r = error
        //this.props.dispatch(poolMemberStatsError(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/stats/`, this.props.token)
    return r
  }

  poolMemberStatsInterval = async member => {
    let rest = new Rest(
      'GET',
      resp => {
        this.refreshStats(member, resp.data)
      },
      error => {
        this.props.dispatch(poolMemberStatsError(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/stats/`, this.props.token)
  }

  refreshStats = async (memb, data ) => {
    console.log(memb)
    console.log(data)
    const index = this.state.members.findIndex(m => {
      return m.name === memb.name
    })

    const members =  Object.assign([], this.state.members)
    const member = members[index]

    const memberModified = Object.assign(member, {connections: data.serverside_curConns, parentState: data.parentState})

    const list = members.map( m => {
      if (m.name === memberModified.name) {
        return memberModified
      }
      return m
    })

    this.poolMembersGet(this.props.obj, this.props.asset.id)
    await this.setState({members: list})
  }


  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      members: [],
    })
    this.state.members.forEach( m => {
      clearInterval(m.intervalId)
    })
  }




  render() {
    const columns = [
      {
        title: 'Loading',
        align: 'center',
        dataIndex: 'loading',
        key: 'loading',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isLoading ? <Spin indicator={memberIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },
      {
        title: 'Member',
        align: 'center',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Address',
        align: 'center',
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: 'State',
        align: 'center',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: 'Session',
        align: 'center',
        dataIndex: 'session',
        key: 'session',
      },
      {
        title: 'Member State',
        align: 'center',
        dataIndex: 'parentState',
        key: 'parentState',
      },
      {
        title: 'Status',
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render(name, record) {
          return {
            props: {
              style: { margin: 0, alignItems: 'center', justifyContent: 'center' }
            },
            children: <div title={record.status} style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: record.color, margin: '0 auto', padding: 0}}></div>
          };
        }
      },
      {
        title: 'Enable',
        align: 'center',
        dataIndex: 'enable',
        key: 'enable',
        render: (name, obj)  => (
          <Space size="small">
          { obj.isLoading || obj.isMonitored ?
            <Button type="primary" disabled>
              Enable
            </Button>
            :
            <Button type="primary" onClick={() => this.poolMemberEnableHandler(obj)}>
              Enable
            </Button>
          }
          </Space>
        ),
      },
      {
        title: 'Disable',
        align: 'center',
        dataIndex: 'disable',
        key: 'disable',
        render: (name, obj)  => (
          <Space size="small">
          { obj.isLoading || obj.isMonitored ?
            <Button type="primary" disabled>
              Disable
            </Button>
            :
            <Button type="primary" onClick={() => this.poolMemberDisableHandler(obj)}>
              Disable
            </Button>
          }
          </Space>
        ),
      },
      {
        title: 'Force Offline',
        align: 'center',
        dataIndex: 'foff',
        key: 'foff',
        render: (name, obj)  => (
          <Space size="small">
          { obj.isLoading || obj.isMonitored ?
            <Button type="primary" disabled>
              Force Offline
            </Button>
            :
            <Button type="primary" onClick={() => this.poolMemberForceOfflineHandler(obj)}>
              Force Offline
            </Button>
          }
          </Space>
        ),
      },
      {
        title: 'Connections',
        align: 'center',
        dataIndex: 'connections',
        key: 'connections',
      },
      {
        title: '',
        align: 'center',
        dataIndex: 'monitoring',
        key: 'monitoring',
        render: (name, obj)  => (
          <Space size="small">
            {obj.isMonitored ? <Spin indicator={memberIcon} style={{margin: '10% 10%'}}/> : null }
          </Space>
        ),
      },/*
      {
        title: "Amount",
        dataIndex: "amount",
        width: 100,
        render(text, record) {
          return {
            props: {
              style: { background: 51 > 50 ? "red" : "green" }
            },
            children: <div>{text}</div>
          };
        }
      },*/
      {
        title: 'Monitoring',
        align: 'center',
        dataIndex: 'monitoring',
        key: 'monitoring',
        render: (name, obj)  => (
          <Space size="small">
            <Button type="primary" onClick={() => this.monitoringToggle(obj)}>
              { obj.isMonitored ? 'STOP' : 'START' }
            </Button>
          </Space>
        ),
      },
      {
        title: 'Remove',
        align: 'center',
        dataIndex: 'delete',
        key: 'delete',
        render: (name, obj)  => (
          <Space size="small">
            { this.props.authorizations && (this.props.authorizations.poolMember_delete || this.props.authorizations.any) ?
              <Delete name={name} obj={obj} poolName={this.props.obj.name} />
            :
              '-'
            }
          </Space>
        ),
      }
    ];

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        <Button type="primary" onClick={() => this.details()}>
          Pool Members
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
              <React.Fragment>
                <br/>
                <Add obj={this.props.obj}/>
                <br/>
                <br/>
              </React.Fragment>
              :
              null
            :
            null
          }

          { this.props.poolMembersLoading ?
              <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/>
            :
              <Table
                dataSource={this.state.members}
                columns={columns}
                pagination={false}
                rowKey="name"
                scroll={{x: 'auto'}}
              />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.nodesError ? <Error component={'poolList '} error={[this.props.nodesError]} visible={true} type={'nodesError'} /> : null }
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
    );
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations.f5,

  asset: state.f5.asset,
  partition: state.f5.partition,

  poolMembers: state.f5.poolMembers,
  poolMembersLoading: state.f5.poolMembersLoading,
  poolMembersFetch: state.f5.poolMembersFetch,
  poolMembersError: state.f5.poolMembersError,

  poolMemberEnableError: state.f5.poolMemberEnableError,
  poolMemberDisableError: state.f5.poolMemberDisableError,
  poolMemberForceOfflineError: state.f5.poolMemberForceOfflineError,
  poolMemberStatsError: state.f5.poolMemberStatsError,

}))(PoolDetails);
