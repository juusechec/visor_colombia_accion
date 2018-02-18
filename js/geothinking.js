dojo.require("dojo.parser");
dojo.require("dojo.ready");
dojo.require("dojo");
dojo.require("dojo.dom-construct");
dojo.require("dojo.json");
dojo.require("dojo.dom");
dojo.require("dojo.on");
dojo.require("dojo.fx");
dojo.require("dojo.domReady!");
dojo.require("dijit.registry");
dojo.require("dojo.request.xhr");
dojo.require("dijit.Dialog");
dojo.require("dojox.layout.FloatingPane");

dojo.require("esri.config");
dojo.require("esri.map");
dojo.require("esri.config");
dojo.require("esri.SpatialReference");
dojo.require("esri.graphic");
dojo.require("esri.InfoTemplate");
dojo.require("esri.Color");
dojo.require("esri.layers.VectorTileLayer");
dojo.require("esri.layers.ArcGISDynamicMapServiceLayer");
dojo.require("esri.layers.GraphicsLayer");
dojo.require("esri.tasks.GeometryService");
dojo.require("esri.tasks.ProjectParameters");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.QueryTask");
dojo.require("esri.tasks.IdentifyTask"),
dojo.require("esri.tasks.IdentifyParameters"),
dojo.require("esri.geometry.Point");
dojo.require("esri.symbols.Symbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.symbols.Font");
dojo.require("esri.symbols.TextSymbol");
dojo.require("esri.toolbars.navigation");
//dojo.require("agsjs.dijit.TOC");
dojo.require("esri.dijit.BasemapGallery");
dojo.require("esri.graphicsUtils");


var dataset = [], registry, dom, datasource, eventQueryChange;
var dataModel = { project: null, entity: null };
//var baseHttp = "http://localhost:2723";
var root = location.protocol + '//' + location.host;
root = location.protocol + '//' + location.hostname;
//var baseHttp = "http://localhost:3994";
var baseHttp = root + ":3994";
var mapServiceUrl = "http://200.32.81.76:6080/arcgis/rest/services/ProjectServiceCICOA/MapServer";
function init() {
    loadGoogleCharts();

    registry = dijit.registry;
    dom = dojo.dom;
    configMap(null);
    eventQueryChange = new CustomEvent("filterChange", { detail: null });

}

function loadGoogleCharts() {
    google.charts.load('current', { 'packages': ['corechart', 'controls', 'gauge'] });

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(function(){
      drawDashboard();
      window.graphs.init();
    });
}

function drawDashboard() {
    //console.log("loaded google charts");
    loadDefaultChartConfig();
    //openDashboard();
    ///////////////////////////////////////////////queryComplements();
}

function configMap(appConfig) {
    //console.log('appConfig', appConfig);

    //map = new esri.Map("map_content", { center: [-73, 4.95], zoom: 5, basemap: "dark-gray", sliderOrientation: "vertical", sliderPosition: "bottom-left" });
    //map = new esri.Map("map", { center: [-73, 4.95], zoom: 5, basemap: "oceans", sliderOrientation: "", sliderPosition: "top-left", sliderStyle:"small", slider:false });
    esri.basemaps.custom = {
      baseMapLayers: [{
        url: "https://conservation.maps.arcgis.com/sharing/rest/content/items/b46dadd0ed67401d9ecb26c3fabd21ff/resources/styles/root.json",
        type: "VectorTile"}
      ],
      thumbnailUrl: "https://www.example.com/images/thumbnail_2014-11-25_61051.png",
      title: "Custom"
    };

    map = new esri.Map("map", { basemap: "custom", sliderOrientation: "", sliderPosition: "top-right", sliderStyle: "small", slider: true });

    var infoTemplates = {
      0: {
        infoTemplate: new esri.InfoTemplate("Proyectos", "Nombre: ${nombre}<br>Categoría: ${categoria}<br>Area Estudio: ${areaestudio}"),
        layerUrl: null
      }
    };

    var dynamic_layer = new esri.layers.ArcGISDynamicMapServiceLayer(mapServiceUrl, { userMapImage: true, opacity: 1,
    infoTemplates: infoTemplates });
    window.dynamic_layer = dynamic_layer;
    map.addLayer(dynamic_layer);

    map.on("load", onLoadMapEvent);

    //map.on("load", onLoadMapEvent);
    map.centerAndZoom(new esri.geometry.Point(-73, 4.95), 5);
    layersInfo = new Array();
    //loadDynamicServices(appConfig.services, layersInfo);
    //loadBaseService(appConfig, layersInfo);
    //loadThematicsService(appConfig, layersInfo);

    //var onLayerAddResultHandler = dojo.on(map, "layer-add-result", function (layer) {
    //    tocLoad();
    //    onLayerAddResultHandler.remove();
    //});
    //navtoolbar = new esri.toolbars.Navigation(map);
    //setAutocomplete();

    //var dialog = new dijit.Dialog();
    //dialog.show();
    //dashboard_container.show();
}

