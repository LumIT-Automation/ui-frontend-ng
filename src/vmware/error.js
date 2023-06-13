import React from 'react'
import { connect } from 'react-redux'
import { Component } from 'react'

import { Modal, Table, Result } from 'antd'

import {
  authorizationsError
} from '../_store/store.authorizations'

import {
  environmentError,

  assetsError,

  assetAddError,
  assetModifyError,
  assetDeleteError,

  datacentersError,
  clustersError,
  clusterError,
  foldersError,
  templatesError,
  templateError,
  customSpecsError,
  customSpecError,
  bootstrapkeysError,
  finalpubkeysError,
  vmCreateError,

  genericError

} from './store'



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

        case 'datacentersError':
          this.props.dispatch(datacentersError(null))
          break;
        case 'clustersError':
          this.props.dispatch(clustersError(null))
          break;
        case 'clusterError':
          this.props.dispatch(clusterError(null))
          break;
        case 'foldersError':
          this.props.dispatch(foldersError(null))
          break;
        case 'templatesError':
          this.props.dispatch(templatesError(null))
          break;
        case 'templateError':
          this.props.dispatch(templateError(null))
          break;
        case 'customSpecsError':
          this.props.dispatch(customSpecsError(null))
          break;
        case 'customSpecError':
          this.props.dispatch(customSpecError(null))
          break;

        case 'bootstrapkeysError':
          this.props.dispatch(bootstrapkeysError(null))
          break;
        case 'finalpubkeysError':
          this.props.dispatch(finalpubkeysError(null))
          break;
        case 'vmCreateError':
          this.props.dispatch(vmCreateError(null))
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
        title={<p style={{textAlign: 'center'}}>VMWARE ERROR {this.props.type}</p>}
        centered
        destroyOnClose={true}
        visible= {this.props.visible}
        footer={''}
        onOk={null}
        //onCancel={() => this.props.dispatch(setError(null))}
        onCancel={this.onCancel}
        width={1500}
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
