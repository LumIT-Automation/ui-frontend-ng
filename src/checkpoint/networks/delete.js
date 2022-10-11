import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../_helpers/Rest"
import Error from '../error'

import { networksFetch, networkDeleteError } from '../store'

import { Button, Space, Modal, Col, Row, Spin, Result } from 'antd'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const deleteIcon = <DeleteOutlined style={{color: 'white' }}  />


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

  networkDelete = async network => {
    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true}, () => this.response())
      },
      error => {
        this.props.dispatch(networkDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`checkpoint/${this.props.asset.id}/${this.props.domain}/network/${this.props.obj.uid}/`, this.props.token )
  }

  response = () => {
    setTimeout( () => this.setState({ response: false }), 2000)
    setTimeout( () => this.props.dispatch(networksFetch(true)), 2030)
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

        <Button icon={deleteIcon} type='primary' danger onClick={() => this.details()} shape='round'/>

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
          { this.state.loading && <Spin indicator={spinIcon} style={{margin: '10% 48%'}}/> }
          {!this.state.loading && this.state.response &&
            <Result
               status="success"
               title="Deleted"
             />
          }
          {!this.state.loading && !this.state.response &&
            <div>
              <Row>
                <Col span={5} offset={10}>
                  <h2>Are you sure?</h2>
                </Col>
              </Row>
              <br/>
              <Row>
                <Col span={2} offset={10}>
                  <Button type="primary" onClick={() => this.networkDelete(this.props.obj)}>
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

        {this.state.visible ?
          <React.Fragment>
            { this.props.networkDeleteError ? <Error component={'delete network'} error={[this.props.networkDeleteError]} visible={true} type={'networkDeleteError'} /> : null }
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
  asset: state.checkpoint.asset,
  domain: state.checkpoint.domain,
  networkDeleteError: state.checkpoint.networkDeleteError
}))(Delete);
