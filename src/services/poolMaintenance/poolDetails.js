import React from 'react';
import { connect } from 'react-redux'
import Rest from "../../_helpers/Rest";
import Error from '../../error'

import { setError } from '../../_store/store.error'

import { Modal, Button, Space, Table, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 25 }} spin />;


/*
This is the PoolDetails Component.
It is a table of pool member in a modal which reders:

  Member
  Address
  State
  Session
  Status
  Enable
  Disable
  Force
  Offline
  Connections
  Monitoring

It receives from redux store token, asset and partition.

When user click on button Details of PoolsTable (the father component, or genitore 2 :-) ) the function details() sets the modal state.visible true, than calls fetchPoolMembers().
fetchPoolMembers() calls `/backend/f5/${this.props.asset.id}/${this.props.partition}/pool/${pool.name}/members/`
on succes calls this.setFetchedMembers() that update this.state.fetchedMembers
When this.state.fetchedMembers changes componentDidUpdate() calls this.setcurrentMembers()
at the first time this.state.renderedMembers.length === 0 this.setcurrentMembers() enriches this.state.fetchedMembers with
  connections: 0,
  isMonitored: false,
  intervalId: null
and sets this.state.currentMembers.
When this.state.currentMembers changes componentDidUpdate() calls this.setRenderedMembers()
this.setRenderedMembers() assign a new list starting from this.state.currentMembers enriches it with Status an color and sets this.state.renderedMembers.

render() renders table of pool members.


ENABLE, DISABLE, FORCE OFFLINE
ENABLE, DISABLE and FORCE OFFLINE buttons call /backend/f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/
with method PATCH and in the body the required state, for example for enable { "data": { "state": "user-up", "session":"user-enabled" } }
on success they call fetchPoolMembers() after 3 seconds in order to have the new member's state. Then componentDidUpdate() does the rest of the refreshing work.


MONITORING
When user click on START/STOP monitoringToggle() runs.
It takes the selected member to start/stop monitoring.
takes the value of member's key isMonitored.
If it's false
  this.interval = setInterval( () => this.memberStats(member), 3000)
  every three seconds calls this.memberStats(member)
  and update the member with
    isMonitored: true,
    intervalId: this.interval
  then sets currentMembers adding the new enriched member to currentMembers.
if it's true
  clearInterval(member.intervalId)
  stops cyclic call and clear intervalId
  update the member with
    isMonitored: false,
    intervalId: null
  then sets currentMembers adding the new enriched member to currentMembers.

memberStats()
call /backend/f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/stats/
onsuccess this.refreshStats(member, resp.data)

refreshStat()
takes the member from this.state.currentMembers and update it with current fetched connections.
It calls fetchPoolMembers also in order to update the status (of every pool's member) during the monitoring cycle.


CLOSE
When user close the modal, closeModal will triggered
closeModal() rest the state (visible, fetchedMembers, currentMembers, renderedMembers)
and clear every possible member's intervalId.
*/


class PoolDetails extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      fetchedMembers: [],
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
    if (this.state.fetchedMembers !== prevState.fetchedMembers) {
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
        this.setFetchedMembers(resp.data.items)
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${pool.name}/members/`, this.props.token)
  }

  setFetchedMembers = fetchedMembersList => {
    this.setState({fetchedMembers: fetchedMembersList})
  }

  setcurrentMembers = () => {

    if (this.state.renderedMembers.length === 0) {

      const fetch = Object.assign([], this.state.fetchedMembers);

      const current = fetch.map( m => {
        let n =  Object.assign( {
            connections: 0,
            isMonitored: false,
            intervalId: null
          }, m);
        return n
      })
      this.setState({currentMembers: current})

    } else {

      const fetch = Object.assign([], this.state.fetchedMembers);
      const current = Object.assign([], this.state.currentMembers);

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
  enableMember = async (member) => {
    const body = { "data": { "state": "user-up", "session":"user-enabled" } }
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body)
  }

  disableMember = async (member) => {
    const body = {"data":{"state":"user-up", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body )
  }

  forceOfflineMember = async (member) => {
    const body = {"data":{"state":"user-down", "session":"user-disabled"}}
    let rest = new Rest(
      "PATCH",
      resp => {
        setTimeout( () => this.fetchPoolMembers(this.props.obj, this.props.asset.id), 1000)
      },
      error => {
        this.props.dispatch(setError(error))
      }
    )
    await rest.doXHR( `f5/${this.props.asset.id}/${this.props.partition}/pool/${this.props.obj.name}/member/${member.name}/`, this.props.token, body )
  }



  //MONITORING
  monitoringToggle = (memb) => {
    const index = this.state.currentMembers.findIndex(m => {
      return m.name === memb.name
    })
    const members =  Object.assign([], this.state.currentMembers)
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
        this.props.dispatch(setError(error))
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
      fetchedMembers: [],
      currentMembers: [],
      renderedMembers: [],
    })
    this.state.currentMembers.map( m => {
      clearInterval(m.intervalId)
    })
  }

  resetError = () => {
    this.setState({ error: null})
  }



  render() {

    const columns = [
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
            <Button type="primary" onClick={() => this.enableMember(obj)}>
              Enable
            </Button>
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
            <Button type="primary" onClick={() => this.disableMember(obj)}>
              Disable
            </Button>
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
            <Button type="primary" onClick={() => this.forceOfflineMember(obj)}>
              Force Offline
            </Button>
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
        dataIndex: 'loading',
        key: 'loading',
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
            //rowClassName={(record, index) => (record.isMonitored ? "red" : "green")}
          />
        </Modal>
        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>
    );
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition
}))(PoolDetails);
