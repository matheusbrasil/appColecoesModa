sap.ui.define([
	"ovly/moda/appcolecao/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ovly/moda/appcolecao/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ovly.moda.appcolecao.controller.Colecao", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ovly.moda.appcolecao.view.Colecao
		 */
		onInit: function() {
			var oViewModel = new JSONModel({
				edicao: false,
				textTitle: "",
				colecaoId: ""
			});
			this.setModel(oViewModel, "viewColecao");

			this._oODataModel = this.getOwnerComponent().getModel();
			this._oODataModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

			this.getRouter().getRoute("colecao").attachPatternMatched(this._onNovaColecao, this);
			this.getRouter().getRoute("editarcolecao").attachPatternMatched(this._onEditarColecao, this);
		},

		onSave: function(oEvent) {

			var oViewModel = this.getModel("viewColecao");
			var oModel = this.getModel();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			// var vColecaoNome = this.byId("colecaoNome");
			// var vColecaoDesc = this.byId("colecaoDesc");
			// var vDataIni = this.byId("dataIni");
			// var vDataFim = this.byId("dataFim");

			// var oColecao = {
			// 	IdColecao: "",
			// 	DataFim: this.byId("dataFim").getDateValue(),
			// 	DataIni: this.byId("dataIni").getDateValue(),
			// 	Colecao: this.byId("colecaoNome").getValue(),
			// 	ColecaoDesc: this.byId("colecaoDesc").getValue()
			// };

			if (oViewModel.getProperty("/edicao")) {
				sap.m.MessageBox.confirm(oBundle.getText("colecaoMsgSaveC"), {
					title: oBundle.getText("colecaoTitSaveC"),
					initialFocus: sap.m.MessageBox.Action.CANCEL,
					onClose: function(oAction) {
						if (oAction === "OK") {
							oModel.submitChanges({
								success: function(oData, response) {
									this.getView().unbindObject();
									setTimeout(function() {
										sap.m.MessageToast.show(oBundle.getText("colecaoMsgSaveCS"));
									}, 1500);
									this.getOwnerComponent().getRouter().navTo("produtos", {
										colecaoId: oViewModel.getProperty("/colecaoId")
									});
								}.bind(this)
							});
						}
					}.bind(this)
				});
			} else {

				sap.m.MessageBox.confirm(oBundle.getText("colecaoMsgSave"), {
					title: oBundle.getText("colecaoTitSave"),
					initialFocus: sap.m.MessageBox.Action.CANCEL,
					onClose: function(oAction) {
						if (oAction === "OK") {
							// oModel.create("/ColecoesModa", oColecao, {
							// 	success: function(oData, response) {
							// 		this.getOwnerComponent().getRouter().navTo("produtos", {
							// 			colecaoId: oData.IdColecao
							// 		});
							// 	}.bind(this),
							// 	error: function(oError) {}
							// });

							oModel.submitChanges({
								success: function(oData, response) {
									this.getView().unbindObject();
									setTimeout(function() {
										sap.m.MessageToast.show(oBundle.getText("colecaoMsgSaveS"));
									}, 1500);
									this.getOwnerComponent().getRouter().navTo("produtos", {
										colecaoId: oData.__batchResponses[0].__changeResponses[0].data.IdColecao
									});
								}.bind(this)
							});
						}
					}.bind(this)
				});
			}

		},

		onCancel: function(oEvent) {
			var oViewModel = this.getModel("viewColecao");
			var oModel = this.getModel();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			sap.m.MessageBox.confirm(oBundle.getText("colecaoMsgCancel"), {
				title: oBundle.getText("colecaoTitCancel"),
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function(oAction) {
					if (oAction === "OK") {
						oModel.resetChanges();
						this.getView().unbindObject();
						if (oViewModel.getProperty("/edicao")) {
							this.getOwnerComponent().getRouter().navTo("produtos", {
								colecaoId: oViewModel.getProperty("/colecaoId")
							}, true);
						} else {
							this.getOwnerComponent().getRouter().navTo("worklist", {}, true);
						}
					}
				}.bind(this)
			});
		},

		onDelete: function(oEvent) {
			var oModel = this.getModel();
			var oItem = oEvent.getSource();
			var oCtx = oItem.getBindingContext();
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			sap.m.MessageBox.confirm(oBundle.getText("colecaoMsgDelete", [this.getView().getBindingContext().getProperty("Colecao")]), {
				title: oBundle.getText("colecaoTitDelete"),
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function(oAction) {
					if (oAction === "OK") {
						//oModel.remove("/ColecoesModa('" + this.getView().getBindingContext().getProperty("IdColecao") + "')", {
						oModel.remove(oCtx.getPath(), {
							success: function(oData, response) {
								this.getOwnerComponent().getRouter().navTo("worklist");
								this.getView().unbindElement();
								setTimeout(function() {
									sap.m.MessageToast.show(oBundle.getText("colecaoMsgDeleteS"));
								}, 1000);
							}.bind(this),
							error: function(oError) {}
						});
					}

				}.bind(this)
			});

		},

		onNavButton: function() {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getRouter().parse(sPreviousHash);
		},

		_onNovaColecao: function(oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oViewModel = this.getModel("viewColecao");
			oViewModel.setProperty("/edicao", false);
			oViewModel.setProperty("/textTitle", oBundle.getText("colecaoTitleNew"));

			var oContext = this._oODataModel.createEntry("ColecoesModa");
			this.getView().setBindingContext(oContext);
		},

		_onEditarColecao: function(oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oViewModel = this.getModel("viewColecao");

			oViewModel.setProperty("/edicao", true);
			oViewModel.setProperty("/colecaoId", oEvent.getParameter("arguments").colecaoId);
			oViewModel.setProperty("/textTitle", oBundle.getText("colecaoTitleEdit"));

			//Chamada de rede
			this.getView().bindElement({
				path: "/ColecoesModa('" + oEvent.getParameter("arguments").colecaoId + "')"
			});
		}

	});

});