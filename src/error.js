import React from 'react'
import { connect } from 'react-redux'
import { Component } from "react";
import  { Redirect } from 'react-router-dom'
import { logout } from './_store/store.auth'

import { setError } from './_store/store.error'

import {
  setAssetsError,
  setAssetAddError,
  setAssetModifyError,
  setAssetDeleteError
} from './_store/store.f5'

import { Modal, Table, Result } from 'antd';

//import notFound from './404.gif'
//import tooMany from './429.gif'


/*

It is the modal for rendere response errors.
It recieves
  error={this.state.error} visible={true} resetError={() => this.resetError()}
the error object, the boolean visible to rendere the modal, and the callback called on onCancel modal event.
in order to render the object in antd table I create a list that contains the objec error.
*/


const initialState = {
  visible: true,
  error: [{}]
};

class Error extends Component {

  constructor(props) {
    super(props);
    //this.state = initialState
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }


  onCancel = async () => {
    if ( this.props.type ) {
      switch(this.props.type) {
        case 'Error':
          this.props.dispatch(setError(null))
          break
        case 'setAssetsError':
          this.props.dispatch(setAssetsError(null))
          break
        case 'setAssetAddError':
          this.props.dispatch(setAssetAddError(null))
          break
        case 'setAssetModifyError':
          this.props.dispatch(setAssetModifyError(null))
        break
        case 'setAssetDeleteError':
          this.props.dispatch(setAssetDeleteError(null))
          break
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
    console.log(this.props.type)
    console.log(this.props.error)


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
            break
          case 401:
            this.logout()
            //return <Result title={statusCode} />
            break
          case 403:
            return <Result status={statusCode} title={'403 - Forbidden'} />
            break
          case 404:
            return <Result status={statusCode} title={'404 - Not Found'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
            break
          case 409:
            return <Result title={'409 - Conflict'} />
            //return <Result icon=<img src={notFound} alt="loading..." /> title={'404 - Not found'} />
            break
          case 412:
            return <Result title={'412 - Precondition Failed'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break
          case 422:
            return <Result title={'422 - Unprocessable Entity'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break
          case 423:
            return <Result title={'423 - Locked'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break
          case 429:
            return <Result title={'429 - Too many requests'} />
            //return <Result icon=<img src={tooMany} alt="loading..." /> title={'429 - Too many requests'} />
            break

          case 500:
            return <Result title={'500'} />
            break
          case 502:
            return <Result title={statusCode} />
            break
          case 503:
            return <Result title={statusCode} />
            break

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
        title={<p style={{textAlign: 'center'}}>ERROR</p>}
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
        />
          </React.Fragment>
      </Modal>

    )
  }
}

export default connect((state) => ({

}))(Error);
