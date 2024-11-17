import React from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Space, Table, Spin} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import {
  err
} from '../../concerto/store'

import Add from './add'
import Delete from './delete'

import {
  poolMembersFetch,
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
      if (!this.props.error) {
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
    await this.setState({poolMembersLoading: true})
    let members = await this.poolMembersGet(pool)
    await this.setState({poolMembersLoading: false})
    if (members.status && members.status !== 200) {
      let error = Object.assign(members, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMembersError'
      })
      this.props.dispatch(err(error))
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
      let error = Object.assign(enable, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberEnableError'
      })
      this.props.dispatch(err(error))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      this.props.dispatch(err(error))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      this.props.dispatch(err(error))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)

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
      let error = Object.assign(disable, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberDisableError'
      })
      this.props.dispatch(err(error))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      this.props.dispatch(err(error))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      this.props.dispatch(err(error))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)

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
      let error = Object.assign(forceOffline, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberForceOfflineError'
      })
      this.props.dispatch(err(error))
    }

    let fetchedMember = await this.poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      this.props.dispatch(err(error))
    }

    let memberStats = await this.poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      members = JSON.parse(JSON.stringify(this.state.members))
      members[index].isLoading = false
      await this.setState({members: members})
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      this.props.dispatch(err(error))
    }

    await this.refreshStats(member, memberStats)

    let sas = await this.statusAndSession(member, fetchedMember.state, fetchedMember.session, memberStats.parentState)

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
      },
      error => {
        r = error
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
        error = Object.assign(error, {
          component: 'poolmembers',
          vendor: 'f5',
          errorType: 'poolMemberStatsIntervalError'
        })
        this.props.dispatch(err(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/stats/`, this.props.token)
  }

  refreshStats = async (memb, data ) => {
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

  authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
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
            { (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'poolMember_delete')) ? 
              <Delete name={name} obj={obj} poolName={this.props.obj.name} />
            :
              '-'
            }
          </Space>
        ),
      }
    ];

    let errors = () => {
      if (this.props.error && this.props.error.component === 'poolmembers') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }

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
          maskClosable={false}
        >
          { ((this.props.asset) && (this.props.asset.id && this.props.partition) ) ?
             (this.authorizatorsSA(this.props.authorizations) || this.isAuthorized(this.props.authorizations, 'f5', 'poolMembers_post')) ? 
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

          { this.state.poolMembersLoading ?
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

        {errors()}

      </Space>
    );
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  authorizations: state.authorizations,
  error: state.concerto.err,

  asset: state.f5.asset,
  partition: state.f5.partition,

  poolMembers: state.f5.poolMembers,
  poolMembersFetch: state.f5.poolMembersFetch,
}))(PoolDetails);