function onLoadMapEvent(map) {
    //console.log(map);

}

var floatingPane = null;
function openDashboard(id) {
    if (floatingPane != null)
        closeFloatingPane();
    var dashboard = document.getElementById(id);
    findElement(id, 'dashboard_options').style.display = 'inline';
    var title = findElement(id, 'dashboard_title');
    var titleText = title.innerHTML;
    title.style.display = 'none';

    var parentid = dashboard.parentElement.id;
    //var dashboardClone = dashboard.cloneNode(true);
    floatingPane = new dojox.layout.FloatingPane({
        title: titleText,
        resizable: true,
        dockable: false,
        closable: true,

        //onClose: function () { console.log("Cerrando"); },
        //onHide:function(){console.log("hidden");},
        style: "position:absolute;top:100px;left:100px;min-width:620px;min-height:520px;visibility:visible;background-color:#FFFFFF; display:table-caption; border: 1px solid #49a942; padding: 0px 0px 0px 0px; border-radius:6px;overflow:hidden; color:#FFFFFF;z-index:1000"
        //style: "position:absolute;top:100px;left:100px;min-width:620px;min-height:520px;visibility:visible;background-color:#FFFFFF; display:table-caption; border-color:#49a942; border-style:solid; padding: 0px 0px 0px 0px; border-radius:6px;overflow:hidden"
    }, dashboard); //.set('class', 'dojoxFloatingPaneClass');
    floatingPane.dashboard = dashboard;
    floatingPane.dashboardParent = parentid;
    //document.getElementsByClassName("dojoxFloatingMinimizeIcon")[0].innerHTML = "X";
    floatingPane.show();
    /*var dialog = new dijit.Dialog({
        title: "My Dialog",
        content: dashboard,
        style: "width: 600px; height:auto"
    });

    dialog.show();*/
    //floatingPane.on('close', floatingPaneClosed);
    console.log('floatingPane', floatingPane);
    //console.log(dashboardClone);
    //dashboardItem.style.display = 'none';
    //registry.byId("dashboard_container").show();

}

function closeFloatingPane() {
    var containerNode = floatingPane.containerNode;
    console.log(containerNode);
    var dashboard = document.createElement('div');
    dashboard.id = floatingPane.id;
    var title = containerNode.children[0];
    dashboard.appendChild(title);
    var options = containerNode.children[0];
    dashboard.appendChild(options);
    var charts = containerNode.children[0];
    dashboard.appendChild(charts);

    //var dashboard = floatingPane.dashboard;
    //dashboardid=floatingPane.id;
    var parent = floatingPane.dashboardParent;

    document.getElementById(parent).appendChild(dashboard);
    floatingPane.destroy();
    floatingPane = null;
    findElement(dashboard.id, 'dashboard_title').style.display = 'block';
    findElement(dashboard.id, 'dashboard_options').style.display = 'none';

}

function findElement(id, element) {
    var elementNode = document.getElementById(id);

    for (var i = 0; i < elementNode.children.length; i++) {
        console.log(elementNode.children[i].id);
        if (elementNode.children[i].id == element)
            return elementNode.children[i];
    }
    return null;
}

