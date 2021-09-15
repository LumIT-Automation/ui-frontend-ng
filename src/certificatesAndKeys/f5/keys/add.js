import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../../_helpers/Rest"
import Error from '../../../error'

import { setAssetList, setKeysList } from '../../../_store/store.f5'
import { setF5Permissions, setF5PermissionsBeauty } from '../../../_store/store.permissions'

//import { fetchNetworks, requestIp } from '../actions/ipamActions'


import { Form, Input, Button, Select, Card, Space, Radio, Alert, Spin, Result, Modal } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
const { TextArea } = Input;

/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/

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
    super(props)
      this.state = {
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

  setFilename = e => {
    let body = Object.assign({}, this.state.body);
    let errors = Object.assign({}, this.state.errors);
    body.fileName = e.target.value
    this.setState({body: body})
  }

  setSourceType = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)
    if (e.target.value === 'pasteText') {
      body.sourceValue = e.target.value
    } else if (e.target.value === 'upload') {
      body.sourceValue = e.target.value
    }
    this.setState({body: body})
  }

  setText = event => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)
    body.text = event.target.value
    this.setState({body: body})
  }

  uploadFile = event => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)
    body.selectedFile = event.target.files[0]
    this.setState({body: body}, () => this.readSingleFile(event))
  }

  readSingleFile = e => {
    let body = Object.assign({}, this.state.body)
    let errors = Object.assign({}, this.state.errors)

    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      var contents = e.target.result;
      body.text = contents
    };
    reader.readAsText(file);
    this.setState({body: body})
  }

  installKey =  async () => {
    let keyName = `${this.state.body.fileName}`
    let contentBase64 = btoa(this.state.body.text)

    let body = {
      "key": {
        "name": keyName,
        "content_base64": contentBase64
      }
    }

    this.setState({loading: true})

    let rest = new Rest(
      "POST",
      resp => {
        this.setState({loading: false, success: true}, () => this.fetchKeys())
        this.success()
      },
      error => {
        this.setState({loading: false, success: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token, body )
  }

  fileSummary = () => {
    if (this.state.body.selectedFile) {
      return (
        <Form.Item label="File Details">
          <Card>
              <p>Name: {this.state.body.selectedFile.name}</p>
              <p>Type: {this.state.body.selectedFile.type}</p>
              <p>Size: {this.state.body.selectedFile.size} Bytes</p>
          </Card>
        </Form.Item>

      );
    } else {
        if (this.state.body.sourceValue === "upload") {
          return (
            <Form.Item label="File Details" >
              <Card>

              </Card>
            </Form.Item>
          )
        }
    }
  }

  fetchKeys = async () => {
    this.setState({loading: true})
    let rest = new Rest(
      "GET",
      resp => {
        this.setState({loading: false})
        this.props.dispatch(setKeysList( resp ))
      },
      error => {
        this.setState({loading: false})
        this.setState({error: error})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/keys/`, this.props.token)
  }

  success = () => {
    setTimeout( () => this.setState({ success: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
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

          <Button type="primary" onClick={() => this.details()}>
            Add Key
          </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>ADD KEY</p>}
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
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            initialValues={{ size: 'default' }}
            size={'default'}
          >

              <Form.Item label="Key name" >
                <Input onChange={e => this.setFilename(e)}/>
              </Form.Item>

            { (this.state.body.fileName) ?
              <Form.Item label="File source">
              <Radio.Group onChange={e => this.setSourceType(e)} value={this.state.body.sourceValue}>
                <Radio value={"upload"}>Upload</Radio>
                <Radio value={"pasteText"}>Paste text</Radio>
              </Radio.Group>
              </Form.Item>
              :
              null
            }

            {this.state.body.sourceValue === "upload" ?
              <Form.Item label="Upload File">
                <Input type="file" onChange={this.uploadFile} />
              </Form.Item>
              :
              null
            }

            {this.state.body.sourceValue === "pasteText" ?
              <Form.Item label="Paste Text">
                <TextArea rows={4} onChange={e => this.setText(e)} />
              </Form.Item>
              :
              null
            }

            {this.fileSummary()}

            { (this.props.asset) ?
              <Form.Item wrapperCol={ {offset: 8, span: 16 }}>
                <Button type="primary" onClick={this.installKey}>Install {this.state.body.fileType}</Button>
              </Form.Item>
            :
              <Form.Item wrapperCol={ {offset: 8, span: 8 }}>
                {
                  <Alert message="Asset not set" type="error" />
                }
              </Form.Item>
            }

          </Form>
        }




        </Modal>

        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
  authorizations: state.authorizations.f5,
  asset: state.f5.asset,
  partition: state.f5.partition
}))(Add);
