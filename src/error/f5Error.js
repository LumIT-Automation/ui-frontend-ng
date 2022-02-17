import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";
import { logout } from '../_store/store.authentication'

import { setAuthorizationsError } from '../_store/store.authorizations'
import {
  addNewDnError,

  fetchF5RolesError,
  addF5PermissionError,
  modifyF5PermissionError,
  deleteF5PermissionError,

} from '../_store/store.permissions'
import {
  permissionsError,
  identityGroupsError,
  environmentError,
  assetsError,
  addAssetError,
  modifyAssetError,
  deleteAssetError,
  partitionsError,
  routeDomainsError,

  nodesError,
  addNodeError,
  deleteNodeError,

  monitorTypesError,
  monitorsError,
  addMonitorError,
  modifyMonitorError,
  deleteMonitorError,

  poolsError,
  addPoolError,
  modifyPoolError,
  deletePoolError,

  poolMembersError,
  addPoolMemberError,
  modifyPoolMemberError,
  deletePoolMemberError,

  profilesError,
  addProfileError,
  deleteProfileError,

  virtualServersError,

  certificatesError,
  keysError,
  certificateAddError,
  certificateDeleteError,
  keyAddError,
  keyDeleteError,

  createL4ServiceError,
  createL7ServiceError,
  deleteServiceError,
  enableMemberError,
  disableMemberError,
  forceOfflineMemberError,
  memberStatsError,

  historysError,

  configurationError,

} from '../_store/store.f5'

import { Modal, Table, Result } from 'antd';

//import notFound from './404.gif'
//import tooMany from './429.gif'


class Error extends Component {

  componentDidMount() {
    console.log('f5 error mount')
    console.log(this.props.component)
    console.log(this.props.error)
    console.log(this.props.type)
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('f5 error update')
    console.log(this.props.component)
    console.log(this.props.error)
    console.log(this.props.type)
  }

  componentWillUnmount() {
  }


  onCancel = async () => {
    if ( this.props.type ) {
      switch(this.props.type) {

        case 'setAuthorizationsError':
          this.props.dispatch(setAuthorizationsError(null))
          break;


        case 'addNewDnError':
          this.props.dispatch(addNewDnError(null))
          break;
        case 'fetchF5RolesError':
          this.props.dispatch(fetchF5RolesError(null))
          break;
        case 'addF5PermissionError':
          this.props.dispatch(addF5PermissionError(null))
          break;
        case 'modifyF5PermissionError':
          this.props.dispatch(modifyF5PermissionError(null))
          break;
        case 'deleteF5PermissionError':
          this.props.dispatch(deleteF5PermissionError(null))
          break;


        case 'permissionsError':
          this.props.dispatch(permissionsError(null))
          break;
        case 'identityGroupsError':
          this.props.dispatch(identityGroupsError(null))
          break;

        case 'environmentError':
          this.props.dispatch(environmentError(null))
          break;
        case 'assetsError':
          this.props.dispatch(assetsError(null))
          break;
        case 'partitionsError':
          this.props.dispatch(partitionsError(null))
          break;
        case 'routeDomainsError':
          this.props.dispatch(routeDomainsError(null))
          break;

        case 'addAssetError':
          this.props.dispatch(addAssetError(null))
          break;
        case 'modifyAssetError':
          this.props.dispatch(modifyAssetError(null))
          break;
        case 'deleteAssetError':
          this.props.dispatch(deleteAssetError(null))
          break;

        case 'nodesError':
          this.props.dispatch(nodesError(null))
          break;
        case 'addNodeError':
          this.props.dispatch(addNodeError(null))
          break;
        case 'deleteNodeError':
          this.props.dispatch(deleteNodeError(null))
          break;

        case 'monitorTypesError':
          this.props.dispatch(monitorTypesError(null))
          break;
        case 'monitorsError':
          this.props.dispatch(monitorsError(null))
          break;
        case 'addMonitorError':
          this.props.dispatch(addMonitorError(null))
          break;
        case 'modifyMonitorError':
          this.props.dispatch(modifyMonitorError(null))
          break;
        case 'deleteMonitorError':
          this.props.dispatch(deleteMonitorError(null))
          break;

        case 'poolsError':
          this.props.dispatch(poolsError(null))
          break;
        case 'addPoolError':
          this.props.dispatch(addPoolError(null))
          break;
        case 'modifyPoolError':
          this.props.dispatch(modifyPoolError(null))
          break;
        case 'deletePoolError':
          this.props.dispatch(deletePoolError(null))
          break;

        case 'poolMembersError':
          this.props.dispatch(poolMembersError(null))
          break;
        case 'addPoolMemberError':
          this.props.dispatch(addPoolMemberError(null))
          break;
        case 'modifyPoolMemberError':
          this.props.dispatch(modifyPoolMemberError(null))
          break;
        case 'deletePoolMemberError':
          this.props.dispatch(deletePoolMemberError(null))
          break;

        case 'profilesError':
          this.props.dispatch(profilesError(null))
          break;
        case 'addProfileError':
          this.props.dispatch(addProfileError(null))
          break;
        case 'deleteProfileError':
          this.props.dispatch(deleteProfileError(null))
          break;

        case 'virtualServersError':
          this.props.dispatch(virtualServersError(null))
          break;

        case 'certificatesError':
          this.props.dispatch(certificatesError(null))
          break;
        case 'keysError':
          this.props.dispatch(keysError(null))
          break;
        case 'certificateAddError':
          this.props.dispatch(certificateAddError(null))
          break;
        case 'certificateDeleteError':
          this.props.dispatch(certificateDeleteError(null))
          break;
        case 'keyAddError':
          this.props.dispatch(keyAddError(null))
          break;
        case 'keyDeleteError':
          this.props.dispatch(keyDeleteError(null))
          break;


        case 'createL4ServiceError':
          this.props.dispatch(createL4ServiceError(null))
          break;
        case 'createL7ServiceError':
          this.props.dispatch(createL7ServiceError(null))
          break;
        case 'deleteServiceError':
          this.props.dispatch(deleteServiceError(null))
          break;
        case 'enableMemberError':
          this.props.dispatch(enableMemberError(null))
          break;
        case 'disableMemberError':
          this.props.dispatch(disableMemberError(null))
          break;
        case 'forceOfflineMemberError':
          this.props.dispatch(forceOfflineMemberError(null))
          break;
        case 'memberStatsError':
          this.props.dispatch(memberStatsError(null))
          break;

        case 'historysError':
            this.props.dispatch(historysError(null))
            break;

        case 'configurationError':
            this.props.dispatch(configurationError(null))
            break;

      }
    }
  }

