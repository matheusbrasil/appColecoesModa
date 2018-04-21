/* global elevateZoom:true */
sap.ui.define([
	"ovly/moda/appcolecao/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"ovly/moda/appcolecao/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("ovly.moda.appcolecao.controller.Produto", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ovly.moda.appcolecao.view.Produto
		 */
		onInit: function() {
			var oViewProduto = new JSONModel({
				uploadUrl: ""
			});
			this.setModel(oViewProduto, "viewProduto");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("produto").attachPatternMatched(this._onObjectMatched, this);
		},

		onCart: function(oEvent) {
			this.getOwnerComponent().getRouter().navTo("carrinho");
		},

		onAddCart: function(oEvent) {
			var oCarrinho = this.getModel("Carrinho");
			var aItems = oCarrinho.getProperty("/Items");
			var iIndex,
				sNew = true;

			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			for (iIndex = 0; iIndex < aItems.length; iIndex++) {
				if (this.getView().getBindingContext().getProperty("ProductId") === aItems[iIndex].ProductId) {
					sNew = false;
					aItems[iIndex].Quantity++;
					aItems[iIndex].TotalPrice = parseFloat(aItems[iIndex].Price * aItems[iIndex].Quantity);
					sap.m.MessageToast.show(oBundle.getText("produtoMsgAdd", [aItems[iIndex].ShortDesc, aItems[iIndex].Quantity]));
					break;

				}
			}

			if (sNew) {
				aItems.push({
					src: "/sap/opu/odata/SAP/ZMNGW_COLECAO_MODA_SRV/ImagensProd(ProductId='" + this.getView().getBindingContext().getProperty(
						"ProductId") + "',ImgNumber='0000')/$value",
					ProductId: this.getView().getBindingContext().getProperty("ProductId"),
					ShortDesc: this.getView().getBindingContext().getProperty("ShortDesc"),
					Quantity: 1,
					MeasureUnit: this.getView().getBindingContext().getProperty("MeasureUnit"),
					Price: parseFloat(this.getView().getBindingContext().getProperty("Price")),
					TotalPrice: parseFloat(this.getView().getBindingContext().getProperty("Price")),
					CurrencyCode: this.getView().getBindingContext().getProperty("CurrencyCode")
				});
				sap.m.MessageToast.show(oBundle.getText("produtoMsgAdd", [this.getView().getBindingContext().getProperty("ShortDesc"), 1]));
			}

			oCarrinho.setProperty("/Items", aItems);
			this._calculaTotal();
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

		_onObjectMatched: function(oEvent) {
			var oViewProduto = this.getModel("viewProduto");
			oViewProduto.setProperty("/uploadUrl", "/sap/opu/odata/SAP/ZMNGW_COLECAO_MODA_SRV/Produtos('" + oEvent.getParameter("arguments").produtoId +
				"')/ToImagensProd");

			this.getView().bindElement({
				path: "/Produtos('" + oEvent.getParameter("arguments").produtoId + "')"
			});
		},

		onUploadComplete: function(oEvent) {
			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();

			this.byId("UploadCollection").getBinding("items").refresh();
			this.byId("idCarousel").getBinding("pages").refresh();

			// delay the success message for to notice onChange message
			setTimeout(function() {
				sap.m.MessageToast.show(oBundle.getText("produtoMsgFileUpd"));
			}, 1500);

		},

		onBeforeUploadStarts: function(oEvent) {
			// // Header Slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onUploadTerminated: function() {
			/*
			// get parameter file name
			var sFileName = oEvent.getParameter("fileName");
			// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
			*/
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			var oModel = this.getModel();
			var sToken = oModel.getSecurityToken();

			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: sToken
			});

			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileDeleted: function(oEvent) {
			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var oItem, oCtx;
			oItem = oEvent.getSource();
			oCtx = oItem.getBindingContext();
			var oModel = this.getModel();

			oModel.remove("/ImagensProd(ProductId='" + oCtx.getProperty("ProductId") + "',ImgNumber='" + oEvent.getParameter("documentId") +
				"')/$value", {
					success: function(oData, response) {
						sap.m.MessageToast.show(oBundle.getText("produtoMsgFileDel"));
					}.bind(this),
					error: function(oError) {}
				});
		},

		onNavBack: function(oEvent) {
			this.getRouter().navTo("produtos", {
				colecaoId: this.getView().getBindingContext().getProperty("IdColecao")
			}, true);
		}

	});

});