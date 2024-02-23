import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const f5Slice = createSlice({
    name: 'f5',
    initialState: {},
    reducers: {
        environment: (state, action) => {
          state.environment = action.payload
        },

        assetsLoading: (state, action) => {
          state.assetsLoading = action.payload
        },
        assets: (state, action) => {
          state.assets = action.payload.data.items
        },
        assetsFetch: (state, action) => {
          state.assetsFetch = action.payload
        },

        asset: (state, action) => {
          state.asset = action.payload
        },

        partitionsLoading: (state, action) => {
          state.partitionsLoading = action.payload
        },
        partitions: (state, action) => {
          state.partitions = action.payload.data.items
        },
        partitionsFetch: (state, action) => {
          state.partitionsFetch = action.payload
        },

        partition: (state, action) => {
          state.partition = action.payload
        },

        routeDomainsLoading: (state, action) => {
          state.routeDomainsLoading = action.payload
        },
        routeDomains: (state, action) => {
          state.routeDomains = action.payload.data.items
        },
        routeDomainsFetch: (state, action) => {
          state.routeDomainsFetch = action.payload
        },

        dataGroupsLoading: (state, action) => {
          state.dataGroupsLoading = action.payload
        },
        dataGroups: (state, action) => {
          state.dataGroups = action.payload.data.items
        },
        dataGroupsFetch: (state, action) => {
          state.dataGroupsFetch = action.payload
        },

        f5objectsLoading: (state, action) => {
          state.f5objectsLoading = action.payload
        },
        f5objects: (state, action) => {
          state.f5objects = action.payload.data.items
        },
        f5objectsFetch: (state, action) => {
          state.f5objectsFetch = action.payload
        },        

        nodesLoading: (state, action) => {
          state.nodesLoading = action.payload
        },
        nodes: (state, action) => {
          state.nodes = action.payload.data.items
        },
        nodesFetch: (state, action) => {
          state.nodesFetch = action.payload
        },

        monitorTypes: (state, action) => {
          state.monitorTypes = action.payload
        },
        monitorsLoading: (state, action) => {
          state.monitorsLoading = action.payload
        },
        monitors: (state, action) => {
          state.monitors = action.payload
        },
        monitorsFetch: (state, action) => {
          state.monitorsFetch = action.payload
        },

        poolsLoading: (state, action) => {
          state.poolsLoading = action.payload
        },
        pools: (state, action) => {
          state.pools = action.payload.data.items
        },
        poolsFetch: (state, action) => {
          state.poolsFetch = action.payload
        },

        poolMembersLoading: (state, action) => {
          state.poolMembersLoading = action.payload
        },
        poolMembers: (state, action) => {
          state.poolMembers = action.payload.data.items
        },
        poolMembersFetch: (state, action) => {
          state.poolMembersFetch = action.payload
        },

        snatPoolsLoading: (state, action) => {
          state.snatPoolsLoading = action.payload
        },
        snatPools: (state, action) => {
          state.snatPools = action.payload.data.items
        },
        snatPoolsFetch: (state, action) => {
          state.snatPoolsFetch = action.payload
        },

        irulesLoading: (state, action) => {
          state.irulesLoading = action.payload
        },
        irules: (state, action) => {
          state.irules = action.payload.data.items
        },
        irulesFetch: (state, action) => {
          state.irulesFetch = action.payload
        },

        certificatesLoading: (state, action) => {
          state.certificatesLoading = action.payload
        },
        certificates: (state, action) => {
          state.certificates = action.payload.data.items
        },
        certificatesFetch: (state, action) => {
          state.certificatesFetch = action.payload
        },

        certificate: (state, action) => {
          state.certificate = action.payload
        },

        keysLoading: (state, action) => {
          state.keysLoading = action.payload
        },
        keys: (state, action) => {
          state.keys = action.payload.data.items
        },
        keysFetch: (state, action) => {
          state.keysFetch = action.payload
        },

        key: (state, action) => {
          state.key = action.payload
        },

        profilesLoading: (state, action) => {
          state.profilesLoading = action.payload
        },
        profiles: (state, action) => {
          state.profiles = action.payload
        },
        profilesFetch: (state, action) => {
          state.profilesFetch = action.payload
        },

        virtualServersLoading: (state, action) => {
          state.virtualServersLoading = action.payload
        },
        virtualServers: (state, action) => {
          state.virtualServers = action.payload.data.items
        },
        virtualServersFetch: (state, action) => {
          state.virtualServersFetch = action.payload
        },


        resetObjects: (state, action) => {

          state.asset = null
          state.partition = null

          state.nodesLoading= null
          state.nodes = null
          state.nodesFetch = null

          state.monitorTypes= null
          state.monitorsLoading= null
          state.monitors = null
          state.monitorsFetch = null

          state.poolsLoading = null
          state.pools = null
          state.poolsFetch = null

          state.poolMembersLoading = null
          state.poolMembers = null
          state.poolMembersFetch = null

          state.profilesLoading = null
          state.profiles = null
          state.profilesFetch = null

          state.virtualServersLoading = null
          state.virtualServers = null
          state.virtualServersFetch = null

          state.certificates = null
          state.keys = null

          state.currentPools = null
        },

        cleanUp: (state, action) => {
          for (const l in state) {
            state[l] = null
          }
        }
    }
})

const { actions, reducer } = f5Slice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,

  asset,

  partitionsLoading,
  partitions,
  partitionsFetch,

  partition,

  routeDomainsLoading,
  routeDomains,
  routeDomainsFetch,

  dataGroupsLoading,
  dataGroups,
  dataGroupsFetch,

  f5objectsLoading,
  f5objects,
  f5objectsFetch,

  nodesLoading,
  nodes,
  nodesFetch,

  monitorTypes,

  monitorsLoading,
  monitors,
  monitorsFetch,

  poolsLoading,
  pools,
  poolsFetch,

  poolMembersLoading,
  poolMembers,
  poolMembersFetch,

  snatPoolsLoading,
  snatPools,
  snatPoolsFetch,

  irulesLoading,
  irules,
  irulesFetch,

  certificatesLoading,
  certificates,
  certificatesFetch,

  keysLoading,
  keys,
  keysFetch,

  profilesLoading,
  profiles,
  profilesFetch,

  virtualServersLoading,
  virtualServers,
  virtualServersFetch,

  resetObjects,
  cleanUp
} = actions

export default reducer
