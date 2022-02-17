import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";
import { logout } from '../_store/store.authentication'

import { authorizationsError } from '../_store/store.authorizations'

import {
  permissionsError,
  identityGroupsError,

  addNewDnError,

  fetchRolesError,
  addPermissionError,
  modifyPermissionError,
  deletePermissionError,

  environmentError,
  assetsError,

  addAssetError,
  modifyAssetError,
  deleteAssetError,

  treeError,
  networksError,
  containersError,
  realNetworksError,

  ipDetailError,
  networkError,
  containerError,
  nextAvailableIpError,
  ipModifyError,
  ipReleaseError,

  historysError,

  genericError

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

        case 'authorizationsError':
          this.props.dispatch(authorizationsError(null))
          break;


        case 'addNewDnError':
          this.props.dispatch(addNewDnError(null))
          break;
        case 'fetchRolesError':
          this.props.dispatch(fetchRolesError(null))
          break;
        case 'addPermissionError':
          this.props.dispatch(addPermissionError(null))
          break;
        case 'modifyPermissionError':
          this.props.dispatch(modifyPermissionError(null))
          break;
        case 'deletePermissionError':
          this.props.dispatch(deletePermissionError(null))
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
        case 'addAssetError':
        	this.props.dispatch(addAssetError(null))
        	break;
        case 'modifyAssetError':
        	this.props.dispatch(modifyAssetError(null))
        	break;
        case 'deleteAssetError':
        	this.props.dispatch(deleteAssetError(null))
        	break;
        case 'treeError':
        	this.props.dispatch(treeError(null))
        	break;
        case 'networksError':
        	this.props.dispatch(networksError(null))
        	break;
        case 'containersError':
          console.log('case giusto')
        	this.props.dispatch(containersError(null))
        	break;
        case 'realNetworksError':
        	this.props.dispatch(realNetworksError(null))
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

        case 'historysError':
          this.props.dispatch(historysError(null))
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
