import React from 'react'
import { connect } from 'react-redux'
import { Tabs, Space, Spin, Form, Input, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Rest from "./_helpers/Rest";
import { setAssets, cleanUp } from './_store/store.f5'

import Error from './error'

import 'antd/dist/antd.css';
import './App.css'

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
//const { Search } = Input;



class Settings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
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
    this.props.dispatch(cleanUp())
  }

  resetError = () => {
    this.setState({ error: null})
  }


  render() {
    return (
      <Space direction="vertical" style={{width: '100%', justifyContent: 'center'}}>

        <Tabs type="card" destroyInactiveTabPane={true}>
        <TabPane tab="Permissions" key="2">
          {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> :
          <Form

            name="basic"
            initialValues={{ remember: true }}
            onFinish={null}
            onFinishFailed={null}
          >
            <Form.Item
              label="AD Group"
              name="adGroup"
              key="adGroup"

            >
              {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
              <Input id='adGroup' placeholder="AD Group" onClick={null} />
            </Form.Item>
            <Form.Item
              label="Vendor"
              name="address"
              key="address"

            >
              {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
              <Input id='address' placeholder="address" onClick={null} />
            </Form.Item>

            <Form.Item
              label="Asset"
              name="fqdn"
              key="fqdn"

            >
              <Input id='fqdn' placeholder="fqdn" onClick={null}/>
            </Form.Item>

            <Form.Item
              label="Partition"
              name="dataenter"
              key="dataenter"

            >
              <Input id='datacenter' placeholder="datacenter" onClick={null}/>
            </Form.Item>

            <Form.Item
              label="Role"
              name="environment"
              key="environment"

            >
              <Input id='environment' placeholder="environment" onClick={null}/>
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

          </Form>
          }
        </TabPane>
          <TabPane tab="Add Permissions" key="2">
            {this.state.loading ? <Spin indicator={antIcon} style={{margin: '10% 45%'}}/> :
            <Form

              name="basic"
              initialValues={{ remember: true }}
              onFinish={null}
              onFinishFailed={null}
            >
              <Form.Item
                label="AD Group"
                name="adGroup"
                key="adGroup"

              >
                {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
                <Input id='adGroup' placeholder="AD Group" onClick={null} />
              </Form.Item>
              <Form.Item
                label="Vendor"
                name="address"
                key="address"

              >
                {/*<Input placeholder="address" onBlur={e => this.ipv4Validator(e.target.value)} />*/}
                <Input id='address' placeholder="address" onClick={null} />
              </Form.Item>

              <Form.Item
                label="Asset"
                name="fqdn"
                key="fqdn"

              >
                <Input id='fqdn' placeholder="fqdn" onClick={null}/>
              </Form.Item>

              <Form.Item
                label="Partition"
                name="dataenter"
                key="dataenter"

              >
                <Input id='datacenter' placeholder="datacenter" onClick={null}/>
              </Form.Item>

              <Form.Item
                label="Role"
                name="environment"
                key="environment"

              >
                <Input id='environment' placeholder="environment" onClick={null}/>
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
                <Button type="primary" onClick={null}>
                  Add Permissions
                </Button>
              </Form.Item>

            </Form>
            }
          </TabPane>

        </Tabs>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}
      </Space>
    )
  }
}


export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  assets: state.f5.assets,
  permissions: state.permissions.f5
}))(Settings);
