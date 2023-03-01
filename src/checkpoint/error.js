import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";

import { authorizationsError } from '../_store/store.authorizations'

import {
  permissionsError,
  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  identityGroupsError,
  identityGroupDeleteError,
  newIdentityGroupAddError,

  rolesError,

  environmentError,
  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError,

  domainsError,

  itemTypesError,

  hostsError,
  hostAddError,
  hostModifyError,
  hostDeleteError,

  groupsError,
  groupAddError,
  groupModifyError,
  groupDeleteError,

  networksError,
  networkAddError,
  networkModifyError,
  networkDeleteError,

  addressRangesError,
  addressRangeAddError,
  addressRangeModifyError,
  addressRangeDeleteError,

  application_sitesError,
  application_siteAddError,
  application_siteModifyError,
  application_siteDeleteError,

  application_site_categorysError,
  application_site_categoryAddError,
  application_site_categoryModifyError,
  application_site_categoryDeleteError,


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

        case 'identityGroupsError':
          this.props.dispatch(identityGroupsError(null))
          break;
        case 'identityGroupDeleteError':
          this.props.dispatch(identityGroupDeleteError(null))
          break;
        case 'newIdentityGroupAddError':
          this.props.dispatch(newIdentityGroupAddError(null))
          break;

        case 'rolesError':
          this.props.dispatch(rolesError(null))
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

        case 'itemTypesError':
          this.props.dispatch(itemTypesError(null))
          break

        case 'hostsError':
          this.props.dispatch(hostsError(null))
          break;
        case 'hostAddError':
          this.props.dispatch(hostAddError(null))
          break;
        case 'hostModifyError':
          this.props.dispatch(hostModifyError(null))
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
        case 'groupModifyError':
          this.props.dispatch(groupModifyError(null))
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
        case 'networkModifyError':
          this.props.dispatch(networkModifyError(null))
          break;
        case 'networkDeleteError':
          this.props.dispatch(networkDeleteError(null))
          break;

        case 'addressRangesError':
          this.props.dispatch(addressRangesError(null))
          break;
        case 'addressRangeAddError':
          this.props.dispatch(addressRangeAddError(null))
          break;
        case 'addressRangeModifyError':
          this.props.dispatch(addressRangeModifyError(null))
          break;
        case 'addressRangeDeleteError':
          this.props.dispatch(addressRangeDeleteError(null))
          break;

        case 'application_sitesError':
          this.props.dispatch(application_sitesError(null))
          break;
        case 'application_siteAddError':
          this.props.dispatch(application_siteAddError(null))
          break;
        case 'application_siteModifyError':
          this.props.dispatch(application_siteModifyError(null))
          break;
        case 'application_siteDeleteError':
          this.props.dispatch(application_siteDeleteError(null))
          break;

        case 'application_site_categorysError':
          this.props.dispatch(application_site_categorysError(null))
          break;
        case 'application_site_categoryAddError':
          this.props.dispatch(application_site_categoryAddError(null))
          break;
        case 'application_site_categoryModifyError':
          this.props.dispatch(application_site_categoryModifyError(null))
          break;
        case 'application_site_categoryDeleteError':
          this.props.dispatch(application_site_categoryDeleteError(null))
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
        maskClosable={false}
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
