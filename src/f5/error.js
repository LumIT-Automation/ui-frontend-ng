import React from 'react'
import { connect } from 'react-redux'
import { Component } from 'react'

import { Modal, Table, Result } from 'antd'

import {
  logout
} from '../_store/store.authentication'

import {
  authorizationsError
} from '../_store/store.authorizations'

import {
  permissionsError,

  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  rolesError,

  newIdentityGroupAddError,

  identityGroupsError,

  environmentError,

  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError,

  partitionsError,

  routeDomainsError,

  dataGroupsError,

  nodesError,

  nodeAddError,
  nodeDeleteError,

  monitorTypesError,

  monitorsError,

  monitorAddError,
  monitorModifyError,
  monitorDeleteError,

  poolsError,

  poolAddError,
  poolModifyError,
  poolDeleteError,

  poolMembersError,

  poolMemberAddError,
  poolMemberModifyError,
  poolMemberDeleteError,
  poolMemberEnableError,
  poolMemberDisableError,
  poolMemberForceOfflineError,
  poolMemberStatsError,

  snatPoolsError,

  snatPoolAddError,
  snatPoolModifyError,
  snatPoolDeleteError,

  irulesError,

  iruleAddError,
  iruleModifyError,
  iruleDeleteError,

  certificatesError,

  certificateAddError,
  certificateDeleteError,

  keysError,

  keyAddError,
  keyDeleteError,

  profilesError,

  profileAddError,
  profileDeleteError,

  virtualServersError,

  virtualServerAddError,
  virtualServerModifyError,
  virtualServerDeleteError,

  l4ServiceCreateError,
  l7ServiceCreateError,
  serviceDeleteError,

  historysError,

  configurationError,
  configurationModifyError,

  genericError

} from './store.f5'



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

        case 'authorizationsError':
          this.props.dispatch(authorizationsError(null))
          break;

        case 'permissionsError':
          this.props.dispatch(permissionsError(null))
          break;

        case 'permissionAddError':
          this.props.dispatch(permissionAddError(null))
          break;
        case 'permissionModifyError':
          this.props.dispatch(permissionModifyError(null))
          break;
        case 'permissionDeleteError':
          this.props.dispatch(permissionDeleteError(null))
          break;

        case 'newIdentityGroupAddError':
          this.props.dispatch(newIdentityGroupAddError(null))
          break;

        case 'rolesError':
          this.props.dispatch(rolesError(null))
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

        case 'assetAddError':
          this.props.dispatch(assetAddError(null))
          break;
        case 'assetModifyError':
          this.props.dispatch(assetModifyError(null))
          break;
        case 'assetDeleteError':
          this.props.dispatch(assetDeleteError(null))
          break;

        case 'partitionsError':
          this.props.dispatch(partitionsError(null))
          break;

        case 'routeDomainsError':
          this.props.dispatch(routeDomainsError(null))
          break;

        case 'dataGroupsError':
          this.props.dispatch(dataGroupsError(null))
          break;

        case 'nodesError':
          this.props.dispatch(nodesError(null))
          break;

        case 'nodeAddError':
          this.props.dispatch(nodeAddError(null))
          break;
        case 'nodeDeleteError':
          this.props.dispatch(nodeDeleteError(null))
          break;

        case 'monitorTypesError':
          this.props.dispatch(monitorTypesError(null))
          break;

        case 'monitorsError':
          this.props.dispatch(monitorsError(null))
          break;

        case 'monitorAddError':
          this.props.dispatch(monitorAddError(null))
          break;
        case 'monitorModifyError':
          this.props.dispatch(monitorModifyError(null))
          break;
        case 'monitorDeleteError':
          this.props.dispatch(monitorDeleteError(null))
          break;

        case 'poolsError':
          this.props.dispatch(poolsError(null))
          break;

        case 'poolAddError':
          this.props.dispatch(poolAddError(null))
          break;
        case 'poolModifyError':
          this.props.dispatch(poolModifyError(null))
          break;
        case 'poolDeleteError':
          this.props.dispatch(poolDeleteError(null))
          break;

        case 'poolMembersError':
          this.props.dispatch(poolMembersError(null))
          break;

        case 'poolMemberAddError':
          this.props.dispatch(poolMemberAddError(null))
          break;
        case 'poolMemberModifyError':
          this.props.dispatch(poolMemberModifyError(null))
          break;
        case 'poolMemberDeleteError':
          this.props.dispatch(poolMemberDeleteError(null))
          break;
        case 'poolMemberEnableError':
          this.props.dispatch(poolMemberEnableError(null))
          break;
        case 'poolMemberDisableError':
          this.props.dispatch(poolMemberDisableError(null))
          break;
        case 'poolMemberForceOfflineError':
          this.props.dispatch(poolMemberForceOfflineError(null))
          break;
        case 'poolMemberStatsError':
          this.props.dispatch(poolMemberStatsError(null))
          break;

        case 'snatPoolsError':
          this.props.dispatch(snatPoolsError(null))
          break;

        case 'snatPoolAddError':
          this.props.dispatch(snatPoolAddError(null))
          break;
        case 'snatPoolModifyError':
          this.props.dispatch(snatPoolModifyError(null))
          break;
        case 'snatPoolDeleteError':
          this.props.dispatch(snatPoolDeleteError(null))
          break;

        case 'irulesError':
          this.props.dispatch(irulesError(null))
          break;

        case 'iruleAddError':
          this.props.dispatch(iruleAddError(null))
          break;
        case 'iruleModifyError':
          this.props.dispatch(iruleModifyError(null))
          break;
        case 'iruleDeleteError':
          this.props.dispatch(iruleDeleteError(null))
          break;

        case 'certificatesError':
          this.props.dispatch(certificatesError(null))
          break;

        case 'certificateAddError':
          this.props.dispatch(certificateAddError(null))
          break;
        case 'certificateDeleteError':
          this.props.dispatch(certificateDeleteError(null))
          break;

        case 'keysError':
          this.props.dispatch(keysError(null))
          break;

        case 'keyAddError':
          this.props.dispatch(keyAddError(null))
          break;
        case 'keyDeleteError':
          this.props.dispatch(keyDeleteError(null))
          break;

        case 'profilesError':
          this.props.dispatch(profilesError(null))
          break;

        case 'profileAddError':
          this.props.dispatch(profileAddError(null))
          break;
        case 'profileDeleteError':
          this.props.dispatch(profileDeleteError(null))
          break;

        case 'virtualServersError':
          this.props.dispatch(virtualServersError(null))
          break;

        case 'virtualServerAddError':
          this.props.dispatch(virtualServerAddError(null))
          break;
        case 'virtualServerModifyError':
          this.props.dispatch(virtualServerModifyError(null))
          break;
        case 'virtualServerDeleteError':
          this.props.dispatch(virtualServerDeleteError(null))
          break;


        case 'l4ServiceCreateError':
          this.props.dispatch(l4ServiceCreateError(null))
          break;
        case 'l7ServiceCreateError':
          this.props.dispatch(l7ServiceCreateError(null))
          break;
        case 'serviceDeleteError':
          this.props.dispatch(serviceDeleteError(null))
          break;

        case 'historysError':
            this.props.dispatch(historysError(null))
            break;

        case 'configurationError':
            this.props.dispatch(configurationError(null))
            break;
        case 'configurationModifyError':
            this.props.dispatch(configurationModifyError(null))
            break;

        default:
          this.props.dispatch(genericError(null))
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