function floatingPaneClosed() {
    console.log("Cerrado");
}


function loadDefaultChartConfig() {
    var projectsPromise = $.get(baseHttp + '/api/BaseService/queryResumeAllProjects');
    var estrategiasPromise = $.get(baseHttp + '/api/BaseService/queryResumenEstrategias');
    var cgPromise = $.get(baseHttp + '/api/BaseService/queryResumenCG');
    var programasPromise = $.get(baseHttp + '/api/BaseService/queryResumenProgramas');

    $.when(projectsPromise, estrategiasPromise, cgPromise, programasPromise).done(
      function(results1, results2, results3, results4) {
          // do something
          console.log('results', results1, results2, results3, results4);
          datasource = results1;
          //setDashboard1Option(results1[0]);
          setDashboard2Option(results2[0].Result);
          setDashboard3Option(results3[0].Result);
          setDashboard4Option(results4[0].Result);
    });

}

//var dashboard, tableChart, piechart, columnchart,datatable;
function setDashboard1Option(data) {
    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
    var filterControl = setFilterControl(data);
    var piechart = setPieChartControl(data, 1);
    var columnchart = setColumnChartControl(data, 1);
    var datatable = setColumnChartDataTable(data, 1);
    console.log(datatable);
    var tableChart = setTableChartControl(data, 1);
    google.visualization.events.addListener(tableChart, 'select',
        function () {
            //console.log(datatable);
            var rowIndex = tableChart.getChart().getSelection();
            var id = datatable.getValue(rowIndex[0].row, 3);
            SelectMapServiceFeature(id);
            //console.log(id);

        });
    google.visualization.events.addListener(piechart, 'select',
        function () {
            //console.log(datatable);
            var rowIndex = piechart.getChart().getSelection();
            var id = datatable.getValue(rowIndex[0].row, 3);
            SelectMapServiceFeature(id);
            //console.log(id);
        });
    google.visualization.events.addListener(columnchart, 'select',
        function () {
            //console.log(datatable);
            var rowIndex = columnchart.getChart().getSelection();
            var id = datatable.getValue(rowIndex[0].row, 3);
            SelectMapServiceFeature(id);
            console.log(id);
        });

    dashboard.bind(filterControl, [tableChart, piechart, columnchart]);

    dashboard.ready = dashboardReady();
    dashboard.draw(datatable);
}

function setDashboard2Option(data) {
    console.log(data);
    dashboard = new google.visualization.Dashboard(document.getElementById('estrategias_dashboard_div'));

    var filterControl = setFilterControl(data);
    var piechart = setPieChartControl(data, 2);
    var columnchart = setColumnChartControl(data, 2);
    var datatable = setColumnChartDataTable(data, 2);

    var tableChart = setTableChartControl(data, 2);
    google.visualization.events.addListener(tableChart, 'select',
       function () {
           console.log(datatable);
           var rowIndex = tableChart.getChart().getSelection()
           var id = datatable.getValue(rowIndex[0].row, 2);
           //console.log(id);
           queryComplemento('estrategia', id);

       });
    google.visualization.events.addListener(piechart, 'select',
        function () {
            console.log(datatable);
            var rowIndex = piechart.getChart().getSelection();
            var id = datatable.getValue(rowIndex[0].row, 2);
            queryComplemento('estrategia', id);
        });
    google.visualization.events.addListener(columnchart, 'select',
        function () {
            console.log(datatable);
            var rowIndex = columnchart.getChart().getSelection();
            var id = datatable.getValue(rowIndex[0].row, 3);
            queryComplemento('estrategia', id);
        });

    dashboard.bind(filterControl, [tableChart, piechart, columnchart]);

    dashboard.ready = dashboardReady();
    dashboard.draw(datatable);
}

