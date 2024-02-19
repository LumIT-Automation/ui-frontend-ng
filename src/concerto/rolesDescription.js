import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Table, List, Spin} from 'antd'

import { QuestionCircleOutlined, LoadingOutlined } from '@ant-design/icons';


import Rest from '../_helpers/Rest'
import Error from './error'

import {
  err,
} from './store'



const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />



class RolesDescription extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      errors: {},
      message:'',
      request: {}
    };
  }

  componentDidMount() {
  }

  shouldComponentUpdate(newProps, newState) {
    return true;
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  details = async () => {
    let fetchedRoles
    await this.setState({visible: true})
    await this.setState({loading: true})

    fetchedRoles = await this.dataGet('/roles/?related=privileges')
    if (fetchedRoles.status && fetchedRoles.status !== 200 ) {
      let error = Object.assign(fetchedRoles, {
        component: 'rolesDescription',
        vendor: 'concerto',
        errorType: 'rolesError'
      })
      this.props.dispatch(err(error))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({rolesAndPrivileges: fetchedRoles.data.items})
      await this.setState({loading: false})
    }

  }

  dataGet = async (entities) => {
    let r
    let rest = new Rest(
      "GET",
      resp => {
        r = resp
      },
      error => {
        r = error
      }
    )
    await rest.doXHR(`${this.props.vendor}${entities}`, this.props.token)
    return r
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    const columns = [
      {
        title: 'Role',
        align: 'center',
        dataIndex: 'role',
        key: 'role',
      },
      {
        title: 'Description',
        align: 'center',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Privileges',
        align: 'center',
        dataIndex: ['privileges', 'privilege'],
        key: 'privilege',
        render: (name, obj)  => (
          <List
            size="small"
            dataSource={obj.privileges}
            renderItem={item => <List.Item >{item.privilege ? item.privilege : item}</List.Item>}
          />
        )
      },
    ];

    let errors = () => {
      if (this.props.error && this.props.error.component === 'rolesDescription') {
        return <Error error={[this.props.error]} visible={true}/> 
      }
    }


    return (
      <React.Fragment>

        <div> <QuestionCircleOutlined style={{marginRight: '10px', marginTop: '12px', marginBottom: '12px'}} onClick={() => this.details()} /> Role </div>


        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.vendor} {this.props.title}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1000}
          maskClosable={false}
        >
          {this.state.loading ?
            <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/>
          :
            <Table
              columns={columns}
              dataSource={this.state.rolesAndPrivileges}
              bordered
              rowKey="role"
              scroll={{x: 'auto'}}
              //pagination={false}
              pagination={{ pageSize: 10 }}
              style={{marginBottom: 10}}
            />
          }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            {errors()}
          </React.Fragment>
        :
          null
        }
      </React.Fragment>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
}))(RolesDescription);
