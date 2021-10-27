Name:       automation-interface-ui-container
Version:    RH_VERSION
Release:    RH_RELEASE
Summary:    Automation Interface UI, container image

License:    GPLv3+
Source0:    RPM_SOURCE

Requires:   podman, buildah, at

BuildArch:  noarch

%description
automation-interface-ui-container

%include %{_topdir}/SPECS/preinst.spec
%include %{_topdir}/SPECS/postinst.spec
%include %{_topdir}/SPECS/prerm.spec
%include %{_topdir}/SPECS/postrm.spec

%prep
%setup  -q #unpack tarball

%install
cp -rfa * %{buildroot}

%include %{_topdir}/SPECS/files.spec