  deleteCookies = (token, username) => {
    return new Promise( (resolve, reject) => {
      try {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
        resolve()
      }
      catch(e) {
        reject(e)
      }
    })
  }

  logout = () => {
    this.deleteCookies('token', 'username').then( this.props.dispatch( logout() ) )
  }


  render(){
    //let err = this.state.error



    const columns = [
      {
        title: 'FROM',
        align: 'left',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: 'Type',
        align: 'left',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'STATUS',
        align: 'left',
        dataIndex: 'status',
        key: 'status',
      },
      {
        title: 'MESSAGE',
        align: 'left',
        dataIndex: 'message',
        key: 'message',
      },
      {
        title: 'REASON',
        align: 'left',
        dataIndex: 'reason',
        key: 'reason',
      },
    ]

    let e = () => {
      if (this.props.error && this.props.error[0]) {
        const statusCode = this.props.error[0].status

        switch(statusCode) {
          case 400:
            return <Result title={'400 - Bad Request'} />
          case 401:
            this.logout()
            //return <Result title={statusCode} />
            break;
          case 403:
            return <Result status={statusCode} title={'403 - Forbidden'} />
          case 404:
            return <Result status={statusCode} title={'404 - Not Found'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
          case 409:
            return <Result title={'409 - Conflict'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
          case 412:
            return <Result title={'412 - Precondition Failed'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
          case 422:
            return <Result title={'422 - Unprocessable Entity'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
          case 423:
            return <Result title={'423 - Locked'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
          case 429:
            return <Result title={'429 - Too many requests'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />

          case 500:
            return <Result title={'500'} />
          case 502:
            return <Result title={statusCode} />
          case 503:
            return <Result title={statusCode} />

          default:
            return <Result status='error' />
        }
      }
      else {
        return null
      }
    }

    return (
      <Modal
        title={<p style={{textAlign: 'center'}}>F5 ERROR {this.props.type}</p>}
        centered
        destroyOnClose={true}
        visible= {this.props.visible}
        footer={''}
        onOk={null}
        //onCancel={() => this.props.dispatch(setError(null))}
        onCancel={this.onCancel}
        width={750}
      >
        <React.Fragment>
        {e()}

        <Table
          dataSource={this.props.error}
          columns={columns}
          pagination={false}
          rowKey="message"
          scroll={{x: 'auto'}}
        />
          </React.Fragment>
      </Modal>

    )
  }
}

export default connect((state) => ({

}))(Error);
