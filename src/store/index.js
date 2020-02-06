import React from "react";
import { render } from "react-dom";

import "../assets/css/_reset.scss";
import "../assets/css/_animations.scss";
import "../assets/css/materialize/materialize.scss";
import "./index.scss";

import "slick-carousel";
import numeral from "numeral";

numeral.register("locale", "pt-br", {
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    currency: {
        symbol: "R$ "
    }
});
numeral.locale("pt-br");

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { Shelf } from "./components/Shelf";
import { Department } from "./components/Department";
import { SearchPage } from "./components/SearchPage";
import { Product } from "./components/Product";
import { NewsApp } from "./components/Newsletter";
import { AccountPage } from "./components/Account";
import { ContactPage } from "./components/Contact";
import { Institutional } from "./components/Institutional";
import { Login } from "./components/Login";
import { Error404 } from "./components/Error-404";

let $body = $("body");

Header();
Footer();
Shelf();
Login();

$body.hasClass("class") && Home();
$body.hasClass("class") && Department();
$body.hasClass("class") && SearchPage();
$body.hasClass("class") && Product();
$body.hasClass("class") && AccountPage();
$body.hasClass("class") && ContactPage();
$body.hasClass("class") && Institutional();
$body.hasClass("class") && Error404();
