import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error/f5Error'

import { assetsFetch, assetDeleteError } from '../../_store/store.f5'

import { Button, Modal, Col, Row, Spin, Result } from 'antd'
import { LoadingOutlined, DeleteOutlined } from '@ant-design/icons'

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />
const deleteIcon = <DeleteOutlined style={{color: 'white' }}  />



class Delete extends React.Component {

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
  }

  assetDelete = async asset => {
    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, response: true}, () =>  this.props.dispatch(assetsFetch(true)) )
      },
      error => {
        this.props.dispatch(assetDeleteError(error))
        this.setState({loading: false, response: false})
      }
    )
    await rest.doXHR(`f5/asset/${asset.id}/`, this.props.token )

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
          title={<div><p style={{textAlign: 'center'}}>DELETE</p> <p style={{textAlign: 'center'}}>{this.props.obj.fqdn} - {this.props.obj.address}</p></div>}
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
                  <Button type="primary" onClick={() => this.assetDelete(this.props.obj)}>
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
            { this.props.assetDeleteError ? <Error component={'asset delete f5'} error={[this.props.assetDeleteError]} visible={true} type={'assetDeleteError'} /> : null }
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
 	assetDeleteError: state.f5.assetDeleteError,

}))(Delete);
