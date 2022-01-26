import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";
import { logout } from '../_store/store.auth'

import { setAuthorizationsError } from '../_store/store.authorizations'
import {
  addNewDnError,

  fetchInfobloxRolesError,
  addInfobloxPermissionError,
  modifyInfobloxPermissionError,
  deleteInfobloxPermissionError,
} from '../_store/store.permissions'

import {
  setPermissionsError,
  setIdentityGroupsError,

  setEnvironmentError,
  setAssetsError,

  setAssetAddError,
  setAssetModifyError,
  setAssetDeleteError,

  setTreeError,
  networksError,
  containersError,
  setRealNetworksError,

  ipDetailError,
  networkError,
  containerError,
  nextAvailableIpError,
  ipModifyError,
  ipReleaseError,

} from '../_store/store.infoblox'

import { Modal, Table, Result } from 'antd';

//import notFound from './404.gif'
//import tooMany from './429.gif'



class Error extends Component {

  componentDidMount() {
    console.log('infoblox error mount')
    console.log(this.props.component)
    console.log(this.props.error)
    console.log(this.props.type)
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('infoblox error update')
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
        case 'fetchInfobloxRolesError':
          this.props.dispatch(fetchInfobloxRolesError(null))
          break;
        case 'addInfobloxPermissionError':
          this.props.dispatch(addInfobloxPermissionError(null))
          break;
        case 'modifyInfobloxPermissionError':
          this.props.dispatch(modifyInfobloxPermissionError(null))
          break;
        case 'deleteInfobloxPermissionError':
          this.props.dispatch(deleteInfobloxPermissionError(null))
          break;


        case 'setPermissionsError':
        	this.props.dispatch(setPermissionsError(null))
        	break;
        case 'setIdentityGroupsError':
          this.props.dispatch(setIdentityGroupsError(null))
          break;

        case 'setEnvironmentError':
        	this.props.dispatch(setEnvironmentError(null))
        	break;
        case 'setAssetsError':
        	this.props.dispatch(setAssetsError(null))
        	break;
        case 'setAssetAddError':
        	this.props.dispatch(setAssetAddError(null))
        	break;
        case 'setAssetModifyError':
        	this.props.dispatch(setAssetModifyError(null))
        	break;
        case 'setAssetDeleteError':
        	this.props.dispatch(setAssetDeleteError(null))
        	break;
        case 'setTreeError':
        	this.props.dispatch(setTreeError(null))
        	break;
        case 'networksError':
        	this.props.dispatch(networksError(null))
        	break;
        case 'containersError':
          console.log('case giusto')
        	this.props.dispatch(containersError(null))
        	break;
        case 'setRealNetworksError':
        	this.props.dispatch(setRealNetworksError(null))
        	break;

        case 'ipDetailError':
        	this.props.dispatch(ipDetailError(null))
        	break;
        case 'networkError':
          this.props.dispatch(networkError(null))
          break;
        case 'containerError':
          this.props.dispatch(containerError(null))
          break;
        case 'nextAvailableIpError':
          this.props.dispatch(nextAvailableIpError(null))
          break;
        case 'ipModifyError':
          this.props.dispatch(ipModifyError(null))
          break;
        case 'ipReleaseError':
          this.props.dispatch(ipReleaseError(null))
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
            break;
          case 401:
            this.logout()
            //return <Result title={statusCode} />
            break;
          case 403:
            return <Result status={statusCode} title={'403 - Forbidden'} />
            break;
          case 404:
            return <Result status={statusCode} title={'404 - Not Found'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
            break;
          case 409:
            return <Result title={'409 - Conflict'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
            break;
          case 412:
            return <Result title={'412 - Precondition Failed'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break;
          case 422:
            return <Result title={'422 - Unprocessable Entity'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break;
          case 423:
            return <Result title={'423 - Locked'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break;
          case 429:
            return <Result title={'429 - Too many requests'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break;

          case 500:
            return <Result title={'500'} />
            break;
          case 502:
            return <Result title={statusCode} />
            break;
          case 503:
            return <Result title={statusCode} />
            break;

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
        title={<p style={{textAlign: 'center'}}>INFOBLOX ERROR {this.props.type}</p>}
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
