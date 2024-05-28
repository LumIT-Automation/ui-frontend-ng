import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const checkpointSlice = createSlice({
    name: 'checkpoint',
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

      domainsLoading: (state, action) => {
        state.domainsLoading = action.payload
      },
      domains: (state, action) => {
        state.domains = action.payload.data.items
      },
      domainsFetch: (state, action) => {
        state.domainsFetch = action.payload
      },

      domain: (state, action) => {
        state.domain = action.payload
      },

      hostsLoading: (state, action) => {
        state.hostsLoading = action.payload
      },
      hosts: (state, action) => {
        state.hosts = action.payload.data.items
      },
      fetchItems: (state, action) => {
        console.log('fetchItems', action.payload)
        state.fetchItems = action.payload
      },

      groupsLoading: (state, action) => {
        state.groupsLoading = action.payload
      },
      groups: (state, action) => {
        state.groups = action.payload.data.items
      },
      groupsFetch: (state, action) => {
        state.groupsFetch = action.payload
      },

      networksLoading: (state, action) => {
        state.networksLoading = action.payload
      },
      networks: (state, action) => {
        state.networks = action.payload.data.items
      },
      networksFetch: (state, action) => {
        state.networksFetch = action.payload
      },

      addressRangesLoading: (state, action) => {
        state.addressRangesLoading = action.payload
      },
      addressRanges: (state, action) => {
        state.addressRanges = action.payload.data.items
      },
      addressRangesFetch: (state, action) => {
        state.addressRangesFetch = action.payload
      },

      datacenterServersLoading: (state, action) => {
        state.datacenterServersLoading = action.payload
      },
      datacenterServers: (state, action) => {
        state.datacenterServers = action.payload.data.items
      },
      datacenterServersFetch: (state, action) => {
        state.datacenterServersFetch = action.payload
      },

      datacenterQuerysLoading: (state, action) => {
        state.datacenterQuerysLoading = action.payload
      },
      datacenterQuerys: (state, action) => {
        state.datacenterQuerys = action.payload.data.items
      },
      datacenterQuerysFetch: (state, action) => {
        state.datacenterQuerysFetch = action.payload
      },

      application_sitesLoading: (state, action) => {
        state.application_sitesLoading = !state.application_sitesLoading
      },
      application_sites: (state, action) => {
        state.application_sites = action.payload.data.items
      },
      application_sitesFetch: (state, action) => {
        state.application_sitesFetch = action.payload
      },

      application_site_categorys: (state, action) => {
        state.application_site_categorys = action.payload.data.items
      },
      application_site_categorysFetch: (state, action) => {
        state.application_site_categorysFetch = action.payload
      },

      cleanUp: (state, action) => {
        for (const l in state) {
          state[l] = null
        }
      }
    }
})

const { actions, reducer } = checkpointSlice;

export const {
  environment,

  assetsLoading,
  assets,
  assetsFetch,
  asset,

  domainsLoading,
  domains,
  domainsFetch,
  domain,

  fetchItems,

  hostsLoading,
  hosts,
  

  groupsLoading,
  groups,
  groupsFetch,

  networksLoading,
  networks,
  networksFetch,

  addressRangesLoading,
  addressRanges,
  addressRangesFetch,

  datacenterServersLoading,
  datacenterServers,
  datacenterServersFetch,

  datacenterQuerysLoading,
  datacenterQuerys,
  datacenterQuerysFetch,

  application_sitesLoading,
  application_sites,
  application_sitesFetch,

  application_site_categorys,
  application_site_categorysFetch,

  cleanUp
} = actions

export default reducer
