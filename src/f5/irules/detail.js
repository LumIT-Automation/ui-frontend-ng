import React from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Space, Input } from 'antd'

const { TextArea } = Input;


class Detail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      members: [],
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


  details = (irule) => {
    this.setState({visible: true})
  }

  //Close and Error
  closeModal = () => {
    this.setState({
      visible: false,
      members: [],
    })
  }



  render() {

    return (
      <Space>
        <Button type="primary" onClick={() => this.details(this.props.obj)}>
          Show Details
        </Button>
        <Modal
          title={<p style={{textAlign: 'center'}}>{this.props.obj.name}</p>}
          centered
          destroyOnClose={true}
          visible={this.state.visible}
          footer={''}
          onOk={() => this.setState({visible: true})}
          onCancel={() => this.closeModal()}
          width={1500}
          maskClosable={false}
        >
          <TextArea rows={25} defaultValue={this.props.obj.apiAnonymous} name="text" id='name' />
        </Modal>

      </Space>
    );
  }
}

export default connect((state) => ({


}))(Detail);
