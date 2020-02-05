import "./index.scss";

export const Menu = () => { };

$(document).ready(function () {
	$(".menu-icon").click(function () {
		$("ul.menu-ul").addClass("is-active--menu");
	});
});

$(document).ready(function () {
	$(".menu-icon").click(function () {
		$("#backdrop-minicart").addClass("is-active--backdrop");
	});
});

$(document).ready(function () {
	$("#backdrop-minicart").click(function () {
		$("ul.menu-ul").removeClass("is-active--menu");
	});
});

$(document).ready(function () {
	$("#backdrop-minicart").click(function () {
		$("#backdrop-minicart").removeClass("is-active--backdrop");
	});
});
