import React from 'react'
import { connect } from 'react-redux'
import { Component } from 'react'

import { Modal, Table, Result } from 'antd'

import {
  authorizationsError
} from '../_store/store.authorizations'

import {
  permissionsError,
  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  identityGroupsError,
  identityGroupDeleteError,
  newIdentityGroupAddError,

  rolesError,

  projectsError,
  accountsError,
  devicesError,
  ddossesError,

  projectError,
  accountError,
  deviceError,
  ddosError,

  fieldError,
  valueError,

  categoriasError,
  categoriaError,

  vendorsError,
  vendorError,

  modellosError,
  modellos20Error,
  modelloError,

  firmwaresError,
  firmwareError,

  backupStatussError,
  backupStatusError,

  regionesError,
  regioneError,

  attivazioneAnnosError,
  attivazioneMesesError,

  eolAnnosError,
  eolMesesError,

  serviziosError,
  servizioError,

  ragioneSocialesError,
  ragioneSocialeError,

  genericError

} from '../fortinetdb/store'

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

        case 'projectsError':
          this.props.dispatch(projectsError(null))
          break;
        case 'accountsError':
          this.props.dispatch(accountsError(null))
          break;
        case 'devicesError':
          this.props.dispatch(devicesError(null))
          break;
        case 'ddossesError':
          this.props.dispatch(ddossesError(null))
          break;
        case 'projectError':
          this.props.dispatch(projectError(null))
          break;
        case 'accountError':
          this.props.dispatch(accountError(null))
          break;
        case 'deviceError':
          this.props.dispatch(deviceError(null))
          break;
        case 'ddosError':
          this.props.dispatch(ddosError(null))
          break;
        case 'fieldError':
          this.props.dispatch(fieldError(null))
          break;
        case 'valueError':
          this.props.dispatch(valueError(null))
          break;
        case 'categoriasError':
          this.props.dispatch(categoriasError(null))
          break;
        case 'categoriaError':
          this.props.dispatch(categoriaError(null))
          break;
        case 'vendorError':
          this.props.dispatch(vendorError(null))
          break;
        case 'vendorsError':
          this.props.dispatch(vendorsError(null))
          break;
        case 'modellosError':
          this.props.dispatch(modellosError(null))
          break;
        case 'modellos20Error':
          this.props.dispatch(modellos20Error(null))
          break;
        case 'modelloError':
          this.props.dispatch(modelloError(null))
          break;
        case 'firmwareError':
          this.props.dispatch(firmwareError(null))
          break;
        case 'firmwaresError':
          this.props.dispatch(firmwaresError(null))
          break;
        case 'backupStatussError':
          this.props.dispatch(backupStatussError(null))
          break;
        case 'backupStatusError':
          this.props.dispatch(backupStatusError(null))
          break;
        case 'regionesError':
          this.props.dispatch(regionesError(null))
          break;
        case 'regioneError':
          this.props.dispatch(regioneError(null))
          break;
        case 'attivazioneAnnosError':
          this.props.dispatch(attivazioneAnnosError(null))
          break;
        case 'attivazioneMesesError':
          this.props.dispatch(attivazioneMesesError(null))
          break;
        case 'eolAnnosError':
          this.props.dispatch(eolAnnosError(null))
          break;
        case 'eolMesesError':
          this.props.dispatch(eolMesesError(null))
          break;
        case 'servizioError':
          this.props.dispatch(servizioError(null))
          break;
        case 'serviziosError':
          this.props.dispatch(serviziosError(null))
          break;

        case 'ragioneSocialesError':
          this.props.dispatch(ragioneSocialesError(null))
          break;
        case 'ragioneSocialeError':
          this.props.dispatch(ragioneSocialeError(null))
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
        title={<p style={{textAlign: 'center'}}>FORTINETDB ERROR {this.props.type}</p>}
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
