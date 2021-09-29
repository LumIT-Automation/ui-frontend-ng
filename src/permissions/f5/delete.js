import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setF5Permissions, setF5PermissionsBeauty } from '../../_store/store.permissions'

import { Button, Space, Modal, Result, Spin, Row, Col } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*

*/

class Delete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
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
  }


  deletePermission = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, success: true}, () => {this.fetchPermissions()})
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/permission/${this.props.obj.permissionId}/`, this.props.token )
  }

  fetchPermissions = async () => {
    this.setState({loading: true})

    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setF5Permissions(resp))
        this.permissionsInRows()
        },
      error => {
        this.setState({loading: false, error: error})
      }
    )
    await rest.doXHR(`f5/permissions/`, this.props.token)
  }

  permissionsInRows = () => {
    let permissions = Object.assign([], this.props.f5Permissions)
    let list = []

    for ( let p in permissions) {
      let asset = this.props.assets.find(a => a.id === permissions[p].partition.asset_id)
      let permissionId = permissions[p].id
      let name = permissions[p].identity_group_name
      let dn = permissions[p].identity_group_identifier
      let role = permissions[p].role
      let assetId = permissions[p].partition.asset_id
      let partition = permissions[p].partition.name
      let fqdn = asset.fqdn
      let address = asset.address

      list.push({
        permissionId: permissionId,
        name: name,
        dn: dn,
        role: role,
        assetId: assetId,
        partition: partition,
        fqdn: fqdn,
        address: address
      })
    }
    this.props.dispatch(setF5PermissionsBeauty(list))
  }

  resetError = () => {
    this.setState({ error: null})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    return (
      <Space direction='vertical'>

        <Button type="primary" danger onClick={() => this.details()}>
          Delete Permission
        </Button>


        <Modal
          title={<div><p style={{textAlign: 'center'}}>DELETE</p> <p style={{textAlign: 'center'}}>{this.props.obj.name}</p></div>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={null}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={antIcon} style={{margin: '10% 48%'}}/> }
          {!this.state.loading && this.state.success &&
            <Result
               status="success"
               title="Deleted"
             />
          }
          {!this.state.loading && !this.state.success &&
            <div>
              <Row>
                <Col span={5} offset={10}>
                  <h2>Are you sure?</h2>
                </Col>
              </Row>
              <br/>
              <Row>
                <Col span={2} offset={10}>
                  <Button type="primary" onClick={() => this.deletePermission(this.props.obj)}>
                    YES
                  </Button>
                </Col>
                <Col span={2} offset={1}>
                  <Button type="primary" onClick={() => this.closeModal()}>
                    NO
                  </Button>
                </Col>
              </Row>
            </div>
          }

        </Modal>


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  assets: state.f5.assets,
  f5Permissions: state.permissions.f5Permissions,
  f5PermissionsBeauty: state.permissions.f5PermissionsBeauty
}))(Delete);
