sap.ui.define([
	"ovly/moda/appcolecao/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ovly/moda/appcolecao/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ovly.moda.appcolecao.controller.Worklist", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ovly.moda.appcolecao.view.produtos
		 */
		onInit: function() {
			var oViewColecoes = new JSONModel({
				mode: "Delete" //or "None"
			});
			this.setModel(oViewColecoes, "viewColecoes");
		},

		onClick: function(oEvent) {
			var oItem, oCtx;
			oItem = oEvent.getSource();
			oCtx = oItem.getBindingContext();
			this.getRouter().navTo("produtos", {
				colecaoId: oCtx.getProperty("IdColecao")
			});
		},

		onCart: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("carrinho");
		},

		onNovaColecao: function() {
			this.getRouter().navTo("colecao");
		},

		onDelete: function(oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oContext = oItem.getBindingContext(),
				oModel = this.getModel();

			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sMsgDelete = oBundle.getText("worklistMsgDelete", [oContext.getProperty("Colecao")]);
			var sTitDelete = oBundle.getText("worklistTitDelete");
			var sMsgDeleteS = oBundle.getText("worklistMsgDeleteS");

			sap.m.MessageBox.confirm(sMsgDelete, {
				title: sTitDelete,
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function(oAction) {
					if (oAction === "OK") {

						oModel.remove(oContext.getPath(), {
							success: function(oData, response) {
								sap.m.MessageToast.show(sMsgDeleteS);
							}.bind(this),
							error: function(oError) {}
						});
					}

				}.bind(this)
			});
		},

		onSearch: function(oEvent) {
			// add filter for search
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var aFilters = [
					new sap.ui.model.Filter("Colecao", sap.ui.model.FilterOperator.Contains, sQuery)
				];
			}

			// update list binding
			var list = this.getView().byId("listColecaoModa");
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},

		formataPerfil: function(sValue) {
			if (!sValue) {
				return;
			}

			return (sValue === "X") ? false : true;
		}

	});
});