function setDashboard3Option(data) {
    console.log(data);
    dashboard = new google.visualization.Dashboard(document.getElementById('cg_dashboard_div'));

    var filterControl = setFilterControl(data);
    var piechart = setPieChartControl(data, 3);
    var columnchart = setColumnChartControl(data, 3);
    var datatable = setColumnChartDataTable(data, 3);

    var tableChart = setTableChartControl(data, 3);
    //google.visualization.events.addListener(tableChart, 'select', selectTableChart);
    //google.visualization.events.addListener(piechart, 'select', selectPieChart);
    //google.visualization.events.addListener(columnchart, 'select', selectColumnChart);

    dashboard.bind(filterControl, [tableChart, piechart, columnchart]);

    dashboard.ready = dashboardReady();
    dashboard.draw(datatable);
}

function setDashboard4Option(data) {
    console.log(data);
    dashboard = new google.visualization.Dashboard(document.getElementById('programas_dashboard_div'));

    var filterControl = setFilterControl(data);
    var piechart = setPieChartControl(data, 4);
    var columnchart = setColumnChartControl(data, 4);
    var datatable = setColumnChartDataTable(data, 4);

    var tableChart = setTableChartControl(data, 4);
    google.visualization.events.addListener(tableChart, 'select', selectTableChart);
    google.visualization.events.addListener(piechart, 'select', selectPieChart);
    google.visualization.events.addListener(columnchart, 'select', selectColumnChart);

    dashboard.bind(filterControl, [tableChart, piechart, columnchart]);

    dashboard.ready = dashboardReady();
    dashboard.draw(datatable);
}

function selectColumnChart(evt) {
    var rowIndex = columnchart.getChart().getSelection();
    var id = datatable.getValue(rowIndex[0].row, 3);
    SelectMapServiceFeature(id);
}

function SelectMapServiceFeature(id) {
    var queryTask = new esri.tasks.QueryTask(mapServiceUrl + "/1");
    var query = new esri.tasks.Query();
    query.outFields = ["ProjectLocationID", "ProjectAreaName"];
    query.where = "ProjectLocationID=" + id;
    query.returnGeometry = true;
    queryTask.execute(query, queryTaskResponse, queryTaskError);

}

function queryTaskResponse(featureset) {
    console.log(featureset);
}


function queryTaskError(error) {
    console.log(error);
}

function selectPieChart(e) {
    console.log(e['select']);
    console.log(piechart.getChart().getSelection());
}

function selectTableChart(evt) {
    console.log(evt);
    console.log(tableChart.getChart().getSelection());
}

function dashboardReady() {

}

function queryComplements() {

    //queryProjects();
    //queryEntities();// YA no funciona

    var projectsPromise = $.post(baseHttp + '/api/BaseService/queryAllProjects');
    //var gruposPromise = $.get('conf/grupos.json');

    $.when(projectsPromise/*, gruposPromise*/).done(function(results1/*, results2*/) {
          // do something
          console.log('results', results1);
          queryProjectsDescResponse(results1);
    });
}

function queryProjectsDescResponse(data) {
    console.log(data);
    dataModel.project = data;
    if (data.Operation) {
        var fields = data.Result.fields;
        var rows = data.Result.data;
        var fieldsOrder = data.Result.dashboard.tableChart.fieldsOrder;
        createTableChart(fieldsOrder, fields, rows);
    }
    //updateModelView();
    //if (data.Operation)
    //{
    //    var rows=data.Result.data;
    //    for (var i = 0; i < rows.length; i++)
    //    {
    //        var row_id = rows[i].GEMID;
    //        var row_des = rows[i].ProjectName;
    //        addTag('projectsDescContainer', 'anchor', row_id, row_des, queryProjectById, true);
    //    }
    //}
}

