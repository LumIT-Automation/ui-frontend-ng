import React from 'react'
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../../_helpers/Rest"
import Error from '../../../error'

import { setError } from '../../../_store/store.error'
import { setKeysFetch } from '../../../_store/store.f5'

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


  deleteKey = async key => {

    let l = key.name.split('/')
    let partition  = l[1]
    let keyName  = l[2]

    this.setState({loading: true})
    let rest = new Rest(
      "DELETE",
      resp => {
        this.setState({loading: false, success: true}, () => this.props.dispatch(setKeysFetch(true)) )
      },
      error => {
        this.props.dispatch(setError(error))
        this.setState({loading: false, success: false})
      }
    )
    await rest.doXHR(`f5/${this.props.asset.id}/${partition}/key/${keyName}/`, this.props.token )
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
      <React.Fragment>
        { this.props.error ?
          <Error error={[this.props.error]} visible={true} />
        :
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

            </Modal>
          </React.Fragment>
        }
      </React.Fragment>
    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
 	error: state.error.error,
  asset: state.f5.asset,
}))(Delete);
