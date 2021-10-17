import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setError } from '../../_store/store.error'
import { setIdentityGroups, setIgIdentifiers } from '../../_store/store.authorizations'

import { Form, Input, Button, Space, Modal, Spin, Result, Select, AutoComplete } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

/*

*/

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
    }
    return true;
}

class Add extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      error: null,
      errors: {},
      message:'',
      body: {}
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

  onChange = event => {
    let body = Object.assign({}, this.state.body);
    body.dn = event.target.value
    this.setState({body: body})
  }

  addNewDn = async () => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);

    this.setState({message: null});
    let list = this.state.body.dn.split(',')
    let cn
    let found = list.find(i => {
      let iLow = i.toLowerCase()
      if (iLow.startsWith('cn=')) {
        i = i.split('=')
        cn = i[1]
      }
    })

    const b = {
      "data":
        {
          "name": cn,
          "identity_group_identifier": body.dn
        }
      }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, success: true}, () => {this.fetchIdentityGroups()})
        this.success()
      },
      error => {
        this.setState({loading: false, success: false, error: error})
      }
    )
    await rest.doXHR(`f5/identity-groups/`, this.props.token, b )
  }

  fetchIdentityGroups = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setIdentityGroups( resp ))
        this.props.dispatch(setIgIdentifiers(resp))
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR("f5/identity-groups/", this.props.token)
  }

  resetError = () => {
    this.setState({ error: null})
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
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

          <Button type="primary" style={{marginLeft: '15px'}} onClick={() => this.details()}>
            Add Group
          </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD GROUP</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
        { this.state.loading && <Spin indicator={antIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.success &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.success &&
          <Form
            {...layout}
            name="basic"
            initialValues={{
              remember: true,
              dn: this.state.body.dn,
            }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Distinguished Name"
              name='dn2'
              key="dn2"
            >
              <Input onChange={this.onChange} placeholder="cn=..."/>
            </Form.Item>


            {this.state.message ?
              <Form.Item

                name="message"
                key="message"
              >
                <p style={{color: 'red'}}>{this.state.message}</p>
              </Form.Item>

              : null
            }

            <Form.Item
              wrapperCol={ {offset: 6 }}
              name="button"
              key="button"
            >
              <Button type="primary" onClick={() => this.addNewDn()}>
                Add Group
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>


        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  assets: state.f5.assets,
  authorizations: state.authorizations.f5,
  identityGroups: state.authorizations.identityGroups,
  igIdentifiers: state.authorizations.igIdentifiers,
  f5Permissions: state.permissions.f5Permissions,
  f5PermissionsBeauty: state.permissions.f5PermissionsBeauty
}))(Add);
