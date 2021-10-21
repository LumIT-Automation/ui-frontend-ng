import React from 'react';
import { connect } from 'react-redux'
import "antd/dist/antd.css"
import Error from '../../error'
import Rest from "../../_helpers/Rest";

import AssetSelector from './assetSelector'
import DetailsIp from './detailsIp'
import RequestIp from './requestIp'
import ModifyIp from './modifyIp'
import ReleaseIp from './releaseIp'

import { Space, Row, Col, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';


class Manager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
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




  render() {
    console.log(this.props.assets)

    return (
      <Space direction='vertical' style={{width: '100%', justifyContent: 'center'}}>

        <Row>
          <Row>
            <div style={{margin: '0 150px'}}>
              <AssetSelector/>
            </div>
          </Row>
          <Divider/>
          <Row>
          </Row>
          <Col>
            Details IP
          </Col>

          <Col>
            <RequestIp/>
          </Col>

          <Col>
            Modify IP
          </Col>

          <Col>
            Release IP
          </Col>
        </Row>

        {this.props.error ? <Error error={[this.props.error]} visible={true} resetError={() => this.resetError()} /> : <Error visible={false} />}

      </Space>

    )
  }
}

export default connect((state) => ({
 	error: state.error.error,
  authorizations: state.authorizations.infoblox,
  assets: state.infoblox.assets,
}))(Manager);
