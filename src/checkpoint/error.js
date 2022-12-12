import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";

import { authorizationsError } from '../_store/store.authorizations'

import {
  permissionsError,
  identityGroupsError,

  newIdentityGroupAddError,

  rolesError,
  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  environmentError,
  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError,

  domainsError,

  hostsError,
  hostAddError,
  hostDeleteError,

  groupsError,
  groupAddError,
  groupDeleteError,

  networksError,
  networkAddError,
  networkDeleteError,

  address_rangesError,
  address_rangeAddError,
  address_rangeDeleteError,

  application_sitesError,
  application_siteAddError,
  application_siteDeleteError,

  hostRemoveError,

  historysError,

  genericError

} from './store'

import { Modal, Table, Result } from 'antd';

//import notFound from './404.gif'
//import tooMany from './429.gif'



class Error extends Component {

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  onCancel = async () => {
    if ( this.props.type ) {
      switch(this.props.type) {

        case 'authorizationsError':
          this.props.dispatch(authorizationsError(null))
          break;


        case 'newIdentityGroupAddError':
          this.props.dispatch(newIdentityGroupAddError(null))
          break;
        case 'rolesError':
          this.props.dispatch(rolesError(null))
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
        case 'assetAddError':
        	this.props.dispatch(assetAddError(null))
        	break;
        case 'assetModifyError':
        	this.props.dispatch(assetModifyError(null))
        	break;
        case 'assetDeleteError':
        	this.props.dispatch(assetDeleteError(null))
        	break;

        case 'domainsError':
          this.props.dispatch(domainsError(null))
          break

        case 'hostsError':
          this.props.dispatch(hostsError(null))
          break;
        case 'hostAddError':
          this.props.dispatch(hostAddError(null))
          break;
        case 'hostDeleteError':
          this.props.dispatch(hostDeleteError(null))
          break;

        case 'groupsError':
          this.props.dispatch(groupsError(null))
          break;
        case 'groupAddError':
          this.props.dispatch(groupAddError(null))
          break;
        case 'groupDeleteError':
          this.props.dispatch(groupDeleteError(null))
          break;

        case 'networksError':
          this.props.dispatch(networksError(null))
          break;
        case 'networkAddError':
          this.props.dispatch(networkAddError(null))
          break;
        case 'networkDeleteError':
          this.props.dispatch(networkDeleteError(null))
          break;

        case 'address_rangesError':
          this.props.dispatch(address_rangesError(null))
          break;
        case 'address_rangeAddError':
          this.props.dispatch(address_rangeAddError(null))
          break;
        case 'address_rangeDeleteError':
          this.props.dispatch(address_rangeDeleteError(null))
          break;

        case 'application_sitesError':
          this.props.dispatch(application_sitesError(null))
          break;
        case 'application_siteAddError':
          this.props.dispatch(application_siteAddError(null))
          break;
        case 'application_siteDeleteError':
          this.props.dispatch(application_siteDeleteError(null))
          break;

        case 'hostRemoveError':
          this.props.dispatch(hostRemoveError(null))
          break;

        case 'historysError':
          this.props.dispatch(historysError(null))
          break;

        default:
          this.props.dispatch(genericError(null))

      }
    }
  }

  logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
    catch(e) {
      console.log(e)
    }
  }


  render(){

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
        width: 300,
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
        title={<p style={{textAlign: 'center'}}>CHECKPOINT ERROR {this.props.type}</p>}
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
