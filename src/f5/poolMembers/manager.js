import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux'

import Rest from '../../_helpers/Rest'
import Error from '../../concerto/error'
import Authorizators from '../../_helpers/authorizators'

import { Modal, Button, Space, Table, Spin} from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

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


function PoolDetails(props) {
  let [visible, setVisible] = useState(false);
  let [loading, setLoading] = useState(false);
  let [poolMembersLoading, setPoolMembersLoading] = useState(false);
  let [members, setMembers] = useState([]);

  //let interval = useRef(null);

  useEffect(() => {
    if (visible && !props.error) {
      props.dispatch(poolMembersFetch(false))
      main(props.obj)
    }
  }, [visible, props.error]);

  useEffect(() => {
    if (visible && !props.error && props.poolMembersFetch) {
      props.dispatch(poolMembersFetch(false))
      main(props.obj)
    }
  }, [visible, props.error, props.poolMembersFetch]);


  let main = async(pool) => {
    setPoolMembersLoading(true)
    let membersFetch = await poolMembersGet(pool)
    setPoolMembersLoading(false)
    if (membersFetch.status && membersFetch.status !== 200) {
      let error = Object.assign(membersFetch, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMembersError'
      })
      props.dispatch(err(error))
    }
    else {
      const membersConn = membersFetch.map( m => {
        let n =  Object.assign( {
            connections: 0,
            isMonitored: false,
            isLoading: false,
            //intervalId: null
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

      setMembers(membersState)
    }
  }

  let poolMembersGet = async (pool) => {
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
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/pool/${pool.name}/members/`, props.token)
    return r
  }


  let statusAndSession = async (member, state, session, parentState, membersCopy) => {
    //let membersCopy = JSON.parse(JSON.stringify(members))

    const index = membersCopy.findIndex(m => {
      return m.name === member.name
    })

    membersCopy[index].state = state
    membersCopy[index].session = session
    membersCopy[index].parentState = parentState

    if (state === 'up' && session === 'monitor-enabled' && parentState === 'enabled') {
      membersCopy[index].status = 'enabled'
      membersCopy[index].color = '#90ee90'
    }
    else if (state === 'up' && session === 'user-disabled') {
      membersCopy[index].status = 'disabled'
      membersCopy[index].color = 'black'
    }
    else if (state === 'checking' && session === 'user-disabled') {
      membersCopy[index].status = 'checking'
      membersCopy[index].color = 'blue'
    }
    else if (state === 'down' && session === 'monitor-enabled') {
      membersCopy[index].status = 'checking'
      membersCopy[index].color = 'red'
    }
    else if (state === 'down' && session === 'user-enabled') {
      membersCopy[index].status = 'rechecking'
      membersCopy[index].color = 'blue'
    }
    else if (state === 'user-down' && session === 'user-disabled') {
      membersCopy[index].status = 'force offline'
      membersCopy[index].color = 'black'
    }
    else {
      membersCopy[index].status = 'other'
      membersCopy[index].color = 'grey'
    }

    //setMembers([...membersCopy])
    return membersCopy
  }


  let poolMemberEnableHandler = async (member) => {
    let membersCopy = JSON.parse(JSON.stringify(members))
    const index = membersCopy.findIndex(m => {
      return m.name === member.name
    })

    membersCopy[index].isLoading = true

    membersCopy.forEach(m => {
      m.workInProgress = true
    })

    setMembers([...membersCopy])

    let enable = await poolMemberEnable(member.name)
    if (enable.status && enable.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(enable, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberEnableError'
      })
      props.dispatch(err(error))
    }

    let fetchedMember = await poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      props.dispatch(err(error))
    }

    let memberStats = await poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      props.dispatch(err(error))
    }

    let membersWithStats = await refreshStats(member, memberStats)

    let membersWithStatusAndSessions = await statusAndSession(
      member, 
      fetchedMember.state, 
      fetchedMember.session, 
      memberStats.parentState, 
      membersWithStats
    )
    membersCopy = JSON.parse(JSON.stringify(membersWithStatusAndSessions))
    membersCopy[index].isLoading = false
    membersCopy.forEach(m => {
      delete m.workInProgress
    })
    setMembers([...membersCopy])
  }

  let poolMemberDisableHandler = async (member) => {
    let membersCopy = JSON.parse(JSON.stringify(members))
    const index = membersCopy.findIndex(m => {
      return m.name === member.name
    })

    membersCopy[index].isLoading = true

    membersCopy.forEach(m => {
      m.workInProgress = true
    })

    setMembers([...membersCopy])

    let disable = await poolMemberDisable(member)
    if (disable.status && disable.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(disable, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberDisableError'
      })
      props.dispatch(err(error))
    }

    let fetchedMember = await poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      props.dispatch(err(error))
    }

    let memberStats = await poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers([...membersCopy])
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      props.dispatch(err(error))
    }

    let membersWithStats = await refreshStats(member, memberStats)

    let membersWithStatusAndSessions = await statusAndSession(
      member, 
      fetchedMember.state, 
      fetchedMember.session, 
      memberStats.parentState, 
      membersWithStats
    )

    membersCopy = JSON.parse(JSON.stringify(membersWithStatusAndSessions))
    membersCopy[index].isLoading = false
    membersCopy.forEach(m => {
      delete m.workInProgress
    })
    setMembers([...membersCopy])
  }

  let poolMemberForceOfflineHandler = async (member) => {
    let membersCopy = JSON.parse(JSON.stringify(members))
    const index = membersCopy.findIndex(m => {
      return m.name === member.name
    })

    membersCopy[index].isLoading = true

    membersCopy.forEach(m => {
      m.workInProgress = true
    })

    setMembers(membersCopy)

    let forceOffline = await poolMemberForceOffline(member)
    if (forceOffline.status && forceOffline.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers(membersCopy)
      let error = Object.assign(forceOffline, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberForceOfflineError'
      })
      props.dispatch(err(error))
    }

    let fetchedMember = await poolMemberGet(member)
    if (fetchedMember.status && fetchedMember.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers(membersCopy)
      let error = Object.assign(fetchedMember, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberGetError'
      })
      props.dispatch(err(error))
    }

    let memberStats = await poolMemberStats(member)
    if (memberStats.status && memberStats.status !== 200) {
      membersCopy = JSON.parse(JSON.stringify(members))
      membersCopy[index].isLoading = false
      setMembers(membersCopy)
      let error = Object.assign(memberStats, {
        component: 'poolmembers',
        vendor: 'f5',
        errorType: 'poolMemberStatsError'
      })
      props.dispatch(err(error))
    }

    let membersWithStats = await refreshStats(member, memberStats)

    let membersWithStatusAndSessions = await statusAndSession(
      member, 
      fetchedMember.state, 
      fetchedMember.session, 
      memberStats.parentState, 
      membersWithStats
    )

    membersCopy = JSON.parse(JSON.stringify(membersWithStatusAndSessions))
    membersCopy[index].isLoading = false
    membersCopy.forEach(m => {
      delete m.workInProgress
    })
    setMembers([...membersCopy])
  }

  let poolMemberEnable = async (memberName) => {
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
    await rest.doXHR(`f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${memberName}/`, props.token, b)
    return r
  }

  let poolMemberDisable = async (member) => {
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
    await rest.doXHR( `f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${member.name}/`, props.token, b )
    return r
  }

  let poolMemberForceOffline = async (member) => {
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
    await rest.doXHR( `f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${member.name}/`, props.token, b )
    return r
  }

  let poolMemberGet = async member => {
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
    await rest.doXHR( `f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${member.name}/`, props.token)
    return r
  }

  let poolMemberStats = async member => {
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
    await rest.doXHR( `f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${member.name}/stats/`, props.token)
    return r
  }

  //MONITORING
  const monitoringToggle = async (memberName) => {
    setMembers((prevMembers) => {
      return prevMembers.map((member) => {
        if (member.name === memberName) {
          if (!member.isMonitored) {
  
            // Aggiungi controlli per fermare un intervallo già esistente
            if (member.intervalId) {
              clearInterval(member.intervalId); // Ferma l'intervallo precedente se presente
            }
  
            // Crea un nuovo intervallo
            const intervalId = setInterval(async () => {
              const result = await poolMemberStatsInterval(member);
              if (result) {
                const updatedMembers = await refreshStats(member, result);
                setMembers(updatedMembers); // Usa il risultato per aggiornare lo stato
              }
            }, 3000);
  
            // Salva l'intervallo nel membro
            return { ...member, isMonitored: true, intervalId }; 
          } else {
            // Stop interval
            if (member.intervalId) {
              clearInterval(member.intervalId); // Ferma l'intervallo
            }
            return { ...member, isMonitored: false, intervalId: null }; // Reset dell'intervallo
          }
        }
        return member;
      });
    });
  };

  let poolMemberStatsInterval = async (member) => {
    try {
      const rest = new Rest(
        'GET',
        (resp) => {
          return resp.data; // Dati ricevuti
        },
        (error) => {
          error = Object.assign(error, {
            component: 'poolmembers',
            vendor: 'f5',
            errorType: 'poolMemberStatsIntervalError',
          });
          props.dispatch(err(error));
          throw error; // Propaga l'errore
        }
      );
  
      const r = await rest.doXHR(
        `f5/${props.asset.id}/${props.partition}/pool/${props.obj.name}/member/${member.name}/stats/`,
        props.token
      );
  
      return r; // Restituisce i dati ottenuti
    } catch (error) {
      console.error(`Error fetching stats for ${member.name}:`, error);
      return null; // Gestione fallback in caso di errore
    }
  };

  let refreshStats = async (memb, data) => {
    try {
      // Copia immutabile di `members` e modifica il membro specifico
      const updatedMembers = members.map((m) => {
        if (m.name === memb.name) {
          return {
            ...m,
            connections: data.serverside_curConns,
            parentState: data.parentState,
          };
        }
        return m;
      });
  
      // Restituisci la lista aggiornata
      return updatedMembers;
    } catch (error) {
      console.error(`Error refreshing stats for ${memb.name}:`, error);
      return members; // Restituisci la lista originale in caso di errore
    }
  };

  let authorizatorsSA = a => {
    let author = new Authorizators()
    return author.isSuperAdmin(a)
  }
  
  let isAuthorized = (authorizations, vendor, key) => {
    let author = new Authorizators()
    return author.isAuthorized(authorizations, vendor, key)
  }


  //Close and Error
  let closeModal = () => {
    setVisible(false);
    setLoading(false);
    members.forEach( m => {
      clearInterval(m.intervalId)
    })
  }

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
        { obj.isLoading || obj.isMonitored || obj.workInProgress ?
          <Button type="primary" disabled>
            Enable
          </Button>
          :
          <Button type="primary" onClick={() => poolMemberEnableHandler(obj)}>
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
        { obj.isLoading || obj.isMonitored || obj.workInProgress ?
          <Button type="primary" disabled>
            Disable
          </Button>
          :
          <Button type="primary" onClick={() => poolMemberDisableHandler(obj)}>
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
        { obj.isLoading || obj.isMonitored || obj.workInProgress ?
          <Button type="primary" disabled>
            Force Offline
          </Button>
          :
          <Button type="primary" onClick={() => poolMemberForceOfflineHandler(obj)}>
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
          <Button type="primary" onClick={() => monitoringToggle(obj.name)}>
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
          { (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', 'poolMember_delete')) ? 
            <Delete name={name} obj={obj} poolName={props.obj.name} />
          :
            '-'
          }
        </Space>
      ),
    }
  ];

  let errorsComponent = () => {
    if (props.error && props.error.component === 'poolmembers') {
      return <Error error={[props.error]} visible={true}/> 
    }
  }

  return (
    <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>
      <Button type="primary" onClick={() => setVisible(true)}>
        Pool Members
      </Button>

      <Modal
        title={<p style={{textAlign: 'center'}}>{props.obj.name}</p>}
        centered
        destroyOnClose={true}
        visible={visible}
        footer={''}
        onOk={() => setVisible(true)}
        onCancel={() => closeModal()}
        width={1500}
        maskClosable={false}
      >
        { ((props.asset) && (props.asset.id && props.partition) ) ?
            (authorizatorsSA(props.authorizations) || isAuthorized(props.authorizations, 'f5', 'poolMembers_post')) ? 
            <React.Fragment>
              <br/>
              <Add obj={props.obj}/>
              <br/>
              <br/>
            </React.Fragment>
            :
            null
          :
          null
        }

        { poolMembersLoading ?
            <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/>
          :
            <Table
              dataSource={members}
              columns={columns}
              pagination={false}
              rowKey="name"
              scroll={{x: 'auto'}}
            />
        }
      </Modal>

      {errorsComponent()}

    </Space>
  );
  
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
