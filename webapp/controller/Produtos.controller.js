sap.ui.define([
	"ovly/moda/appcolecao/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ovly/moda/appcolecao/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ovly.moda.appcolecao.controller.Produtos", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ovly.moda.appcolecao.view.produtos
		 */
		onInit: function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("produtos").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function(oEvent) {
			this.getView().bindElement({
				path: "/ColecoesModa('" + oEvent.getParameter("arguments").colecaoId + "')"
			});

		},

		onCart: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("carrinho");
		},

		onClick: function(oEvent) {
			var oItem, oCtx;
			oItem = oEvent.getSource();
			oCtx = oItem.getBindingContext();
			this.getOwnerComponent().getRouter().navTo("produto", {
				produtoId: oCtx.getProperty("ProductId")
			});
		},

		onNavButton: function() {
			// update list binding
			this.byId("idSearch").setValue();
			var list = this.getView().byId("listProdutos");
			var binding = list.getBinding("items");
			binding.filter(null);
			this.getView().unbindElement();
			this.getOwnerComponent().getRouter().navTo("worklist", {}, true);
		},

		onEditColec: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("editarcolecao", {
				colecaoId: this.getView().getBindingContext().getProperty("IdColecao")
			});
		},

		onDelete: function(oEvent) {
			var oItem = oEvent.getParameter("listItem"),
				oContext = oItem.getBindingContext(),
				oModel = this.getModel();

			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sMsgDelete = oBundle.getText("produtosMsgDelete", [oContext.getProperty("ShortDesc")]);
			var sTitDelete = oBundle.getText("produtosTitDelete");
			var sMsgDeleteS = oBundle.getText("produtosMsgDeleteS");

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
					new sap.ui.model.Filter("ShortDesc", sap.ui.model.FilterOperator.Contains, sQuery)
				];
			}

			// update list binding
			var list = this.getView().byId("listProdutos");
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},

		handleSelectDialogPress: function(oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("ovly.moda.appcolecao.view.DialogoProduto", this);
				this._oDialog.setModel(this.getView().getModel());
			}

			// Multi-select if required
			var bMultiSelect = !!oEvent.getSource().data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			// Remember selections if required
			var bRemember = !!oEvent.getSource().data("remember");
			this._oDialog.setRememberSelections(bRemember);

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},
		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Text", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilter);
		},

		handleClose: function(oEvent) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oModel = this.getModel();
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var oProduto = {
					ProductId: aContexts.map(function(oContext) {
						return oContext.getObject().ProductId;
					}).join(", "),
					IdColecao: this.getView().getBindingContext().getProperty("IdColecao")
				};

				oModel.create("/Produtos", oProduto, {
					success: function(oData, response) {
					}.bind(this),
					error: function(oError) {}
				});

			} else {
				sap.m.MessageToast.show(oBundle.getText("produtosMsgDialogNo"));
			}
			oEvent.getSource().getBinding("items").filter([]);
		}
	});

});