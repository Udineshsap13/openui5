sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/core/Fragment",
	"sap/ui/model/BindingMode",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/CountMode",
	"sap/ui/fl/Utils",
	"sap/ui/core/Core"
], function(
	UriParameters,
	Log,
	MessageToast,
	Controller,
	MockServer,
	Fragment,
	BindingMode,
	JSONModel,
	ODataModel,
	CountMode,
	FlUtils,
	oCore
) {
	"use strict";
	function setTableModelData (oModel, sResourcePath) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", sResourcePath + "/TableData.json", true);
		xhr.onload = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 400) {
					var oTableData = JSON.parse(xhr.responseText);
					oModel.setData(oTableData.ProductCollection);
				}
			}
		};
		xhr.send();
	}

	return Controller.extend("sap.ui.rta.test.ComplexTest", {

		onInit: function () {
			this._sResourcePath = sap.ui.require.toUrl("sap/ui/rta/test");
			var oManifest = FlUtils.getAppComponentForControl(this.getView()).getManifest();
			var iServerDelay = UriParameters.fromQuery(window.location.search).get("serverDelay");

			var iAutoRespond = iServerDelay || 1000;
			var oMockServer;
			var dataSource;
			var sMockServerPath;
			var sMetadataUrl;
			var aEntities = [];
			var oDataSources = oManifest["sap.app"]["dataSources"];

			MockServer.config({
				autoRespond: true,
				autoRespondAfter: iAutoRespond
			});

			for (var property in oDataSources) {
				if (oDataSources.hasOwnProperty(property)) {
					dataSource = oDataSources[property];

					//do we have a mock url in the app descriptor
					if (dataSource.settings && dataSource.settings.localUri) {
						if (typeof dataSource.type === "undefined" || dataSource.type === "OData") {
							oMockServer = new MockServer({
								rootUri: dataSource.uri
							});
							sMetadataUrl = this._sResourcePath + dataSource.settings.localUri;
							sMockServerPath = sMetadataUrl.slice(0, sMetadataUrl.lastIndexOf("/") + 1);
							aEntities = dataSource.settings.aEntitySetsNames ? dataSource.settings.aEntitySetsNames : [];
							oMockServer.simulate(sMetadataUrl, {
								sMockdataBaseUrl: sMockServerPath,
								bGenerateMissingMockData: true,
								aEntitySetsNames: aEntities
							});
						}
						//else if *Other types can be inserted here, like Annotations*
						oMockServer.start();
						Log.info("Running the app with mock data for " + property);

						if (property === "mainService") {
							var oModel;
							var oView;

							oModel = new ODataModel(dataSource.uri, {
								json: true,
								loadMetadataAsync: true
							});

							oModel.setDefaultBindingMode(BindingMode.TwoWay);
							oModel.setDefaultCountMode(CountMode.None);
							this._oModel = oModel;

							oView = this.getView();
							oView.setModel(oModel);

							var data = {
								readonly: false,
								mandatory: false,
								visible: true,
								enabled: true
							};

							var oTableModel = new JSONModel();
							oView.setModel(oTableModel, "ProductCollection");
							setTableModelData(oTableModel, this._sResourcePath);

							var oStateModel = new JSONModel(data);
							oView.setModel(oStateModel, "state");
							oView.bindElement("/Headers(AccountingDocument='100015012',CompanyCode='0001',FiscalYear='2015')");
						} else if (property === "smartFilterService") {
							//smartfilterbar bind
							var oSmartFilterModel = new ODataModel("/foo", true);
							oSmartFilterModel.setDefaultCountMode(CountMode.None);
							var oSmartFilterLayout = this.byId("smartFilterLayout");
							if (oSmartFilterLayout) {
								oSmartFilterLayout.unbindElement();
								oSmartFilterLayout.setModel(oSmartFilterModel);
							}
						}
					} else {
						Log.error("Running the app with mock data for " + property);
					}
				}
			}
		},

		toggleUpdateMode: function() {
			var oSmartFilterbar = this.byId("smartFilterBar");
			var oButton = this.byId("toggleUpdateMode");

			if (!oSmartFilterbar || !oButton) {
				return;
			}

			var bLiveMode = oSmartFilterbar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}

			oSmartFilterbar.setLiveMode(!bLiveMode);
		},

		_setButtonText: function() {
			var oSmartFilterbar = this.byId("smartFilterBar");
			var oButton = this.byId("toggleUpdateMode");

			if (!oSmartFilterbar || !oButton) {
				return;
			}

			var bLiveMode = oSmartFilterbar.getLiveMode();
			if (bLiveMode) {
				oButton.setText("Change to 'LiveMode'");
			} else {
				oButton.setText("Change to 'ManualMode'");
			}
		},

		_undoRedoStack: function(oStack) {
			function undo(oStack) {
				if (oStack.canUndo()) {
					return oStack.undo().then(function() {
						return undo(oStack);
					});
				}
				return Promise.resolve();
			}
			function redo(oStack) {
				if (oStack.canRedo()) {
					return oStack.redo().then(function() {
						return redo(oStack);
					});
				}
				return Promise.resolve();
			}

			undo(oStack)
				.then(function() {
					MessageToast.show("All changes undone", {duration: 1000});

					return redo(oStack);
				})
				.then(function() {
					MessageToast.show("All changes redone", {duration: 1000});
				});
		},

		switchToAdaptionMode: function() {
			sap.ui.require([
				"sap/ui/rta/api/startAdaptation",
				"sap/ui/rta/command/Stack"
			], function(
				startAdaptation,
				Stack
			) {
				var aFileNames = [];

				Object.keys(window.localStorage).map(function(sKey) {
					if (sKey.startsWith("sap.ui.fl")) {
						var oChange = JSON.parse(window.localStorage.getItem(sKey));
						if (
							oChange.projectId === "sap.ui.rta.test"
						) {
							aFileNames.push(oChange.fileName);
						}
					}
				});

				Stack.initializeWithChanges(oCore.byId("Comp1---idMain1"), aFileNames).then(function(oStack) {
					//expose undo/redo test function to console
					window.undoRedoStack = this._undoRedoStack.bind(this, oStack);

					startAdaptation({
						rootControl: this.getOwnerComponent(),
						commandStack: oStack,
						stop: function() {
							this.destroy();
						}
					}).then(function() {
						MessageToast.show("Rta is started with all changes from local storage added to the command stack. Undo might already by enabled.\n To test the visual editor usage of our stack, there is a undoRedoStack() function in console available", {duration: 10000});
					});
				}.bind(this));
			}.bind(this));
		},

		openSmartFormDialog: function() {
			sap.ui.require([
				"sap/m/Dialog"
			], function(
				Dialog
			) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oDialog || !oCore.byId(this._oDialog.getId())) {
						Fragment.load({
							id: this.getView().createId("SmartFormDialog"),
							name: "sap.ui.rta.test.fragment.Popup"
						}).then(function(oDialogForm) {
							this._oDialogForm = oDialogForm;

							this._oDialog = new Dialog({
								id: oComponent.createId("SmartFormDialog"),
								showHeader: false,
								content: this._oDialogForm,
								contentHeight: "85%"
							});
							this.getView().addDependent(this._oDialog);

							this._oDialog.addStyleClass("sapUiNoContentPadding");
							this._oDialog.addStyleClass("sapUiSizeCompact");
							this._oDialog.open();
						}.bind(this));
					} else {
						this._oDialog.open();
					}
				}.bind(this));
			}.bind(this));
		},

		createOrDeleteContent: function(oEvent) {
			var oTargetControl = oEvent.getSource();
			sap.ui.require([
				"sap/ui/core/mvc/XMLView",
				"sap/m/Dialog",
				"sap/ui/comp/smartform/SmartForm",
				"sap/ui/comp/smartform/Group",
				"sap/ui/comp/smartform/GroupElement",
				"sap/ui/comp/smartfield/SmartField"
			], function(
				XMLView,
				Dialog,
				SmartForm,
				Group,
				GroupElement,
				SmartField
			) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oDialog || !oCore.byId(this._oDialog.getId())) {
						this._oDialogForm = new XMLView(
							this.getView().createId("SmartFormDialog"),
							{
								viewName: "sap.ui.rta.test.Popup"
							}
						);

						this._oDialog = new Dialog({
							id: oComponent.createId("SmartFormDialog"),
							showHeader: false,
							content: this._oDialogForm
						});
						this.getView().addDependent(this._oDialog);

						this._oDialog.addStyleClass("sapUiNoContentPadding");
						this._oDialog.addStyleClass("sapUiSizeCompact");
					}
					this._oDialog.open();
				}.bind(this));

				if (this.byId("newForm")) {
					this.byId("newForm").destroy();
				} else {
					var oLayout = oTargetControl.getParent();
					var oSmartForm = new SmartForm(this.getView().createId("newForm"), {
						groups: [
							new Group("newGroup", {
								groupElements: [
									new GroupElement("newGroupElement0", {
										elements: [
											new SmartField("smartField0", {
												value: "{CreatedByUserName}"
											})
										]
									}),
									new GroupElement("newGroupElement1", {
										elements: [
											new SmartField("smartField1", {
												value: "{CompanyAdress}"
											})
										],
										visible: false
									}),
									new GroupElement("newGroupElement2", {
										elements: [
											new SmartField("smartField2", {
												value: "{ExpirationDate}"
											})
										],
										visible: false
									}),
									new GroupElement("newGroupElement3", {
										elements: [
											new SmartField("smartField3", {
												value: "{ValidityFrom}"
											})
										],
										visible: false
									})
								]
							})
						]
					});
					oLayout.insertContent(oSmartForm, 3);
				}
			}.bind(this));
		},

		openSmartFormPopover: function(oEvent) {
			var oTargetButton = oEvent.getSource();
			return sap.ui.require([
				"sap/m/Popover"
			], function(Popover) {
				var oComponent = this.getOwnerComponent();
				oComponent.runAsOwner(function() {
					if (!this._oPopover || !oCore.byId(this._oPopover.getId())) {
						Fragment.load({
							id: this.getView().createId("FormPopover"),
							name: "sap.ui.rta.test.fragment.Popup"
						}).then(function(oPopoverForm) {
							this._oPopoverForm = oPopoverForm;

							this._oPopover = new Popover({
								id: oComponent.createId("SmartFormPopover"),
								showHeader: false,
								content: this._oPopoverForm
							});
							this.getView().addDependent(this._oPopover);

							this._oPopover.addStyleClass("sapUiNoContentPadding");
							this._oPopover.addStyleClass("sapUiSizeCompact");
						}.bind(this));
					} else {
						this._oPopover.openBy(oTargetButton);
					}
				}.bind(this));
			}.bind(this));
		},

		sampleFormatter: function(sValue) {
			return "This text was changed by a formatter: " + (sValue && sValue.toUpperCase());
		}
	});
});

