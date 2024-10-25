import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import 'antd/dist/antd.css';
import '../App.css';

import Rest from '../_helpers/Rest';
import Error from './error';

import { getColumnSearchProps, handleSearch, handleReset } from '../_helpers/tableUtils';

import { Space, Table, Button, Spin, Progress } from 'antd';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

import {
  historys,
  err,
  taskProgressLoading,
  secondStageProgressLoading,
} from './store';

const spinIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

function History(props) {
  let [loading, setLoading] = useState(false);
  let [historysRefresh, setHistorysRefresh] = useState(false);
  let [assets, setAssets] = useState([]);

  let [searchText, setSearchText] = useState('');
  let [searchedColumn, setSearchedColumn] = useState('');
  let searchInput = useRef(null);

  let interval = useRef(null);

  useEffect(() => {
    console.log(props.vendor)
    if (!props.error) {
        setHistorysRefresh(false);
        props.dispatch(historys([]));
        setLoading(true);
        getAssets();
      }
    return () => clearInterval(interval.current);

  }, [props.vendor, historysRefresh]);

  useEffect(() => {
    main();
  }, [assets]);
  


/*
  useEffect(() => {
    if (props.vendor === 'vmware') {
      if (!props.error) {
        setHistorysRefresh(false);
        if (!props.historys) {
          main();
        }
        interval.current = setInterval(() => refresh(), 15000);
      } else {
        clearInterval(interval.current);
      }
    }
    if (!props.error) {
      setHistorysRefresh(false);
      main();
    }
    return () => clearInterval(interval.current);
  }, [props.vendor]);

  useEffect(() => {
    if (historysRefresh) {
      if (props.vendor === 'vmware') {
        clearInterval(interval.current);
      }
      setHistorysRefresh(false);
      main();
    }
  }, [historysRefresh]);*/

  let main = async () => {
    let fetchedHistorys = await historyGet();
    if (fetchedHistorys.status && fetchedHistorys.status !== 200) {
      let error = Object.assign(fetchedHistorys, {
        component: 'history',
        vendor: 'concerto',
        errorType: 'historysError',
      });
      props.dispatch(err(error));
      setLoading(false);
      return;
    } else {
      let hists = [];
      let asset;
      fetchedHistorys.data.items.forEach((hist) => {
        try {
          if (props.vendor === 'vmware') {
            asset = assets.find((a) => a.id === hist.id_asset);
          } else {
            asset = assets.find((a) => a.id === hist.asset_id);
          }

          hist.fqdn = asset?.fqdn || '';
          hists.push(hist);
        } catch (error) {
          console.log(error);
        }
      });

      console.log(hists)

      if (props.vendor === 'vmware') {
        interval.current = setInterval(() => refresh(), 5000);
        let list = [];
        setLoading(false);
        hists.forEach((item) => {
          let ts = item.task_startTime.split('.');
          item.task_startTime = ts[0];
          list.push(item);
        });

        props.dispatch(historys(list));
      } else {
        setLoading(false);
        props.dispatch(historys(hists));
      }
    }
  };

  let refresh = async () => {
    if (!props.historys || props.historys.length < 1) {
      console.log('return')
      clearInterval(interval.current);
      return
    }
    else {
      let taskProgress = false;
      let secondStage = false;
      console.log(props.historys)
      try {
        props.historys.forEach((item) => {
          if (item.second_stage_state === 'running') {
            secondStage = true;
          }
          if (item.task_state === 'running') {
            taskProgress = true;
          }
        });
      }
      catch(error) {
        console.log(error)
      }


      if (taskProgress) {
        props.dispatch(taskProgressLoading(true));
      }
      if (secondStage) {
        props.dispatch(secondStageProgressLoading(true));
      }

      let list = [];

      let fetchedHistorys = await historyGet();
      props.dispatch(taskProgressLoading(false));
      props.dispatch(secondStageProgressLoading(false));

      if (fetchedHistorys.status && fetchedHistorys.status !== 200) {
        let error = Object.assign(fetchedHistorys, {
          component: 'history',
          vendor: 'concerto',
          errorType: 'historysError',
        });
        props.dispatch(err(error));
        return;
      } else {
        fetchedHistorys.data.items.forEach((item) => {
          let ts
          try {
            ts = item.task_startTime.split('.');
            item.task_startTime = ts[0];
            list.push(item);
          }
          catch(error) {
            console.log(error)
          }
        });
        props.dispatch(historys({ data: { items: list } }));
      }
    }
    
  };

  let getAssets = async () => {
    setLoading(true);
    let fetchedAssets = await assetGet();
    if (fetchedAssets.status && fetchedAssets.status !== 200) {
      let error = Object.assign(fetchedAssets, {
        component: 'history',
        vendor: 'concerto',
        errorType: 'assetsError',
      });
      props.dispatch(err(error));
      setLoading(false);
      return;
    } else {
      setAssets(fetchedAssets.data.items);
    }
  }

  let assetGet = async () => {
    let endpoint = `${props.vendor}/assets/`;
    let r;
    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );

    await rest.doXHR(`${endpoint}`, props.token);

    return r;
  };

  let historyGet = async () => {
    let endpoint = '';
    if (props.vendor === 'vmware') {
      endpoint = `${props.vendor}/stage2/targets/?results=10`;
    } else {
      endpoint = `${props.vendor}/history/`;
    }

    let r;
    let rest = new Rest(
      'GET',
      (resp) => {
        r = resp;
      },
      (error) => {
        r = error;
      }
    );

    await rest.doXHR(`${endpoint}`, props.token);

    return r;
  };

  let returnCol = () => {
    if (props.vendor === 'infoblox') {
      return infobloxColumns;
    } else if (props.vendor === 'checkpoint') {
      return checkpointColumns;
    } else if (props.vendor === 'f5') {
      return f5Columns;
    } else if (props.vendor === 'vmware') {
      return vmwareColumns;
    } else {
      return f5Columns;
    }
  };

  const execCommands = [
    {
      title: 'Command',
      align: 'center',
      width: 200,
      dataIndex: 'command',
      key: 'command',
      ...getColumnSearchProps(
        'command', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Status',
      align: 'center',
      width: 100,
      dataIndex: 'exit_status',
      key: 'exit_status',
      ...getColumnSearchProps(
        'exit_status', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Error',
      align: 'center',
      width: 300,
      dataIndex: 'stderr',
      key: 'stderr',
      ...getColumnSearchProps(
        'stderr', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    }
  ]

  const infobloxColumns = [
    {
      title: 'Type',
      align: 'center',
      dataIndex: 'type',
      key: 'type',
      ...getColumnSearchProps(
        'type', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Asset',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Action',
      align: 'center',
      width: 500,
      dataIndex: 'action',
      key: 'action',
      ...getColumnSearchProps(
        'action', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Address',
      align: 'center',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps(
        'address', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Network',
      align: 'center',
      dataIndex: 'network',
      key: 'network',
      ...getColumnSearchProps(
        'network', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Gateway',
      align: 'center',
      dataIndex: 'gateway',
      key: 'gateway',
      ...getColumnSearchProps(
        'gateway', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Date',
      align: 'center',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      ...getColumnSearchProps(
        'date', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps(
        'status', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Username',
      align: 'center',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps(
        'username', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    }
  ];
  const checkpointColumns = [
    {
      title: 'Config Object Type',
      align: 'center',
      width: 300,
      dataIndex: 'config_object_type',
      key: 'config_object_type',
      ...getColumnSearchProps(
        'config_object_type', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Asset',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Name',
      align: 'center',
      width: 500,
      dataIndex: 'config_object_name',
      key: 'config_object_name',
      ...getColumnSearchProps(
        'config_object_name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Description',
      align: 'center',
      width: 500,
      dataIndex: 'config_object_description',
      key: 'config_object_description',
      ...getColumnSearchProps(
        'config_object_description', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Action',
      align: 'center',
      width: 500,
      dataIndex: 'action',
      key: 'action',
      ...getColumnSearchProps(
        'action', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Date',
      align: 'center',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      ...getColumnSearchProps(
        'date', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps(
        'status', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Username',
      align: 'center',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps(
        'username', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    }
  ];
  const f5Columns = [
    {
      title: 'Config Object Type',
      align: 'center',
      width: 300,
      dataIndex: 'config_object_type',
      key: 'config_object_type',
      ...getColumnSearchProps(
        'config_object_type', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Asset',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Status',
      align: 'center',
      dataIndex: 'status',
      key: 'status',
      ...getColumnSearchProps(
        'status', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Action',
      align: 'center',
      width: 500,
      dataIndex: 'action',
      key: 'action',
      ...getColumnSearchProps(
        'action', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Config Object',
      align: 'center',
      dataIndex: 'config_object',
      key: 'config_object',
      ...getColumnSearchProps(
        'config_object', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Date',
      align: 'center',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      ...getColumnSearchProps(
        'date', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Username',
      align: 'center',
      dataIndex: 'username',
      key: 'username',
      ...getColumnSearchProps(
        'username', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    }
  ];
  const vmwareColumns = [
    {
      title: 'Vm name',
      align: 'center',
      width: 150,
      dataIndex: 'vm_name',
      key: 'vm_name',
      ...getColumnSearchProps(
        'vm_name', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Asset',
      align: 'center',
      dataIndex: 'fqdn',
      key: 'fqdn',
      ...getColumnSearchProps(
        'fqdn', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Start time',
      align: 'center',
      width: 250,
      dataIndex: 'task_startTime',
      key: 'task_startTime',
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.task_startTime) - new Date(b.task_startTime),
      ...getColumnSearchProps(
        'task_startTime', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Task state',
      align: 'center',
      width: 100,
      dataIndex: 'task_state',
      key: 'task_state',
      ...getColumnSearchProps(
        'task_state', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Task progress',
      align: 'center',
      width: 280,
      dataIndex: 'task_progress',
      key: 'task_progress',
      render: (name, obj)  => (
        <React.Fragment>
          { obj.task_progress ?
            <Progress percent={obj.task_progress} />
          :
            <React.Fragment>
            { obj.task_state === 'success' ?
              <Progress percent={100} />
            :
              null
            }
            </React.Fragment>
          }
        </React.Fragment>
      )
    },
    {
      title: 'Task message',
      align: 'center',
      width: 200,
      dataIndex: 'task_message',
      key: 'task_message',
      ...getColumnSearchProps(
        'task_message', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Second stage',
      align: 'center',
      width: 200,
      dataIndex: 'second_stage_state',
      key: 'second_stage_state',
      ...getColumnSearchProps(
        'second_stage_state', 
        searchInput, 
        (selectedKeys, confirm, dataIndex) => handleSearch(selectedKeys, confirm, dataIndex, setSearchText, setSearchedColumn),
        (clearFilters, confirm) => handleReset(clearFilters, confirm, setSearchText), 
        searchText, 
        searchedColumn, 
        setSearchText, 
        setSearchedColumn
      ),
    },
    {
      title: 'Commands Executions',
      align: 'center',
      width: 500,
      dataIndex: 'commandsExecutions',
      key: 'commandsExecutions',
      render: (name, obj)  => (
        <React.Fragment>
          <Table
            columns={execCommands}
            dataSource={obj.commandsExecutions}
            bordered
            rowKey={randomKey}
            scroll={{y: '30vh'}}
            pagination={false}
            style={{maxWidth: '100%', marginLeft: '-28px', minHeight: '30vh'}}
          />
        </React.Fragment>
      )
    },
  ];

  let randomKey = () => Math.random().toString();

  let errorsComponent = () => {
    if (props.error && props.error.component === 'history') {
      return <Error error={[props.error]} visible={true} />;
    }
  };

  return (
    <React.Fragment>
      {console.log(interval)}
      {loading ? (
        <Spin indicator={spinIcon} style={{ margin: '10% 45%' }} />
      ) : (
        <Space direction="vertical" style={{ width: '100%', padding: 15, marginBottom: 10 }}>
          <Button onClick={() => setHistorysRefresh(true)}>
            <ReloadOutlined />
          </Button>
          <br />
          <Table
            columns={returnCol()}
            dataSource={props.historys}
            bordered
            rowKey={randomKey}
            scroll={{ x: 'auto' }}
            pagination={{ pageSize: 10 }}
          />
        </Space>
      )}
      {errorsComponent()}
    </React.Fragment>
  );
};

export default connect((state) => ({
  token: state.authentication.token,
  error: state.concerto.err,
  historys: state.concerto.historys,
  taskProgressLoading: state.concerto.taskProgressLoading,
  secondStageProgressLoading: state.concerto.secondStageProgressLoading,
}))(History);
