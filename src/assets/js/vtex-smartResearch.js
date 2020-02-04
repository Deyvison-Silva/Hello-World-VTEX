/**
 *	Pesquisa Inteligente
 *	@description Executar buscas sem recarregar a página
 *	@author Carlos Vinicius
 *	@contributor Edson Domingos Júnior
 *	@version 3.9
 *	@date 2012-10-22
 */

import URI, { parseQuery, buildQuery } from "urijs";

"function" !== typeof String.prototype.replaceSpecialChars &&
    (String.prototype.replaceSpecialChars = function() {
        return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    });

"function" !== typeof String.prototype.trim &&
    (String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, "");
    });

jQuery.fn.vtexSmartResearch = function(opts) {
    let $this = jQuery(this);
    let log = (msg, type) => {
        if (typeof console == "object") {
            console.log(`[Smart Research - ${type || "Erro"}] ${msg}`);
        }
    };

    let defaults = {
        pageLimit: null, // Número máximo de páginas que o script irá retornar. Exemplo "pageLimit=3" só será retornado resultados até a terceira página
        loadContent: ".prateleira[id^=ResultItems]", // Elemento que esta em volta da(s) prateleira(s) de produtos.
        shelfClass: ".prateleira", // Pratelira de produtos (filha do elemento definido de um "loadContent")
        filtersMenu: ".search-multiple-navigator", // Menu com os filtros
        linksMenu: ".search-single-navigator", // Menu de links
        menuDepartament: ".navigation .menu-departamento", // seletor do menu da página de departamentos
        mergeMenu: true, // Define se o menu de links será mesclado com o de filtros será mesclado na página de departamento
        insertMenuAfter: ".search-multiple-navigator h3:first", // O menu de links será inserido após este elemento
        emptySearchElem: jQuery('<div class="vtexsr-emptySearch"></div>'), // Elemento Html (em Objeto jQuery) no qual será adicionado a mensagem de busca vazia
        elemLoading: '<div id="scrollLoading">Carregando ... </div>', // Elemento com mensagem de carregando ao iniciar a requisição da página seguinte
        returnTopText: '<span class="text">voltar ao</span><span class="text2">TOPO</span>', // Mensagem de "retornar ao topo"
        emptySearchMsg: "<h3>Esta combinação de filtros não retornou nenhum resultado!</h3>", // Html com a mensagem para ser apresentada quando não existirem resultados para os filtros selecionados
        filterErrorMsg: "Houve um erro ao tentar filtrar a página!", // Mensagem de erro exibida quando existe algum erro de servidor ao aplicar os filtros
        searchUrl: null, // Url da página de busca (opicional)
        usePopup: false, // Opção p/ definir se deseja que a mensagem de não localizado seja exibida em um popup
        showLinks: true, // Exibe o menu de links caso o de filtro não seja encontrado
        popupAutoCloseSeconds: 3, // Caso esteja utilizando popup, defina aqui o tempo para que ele feche automaticamente
        // Função que retorna o valor p/ onde a página deve rolar quando o usuário marca ou desmarca um filtro
        filterScrollTop: shelfOffset => {
            return shelfOffset.top - 20;
        },
        callback: () => {},
        // Cálculo do tamanho do conteúdo/vitrine para que uma nova página seja chamada antes do usuário chegar ao "final" do site
        getShelfHeight: container => {
            return container.scrollTop() + container.height();
        },
        // Callback após inserir a prateleira na página
        shelfCallback: () => {},
        // Callback em cada requisição Ajax (Para requisições feitas com sucesso)
        // Recebe como parâmetro um objeto contendo a quantidade total de requisições feitas e a quantidade de filtros selecionados
        ajaxCallback: () => {},
        // Função que é executada quando a seleção de filtros não retorna nenhum resultado
        // Recebe como parâmetro um objeto contendo a quantidade total de requisições feitas e a quantidade de filtros selecionados
        emptySearchCallback: () => {},
        // Função para permitir ou não que a rolagem infinita execute na página esta deve retornar "true" ou "false"
        // Recebe como parâmetro um objeto contendo a quantidade total de requisições feitas e a quantidade de filtros selecionados
        authorizeScroll: () => {
            return true;
        },
        // Função para permitir ou não que o conteúdo de "loadContent" seja atualizado. Esta deve retornar "true" ou "false"
        // Recebe como parâmetro um objeto contendo a quantidade total de requisições feitas e a quantidade de filtros selecionados
        authorizeUpdate: () => {
            return true;
        },
        // Callback de cada laço percorrendo os fildsets e os labels. Retorna um objeto com algumas informações
        labelCallback: data => {}
    };

    let options = jQuery.extend(defaults, opts),
        _console = "object" === typeof console,
        $empty = jQuery(""),
        elemLoading = jQuery(options.elemLoading),
        currentPage = 2,
        moreResults = true,
        _window = jQuery(window),
        _document = jQuery(document),
        _html = jQuery("html,body"),
        body = jQuery("body"),
        currentSearchUrl = "",
        urlFilters = "",
        concatFilters = [],
        searchUrl = "",
        animatingFilter = false,
        loadContentE = jQuery(options.loadContent),
        filtersMenuE = jQuery(options.filtersMenu),
        ajaxCallbackObj = { requests: 0, filters: 0, isEmpty: false },
        labelCallbackData = {};

    let fn = {
        getUrl: scroll => {
            let s = scroll || false;

            if (s) {
                return currentSearchUrl.replace(/PageNumber=[0-9]*/, `PageNumber=${currentPage}`);
            } else {
                return (searchUrl + urlFilters).replace(/PageNumber=[0-9]*/, `PageNumber=${pageNumber}`);
            }
        },
        getSearchUrl: () => {
            let url;
            let content;
            let preg;

            jQuery("script:not([src])").each(function() {
                content = jQuery(this)[0].innerHTML;
                preg = /\/buscapagina\?.+&PageNumber=/i;

                if (content.search(/\/buscapagina\?/i) > -1) {
                    url = preg.exec(content);
                    return false;
                }
            });

            if (typeof url !== "undefined" && typeof url[0] !== "undefined") return url[0];
            else {
                log(
                    `Não foi possível localizar a url de busca da página.\n Tente adicionar o .js ao final da página. \n[Método: getSearchUrl]`
                );
                return "";
            }
        },
        scrollToTop: () => {
            let elem = body.find("#returnToTop");

            if (elem.length < 1) {
                elem = jQuery(
                    `<div id="returnToTop"><a href="#">${
                        options.returnTopText
                    }<span class="arrowToTop"></span></a></div>`
                );
                body.append(elem);
            }

            let windowH = _window.height();

            _window.bind("resize", function() {
                windowH = _window.height();
            });

            _window.bind("scroll", function() {
                if (_window.scrollTop() > windowH) {
                    elem.stop(true).fadeTo(300, 1, () => {
                        elem.show();
                    });
                } else {
                    elem.stop(true).fadeTo(300, 0, () => {
                        elem.hide();
                    });
                }
            });

            elem.bind("click", function() {
                _html.animate({ scrollTop: 0 }, "slow");
                return false;
            });
        },
        infinitScroll: () => {
            let elementPages;
            let pages;
            let currentStatus;
            let tmp;

            elementPages = body.find(".pager:first").attr("id");
            tmp = (elementPages || "").split("_").pop();
            pages = null !== options.pageLimit ? options.pageLimit : window[`pagecount_${tmp}`];
            currentStatus = true;

            if ("undefined" === typeof pages) {
                pages = 99999999;
            }

            _window.bind("scroll", function() {
                let _this = jQuery(this);

                if (
                    !animatingFilter &&
                    currentPage <= pages &&
                    moreResults &&
                    options.authorizeScroll(ajaxCallbackObj)
                ) {
                    if (_this.scrollTop() + _this.height() >= options.getShelfHeight(loadContentE) && currentStatus) {
                        let currentItems = loadContentE.find(options.shelfClass).filter(":last");

                        currentItems.after(elemLoading);
                        currentStatus = false;

                        pageJqxhr = jQuery.ajax({
                            url: fn.getUrl(true),
                            success: data => {
                                if (data.trim().length < 1) {
                                    moreResults = false;

                                    log(`Não existem mais resultados a partir da página: ${currentPage - 1}`, `Aviso`);
                                } else {
                                    currentItems.after(data);
                                }

                                currentStatus = true;
                                elemLoading.remove();
                                ajaxCallbackObj.requests++;
                                options.ajaxCallback(ajaxCallbackObj);
                            }
                        });
                        currentPage++;
                    }
                } else {
                    return false;
                }
            });
        }
    };

    if (null !== options.searchUrl) {
        currentSearchUrl = searchUrl = options.searchUrl;
    } else {
        currentSearchUrl = searchUrl = fn.getSearchUrl();
    }

    // Reporting Errors
    if ($this.length < 1) {
        log(`Nenhuma opção de filtro encontrada`, `Aviso`);

        if (options.showLinks) {
            jQuery(options.linksMenu)
                .css("visibility", "visible")
                .show();
        }

        fn.infinitScroll();
        fn.scrollToTop();
        return $this;
    }

    // Reporting Errors
    if (loadContentE.length < 1) {
        log(`Elemento para destino da requisição não foi encontrado \n (${loadContentE.selector})`);
        return false;
    }
    if (filtersMenuE.length < 1) {
        log(`O menu de filtros não foi encontrado \n (${filtersMenuE.selector})`);
    }

    let currentUrl = document.location.href,
        linksMenuE = jQuery(options.linksMenu),
        prodOverlay = jQuery('<div class="vtexSr-overlay"></div>'),
        departamentE = jQuery(options.menuDepartament),
        loadContentOffset = loadContentE.offset(),
        pageNumber = 1,
        shelfJqxhr = null,
        pageJqxhr = null;

    options.emptySearchElem.append(options.emptySearchMsg);
    loadContentE.before(prodOverlay);

    let fns = {
        exec: () => {
            fns.setFilterMenu();
            fns.fieldsetFormat();
            $this.each(function() {
                let _this = jQuery(this);
                let label = _this.parent();

                if (_this.is(":checked")) {
                    urlFilters += `&${_this.attr("rel") || ""}`;
                    // Adicionando classe ao label
                    label.addClass("sr_selected");
                }

                fns.adjustText(_this);
                // Add span vazio (depois de executar de "adjustText")
                label.append('<span class="sr_box"></span><span class="sr_box2"></span>');

                _this.bind("change", function() {
                    fns.inputAction();

                    if (_this.is(":checked")) {
                        fns.addFilter(_this);
                    } else {
                        fns.removeFilter(_this);
                    }

                    ajaxCallbackObj.filters = $this.filter(":checked").length;
                });
            });

            if ("" !== urlFilters) {
                fns.addFilter($empty);
            }
        },
        mergeMenu: () => {
            if (!options.mergeMenu) {
                return false;
            }

            let elem = departamentE;

            elem.insertAfter(options.insertMenuAfter);
            fns.departamentMenuFormat(elem);
        },
        mergeMenuList: () => {
            let i = 0;

            filtersMenuE.find("h3,h4").each(function() {
                let ul = linksMenuE
                    .find("h3,h4")
                    .eq(i)
                    .next("ul");

                ul.insertAfter(jQuery(this));
                fns.departamentMenuFormat(ul);
                i++;
            });
        },
        departamentMenuFormat: elem => {
            elem.find("a").each(function() {
                let a = jQuery(this);

                a.text(fns.removeCounter(a.text()));
            });
        },
        fieldsetFormat: () => {
            labelCallbackData.fieldsetCount = 0;
            labelCallbackData.tmpCurrentLabel = {};

            filtersMenuE.find("fieldset").each(function() {
                let $t = jQuery(this),
                    label = $t.find("label"),
                    fieldsetClass = `filtro_${($t.find("h5:first").text() || "")
                        .toLowerCase()
                        .replaceSpecialChars()
                        .replace(/\s/g, "-")}`;

                labelCallbackData[fieldsetClass] = {};

                // Ocultar fieldset quando não existe filtro e sair desste método
                if (label.length < 1) {
                    $t.hide();
                    return;
                }

                // Adicionar classe ao fieldset
                $t.addClass(fieldsetClass);

                // Adicionando classe e título ao label
                label.each(function(ndx) {
                    let t = jQuery(this),
                        v = t.find("input").val() || "",
                        labelClass = `sr_${v
                            .toLowerCase()
                            .replaceSpecialChars()
                            .replace(/\s/g, "-")}`;

                    labelCallbackData.tmpCurrentLabel = {
                        fieldsetParent: [$t, fieldsetClass],
                        elem: t
                    };

                    labelCallbackData[fieldsetClass][ndx.toString()] = {
                        className: labelClass,
                        title: v
                    };

                    t.addClass(labelClass).attr({ title: v, index: ndx });

                    options.labelCallback(labelCallbackData);
                });

                labelCallbackData.fieldsetCount++;
            });
        },
        inputAction: () => {
            if (null !== pageJqxhr) {
                pageJqxhr.abort();
            }

            if (null !== shelfJqxhr) {
                shelfJqxhr.abort();
            }

            currentPage = 2;
            moreResults = true;
        },
        addFilter: input => {
            urlFilters += `&${input.attr("rel") || ""}`;
            concatFilters.push(input.attr("rel").split("=")[1] || "");
            prodOverlay.fadeTo(300, 0.6);
            currentSearchUrl = fn.getUrl();

            $(window).on("hashchange", function() {
                if (window.location.hash != "") {
                    currentSearchUrl = currentSearchUrl.replace(
                        /PageNumber=[0-9]*/,
                        `PageNumber=${window.location.hash.replace(/\#/, "")}`
                    );

                    shelfJqxhr = jQuery.ajax({
                        url: currentSearchUrl,
                        success: fns.filterAjaxSuccess,
                        error: fns.filterAjaxError
                    });
                }
            });

            shelfJqxhr = jQuery.ajax({
                url: currentSearchUrl,
                success: fns.filterAjaxSuccess,
                error: fns.filterAjaxError
            });
            // Adicionando classe ao label
            input.parent().addClass("sr_selected");

            fns.groupFilters(concatFilters);
        },
        removeFilter: input => {
            let url = input.attr("rel") || "";
            let filterToRemove = input.attr("rel").split("=")[1] || "";
            concatFilters = concatFilters.filter(function(item) {
                return item !== filterToRemove;
            });

            prodOverlay.fadeTo(300, 0.6);

            if (url !== "") {
                urlFilters = urlFilters.replace(`&${url}`, "");
            }

            currentSearchUrl = fn.getUrl();

            shelfJqxhr = jQuery.ajax({
                url: currentSearchUrl,
                success: fns.filterAjaxSuccess,
                error: fns.filterAjaxError
            });
            // Removendo classe do label
            input.parent().removeClass("sr_selected");

            fns.groupFilters(concatFilters);
        },
        groupFilters: filters => {
            let url = new URI(window.location.href);
            let query = url.query() != "" ? parseQuery(url.query()) : "";
            let page = window.location.hash != "" ? window.location.hash : "";

            if (query != "") {
                query.filters = `[${filters}]`;
                query = buildQuery(query);

                window.history.pushState("", "", url.pathname() + `?${query}${page}`);
            } else {
                window.history.pushState("", "", url.pathname() + `?filters=[${buildQuery(filters)}]${page}`);
            }
        },
        filterAjaxSuccess: data => {
            let $data = jQuery(data);

            prodOverlay.fadeTo(300, 0, function() {
                jQuery(this).hide();
            });

            fns.updateContent($data);
            ajaxCallbackObj.requests++;
            options.ajaxCallback(ajaxCallbackObj);
            _html.animate(
                {
                    scrollTop: options.filterScrollTop(loadContentOffset || { top: 0, left: 0 })
                },
                600
            );
        },
        filterAjaxError: function() {
            prodOverlay.fadeTo(300, 0, function() {
                jQuery(this).hide();
            });

            // alert(options.filterErrorMsg);

            log(`Houve um erro ao tentar fazer a requisição da página com filtros.`);
        },
        updateContent: $data => {
            animatingFilter = true;

            if (!options.authorizeUpdate(ajaxCallbackObj)) {
                return false;
            }

            let shelf = $data.filter(options.shelfClass);
            let shelfPage = loadContentE.find(options.shelfClass);

            (shelfPage.length > 0 ? shelfPage : options.emptySearchElem).slideUp(600, function() {
                jQuery(this).remove();

                // Removendo a mensagem de busca vazia, esta remoção "forçada" foi feita para
                // corrigir um bug encontrado ao clicar em vários filtros
                if (options.usePopup) {
                    body.find(".boxPopUp2").vtexPopUp2();
                } else {
                    options.emptySearchElem.remove();
                }

                if (shelf.length > 0) {
                    shelf.hide();
                    loadContentE.append(shelf);
                    options.shelfCallback();
                    shelf.slideDown(600, () => {
                        animatingFilter = false;
                    });
                    ajaxCallbackObj.isEmpty = false;
                } else {
                    ajaxCallbackObj.isEmpty = true;

                    if (options.usePopup) {
                        options.emptySearchElem
                            .addClass(`freeContent autoClose ac_${options.popupAutoCloseSeconds}`)
                            .vtexPopUp2()
                            .stop(true)
                            .show();
                    } else {
                        loadContentE.append(options.emptySearchElem);
                        options.emptySearchElem
                            .show()
                            .css("height", "auto")
                            .fadeTo(300, 0.2, () => {
                                options.emptySearchElem.fadeTo(300, 1);
                            });
                    }

                    options.emptySearchCallback(ajaxCallbackObj);
                }
            });
        },
        adjustText: input => {
            var label = input.parent(),
                text = label.text();

            text = fns.removeCounter(text);

            label.text(text).prepend(input);
        },
        removeCounter: text => {
            return text.replace(/\([0-9]+\)/gi, a => {
                return "";
            });
        },
        setFilterMenu: () => {
            if (filtersMenuE.length > 0) {
                linksMenuE.hide();
                filtersMenuE.show();
            }
        },
        loadPage: () => {
            let url = new URI(window.location.href);
            let query = url.query() != "" ? parseQuery(url.query()) : "";

            if (query.filters != "[]" && query.filters != undefined) {
                let $filters = query.filters.split("[")[1].split("]")[0];

                if ($filters.match(/,/g)) {
                    $filters = $filters.split(",");

                    $.each($filters, function(idx, item) {
                        $(`input[rel="fq=${item}"]`).click();
                    });
                } else {
                    $(`input[rel="fq=${$filters}"]`).click();
                }
            }

            if (window.location.hash != "") {
                let page = window.location.hash.replace(/\#/, "");

                window.onload = function() {
                    $(".resultItemsWrapper .page-number").each(function() {
                        console.log($(this).text());

                        if ($(this).text() === page) {
                            $(this).click();
                        }
                    });
                };
            }
        }
    };

    if (body.hasClass("departamento")) {
        fns.mergeMenu();
    } else {
        if (body.hasClass("categoria") || body.hasClass("resultado-busca")) {
            fns.mergeMenuList();
        }
    }

    fns.exec();
    fn.infinitScroll();
    fn.scrollToTop();
    options.callback();
    fns.loadPage();

    $(window).load(function() {});

    // Exibindo o menu
    filtersMenuE.css("visibility", "visible");
};
