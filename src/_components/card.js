import React from 'react';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card, Button } from 'antd';

const { Meta } = Card;

const App = ({props}) => (
  <>
  
  <Card
    style={{
      width: props.width,
    }}
    /*cover={
      <img
        alt="example"
        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
      />
    }*/
    actions={[
      <>
      <Button 
        //type="primary" 
        //color={props.color}
        style={{ background: props.color, color: 'white'}}
        onClick={props.onClick}
      >
        Open
      </Button>
      </>
    ]}
  >
    <Meta
      //avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}

      
      //title={props.title}
      title={<div className="ant-card-meta-title">{props.title}</div>}
      description={<div className="description-text">{props.details}</div>}
      //description={props.details}
    />
  </Card>
  </>
);

export default App;