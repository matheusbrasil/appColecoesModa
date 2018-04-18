sap.ui.define([
		"ovly/moda/appcolecao/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ovly.moda.appcolecao.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);