function createTableChart(fieldsOrder, fields, rows) {
    var datatable = new google.visualization.DataTable();
    for (var i = 0; i < fieldsOrder.length; i++) {
        var field = findField(fields, fieldsOrder[i]);
        if (field != null) {
            if (field.fieldType != null)
                datatable.addColumn({ "type": field.fieldType, "label": field.fieldAlias, "id": field.fieldName });
            else
                datatable.addColumn({ "type": "string", "label": field.fieldAlias, "id": field.fieldName });
        }
    }
    console.log(datatable);
    datatable.addRows(rows.length);
    var columnIndex, columnType, value;
    for (var i = 0; i < rows.length; i++) {
        for (var attribute in rows[i]) {
            columnIndex = getColumnIndex(fieldsOrder, attribute);
            if (columnIndex != -1) {
                columnType = datatable.getColumnType(columnIndex);
                console.log(columnIndex);
                console.log(attribute);
                if (columnType == 'date') {
                    value = new Date(rows[i][attribute]);
                }
                else {
                    value = rows[i][attribute];
                }

                console.log(value);
                datatable.setCell(i, columnIndex, value);
                //if (value != null)
                //    datatable.setCell(i, columnIndex, value);
                //else
                //    datatable.setCell(i, columnIndex, "");
            }
            //console.log(rows[i][attribute]);
        }
        //for (var j = 0; j < fieldsOrder.length; j++)
        //{
        //    var value = rows[i][fieldsOrder[j]];
        //    if(value!=null)
        //        datatable.setCell(i, j, value);
        //    else
        //        datatable.setCell(i, j, "");
        //}
    }
    console.log(datatable);
}

function getColumnIndex(fields, columnName) {
    //console.log(columnName);
    //console.log(fields);
    for (var i = 0; i < fields.length; i++) {
        if (fields[i] == columnName){
            return i;
        }
    }
    return -1;
}

function addTag(container, tag, id, label, listener, embebed) {
    var tag;
    switch (tag) {
        case 'anchor':
            tag = createAnchor(id, label, listener, embebed);
            break;
        case 'button':
            break;
    }
    document.getElementById(container).appendChild(tag);
}

function createAnchor(id, label, listener, embebed) {
    var aTag = document.createElement("a");
    aTag.id = id;
    aTag.innerHTML = label;
    aTag.href = "#";
    aTag.addEventListener('click', listener);
    if (embebed) {
        var divEmbebed = document.createElement("li");
        divEmbebed.appendChild(aTag);
        return divEmbebed;
    }
    return aTag;
}

function queryProjectById(event) {
    console.log(event.target);
}

function queryEntitytById(event) {

}

function queryEntities(ids) {
    if (ids == null) {
        dojo.request.xhr(baseHttp + "/api/BaseService/queryAllETPSEntityDescription",
        {
            handleAs: "json",
            method: 'post',
            sync: false,
            headers: { "X-Requested-With": null }
        }).then(queryEntitiesDesResponse);
    }
    else {

    }
}

function queryEntitiesDesResponse(data) {
    //console.log(data);
    dataModel.entity = data;
    if (data.Operation) {
        var rows = data.Result.data;
        for (var i = 0; i < rows.length; i++) {
            var id = rows[i].EntityID;
            var des = rows[i].EntityName;
            var type = rows[i].EntityType;
            if (type == 2){
              addTag('sociosDescContainer', 'anchor', id, des, queryEntitytById, true);
            }
            if (type == 1){
              addTag('donantesDescContainer', 'anchor', id, des, queryEntitytById, true);
            }
        }
    }
    console.log(dataModel);
}

function setPieChartDataTable(data) {
    var datatable = setPieChartColumns(data.dashboard.pieChart, data.fields);
    setDataRows(data.dashboard.pieChart.fieldsOrder, data.data, datatable);
    console.log(datatable);
    return datatable;
}

function setColumnChartDataTable(data, opt) {
    console.log(data);
    var datatable = setColumnChartColumns(data.dashboard.columnChart, data.fields);
    console.log(datatable);
    //setColumnChartColumns(data.dashboard.columnChart.fieldsOrder, data.fields, datatable);

    setDataRows(data.dashboard.columnChart.fieldsOrder, data.data, datatable);
    return datatable;
}

