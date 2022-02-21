import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from '../../_helpers/Rest'
import Error from '../../error/f5Error'

import { profilesFetch, profileAddError } from '../../_store/store.f5'

import { Form, Input, Button, Space, Modal, Spin, Result, Select } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const addIcon = <PlusOutlined style={{color: 'white' }}  />


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
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
    this.fetchProfilesType()
  }

  fetchProfilesType = async () => {
    let profTypes = await this.fetchProfileTypesList()

    if (profTypes.status && profTypes.status !== 200 ) {
      this.props.dispatch(profileAddError(profTypes))
    }
    else {
      this.setState({profileTypes: profTypes.data.items})
    }
  }

  fetchProfileTypesList = async () => {
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
    await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/`, this.props.token)
    return r
  }

  setProfileName = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e.target.value) {
      request.name = e.target.value
      delete errors.nameError
    }
    else {
      errors.nameError = 'error'
    }
    this.setState({request: request, errors: errors})
  }

  setProfileType = e => {
    let request = Object.assign({}, this.state.request);
    let errors = Object.assign({}, this.state.errors);

    if (e) {
      request.profileType = e
      delete errors.profileTypeError
      }
      else {
        errors.profileTypeError = 'error'
      }
      this.setState({request: request, errors: errors})
  }


  profileAdd = async () => {
    let request = Object.assign({}, this.state.request)

    if (isEmpty(request)){
      this.setState({message: 'Please fill the form'})
    }

    else {
      this.setState({message: null});
      const b = {
        "data":
          {
            "name": this.state.request.name,
          }
        }

      this.setState({loading: true})

      let rest = new Rest(
        "POST",
        resp => {
          this.setState({loading: false, response: true}, () => this.response())
        },
        error => {
          this.props.dispatch(profileAddError(error))
          this.setState({loading: false, response: false})
        }
      )
      await rest.doXHR(`f5/${this.props.asset.id}/${this.props.partition}/profiles/${this.state.request.profileType}/`, this.props.token, b)
    }
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(profilesFetch(true)), 2030)
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

        <Button icon={addIcon} type='primary' onClick={() => this.details()} shape='round'/>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD PROFILE</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={750}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: 'auto 48%'}}/> }
        { !this.state.loading && this.state.response &&
          <Result
             status="success"
             title="Added"
           />
        }
        { !this.state.loading && !this.state.response &&
          <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="Name"
              name="name"
              key="name"
              validateStatus={this.state.errors.mameError}
              help={this.state.errors.nameError ? 'Please input a valid name' : null }
            >
              <Input id='name' placeholder="name" onBlur={e => this.setProfileName(e)}/>
            </Form.Item>

            <Form.Item
              label="Profile Type"
              name="profileType"
              key="profileType"
              validateStatus={this.state.errors.profileTypeError}
              help={this.state.errors.profileTypeError ? 'Please select profile type' : null }
            >
              <Select onChange={a => this.setProfileType(a)}>
                {this.state.profileTypes ? this.state.profileTypes.map((m, i) => {
                  return (
                    <Select.Option  key={i} value={m}>{m}</Select.Option>
                  )
                })
                :
                null
                }
              </Select>
            </Form.Item>

            {this.state.message ?
              <Form.Item
                wrapperCol={ {offset: 8, span: 16 }}
                name="message"
                key="message"
              >
                <p style={{color: 'red'}}>{this.state.message}</p>
              </Form.Item>

              : null
            }

            <Form.Item
              wrapperCol={ {offset: 8, span: 16 }}
              name="button"
              key="button"
            >
              <Button type="primary" onClick={() => this.profileAdd()}>
                Add Profile
              </Button>
            </Form.Item>

          </Form>
        }
        </Modal>

        {this.state.visible ?
          <React.Fragment>
            { this.props.profileAddError ? <Error component={'add profile'} error={[this.props.profileAddError]} visible={true} type={'profileAddError'} /> : null }
          </React.Fragment>
        :
          null
        }

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
 	error: state.error.error,
  asset: state.f5.asset,
  partition: state.f5.partition,
  profileAddError: state.f5.profileAddError
}))(Add);
