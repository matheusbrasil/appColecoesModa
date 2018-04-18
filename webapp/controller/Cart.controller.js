sap.ui.define([
	"ovly/moda/appcolecao/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ovly/moda/appcolecao/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ovly.moda.appcolecao.controller.Cart", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ovly.moda.appcolecao.view.Cart
		 */
		onInit: function() {
			//this.byId("idTable").getBinding("items").refresh();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._oViewModel = new JSONModel({
				enableCreate: false
			});
			this.setModel(this._oViewModel, "viewModel");

			oRouter.getRoute("carrinho").attachPatternMatched(this._onObjectMatched, this);
		},

		onDelete: function(oEvent) {
			var oCarrinho = this.getView().getModel("Carrinho"),
				aItems = oCarrinho.getProperty("/Items");

			var oItem = oEvent.getParameter("listItem"),
				oContext = oItem.getBindingContext("Carrinho");

			for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
				if (oContext.getProperty("ProductId") === aItems[iIndex].ProductId) {
					aItems.splice(iIndex, 1);
					break;
				}
			}

			if (aItems.length > 0) {
				this._oViewModel.setProperty("/enableCreate", true);
			} else {
				this._oViewModel.setProperty("/enableCreate", false);
			}

			oCarrinho.setProperty("/Items", aItems);
			this._calculaTotal();
			//this.byId("idTable").getBinding("items").refresh();

		},

		_calculaTotal: function() {
			var oCarrinho = this.getView().getModel("Carrinho"),
				aItems = oCarrinho.getProperty("/Items"),
				oHeader = oCarrinho.getProperty("/Header");
			oHeader.totalValue = 0;
			for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
				oHeader.totalValue = parseFloat(oHeader.totalValue + aItems[iIndex].TotalPrice);
				oHeader.CurrencyCode = aItems[iIndex].CurrencyCode;
			}
			oCarrinho.setProperty("/Header", oHeader);
		},

		onChange: function(oEvent) {
			var oCarrinho = this.getView().getModel("Carrinho"),
				aItems = oCarrinho.getProperty("/Items");

			var oItem = oEvent.getSource().getBindingContext("Carrinho").getObject();

			for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
				if (oItem.ProductId === aItems[iIndex].ProductId) {
					aItems[iIndex].TotalPrice = parseFloat(aItems[iIndex].Price * aItems[iIndex].Quantity);
					break;
				}
			}
			oCarrinho.setProperty("/Items", aItems);
			this._calculaTotal();
			//this.getView().getModel().refresh();
			//this.byId("idTable").getBinding("items").refresh();

		},

		onBuy: function(oEvent) {
			var oCarrinho = this.getView().getModel("Carrinho"),
				aItems = oCarrinho.getProperty("/Items"),
				oHeader = oCarrinho.getProperty("/Header");
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			var oModel = this.getModel();

			var itensCarrinho = {
				Header: {
					totalValue: 0.00,
					CurrencyCode: ""
				},
				Items: []
			};

			var oDeepInsert = {
				BuyerId: "0100000000",
				CurrencyCode: oHeader.CurrencyCode,
				ToCarrinhoItem: []
			};

			for (var iIndex = 0; iIndex < aItems.length; iIndex++) {

				oDeepInsert.ToCarrinhoItem.push({
					ProductId: aItems[iIndex].ProductId,
					Quantity: aItems[iIndex].Quantity.toFixed(3),
					QuantityUnit: aItems[iIndex].MeasureUnit
				});
			}

			sap.m.MessageBox.confirm(oBundle.getText("cartMsgBuy"), {
				title: oBundle.getText("cartTitBuy"),
				initialFocus: sap.m.MessageBox.Action.CANCEL,
				onClose: function(oAction) {
					if (oAction === "OK") {
						oModel.create("/CarrinhoHeaderSet", oDeepInsert, {
							success: function(oData, response) {
								setTimeout(function() {
									sap.m.MessageToast.show(oBundle.getText("cartMsgBuyS"));
								}, 1500);

								this.getModel("Carrinho").setData(itensCarrinho);
								this.getOwnerComponent().getRouter().navTo("worklist", {}, true);
							}.bind(this),
							error: function(oError) {}
						});
					}
				}.bind(this)
			});

		},

		_onObjectMatched: function(oEvent) {
			//debugger;
			var oCarrinho = this.getModel("Carrinho"),
				aItems = oCarrinho.getProperty("/Items");

			if (aItems.length > 0) {
				this._oViewModel.setProperty("/enableCreate", true);
			}

			//this.getView().setModel(oCarrinho);
			//this.getView().getModel().refresh();

			//var oContexto = oCarrinho.getContext("/");
			//this.getView().setBindingContext(oContexto, "Carrinho");

			//BINDING NO CONTROLE TABLE
			// var oTable = this.byId("idTable");
			// var oTemplate = this.byId("idColumnListItem");
			// oTable.setModel(oCarrinho);
			// oTable.bindItems("/Items", oTemplate);
			//oTable.bindAggregation("items", {});
			//oTable.bindAggregation("columns", {});

		},

		formataValor: function(sValue) {
			var numberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});

			if (!sValue) {
				return;
			}

			return numberFormat.format(sValue);
		},

		onNavBack: function(oEvent) {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getRouter().parse(sPreviousHash);
		}

	});

});