function setTableChartDataTable(data) {
    var datatable = setTableChartColumns(data.dashboard.columnChart, data.fields);
    console.log(data);
    //setColumnChartColumns(data.dashboard.columnChart.fieldsOrder, data.fields, datatable);

    //setDataRows(data.dashboard.columnChart.fieldsOrder, data.data, datatable);
    //return datatable;
}

function setPieChartColumns(fieldsConfig, fields) {
    var datatable = new google.visualization.DataTable();
    for (var i = 0; i < fieldsConfig.fieldsOrder.length; i++) {
        var field = findField(fields, fieldsConfig.fieldsOrder[i]);
        if (field != null)
            datatable.addColumn(field.fieldType, field.fieldAlias);
    }
    return datatable;
}

function setColumnChartColumns(fieldsConfig, fields) {
    console.log(fieldsConfig);
    var datatable = new google.visualization.DataTable();
    for (var i = 0; i < fieldsConfig.fieldsOrder.length; i++) {
        var field = findField(fields, fieldsConfig.fieldsOrder[i]);

        if (field != null) {
            var defaultField = true;
            if (fieldsConfig.domainField == field.fieldName) {
                datatable.addColumn({ "type": field.fieldType, "label": field.fieldAlias, "role": "domain" });
                defaultField = false;
            }
            if (fieldsConfig.datafield == field.fieldName) {
                datatable.addColumn({ "type": field.fieldType, "label": field.fieldAlias, "role": "data" });
                defaultField = false;
            }
            if (fieldsConfig.annotationField == field.fieldName) {
                datatable.addColumn({ "type": field.fieldType, "label": field.fieldAlias, "role": "annotation" });
                defaultField = false;
            }
            if (defaultField)
                datatable.addColumn({ "type": field.fieldType, "label": field.fieldAlias });
        }
    }
    return datatable;
}

function setFieldsTable(fields, data) {
    console.log(fields);
    console.log(data);
}

function setDataRows(fields, rows, datatable) {
    datatable.addRows(rows.length);
    for (var i = 0; i < rows.length; i++) {
        for (var j = 0; j < fields.length; j++) {
            datatable.setCell(i, j, rows[i][fields[j]]);
        }
    }
}

function findField(fields, fieldName) {
    for (var i = 0; i < fields.length; i++) {
        if (fields[i].fieldName == fieldName)
            return fields[i];
    }
    return null;
}

function setFilterControl(data) {
    //console.log(data);
    var filterControl = new google.visualization.ControlWrapper(data.dashboard.filterOptions);
    return filterControl;
}

function setFilterRangeControl(data) {
    // Create a range slider, passing some options
    var donutRangeSlider = new google.visualization.ControlWrapper(data.dashboard.filterRangeOptions);
    return filterControl;
}

function setPieChartControl(data, opt) {
    var container = null;
    switch (opt) {
        case 1:
            container = 'chart_div';
            break;
        case 2:
            container = 'e_chart_div';
            break;
        case 3:
            container = 'cg_chart_div';
            break;
        case 4:
            container = 'p_chart_div';
            break;
    }
    var pieChart = new google.visualization.ChartWrapper({
        'chartType': 'PieChart',
        'containerId': container,
        'options': data.dashboardOptions.pieChartOptions
    });
    return pieChart;
}

function setColumnChartControl(data, opt) {
    var container = null;
    switch (opt) {
        case 1:
            container = 'columnchart_div';
            break;
        case 2:
            container = 'e_columnchart_div';
            break;
        case 3:
            container = 'cg_columnchart_div';
            break;
        case 4:
            container = 'p_columnchart_div';
            break;
    }
    var columnChart = new google.visualization.ChartWrapper({
        'chartType': 'ColumnChart',
        'containerId': container,
        'options': data.dashboardOptions.columnChartOptions
    });
    return columnChart;
}

function setBarChartControl(data, opt) {
    var container = null;
    switch (opt) {
        case 1:
            container = 'barchart_div';
            break;
        case 2:
            container = 'e_barchart_div';
            break;
        case 3:
            container = 'cg_barchart_div';
            break;
        case 4:
            container = 'p_barchart_div';
            break;
    }
    var barChart = new google.visualization.ChartWrapper({
        'chartType': 'BarChart',
        'containerId': container,
        'options': data.dashboardOptions.barChartOptions
    });
    return barChart;
}

