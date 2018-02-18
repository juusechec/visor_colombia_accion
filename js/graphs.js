var Graphs = function() {
  var self = this;

  this.init = function() {
    console.log('Loading Graphs...');
    self.loadData();
  }

  this.loadData = function () {
    var areasTrabajoPromise = $.get(baseHttp + '/api/BaseService/queryAreasTrabajo');
    var entidadesPromise = $.get(baseHttp + '/api/BaseService/queryEntidades');
    var proyectosPromise = $.get(baseHttp + '/api/BaseService/queryProyectos');
    //var estrategiasPromise = $.get(baseHttp + '/api/BaseService/queryResumenEstrategias');

    $.when(areasTrabajoPromise, entidadesPromise, proyectosPromise).done(function(
      areasTrabajoResults,
      entidadesResults,
      proyectosResults) {
          console.log(
            'Graphs loadData results',
            areasTrabajoResults,
            entidadesResults,
            proyectosResults
          );
          self.areasTrabajoResults = areasTrabajoResults;
          self.loadAreasTrabajoGraphs(areasTrabajoResults[0].Result);
          self.loadSociosGraphs(entidadesResults[0].Result);
          self.loadProyectosGraphs(proyectosResults[0].Result);
    });
  }

  this.serverDataToArray = function (serverData){
    var arreglo = [];
    for (i in serverData) {arreglo.push(serverData[i])};
    return arreglo;
  }

  this.serverFieldsToArray = function (serverFields) {
    var arreglo = [];
    for (i in serverFields) {arreglo.push(serverFields[i].fieldAlias)};
    return arreglo;
  }

  this.serverFieldsToKeyValue = function (serverFields) {
    var keyValue = {};
    for (i in serverFields) {keyValue[serverFields[i].fieldName] = serverFields[i].fieldAlias};
    return keyValue;
  }

  this.parseDateFX = function (a) {
    if (a === null){
      // a = 'No Información';
    } else {
      if (typeof a === 'string' || a instanceof String){
        var b = a.split('T');
        if (b.length === 2){
          var c = b[0].split('-')
          if (c.length === 3){
            // var year = c[0];
            // var month = c[1];
            // var day = c[2];
            a = new Date(c);
          }
        }
      }
    }
    return a;
  }

  this.parseDates = function (row) {
    for (var i = 0; i < row.length; i++) {
      row[i] = parseDateFX(row[i]);
    };
    return row;
  }

  this.removeFields = function (fieldsIndex, transformFX) {
    fieldsIndex.sort();
    return function (valuesArr) {
      //console.log('removeFields valuesArr fieldsIndex', valuesArr, fieldsIndex);
      for (var i = fieldsIndex.length -1; i >= 0; i--) {
        valuesArr.splice(fieldsIndex[i], 1);
      }
      if (typeof transformFX !== 'undefined'){
        transformFX(valuesArr);
      }
      return valuesArr;
    };
  }

  this.returnIndexFromFields = function (filterFields, fields) {
    var arrayIndex = new Array(filterFields.length);
    var finded = 0;
    for (var i = 0; i < fields.length; i++) {
      if (finded === filterFields.length) {
        break;
      }
      var field = fields[i];
      var fieldName = field.fieldName;
      var indexFieldName = filterFields.indexOf(fieldName);
      //console.log('filterFields, fields, field, fieldName, indexFieldName', filterFields, fields, field, fieldName, indexFieldName);
      if (indexFieldName > -1) { // existe
        arrayIndex[indexFieldName] = i;
        finded += 1;
      }
    }
    return arrayIndex;
  }

  this.filterFieldsOfRows = function (rows, filterFields, transformFX) {
    var filteredRows = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var filteredRow = [];
      for (var j = 0; j < filterFields.length; j++) {
        var fieldId = (filterFields[j].id === undefined)?filterFields[j]:filterFields[j].id;
        var valor = row[fieldId];
        // Si el valor no viene en la respuesta del servicio REST, se lo inventa
        // Si existe una función de transformación, la usa para generar algún valor
        // ejemplos de este uso es transformar un string en un date
        // cambiar el null de algún campo por un valor Predeterminado, etc.
        if (valor === undefined) {
          valor = null;
        }
        if (typeof transformFX !== 'undefined'){
          valor = transformFX(valor, {
            'id': fieldId,
            'row': row
          });
        }
        filteredRow.push(valor);
      }
      filteredRows.push(filteredRow);
    }
    return filteredRows;
  }

  this.getPositionOf = function (arreglo, valor, id) {
    for (var i = 0; i < arreglo.length; i++) {
      var idArreglo = (typeof id === 'undefined')?arreglo[i]:arreglo[i][id];
      idArreglo = (idArreglo === undefined)?arreglo[i]:idArreglo;
      if (idArreglo === valor) {
        return i;
      }
    }
  }

  this.fieldsToColumns = function (filterFields, fields) {
    // https://developers.google.com/chart/interactive/docs/roles
    var columns = new Array(filterFields.length);
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var fieldName = field.fieldName;
      var fieldIndex = self.getPositionOf(filterFields, fieldName, 'id');
      if (fieldIndex > -1) { // si el elemento coincide con el indice filtrado
        if (filterFields[fieldIndex].id === undefined) { // solo un string
          var id = field.fieldName;
          var label = field.fieldAlias;
          var type = field.fieldType;
          columns[fieldIndex] = {id: id, label: label, type: type}; // estructura google charts
        } else {
          var id = filterFields[fieldIndex].id;
          var label = (filterFields[fieldIndex].label === undefined)?field.fieldAlias:filterFields[fieldIndex].label;
          var type = (filterFields[fieldIndex].type === undefined)?field.fieldType:filterFields[fieldIndex].type;
          columns[fieldIndex] = filterFields[fieldIndex];
          columns[fieldIndex].id = id;
          columns[fieldIndex].label = label;
          columns[fieldIndex].type = type;
        }
      }
    }
    for (var i = 0; i < columns.length; i++) {
      if (columns[i] === undefined) {
        columns[i] = filterFields[i];
      }
    }
    return columns;
  }

  this.loadSociosGraphs = function(datos) {
    console.log('loadSociosGraphs datos', datos);

    // https://developers.google.com/chart/interactive/docs/roles
    // https://gist.github.com/battlehorse/1242360

    // ######### dashboard1 ##########

    var filterFields = [
      'nombre_entidad',
      {id: 'valor_proyectos', type: 'number'},
      {id: 'numero_proyectos', role:'annotation'},
    ];

    var columns = self.fieldsToColumns(filterFields, datos.fields);
    //console.log('columns', columns);

    var dataArray = self.filterFieldsOfRows(datos.rows, columns);
    //console.log('dataArray', dataArray);

    var arrayData = [columns].concat(dataArray);
    console.log('arrayData', arrayData);

    // Create our data table.
    var data = google.visualization.arrayToDataTable(arrayData);
    // Create a dashboard.
    var dashboard1 = new google.visualization.Dashboard(
        document.getElementById('dashboard1_div_socios'));

    var categoryFilter = new google.visualization.ControlWrapper({
        controlType: 'CategoryFilter',
        containerId: 'hidden_div_socios',
        options: {
          'filterColumnIndex': 0,
          //'filterColumnLabel': 'Nombre Entidad'
        }
    });

    var barChart = new google.visualization.ChartWrapper({
      chartType: 'BarChart',
      containerId: 'barchart_div_socios',
      options: {
        title: 'Valor Proyectos',
        filterColumnIndex: 1,
        width: 500,
        height: 400,
      }
    });

    dashboard1.bind(categoryFilter, barChart);
    dashboard1.draw(data);

    // ######### dashboard2 ##########

    var filterFields2 = [
      'nombre_entidad',
      {id: 'valor_proyectos', type: 'number'},
      'numero_proyectos',
      {id: 'fechainicial', type: 'date'},
      {id: 'fechafinal', type: 'date'},
      {id: 'proyectos', label: 'Proyectos', type: 'string'},
    ];

    var columns2 = self.fieldsToColumns(filterFields2, datos.fields);
    //console.log('columns2', columns2);

    var dataArray2 = self.filterFieldsOfRows(datos.rows, columns2, (function (valor, obj){
      var columns = this;
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].id == obj.id && columns[i].type === 'date') {
          return self.parseDateFX(valor);
        }
      }
      if (obj.id === 'proyectos') { // proyectos no existe, la crea
        return '<a href="#">Ver proyectos</a>';
      }
      return valor;
    }).bind(columns2));
    //console.log('dataArray', dataArray);

    var arrayData2 = [columns2].concat(dataArray2);
    console.log('arrayData2', arrayData2);

    // Create our data table.
    var data2 = google.visualization.arrayToDataTable(arrayData2);
    // Create a dashboard.
    var dashboard2 = new google.visualization.Dashboard(
        document.getElementById('dashboard2_div_socios'));

    var stringFilter = new google.visualization.ControlWrapper({
      controlType: 'StringFilter',
      containerId: 'filter_string_div_socios',
      options: {
        filterColumnIndex: 0,
        //filterColumnLabel: 'Fecha Inicial Primer Proyecto',
        realtimeTrigger: true,
        caseSensitive: false,
        label: 'Filtre por Nombre Proyecto'
      }
    });

    // Define a table visualization
    var tableChart = new google.visualization.ChartWrapper({
      chartType: 'Table',
      containerId: 'table_div_socios',
        options: {
        width: 500,
        height: 400,
        allowHtml: true,
      }
    });
    dashboard2.bind([stringFilter], [tableChart]);
    dashboard2.draw(data2);

    // Create a range slider, passing some options
    // var donutRangeSlider = new google.visualization.ControlWrapper({
    //   'controlType': 'NumberRangeFilter',
    //   'containerId': 'filter_div_socios',
    //   'options': {
    //     'filterColumnLabel': 'Fecha Inicial Primer Proyecto'
    //   }
    // });

    // var dateRangeSlider = new google.visualization.ControlWrapper({
    //     controlType: 'ChartRangeFilter',
    //     containerId: 'filter_div_socios',
    //     options: {
    //       'filterColumnIndex': 2,
    //       //'filterColumnLabel': 'Fecha Final Proyectos',
    //       'ui': {
    //         'chartOptions': {
    //           'height': 50,
    //           'width': 600,
    //           'chartArea': {
    //             'width': '80%'
    //           }
    //         },
    //         // 'chartView': {
    //         //   'columns': [1]
    //         // }
    //       }
    //     }
    // });

    // https://groups.google.com/forum/#!topic/google-visualization-api/UF-1xlPLMQM
    // var intermediary = new google.visualization.ControlWrapper({
    //     controlType: 'CategoryFilter',
    //     containerId: 'hidden_div_socios',
    //     options: {
    //       'filterColumnIndex': 0,
    //       //'filterColumnLabel': 'Nombre Entidad'
    //     }
    // });

    // Create a pie chart, passing some options
    // var pieChart = new google.visualization.ChartWrapper({
    //   chartType: 'PieChart',
    //   containerId: 'chart_div_socios',
    //   options: {
    //     title: 'Valor Proyectos',
    //     width: 500,
    //     height: 400,
    //     pieSliceText: 'value',
    //     legend: 'right',
    //     pieHole: 0.4,
    //   }
    // });


   // var stringFilter = new google.visualization.ControlWrapper({
   //   controlType: 'StringFilter',
   //   containerId: 'filter_string_div_socios',
   //   options: {
   //     filterColumnIndex: 0,
   //     //filterColumnLabel: 'Fecha Inicial Primer Proyecto',
   //     realtimeTrigger: true,
   //     caseSensitive: false,
   //     label: 'Filtre por Nombre Proyecto'
   //   }
   // });
   //
   //  // Define a table visualization
   //  var tableChart = new google.visualization.ChartWrapper({
   //    chartType: 'Table',
   //    containerId: 'table_div_socios',
   //    options: {
   //      width: 500,
   //      height: 400,
   //      allowHtml: true,
   //    }
   //  });
   //
   //  // Establish dependencies, declaring that 'filter' drives 'pieChart',
   //  // so that the pie chart will only display entries that are let through
   //  // given the chosen slider range.
   //  //dashboard.bind([dateRangeSlider], [intermediary]);
   //
   //  // bind intermediary to pie
   //  //dashboard.bind([intermediary], [barChart]);
   //  dashboard2.bind(stringFilter, barChart);
   //
   //  //dashboard.bind([stringFilter], [barChart,tableChart]);
   //
   //  // Draw the dashboard.
   //  dashboard2.draw(data);
  }

  this.loadProyectosGraphs = function(datos) {
    console.log('loadProyectosGraphs datos', datos);

    // ######### dashboard1 ##########
    // var filterFields = [
    //   'nombre_proyecto',
    //   {id: 'valor_proyecto', type: 'number'},
    //   {id: 'estado_proyecto', role: 'annotation'},
    // ];

    var filterFields = [
      {id: 'fechainicial_proyecto', type: 'date'},
      {id: 'valor_proyecto', type: 'number'},
      {id: 'estado_proyecto', role: 'annotation'},
      {id: 'nombre_proyecto', role: 'tooltip'},
    ];

    var columns = self.fieldsToColumns(filterFields, datos.fields);
    //console.log('columns', columns);

    var dataArray = self.filterFieldsOfRows(datos.rows, columns, (function (valor, obj){
      var columns = this;
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].id == obj.id && columns[i].type === 'date') {
          return self.parseDateFX(valor);
        }
      }
      return valor;
    }).bind(columns));
    //console.log('dataArray', dataArray);

    var arrayData = [columns].concat(dataArray);
    console.log('arrayData', arrayData);

    // Create our data table.
    var data = google.visualization.arrayToDataTable(arrayData);
    // Create a dashboard.
    var dashboard1 = new google.visualization.Dashboard(
        document.getElementById('dashboard1_div_proyectos'));

    // http://jsfiddle.net/dlaliberte/pfTqP/
    var dateRangeSlider = new google.visualization.ControlWrapper({
        controlType: 'ChartRangeFilter',
        containerId: 'filter_div_proyectos',
        options: {
          filterColumnIndex: 0,
          //'filterColumnLabel': 'Fecha Final Proyectos',
          ui: {
            chartOptions: {
              height: 50,
              width: 600,
              chartArea: {
                width: '80%'
              },
              hAxis: {baselineColor: 'none', format: "dd.MM.yyyy" }
            },
            chartView: {
              columns: [0, 1]
            }
          }
        }
    });

    // var categoryFilter = new google.visualization.ControlWrapper({
    //     controlType: 'CategoryFilter',
    //     containerId: 'hidden_div_proyectos',
    //     options: {
    //       filterColumnIndex: 0,
    //       //'filterColumnLabel': 'Nombre Entidad'
    //     }
    // });

    var barChart = new google.visualization.ChartWrapper({
      chartType: 'BarChart',
      containerId: 'barchart_div_proyectos',
      options: {
        title: 'Valor Proyectos',
        filterColumnIndex: 1,
        width: 500,
        height: 400,
      }
    });

    dashboard1.bind(dateRangeSlider, barChart);
    dashboard1.draw(data);

    var data = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['Valor proyectos', 400000],
          ['Numero Proyectos', 34],
        ]);

    var options = {
      width: 400, height: 120,
      redFrom: 90, redTo: 100,
      yellowFrom:75, yellowTo: 90,
      minorTicks: 5
    };

    var chart = new google.visualization.Gauge(document.getElementById('gaugechart_div_proyectos'));
    chart.draw(data, options);

  }

  this.loadAreasTrabajoGraphs = function (datos) {
    if (datos === undefined){
      datos = self.areasTrabajoResults[0].Result;
    }
    console.log('loadAreasTrabajoGraphs datos', datos);
    // ######### dashboard1 ##########

    var filterFields = [
      'nombre',
      'categoria',
      'areaestudio',
      {id: 'valor_proyectos', type: 'number'},
      {id: 'numero_proyectos', role:'annotation'},
      {id: 'fechainicial', type: 'date'},
      {id: 'fechafinal', type: 'date'},
      {id: 'anoinicial', type: 'number'},
      {id: 'anofinal', type: 'number'},
      {id: 'proyectos', label: 'Proyectos', type: 'string'}, // inventados
      'objectid'
    ];

    var columns = self.fieldsToColumns(filterFields, datos.fields);
    //console.log('columns', columns);

    var dataArray = self.filterFieldsOfRows(datos.rows, columns, (function (valor, obj){
      var columns = this;
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].id == obj.id && columns[i].type === 'date') {
          return self.parseDateFX(valor);
        }
      }
      if (obj.id === 'proyectos') { // proyectos no existe, la crea
        return '<a href="#" onclick="graphs.seeProyectosFromSocios(\'' + obj.row.objectid + '\')">Detalle</a><br/>' +
        '<a href="#" onclick="graphs.zoomProyectosFromSocios(\'' + obj.row.objectid + '\')">Zoom</a>';
      }
      return valor;
    }).bind(columns));
    //console.log('dataArray', dataArray);

    var arrayData = [columns].concat(dataArray);
    console.log('arrayData AreasTrabajo', arrayData);

    // Create our data table.
    var data = google.visualization.arrayToDataTable(arrayData);
    // Create a dashboard.
    var dashboard = new google.visualization.Dashboard(
        document.getElementById('dashboard_div_areastrabajo'));

    var initialRangeSlider = new google.visualization.ControlWrapper({
      'controlType': 'NumberRangeFilter',
      'containerId': 'initialfilter_div_areastrabajo',
      'options': {
        'filterColumnLabel': 'Año Inicial',
        'ui': {
          'format': {
            'pattern': '#'
          },
        }
      }
    });

    var finalRangeSlider = new google.visualization.ControlWrapper({
      'controlType': 'NumberRangeFilter',
      'containerId': 'finalfilter_div_areastrabajo',
      'options': {
        'filterColumnLabel': 'Año Final',
        'ui': {
          'format': {
            'pattern': '#'
          },
        }
      }
    });

    var categoryFilter = new google.visualization.ControlWrapper({
        controlType: 'CategoryFilter',
        containerId: 'categoryfilter_div_areastrabajo',
        options: {
          'filterColumnIndex': 0,
          //'filterColumnLabel': 'Nombre Entidad'
        }
    });

    var barChart = new google.visualization.ChartWrapper({
      chartType: 'BarChart',
      containerId: 'barchart_div_areastrabajo',
      options: {
        'title': 'Valor en USD de los proyectos por localización',
        //'filterColumnIndex': 1,
        'filterColumnLabel': 'Valor Proyectos',
        bar: { groupWidth: "60%" },
        chartArea: {
          left: 100,
          right: 0,
          top: 30,
          bottom: 30,
          //width : "60%"
        },
        'legend': { position: 'bottom', alignment: 'start' },
      },
      view: {
        'columns': [0, 3, {sourceColumn:4 ,type:'number', role: 'annotation'}]
      }
    });

    var tableChart = new google.visualization.ChartWrapper({
      chartType: 'Table',
      containerId: 'table_div_areastrabajo',
      options: {
        width: 500,
        height: 400,
        allowHtml: true,
      },
      view: {
        'columns': [0,1,2,3,4,5,6,9]
      }
    });

    dashboard.bind([initialRangeSlider, finalRangeSlider, categoryFilter], [barChart, tableChart]);
    dashboard.draw(data);
  }

  self.zoomProyectosFromSocios = function (objectid) {
    $.get(baseHttp + '/api/BaseService/queryProyectosByAreaTrabajo?localizacionid=' + objectid).done(function(data) {
      console.log('zoomProyectosFromSocios data', data);
      var proyecto = data.Result.rows[0];
      var layerDefinitions = [];
      layerDefinitions[0] = "objectid = " + proyecto.objectid;
      layerDefinitions[1] = "objectid = " + proyecto.objectid;
      dynamic_layer.setLayerDefinitions(layerDefinitions);

      var queryTask = new esri.tasks.QueryTask(mapServiceUrl + '/0');
      //initialize query
      var query = new esri.tasks.Query();
      query.returnGeometry = true;
      //query.outSpatialReference = {wkid:3116};
      query.outSpatialReference = {wkid:102100};
      query.outFields = ["*"];
      query.where = "objectid=" + proyecto.objectid;
      queryTask.execute(query, function (response){
        console.log("zoomProyectosFromSocios response", response);
        var features = response.features;

        // si es un solo punto
        if (features.length === 1){
          var geometry = features[0].geometry;
          if(geometry.type === "point"){
              //map.centerAt(geometry);
              map.centerAndZoom(geometry, 12);
          }
          // Si no es un punto si no una linea o polígono
          if (geometry.getExtent !== undefined && geometry.getExtent() != null) {
            map.setExtent(geometry.getExtent().expand(3));
          }

          return;
        }

        // https://developers.arcgis.com/javascript/3/jsapi/esri.graphicsutils-amd.html#graphicsextent
        // Si son varios puntos
        var myFeatureExtent = esri.graphicsExtent(features);
        myFeatureExtent = myFeatureExtent.expand(1.8);
        // for (var i = 0; i<features.length; i++){
        //   var attributes = features[i].attributes;
        //   var geometry = JSON.stringify(features[i].geometry);
        // }
        console.log('myFeatureExtent', myFeatureExtent);
        map.setExtent(myFeatureExtent);
      }, function (e) {
        console.log('', e);
        alert('error querying zoom projects');
      });
    }).fail(function(e) {
      console.log('', e);
      alert('error querying projects');
    });
  }

  self.seeProyectosFromSocios = function (objectid) {

    var plantillaPromise = $.get('templates/proyectos.html');
    var proyectosPromise = $.get(baseHttp + '/api/BaseService/queryProyectosByAreaTrabajo?localizacionid=' + objectid);

    $.when(plantillaPromise, proyectosPromise).done(function(
      plantillaResults,
      proyectosResults) {
        console.log(
          'seeProyectosFromSocios results',
          plantillaResults,
          proyectosResults
        );
        var plantilla = plantillaResults[0];
        var proyectos = proyectosResults[0].Result;

        proyectos = self.constructArrayProyectosToView(proyectos);
        //console.log('proyectos', proyectos);

        var view = {
          'name': 'Lista de Proyectos',
          'proyectos': proyectos
        };
        console.log('view', view);

        plantilla = mustache(plantilla, view);
        //$('#accordion').collapse();
        $('#proyectosModalBody').html(plantilla);
        $('#proyectosModal').modal('show');
        setTimeout(leftPane.resizeMap, 500);
    }).fail(function(e) {
      console.log('', e);
      alert('error querying projects');
    });
  }

  self.constructArrayProyectosToView = function (proyectos) {
    var view = [];
    //[
    //  { 'number': '1', 'titulo': 'Proyecto 1', 'campos': [{'nombre_campo': 'campo 1', 'valor_campo': 'campo 1'}] },
    //  { 'number': '2', 'titulo': 'Proyecto 2', 'campos': [], 'expanded': 'true' },
    //]
    var rows = proyectos.rows;
    var keyValueFields = self.serverFieldsToKeyValue(proyectos.fields);
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var campos = self.serverRowToKeyValueArray(row, keyValueFields);
      var rowView = { 'secuencia': i, 'titulo': row.nombre_proyecto, 'campos': campos };
      view.push(rowView);
    }
    view[0].expanded = 'true'; // or anything else
    return view;
  }

  self.serverRowToKeyValueArray = function (row, keyValueFields) {
    var keyValueArray = [];
    for (var field in row) {
      keyValueArray.push({'key': field, 'name': keyValueFields[field], 'value': row[field]});
    }
    return keyValueArray;
  }

}

var graphs = new Graphs();
