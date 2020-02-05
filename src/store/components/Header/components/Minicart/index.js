import "./index.scss";

export const MiniCart = () => { };

$(document).ready(function () {
	$(".cart--icon-link").click(function () {
		$(".v2-vtexsc-cart").addClass("is-active--minicart");
	});
});

$(document).ready(function () {
	$(".cart--icon-link").click(function () {
		$("#backdrop-minicart").addClass("is-active--backdrop");
	});
});

$(document).ready(function () {
	$("#backdrop-minicart").click(function () {
		$(".v2-vtexsc-cart").removeClass("is-active--minicart");
	});
});

$(document).ready(function () {
	$("#backdrop-minicart").click(function () {
		$("#backdrop-minicart").removeClass("is-active--backdrop");
	});
});