function setTableChartControl(data, opt) {
    var container = null;
    switch (opt) {
        case 1:
            container = 'table_div';
            break;
        case 2:
            container = 'e_table_div';
            break;
        case 3:
            container = 'cg_table_div';
            break;
        case 4:
            container = 'p_table_div';
            break;
    }
    var tableChart = new google.visualization.ChartWrapper({
        'chartType': 'Table',
        'containerId': container,
        'options': data.dashboardOptions.tableChartOptions.options
    });
    tableChart.setProperty("style", data.dashboardOptions.tableChartOptions.style);

    return tableChart;
}

function selectHandler(event) {
    console.log(event);
}

function changeChart() {

}

function queryAllProjects() {
    dojo.request.xhr("http://localhost:2723/api/BaseService/queryAllETPSProjects",
    {
        handleAs: "json",
        headers: { "X-Requested-With": null }
    }).then(setProyectosTable);
}

function setProyectosTable(data) {
    removeFloatingPaneNodes();
    console.log(data);
    var chartControl = null;
    if (data.Operation) {
        console.log(data.Result);
        chartControl = setTableChartControl(data.Result);
    }
    console.log(chartControl);

    floatingPane.show();
}

function changeNavlistOption(option) {
    var main_menu = document.getElementById('main_menu');
    for (var i = 0; i < main_menu.childNodes.length; i++) {
        main_menu.childNodes[i].className = 'navlist-item';
    }
    option.target.parentElement.className = 'active';
    switch (option.target.parentElement.id) {
        case 'CG_menu':
            document.getElementById('E_list').style.display = 'none';
            document.getElementById('IN_list').style.display = 'none';
            document.getElementById('CG_list').style.display = 'block';
            document.getElementById('menuOptions').innerHTML = 'Criterios de Gestión';
            break;
        case 'E_menu':
            document.getElementById('CG_list').style.display = 'none';
            document.getElementById('IN_list').style.display = 'none';
            document.getElementById('E_list').style.display = 'block';
            document.getElementById('menuOptions').innerHTML = 'Estrategias';
            break;
        case 'IN_menu':
            document.getElementById('E_list').style.display = 'none';
            document.getElementById('CG_list').style.display = 'none';
            document.getElementById('IN_list').style.display = 'block';
            document.getElementById('menuOptions').innerHTML = 'Iniciativas Nacionales';
            break;
    }
}

function changeChartOption(container, option) {
    var elementContainer = document.getElementById(container);

    for (var i = 0; i < elementContainer.children.length; i++) {
        console.log(elementContainer.children[i]);
        if (elementContainer.children[i].id == option) {
            elementContainer.children[i].style.display = 'block';
        }
        else {
            elementContainer.children[i].style.display = 'none';
        }
    }
}

function openFloatingPane() {
    floatingPane.show();
}

function removeFloatingPaneNodes() {
    removeNode("filter_div");
    removeNode("table_div");
    removeNode("chart_div");
    removeNode("columnchart_div");
}

function removeNode(nodeName) {
    var node = document.getElementById(nodeName);
    while (node.hasChildNodes()) {
        node.removeChild(node.firstChild);
    }
}

function clearDashboardContainer() {
    removeNode("filter_div");
    removeNode("table_div");
    removeNode("chart_div");
    removeNode("columnchart_div");
}

function abrirDashboardPanel(dashboard) {

}

function queryComplemento(_option, _id) {
    dojo.request.xhr(baseHttp + "/api/BaseService/queryComplemento",
   {
       query: { option: _option, id: _id },
       handleAs: "json",
       method: "POST",
       headers: { "X-Requested-With": null }
   }).then(complementoResponse);
}

function complementoResponse(data) {
    console.log(data);
}

dojo.addOnLoad(init);
