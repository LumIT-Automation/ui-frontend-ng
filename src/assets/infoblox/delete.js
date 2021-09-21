import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Rest from "../../_helpers/Rest"
import Error from '../../error'

import { setInfobloxAssetsLoading, setInfobloxAssetsFetchStatus } from '../../_store/store.infoblox'

import { Button, Space, Modal, Col, Row, Spin, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;
/*
Asset is a table that receives assetList: state.f5.assetList from the store and render it.
*/

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


  deleteAsset = async asset => {
    this.props.dispatch(setInfobloxAssetsLoading( true ))
    let rest = new Rest(
      "DELETE",
      resp => {
        this.props.dispatch(setInfobloxAssetsLoading( false ))
        this.setState({success: true, error: false}, () => this.props.dispatch(setInfobloxAssetsFetchStatus( 'updated' )))
        this.success()
      },
      error => {
        this.props.dispatch(setInfobloxAssetsLoading( false ))
        this.setState({success: false, error: error})
      }
    )
    await rest.doXHR(`infoblox/asset/${asset.id}/`, this.props.token )

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

        <Button type="primary" danger onClick={() => this.details()}>
          Delete Asset
        </Button>


        <Modal
          title={<p style={{textAlign: 'center'}}>DELETE ASSET</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={null}
          onCancel={() => this.closeModal()}
          width={750}
        >
          { this.state.loading && <Spin indicator={antIcon} style={{margin: '10% 48%'}}/> }
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
                  <Button type="primary" onClick={() => this.deleteAsset(this.props.obj)}>
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


        {this.state.error ? <Error error={this.state.error} visible={true} resetError={() => this.resetError()} /> : <Error error={this.state.error} visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
  token: state.ssoAuth.token,
}))(Delete);
