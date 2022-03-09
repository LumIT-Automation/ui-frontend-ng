import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../../_helpers/Rest"
import Error from "../../../f5/error"

import { keysFetch, keyDeleteError } from '../../../f5/store.f5'

import { Button, Modal, Col, Row, Spin, Result } from 'antd'
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


  deleteKey = async key => {

    let l = key.name.split('/')
    let partition  = l[1]
    let keyName  = l[2]

    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true}, () => this.props.dispatch(keysFetch(true)) )
      },
      error => {
        this.props.dispatch(keyDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${partition}/key/${keyName}/`, this.props.token )
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
    })
  }


  render() {

    return (
      <React.Fragment>

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
                  <Button type="primary" onClick={() => this.deleteKey(this.props.obj)}>
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

          {this.state.visible ?
            <React.Fragment>
              { this.props.keyDeleteError ? <Error component={'keys add'} error={[this.props.keyDeleteError]} visible={true} type={'keyDeleteError'} /> : null }
            </React.Fragment>
          :
            null
          }

        </Modal>
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.authentication.token,
  keyDeleteError: state.f5.keyDeleteError,
  asset: state.f5.asset,
}))(Delete);
