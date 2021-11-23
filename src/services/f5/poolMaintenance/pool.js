import React from 'react';
import { connect } from 'react-redux'
import Rest from "../../../_helpers/Rest";
import Error from '../../../error/f5Error'

import {
  setPoolMembers,
  setPoolMembersError,

  enableMemberError,
  disableMemberError,
  forceOfflineMemberError,
  memberStatsError

} from '../../../_store/store.f5'

import { Modal, Button, Space, Table, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />



class PoolDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      currentMembers: [],
      renderedMembers: [],
      error: null
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.poolMembers !== prevProps.poolMembers) {
      this.setcurrentMembers()
    }
    if (this.state.currentMembers !== prevState.currentMembers) {
      this.setRenderedMembers()
    }
  }

  componentWillUnmount() {
  }


  details = (pool) => {
    this.setState({visible: true})
    this.fetchPoolMembers(pool)
  }

  fetchPoolMembers = async (pool) => {
    let rest = new Rest(
      "GET",
      resp => {
        this.props.dispatch(setPoolMembers(resp))
      },
      error => {
        this.props.dispatch(setPoolMembersError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${pool.name}/members/`, this.props.token)
  }

  setcurrentMembers = () => {

    if (this.state.renderedMembers.length === 0) {

      const fetch = JSON.parse(JSON.stringify(this.props.poolMembers))

      //const fetch = Object.assign([], this.props.poolMembers);

      const current = fetch.map( m => {
        let n =  Object.assign( {
            connections: 0,
            isMonitored: false,
            isLoading: false,
            intervalId: null
          }, m);
        return n
      })
      this.setState({currentMembers: current})

    } else {

      const fetch = JSON.parse(JSON.stringify(this.props.poolMembers))
      const current = JSON.parse(JSON.stringify(this.state.currentMembers))
      //const current = Object.assign([], this.state.currentMembers);

      const newCurrent = current.map( m => {
        let fetched = fetch.find(f => m.name === f.name);
        let n = Object.assign(m, fetched)
          return n
      })
      this.setState({currentMembers: newCurrent})
      }
  }

  setRenderedMembers = () => {
    const current = Object.assign([], this.state.currentMembers);
    let n

    const newCurrent = current.map( m => {
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

    this.setState({renderedMembers: newCurrent})
  }



  //ENABLE, DISABLE, FORCE OFFLINE
  enableMemberHandler = async (member) => {
    const members = JSON.parse(JSON.stringify(this.state.currentMembers))
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === member.name
    })
    members[index].isLoading = true
    await this.setState({currentMembers: members})

    let enable = await this.enableMember(member)
    members[index].isLoading = false

    if (enable.status && enable.status !== 200) {
      this.props.dispatch(enableMemberError(enable))
      return
    }

    await this.setState({currentMembers: members})

    this.fetchPoolMembers(this.props.obj, this.props.asset.id)
  }

  disableMemberHandler = async (member) => {
    const members = JSON.parse(JSON.stringify(this.state.currentMembers))
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === member.name
    })
    members[index].isLoading = true
    await this.setState({currentMembers: members})

    let disable = await this.disableMember(member)
    members[index].isLoading = false

    if (disable.status && disable.status !== 200) {
      this.props.dispatch(disableMemberError(disable))
      return
    }

    await this.setState({currentMembers: members})

    this.fetchPoolMembers(this.props.obj, this.props.asset.id)
  }

  forceOfflineMemberHandler = async (member) => {
    const members = JSON.parse(JSON.stringify(this.state.currentMembers))
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === member.name
    })
    members[index].isLoading = true
    await this.setState({currentMembers: members})

    let forceOffline = await this.forceOfflineMember(member)
    members[index].isLoading = false

    if (forceOffline.status && forceOffline.status !== 200) {
      this.props.dispatch(forceOfflineMemberError(forceOffline))
      return
    }
    await this.setState({currentMembers: members})

    this.fetchPoolMembers(this.props.obj, this.props.asset.id)
  }

  enableMember = async (member) => {
    let r
    const b = { "data": { "state": "user-up", "session":"user-enabled" } }
    let rest = new Rest(
      "PATCH",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, b)
    return r
  }

  disableMember = async (member) => {
    let r
    const b = {"data":{"state":"user-up", "session":"user-disabled"}}
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

  forceOfflineMember = async (member) => {
    let r
    const b = {"data":{"state":"user-down", "session":"user-disabled"}}
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



  //MONITORING
  monitoringToggle = (memb) => {
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === memb.name
    })
    const members = JSON.parse(JSON.stringify(this.state.currentMembers))
    //const members =  Object.assign([], this.state.currentMembers)
    const isMonitored = members[index].isMonitored
    let list = []


    if (!isMonitored) {
      const member = members[index]

      this.interval = setInterval( () => this.memberStats(member), 3000)

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
    this.setState({currentMembers: list})
  }

  memberStats = async member => {
    let rest = new Rest(
      'GET',
      resp => {
        this.refreshStats(member, resp.data)
      },
      error => {
        this.props.dispatch(memberStatsError(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/stats/`, this.props.token)
  }

  refreshStats = (memb, data ) => {
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === memb.name
    })

    const members =  Object.assign([], this.state.currentMembers)
    const member = members[index]

    const memberModified = Object.assign(member, {connections: data.serverside_curConns})

    const list = members.map( m => {
      if (m.name === memberModified.name) {
        return memberModified
      }
      return m
    })

    this.fetchPoolMembers(this.props.obj, this.props.asset.id)
    this.setState({currentMembers: list})
  }


  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      currentMembers: [],
      renderedMembers: [],
    })
    this.state.currentMembers.map( m => {
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
            {obj.isLoading ? <Spin indicator={antIcon} style={{margin: '10% 10%'}}/> : null }
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
          { obj.isLoading ?
            <Button type="primary" disabled>
              Enable
            </Button>
            :
            <Button type="primary" onClick={() => this.enableMemberHandler(obj)}>
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
          { obj.isLoading ?
            <Button type="primary" disabled>
              Disable
            </Button>
            :
            <Button type="primary" onClick={() => this.disableMemberHandler(obj)}>
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
          { obj.isLoading ?
            <Button type="primary" disabled>
              Force Offline
            </Button>
            :
            <Button type="primary" onClick={() => this.forceOfflineMemberHandler(obj)}>
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
            {obj.isMonitored ? <Spin indicator={antIcon} style={{margin: '10% 10%'}}/> : null }
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
    ];

    return (
      <Space>
        <Button type="primary" onClick={() => this.details(this.props.obj)}>
          Show Details
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

          <Table
            dataSource={this.state.renderedMembers}
            columns={columns}
            pagination={false}
            rowKey="name"
            scroll={{x: 'auto'}}
            //rowClassName={(record, index) => (record.isMonitored ? "red" : "green")}
          />
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.poolMembersError ? <Error component={'poolMaint pool'} error={[this.props.poolMembersError]} visible={true} type={'setPoolMembersError'} /> : null }
            { this.props.enableMemberError ? <Error component={'poolMaint pool'} error={[this.props.enableMemberError]} visible={true} type={'enableMemberError'} /> : null }
            { this.props.disableError ? <Error component={'poolMaint pool'} error={[this.props.disableError]} visible={true} type={'disableError'} /> : null }
            { this.props.forceOfflineMemberError ? <Error component={'poolMaint pool'} error={[this.props.forceOfflineMemberError]} visible={true} type={'forceOfflineMemberError'} /> : null }
            { this.props.memberStatsError ? <Error component={'poolMaint pool'} error={[this.props.memberStatsError]} visible={true} type={'memberStatsError'} /> : null }

          </React.Fragment>
        :
          null
        }

      </Space>
    );
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,

  asset: state.f5.asset,
  partition: state.f5.partition,

  poolMembers: state.f5.poolMembers,
  poolMembersError: state.f5.poolMembersError,

  enableMemberError: state.f5.enableMemberError,
  disableError: state.f5.disableMemberError,
  forceOfflineMemberError: state.f5.forceOfflineMemberError,
  memberStatsError: state.f5.memberStatsError,

}))(PoolDetails);
