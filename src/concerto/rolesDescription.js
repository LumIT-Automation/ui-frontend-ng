import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Table, List, Spin } from 'antd'
import { QuestionCircleOutlined, LoadingOutlined } from '@ant-design/icons'

import Rest from '../_helpers/Rest'
import Error from './error'

import {
  rolesError
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

    fetchedRoles = await this.rolesGet()
    if (fetchedRoles.status && fetchedRoles.status !== 200 ) {
      this.props.dispatch(rolesError(error))
      await this.setState({loading: false})
      return
    }
    else {
      await this.setState({rolesAndPrivileges: fetchedRoles.data.items})
      await this.beautifyPriv()
      await this.setState({loading: false})
    }

  }

  rolesGet = async () => {
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
    await rest.doXHR(`${this.props.vendor}/roles/?related=privileges`, this.props.token)
    return r
  }

  beautifyPriv = () => {
    let fetchedList = JSON.parse(JSON.stringify(this.state.rolesAndPrivileges))
    let newList = []

    for (let r in fetchedList) {
      let newRole = {}
      newRole.role = fetchedList[r].role
      newRole.description = fetchedList[r].description
      newRole.privileges = <List size="small" dataSource={fetchedList[r].privileges} renderItem={item => <List.Item >{item}</List.Item>} />
      newList.push(newRole)
    }
    this.setState({rolesBeauty: newList})
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
        dataIndex: 'privileges',
        key: 'privileges',
      },
    ];


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
              dataSource={this.state.rolesBeauty}
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
          { this.props.rolesError ? <Error component={`roledescription ${this.props.vendor}`} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
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
  rolesError: state.concerto.rolesError,
}))(RolesDescription);
