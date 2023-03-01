import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import { Modal, Row, Col, Select, Button, Spin, Result } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { LoadingOutlined } from '@ant-design/icons'
import Rest from '../../_helpers/Rest'
import Error from '../error'

import {
  permissionsFetch,
  identityGroups,
  identityGroupDeleteError,
  identityGroupsError
} from '../store'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />


class IdentityGroupDelete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
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
    this.main()
  }

  main = async () => {
    let fetchedIdentityGroups = await this.identityGroupsGet()
    if (fetchedIdentityGroups.status && fetchedIdentityGroups.status !== 200 ) {
      this.props.dispatch(identityGroupsError(fetchedIdentityGroups))
      return
    }
    else {
      this.props.dispatch(identityGroups( fetchedIdentityGroups ))
    }
  }


  //GET
  identityGroupsGet = async () => {
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
    await rest.doXHR("checkpoint/identity-groups/", this.props.token)
    return r
  }

  identityGroupSet = async identity_group_identifier => {
    await this.setState({identity_group_identifier: identity_group_identifier})
  }


  identityGroupDelete = async () => {
    await this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true}, () => this.props.dispatch(permissionsFetch(true)) )
        },
      error => {
        this.props.dispatch(identityGroupDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/identity-group/${this.state.identity_group_identifier}/`, this.props.token)
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.closeModal(), 2050)
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      identity_group_identifier: ''
    })
  }


  render() {

    return (
      <React.Fragment>

        <Button type="primary" danger onClick={() => this.details()} shape='round'>
          Remove identity group
        </Button>

        <Modal
          title={<p style={{textAlign: 'center'}}>Delete identity group</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1000}
          maskClosable={false}
        >
        { this.state.loading && <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/> }
        {!this.state.loading && this.state.response &&
          <Result
             status="success"
             title="Deleted"
           />
        }
        {!this.state.loading && !this.state.response &&
          <React.Fragment>
          <Row>
            <Col offset={2} span={6}>
              <p style={{marginRight: 25, float: 'right'}}>Identity group:</p>
            </Col>
            <Col span={16}>
              <React.Fragment>
                { this.props.identityGroups && this.props.identityGroups.length > 0 ?
                  <React.Fragment>
                    <Select
                      value={this.state.identity_group_identifier}
                      showSearch
                      style={{width: 350}}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      filterSort={(optionA, optionB) =>
                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                      }
                      onSelect={n => this.identityGroupSet(n)}
                    >
                      <React.Fragment>
                        {this.props.identityGroups.map((n, i) => {
                          return (
                            <Select.Option key={i} value={n.identity_group_identifier}>{n.identity_group_identifier}</Select.Option>
                          )
                        })
                        }
                      </React.Fragment>
                    </Select>
                  </React.Fragment>
                :
                  null
                }
              </React.Fragment>
            </Col>
          </Row>
          <br/>

          {this.state.identity_group_identifier ?
            <React.Fragment>
              <Row>
                <Col offset={7}>
                  <p>Delete {this.state.identity_group_identifier} and all of its permissions?</p>
                </Col>
              </Row>
              <Row>
                <Col span={2} offset={10}>
                  <Button type="primary" onClick={() => this.identityGroupDelete()}>
                    YES
                  </Button>
                </Col>
                <Col span={2} offset={1}>
                  <Button type="primary" onClick={() => this.closeModal()}>
                    NO
                  </Button>
                </Col>
              </Row>
            </React.Fragment>
          :
            null
          }

          </React.Fragment>
        }

      </Modal>

      {this.state.visible ?
        <React.Fragment>
        { this.props.identityGroupDeleteError ? <Error component={'identityGroupDeleteError'} error={[this.props.identityGroupDeleteError]} visible={true} type={'identityGroupDeleteError'} /> : null }
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
  identityGroups: state.checkpoint.identityGroups,
  identityGroupDeleteError: state.checkpoint.identityGroupDeleteError,
}))(IdentityGroupDelete);
