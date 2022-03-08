import React from 'react'
import { connect } from 'react-redux'
import 'antd/dist/antd.css'
import Rest from "../../../_helpers/Rest"
import Error from "../../../error/f5Error"

import { certificatesFetch, certificateDeleteError } from '../../../f5/store.f5'

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


  deleteCertificate = async cert => {

    let l = cert.name.split('/')
    let partition  = l[1]
    let certName  = l[2]

    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true}, () => this.props.dispatch(certificatesFetch(true)) )
      },
      error => {
        this.props.dispatch(certificateDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${partition}/certificate/${certName}/`, this.props.token )
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
                  <Button type="primary" onClick={() => this.deleteCertificate(this.props.obj)}>
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
              { this.props.certificateDeleteError ? <Error component={'certificates add'} error={[this.props.certificateDeleteError]} visible={true} type={'certificateDeleteError'} /> : null }
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
 	certificateDeleteError: state.f5.certificateDeleteError,
  asset: state.f5.asset,
}))(Delete);
