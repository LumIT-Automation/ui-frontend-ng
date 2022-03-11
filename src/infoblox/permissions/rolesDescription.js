import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Table, List } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  rolesError
} from '../store.infoblox'



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

  details = () => {
    this.setState({visible: true})
    this.rolesGet()
  }

  rolesGet = async () => {
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({rolesAndPrivileges: resp.data.items}, () => {this.beautifyPriv()})
        },
      error => {
        this.props.dispatch(rolesError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`infoblox/roles/?related=privileges`, this.props.token)
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

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
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

        <div> <QuestionCircleOutlined style={{marginRight: '10px', marginTop: '12px', marginBottom: 'auto'}} onClick={() => this.details()} /> Role </div>


        <Modal
          title={<p style={{textAlign: 'center'}}>ROLES' DESCRIPTION</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1000}
        >
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
        </Modal>

        {this.state.visible ?
          <React.Fragment>
          { this.props.rolesError ? <Error component={'roledescription infoblox'} error={[this.props.rolesError]} visible={true} type={'rolesError'} /> : null }
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
  rolesError: state.infoblox.rolesError,
}))(RolesDescription);
