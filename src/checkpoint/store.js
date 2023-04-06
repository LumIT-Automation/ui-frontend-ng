import { createSlice } from '@reduxjs/toolkit' // https://redux-toolkit.js.org/tutorials/quick-start

const checkpointSlice = createSlice({
    name: 'checkpoint',
    initialState: {},
    reducers: {
      permissionsLoading: (state, action) => {
        state.permissionsLoading = action.payload
      },
      permissions: (state, action) => {
        state.permissions = action.payload
      },
      permissionsFetch: (state, action) => {
        state.permissionsFetch = action.payload
      },
      permissionsError: (state, action) => {
        state.permissionsError = action.payload
      },


      permissionAddError: ( state, action) => {
        state.permissionAddError = action.payload
      },
      permissionModifyError: ( state, action) => {
        state.permissionModifyError = action.payload
      },
      permissionDeleteError: ( state, action) => {
        state.permissionDeleteError = action.payload
      },

      rolesError: ( state, action) => {
        state.rolesError = action.payload
      },
      newIdentityGroupAddError: ( state, action) => {
        state.newIdentityGroupAddError = action.payload
      },

      identityGroupsLoading: (state, action) => {
        state.identityGroupsLoading = action.payload
      },
      identityGroups: (state, action) => {
        state.identityGroups = action.payload.data.items
      },
      identityGroupsFetch: (state, action) => {
        state.identityGroupsFetch = action.payload
      },
      identityGroupsError: (state, action) => {
        state.identityGroupsError = action.payload
      },
      identityGroupDeleteError: (state, action) => {
        state.identityGroupDeleteError = action.payload
      },

      environment: (state, action) => {
        state.environment = action.payload
      },
      environmentError: (state, action) => {
        state.environmentError = action.payload
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
      assetsError: (state, action) => {
        state.assetsError = action.payload
      },

      asset: (state, action) => {
        state.asset = action.payload
      },
      assetAddError: (state, action) => {
        state.assetAddError = action.payload
      },
      assetModifyError: (state, action) => {
        state.assetModifyError = action.payload
      },
      assetDeleteError: (state, action) => {
        state.assetDeleteError = action.payload
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
      domainsError: (state, action) => {
        state.domainsError = action.payload
      },

      domain: (state, action) => {
        state.domain = action.payload
      },

      itemTypesError: (state, action) => {
        state.itemTypesError = action.payload
      },

      hostsLoading: (state, action) => {
        state.hostsLoading = action.payload
      },
      hosts: (state, action) => {
        state.hosts = action.payload.data.items
      },
      hostsFetch: (state, action) => {
        state.hostsFetch = action.payload
      },
      hostsError: (state, action) => {
        state.hostsError = action.payload
      },

      hostAddError: (state, action) => {
        state.hostAddError = action.payload
      },
      hostModifyError: (state, action) => {
        state.hostModifyError = action.payload
      },
      hostDeleteError: (state, action) => {
        state.hostDeleteError = action.payload
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
      groupsError: (state, action) => {
        state.groupsError = action.payload
      },

      groupAddError: (state, action) => {
        state.groupAddError = action.payload
      },
      groupModifyError: (state, action) => {
        state.groupModifyError = action.payload
      },
      groupDeleteError: (state, action) => {
        state.groupDeleteError = action.payload
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
      networksError: (state, action) => {
        state.networksError = action.payload
      },

      networkAddError: (state, action) => {
        state.networkAddError = action.payload
      },
      networkModifyError: (state, action) => {
        state.networkModifyError = action.payload
      },
      networkDeleteError: (state, action) => {
        state.networkDeleteError = action.payload
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
      addressRangesError: (state, action) => {
        state.addressRangesError = action.payload
      },

      addressRangeAddError: (state, action) => {
        state.addressRangeAddError = action.payload
      },
      addressRangeModifyError: (state, action) => {
        state.addressRangeModifyError = action.payload
      },
      addressRangeDeleteError: (state, action) => {
        state.addressRangeDeleteError = action.payload
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
      datacenterServersError: (state, action) => {
        state.datacenterServersError = action.payload
      },

      datacenterServerAddError: (state, action) => {
        state.datacenterServerAddError = action.payload
      },
      datacenterServerModifyError: (state, action) => {
        state.datacenterServerModifyError = action.payload
      },
      datacenterServerDeleteError: (state, action) => {
        state.datacenterServerDeleteError = action.payload
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
      datacenterQuerysError: (state, action) => {
        state.datacenterQuerysError = action.payload
      },

      datacenterQueryAddError: (state, action) => {
        state.datacenterQueryAddError = action.payload
      },
      datacenterQueryModifyError: (state, action) => {
        state.datacenterQueryModifyError = action.payload
      },
      datacenterQueryDeleteError: (state, action) => {
        state.datacenterQueryDeleteError = action.payload
      },

      application_sitesLoading: (state, action) => {
        state.application_sitesLoading = action.payload
      },
      application_sites: (state, action) => {
        state.application_sites = action.payload.data.items
      },
      application_sitesFetch: (state, action) => {
        state.application_sitesFetch = action.payload
      },
      application_sitesError: (state, action) => {
        state.application_sitesError = action.payload
      },

      application_siteAddError: (state, action) => {
        state.application_siteAddError = action.payload
      },
      application_siteModifyError: (state, action) => {
        state.application_siteModifyError = action.payload
      },
      application_siteDeleteError: (state, action) => {
        state.application_siteDeleteError = action.payload
      },

      application_site_categorysLoading: (state, action) => {
        state.application_site_categorysLoading = action.payload
      },
      application_site_categorys: (state, action) => {
        state.application_site_categorys = action.payload.data.items
      },
      application_site_categorysFetch: (state, action) => {
        state.application_site_categorysFetch = action.payload
      },
      application_site_categorysError: (state, action) => {
        state.application_site_categorysError = action.payload
      },

      application_site_categoryAddError: (state, action) => {
        state.application_site_categoryAddError = action.payload
      },
      application_site_categoryModifyError: (state, action) => {
        state.application_site_categoryModifyError = action.payload
      },
      application_site_categoryDeleteError: (state, action) => {
        state.application_site_categoryDeleteError = action.payload
      },

      hostRemoveError: (state, action) => {
        state.hostRemoveError = action.payload
      },
      vpnToServiceError: (state, action) => {
        state.vpnToServiceError = action.payload
      },
      vpnToHostError: (state, action) => {
        state.vpnToHostError = action.payload
      },

      genericError: (state, action) => {
        state.genericError = action.payload
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
  permissionsLoading,
  permissions,
  permissionsFetch,
  permissionsError,

  permissionAddError,
  permissionModifyError,
  permissionDeleteError,

  rolesError,

  identityGroupsLoading,
  identityGroups,
  identityGroupsFetch,
  identityGroupsError,

  identityGroupDeleteError,
  newIdentityGroupAddError,

  environment,
  environmentError,

  assetsLoading,
  assets,
  assetsFetch,
  assetsError,

  asset,
  assetAddError,
  assetModifyError,
  assetDeleteError,

  domainsLoading,
  domains,
  domainsFetch,
  domainsError,

  domain,

  itemTypesError,

  hostsLoading,
  hosts,
  hostsFetch,
  hostsError,
  hostAddError,
  hostModifyError,
  hostDeleteError,

  groupsLoading,
  groups,
  groupsFetch,
  groupsError,
  groupAddError,
  groupModifyError,
  groupDeleteError,

  networksLoading,
  networks,
  networksFetch,
  networksError,
  networkAddError,
  networkModifyError,
  networkDeleteError,

  addressRangesLoading,
  addressRanges,
  addressRangesFetch,
  addressRangesError,
  addressRangeAddError,
  addressRangeModifyError,
  addressRangeDeleteError,

  datacenterServersLoading,
  datacenterServers,
  datacenterServersFetch,
  datacenterServersError,
  datacenterServerAddError,
  datacenterServerModifyError,
  datacenterServerDeleteError,

  datacenterQuerysLoading,
  datacenterQuerys,
  datacenterQuerysFetch,
  datacenterQuerysError,
  datacenterQueryAddError,
  datacenterQueryModifyError,
  datacenterQueryDeleteError,

  application_sitesLoading,
  application_sites,
  application_sitesFetch,
  application_sitesError,
  application_siteAddError,
  application_siteModifyError,
  application_siteDeleteError,

  application_site_categorysLoading,
  application_site_categorys,
  application_site_categorysFetch,
  application_site_categorysError,
  application_site_categoryAddError,
  application_site_categoryModifyError,
  application_site_categoryDeleteError,

  hostRemoveError,
  vpnToServiceError,
  vpnToHostError,

  genericError,

  cleanUp
} = actions

export default reducer
