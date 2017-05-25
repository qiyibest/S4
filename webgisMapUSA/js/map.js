var layer, serverName, countyLayer, tractLayer, legend, map, visible = [],
    curVisible = [];
var curYear = 1;
var prevYear = 1;
var poplayerName = null;
var serverURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/MapUSA/";
var identifyTask, identifyParams, dd = null,
    layvar = null,
    tractURLf = null,
    countyURLf = null,
    scale, drawingstate;
var globalscale;

var app;
var symbol, infoTemplate;
var featureSet;
var SelectedData=[];
var _public = {};

function getdrawingState(state) {
    drawingstate = state;
}

function changeColor(name){
    if (name !== "reset"){
    document.getElementById("selection").setAttribute( "class", "active" );
    }else{
        document.getElementById("selection").setAttribute( "class", "" );
    }
}


require([
    "esri/map",
    "dojo/_base/connect",
    "esri/dijit/BasemapGallery",
    "esri/dijit/Print",
    "esri/tasks/PrintTask",
    "esri/tasks/PrintParameters",
    "esri/tasks/LegendLayer",
    "esri/tasks/PrintTemplate",
    "esri/dijit/Search",
    "esri/arcgis/utils",
    "esri/geometry/Extent",
    "esri/geometry/scaleUtils",
    "esri/geometry/Point",

    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",

    "esri/toolbars/draw",
    "esri/graphic",
    "esri/geometry/Polygon",
    "esri/tasks/FeatureSet",
    "esri/tasks/query",
    "esri/tasks/QueryTask",

    "esri/InfoTemplate",
    "esri/tasks/IdentifyTask",
    "esri/tasks/IdentifyParameters",
    "esri/dijit/Popup",

    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/FeatureLayer",
    "esri/dijit/Legend",
    "esri/dijit/LayerList",
    "esri/dijit/Scalebar",

    "dojo/_base/Color",
    "dojo/_base/array",
    "dojo/store/Memory",

    "dojo/_base/declare",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",


    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/ComboBox",
    "dijit/form/FilteringSelect",
    "dijit/form/HorizontalSlider",
    "dijit/form/TextBox",

    "dojo/ready", "dojo/parser", "dijit/registry", "dojo/dom", "dojo/dom-attr", "dojo/on", "dojo/query", "dijit/form/ComboBox", "dijit/form/Select",
    "dojo/_base/array", "dojo/dom-construct", "dojo/domReady!", "dijit/form/Button", "dijit/WidgetSet",
], function(
    Map, connect, BasemapGallery, Print, PrintTask, PrintParameters, LegendLayer, PrintTemplate, Search, arcgisUtils, Extent, scaleUtils, Point,
    SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
    Draw, Graphic, Polygon, FeatureSet, Query, QueryTask,
    InfoTemplate, IdentifyTask, IdentifyParameters, Popup,
    ArcGISDynamicMapServiceLayer, FeatureLayer, Legend, LayerList, Scalebar,
    Color, array, Memory,
    declare, Grid, Selection,
    BorderContainer, ContentPane, ComboBox, FilteringSelect, HorizontalSlider, TextBox, ready, parser, registry, dom, domConstruct, domAttr, on, query, arrayUtils
) {

    ready(function() {
        // Parse DOM nodes decorated with the data-dojo-type attribute

        parser.parse();
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////  

    app = {
        "map": map,
        "toolbar": toolbar
    };
    app.map = map = new Map("map", {
        basemap: "streets",
        zoom: 4,
        sliderPosition: 'bottom-right'
    });
    map.centerAt(new Point(-95, 48));

    map.on("extent-change", function() {
        globalscale = map.getScale();
    });

    var scalebar = new Scalebar({
        map: map,
        scalebarUnit: "dual"
    });

    ///////////////////////////////////////////////////////////////////////////////////////////
    var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: true,
        map: map
    }, "basemapGallery");
    basemapGallery.on('load', function() {
        basemapGallery.remove('basemap_0');
        basemapGallery.remove('basemap_1');
        basemapGallery.remove('basemap_2');
        basemapGallery.remove('basemap_3');
        basemapGallery.remove('basemap_4');
        basemapGallery.remove('basemap_5');
        basemapGallery.remove('basemap_7');
        basemapGallery.remove('basemap_8');
        basemapGallery.remove('basemap_10');
    });

    basemapGallery.startup();
    /////////////////////////////////////////////////////////////////////////////
    var slider = new HorizontalSlider({
        name: "slider",
        value: 1,
        minimum: 1,
        maximum: 9,
        discreteValues: 9,
        style: "width:350px; margin-left:15px",
        showButtons: false,
        onChange: function(value) {
            preYear = curYear;
            curYear = value;
            if (curVisible.length !== 0) {
                switch (serverName) {
                    case "county1":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 20;
                        break;
                    case "county2":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 12;
                        break;
                    case "county3":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 5;
                        break;
                    case "county4":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 9;
                        break;
                    case "county5":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 16;
                        break;
                    case "county6":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 9;
                        break;
                    case "county7":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 16;
                        break;
                }

                updateLayerVisibility(countyURL, tractURL, curVisible);
            }

        }
    }, "slider").startup();
    //////////////////////////////////////////////////////////////////////////////
    new dijit.form.FilteringSelect({
        id: "category",
        store: new Memory({
            idProperty: "urlIdentifier",
            data: category
        }),
        autoComplete: true,
        style: "width: 250px; margin-left:15px",
        onChange: function(urlIdentifier) {
            dijit.byId('layerName').query.urlIdentifier = this.item.urlIdentifier || /.*/;
        }
    }, "category").startup();
    /////////////////////////////////////////////////////////////////////////////////////

    new dijit.form.ComboBox({
        id: "layerName",
        store: new Memory({
            data: layerName
        }),
        autoComplete: false,
        query: {
            urlIdentifier: /.*/
        },
        style: "width: 250px; margin-left:15px",
        required: true,
        searchAttr: "name",
        onChange: function(layerName) {
            //console.log(year);
            //  console.log("combobox onchange ", layerName, this.item);
            dijit.byId('category').set('value', this.item ? this.item.urlIdentifier : null);
            curVisible = [];
            serverName = this.item.urlIdentifier;
            serverNum = 0
            if (serverName.includes('county')) {
                serverNum = serverName.substring(6)
            } else {
                serverNum = serverName.substring(5)
            }
            tractURL = serverURL + 'tract' + serverNum + "/MapServer";
            countyURL = serverURL + 'county' + serverNum + "/MapServer";
            //console.log(this.item.urlIdentifier);
            switch (curYear) {
                case 1:
                    curVisible.push(this.item.yearOne);
                    break;
                case 2:
                    curVisible.push(this.item.yearTwo);
                    break;
                case 3:
                    curVisible.push(this.item.yearThree);
                    break;
                case 4:
                    curVisible.push(this.item.yearFour);
                    break;
                case 5:
                    curVisible.push(this.item.yearFive);
                    break;
                case 6:
                    curVisible.push(this.item.yearSix);
                    break;
                case 7:
                    curVisible.push(this.item.yearSeven);
                    break;
                case 8:
                    curVisible.push(this.item.acs);
                    break;
                case 9:
                    curVisible.push(this.item.yearEight);
                    break;
            }

            updateLayerVisibility(countyURL, tractURL, curVisible);

        }
    }, "layerName").startup();

    ///////////////////////////////////////////////////////////////////////////////////////  
    function updateLayerVisibility(countyURL, tractURL, curVisible) {
        widgetPrint.destroy();
        map.graphics.clear();
        tractURLf = tractURL;
        countyURLf = countyURL;
        dd = curVisible;
        //console.log(tractURL)
        $.getJSON(countyURLf + "/" + dd + "?f=json",
            function(result) {
                layvar = result.drawingInfo.renderer.field;
                poplayerName = result.name;
            });

        $.getJSON(tractURLf + "/" + dd + "?f=json",
            function(result) {
                tractlayvar = result.drawingInfo.renderer.field;
                tractpoplayerName = result.name;
            })

        var layers = map.getLayersVisibleAtScale(map.getScale());

        while (layers.length > 1) {
            map.removeLayer(map.getLayer(map.layerIds[1]));
            layers = map.getLayersVisibleAtScale(map.getScale());
        };

        countyLayer = new ArcGISDynamicMapServiceLayer(countyURL, {
            "opacity": 0.5,
            maxScale: 1155581.108577
        });

        tractLayer = new ArcGISDynamicMapServiceLayer(tractURL, {
            "opacity": 0.5,
            minScale: 577790.554289
        });

        map.addLayer(countyLayer);
        map.addLayer(tractLayer);

        countyLayer.setVisibleLayers(curVisible);
        tractLayer.setVisibleLayers(curVisible);

        legend.refresh([{
            "layer": countyLayer
        }, {
            "layer": tractLayer
        }]);


        var legendlayer1 = new LegendLayer();
        var legendlayer2 = new LegendLayer();

        legendlayer1.layerId =  countyLayer.id;
        legendlayer2.layerId =  tractLayer.id;

        myLayouts = [{
            "name": "Letter ANSI A Portrait",
            "label": "Portrait (JPG)",
            "format": "jpg",
            "options": {
                "legendLayers": [legendlayer1,legendlayer2], 
                "copyrightText": "Brown Uinveristy S4",
                //"authorText": "US 2010",
                "titleText": "Longitudinal Tract Data Base"
            }
        }];

        myTemplates = [];
        dojo.forEach(myLayouts, function(lo) {
            var t = new PrintTemplate();
            t.layout = lo.name;
            t.label = lo.label;
            t.format = lo.format;
            t.layoutOptions = lo.options;
            t.preserveScale = false;
            myTemplates.push(t);
        });

        widgetPrint = new Print({
            map: map,
            url: "https://s4.ad.brown.edu/s4gisserver/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            templates: myTemplates
        }, divPrint);
        widgetPrint.startup();

        widgetPrint.on('print-start',function(){if (globalscale < 587790.554289) tractLayer.minScale=0;});
        widgetPrint.on('print-complete',function(){tractLayer.minScale=577790.554289;});

    }

    //////////////////////////////////////////////////////////////////////////////

    legend = new Legend({
        map: map,
        layerInfos: [{
            "layer": countyLayer
        }, {
            "layer": tractLayer
        }]
    }, "divLegend");
    legend.refresh();
    legend.startup();


    ////////////////////////////////////////////////////////////////////////////
    map.on("load", initTools);

    function initTools(evtObj) {
            app.toolbar = toolbar = new Draw(evtObj.map);
            toolbar.on("draw-end", displayPoly);
            //toolbar.on("selection-complete", displayPoly);
        }
    ////////////////////////////////////////////////////////////////////////////
    var query;
    var featureSet = new FeatureSet();
    ////////////////////////////////////////////////////////////////////////////



    function displayPoly(evtObj) {
            //deactivate()
            app.toolbar.deactivate(esri.toolbars.Draw.POLYGON);
            var geometryInput = evtObj.geometry;
            var symbol = new SimpleFillSymbol();

            var graphic = new Graphic(geometryInput, symbol);
            _public._kabgraphic = graphic;

            map.graphics.clear();
            map.graphics.add(graphic);

            var zoomExtent = evtObj.geometry.getExtent().expand(2.0);
            _public._kabstateExtent = zoomExtent;
            map.setExtent(zoomExtent);

            var _kabpolygon = new Polygon(_public._kabgraphic.geometry);
            _public._kabpolygon = _kabpolygon;

            var queryTask;

            if (globalscale > 577791) queryTask = new QueryTask(countyURLf + "/" + dd);
            else queryTask = new QueryTask(tractURLf + "/" + dd);

            _public._kabqueryTaskInside = queryTask;

            //build query filter  

            query = new Query();
            _public._kabqueryInside = query;
            query.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
            query.geometry = graphic.geometry;
            query.returnGeometry = true;
            query.outFields = ["*"];
            query.outSpatialReference = map.spatialReference;
            queryTask.execute(query, queryCallback);

            var infoPopup = new Popup({
                fillSymbol: new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID, new Color([100, 0, 50]), 2
                    ), new Color([200, 88, 0, 0.25]))
            }, dojo.create("div"));

            //add code to show the popup window here

            function queryCallback(featureSet) {

                map.graphics.clear();

                _public._kabfeatureSet = featureSet;

                var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                        new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])
                );

                _public._kabsymbol = symbol;

                var features = featureSet.features;
				
				SelectedData=[];
		        for (var i=0, il=featureSet.features.length; i<il; i++) {
           
		        var OneAtt = featureSet.features[i].attributes;
		        //console.log(OneAtt);
		        SelectedData.push(OneAtt);
		        }

                _public._kabfeatures = features;

                dojo.forEach(features, function(feature) {

                    if (globalscale > 577791) {
                        var someInfoTemplate = new InfoTemplate("Detail Information",
                            "<b>State: </b> ${STATE_1}<br/>" +
                            "<b>County: </b> ${COUNTY_1}<br/>" + "<b>" + poplayerName + ":</b> " + "${" + layvar + "}")
                    } else {
                        var someInfoTemplate = new InfoTemplate("Detail Information",
                            "<b>State: </b> ${STATE}<br/>" +
                            "<b>County: </b> ${COUNTY}<br/>" +
                            "<b>Tract No: </b> ${TractShow}<br/>" +
                            "<b>" + tractpoplayerName + ":</b> " +
                            "${" + tractlayvar + "}")
                    };
                    feature.setSymbol(symbol);
                    feature.setInfoTemplate(someInfoTemplate);
                    _public._kabfeature = feature;
                    map.graphics.add(feature);

                });
            }

        }
    ////////////////////////////////////////////////////////////////////////////

    map.on("click", executeIdentifyTask);

    function executeIdentifyTask(event) {

            if (drawingstate != 'poly') {

                if (globalscale > 577791) identifyTask = new IdentifyTask(countyURLf);
                else identifyTask = new IdentifyTask(tractURLf);


                identifyParams = new IdentifyParameters();
                identifyParams.mapExtent = map.extent;
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;

                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                identifyParams.width = map.width;
                identifyParams.height = map.height;

                identifyParams.geometry = event.mapPoint;
                identifyParams.mapExtent = map.extent;

                if (globalscale > 577791) identifyParams.layerIds = countyLayer.visibleLayers;
                else identifyParams.layerIds = tractLayer.visibleLayers;

                var deferred = identifyTask
                    .execute(identifyParams)
                    .addCallback(function(response) {
                        // response is an array of identify result objects
                        // Let's return an array of features.
                        return dojo.map(response, function(result) {

                            var feature = result.feature;
                            var layerName = result.layerName;

                            feature.attributes.layerName = layerName;

                            if (globalscale > 577791) {

                                $.getJSON(countyURLf + "/" + dd + "?f=json",
                                    function(result) {
                                        layvar = result.drawingInfo.renderer.field;
                                    });

                                var someInfoTemplate = new InfoTemplate("Detail Information",
                                    "<b>State: </b> ${STATE_1}<br/>" +
                                    "<b>County: </b> ${COUNTY_1}<br/>" +
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                            } else {
                                $.getJSON(tractURLf + "/" + dd + "?f=json",
                                    function(result) {
                                        layvar = result.drawingInfo.renderer.field;
                                    });
                                var someInfoTemplate = new InfoTemplate("Detail Information",
                                    "<b>State: </b> ${STATE}<br/>" +
                                    "<b>County: </b> ${COUNTY}<br/>" +
                                    "<b>Tract No: </b> ${TractShow}<br/>" +
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                            }
                            feature.setInfoTemplate(someInfoTemplate);
                            return feature;
                        });
                    });
                map.infoWindow.setFeatures([deferred]);
                map.infoWindow.show(event.mapPoint);
            }
        }
    ////////////////////////////////////////////////////////////////////////////


    //search bar
    var dijitSearch = new Search({
        map: map,
        autoComplete: true,
    }, "divSearch");
    dijitSearch.startup();

//////////////////////////////////////////////////////////////////////////////
//initial print widget. 
    var myLayouts = [{
        "name": "Letter ANSI A Portrait",
        "label": "Portrait (JPG)",
        "format": "jpg",
        "options": {
            "legendLayers": [],
            "copyrightText": "Brown Uinveristy S4",
            //"authorText": "US 2010",
            "titleText": "Longitudinal Tract Data Base"
        }
    }];
    
     //* Step: create the print templates
     

    var myTemplates = [];
    dojo.forEach(myLayouts, function(lo) {
        var t = new PrintTemplate();
        t.layout = lo.name;
        t.label = lo.label;
        t.format = lo.format;
        t.layoutOptions = lo.options;
        t.preserveScale = false;
        myTemplates.push(t);
    });

    var widgetPrint = new Print({
        map: map,
        url: "https://s4.ad.brown.edu/s4gisserver/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        templates: myTemplates
    }, divPrint);
    widgetPrint.startup();

/////////////////////////////////////////////////////////////////////////////
    function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
            return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(function(item) {
            ctr = 0;
            keys.forEach(function(key) {
                if (ctr > 0) result += columnDelimiter;

                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    window.downloadCSV = function(args) {
        var data, filename, link;

        var csv = convertArrayOfObjectsToCSV({
            data: SelectedData
        });
        if (csv == null) return;

        filename = args.filename || 'export.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
    }

    dojo.query(".dropdown-toggle").on('click', function (e) {
        // Show dropdown nav
        if(dojo.hasClass("dropdown", "open")){
            dojo.removeClass("dropdown", "open");
            dojo.query(".dropdown-menu").style("left", "-395px");
            dojo.query(".calcite-dropdown-toggle").removeClass("open")
  
        }else{
            dojo.addClass("dropdown", "open");
            dojo.query(".calcite-dropdown-toggle").addClass("open")
            dojo.query(".dropdown-menu").style("left", "0px");
 
        }
      });

});
////////////////////////////////////////////////////////////////////////////////

var category = [{
    name: "Race, Ethnicity, Ancestry",
    urlIdentifier: "county1"
}, {
    name: "Immigration and Country of Birth",
    urlIdentifier: "county2"
}, {
    name: "Marriage and Family",
    urlIdentifier: "county3"
}, {
    name: "Education and Labor Force",
    urlIdentifier: "county4"
},{
    name: "Income and Poverty",
    urlIdentifier: "county5"
}, {
    name: "Housing",
    urlIdentifier: "county6"
}, {
    name: "Age by Race",
    urlIdentifier: "county7"
}];

var layerName = [{"name":"% White race*","urlIdentifier":"county1","yearOne":"0","yearTwo":"20","yearThree":"40","yearFour":"60","yearFive":"80","yearSix":"100","yearSeven":"120","acs":"140","yearEight":"160"},
{"name":"% Black race*","urlIdentifier":"county1","yearOne":"1","yearTwo":"21","yearThree":"41","yearFour":"61","yearFive":"81","yearSix":"101","yearSeven":"121","acs":"141","yearEight":"161"},
{"name":"% Native American race","urlIdentifier":"county1","yearOne":"2","yearTwo":"22","yearThree":"42","yearFour":"62","yearFive":"82","yearSix":"102","yearSeven":"122","acs":"142","yearEight":"162"},
{"name":" % Hawaiian race","urlIdentifier":"county1","yearOne":"3","yearTwo":"23","yearThree":"43","yearFour":"63","yearFive":"83","yearSix":"103","yearSeven":"123","acs":"143","yearEight":"163"},
{"name":" % Asian and Pacific Islander race","urlIdentifier":"county1","yearOne":"4","yearTwo":"24","yearThree":"44","yearFour":"64","yearFive":"84","yearSix":"104","yearSeven":"124","acs":"144","yearEight":"164"},
{"name":"%  Hispanic","urlIdentifier":"county1","yearOne":"5","yearTwo":"25","yearThree":"45","yearFour":"65","yearFive":"85","yearSix":"105","yearSeven":"125","acs":"145","yearEight":"165"},
{"name":"% Korean birth/race","urlIdentifier":"county1","yearOne":"6","yearTwo":"26","yearThree":"46","yearFour":"66","yearFive":"86","yearSix":"106","yearSeven":"126","acs":"146","yearEight":"166"},
{"name":"% Japanese birth/race","urlIdentifier":"county1","yearOne":"7","yearTwo":"27","yearThree":"47","yearFour":"67","yearFive":"87","yearSix":"107","yearSeven":"127","acs":"147","yearEight":"167"},
{"name":"% Chinese birth/race","urlIdentifier":"county1","yearOne":"8","yearTwo":"28","yearThree":"48","yearFour":"68","yearFive":"88","yearSix":"108","yearSeven":"128","acs":"148","yearEight":"168"},
{"name":"% Indian birth/race","urlIdentifier":"county1","yearOne":"9","yearTwo":"29","yearThree":"49","yearFour":"69","yearFive":"89","yearSix":"109","yearSeven":"129","acs":"149","yearEight":"169"},
{"name":" % Filipino birth/race","urlIdentifier":"county1","yearOne":"10","yearTwo":"30","yearThree":"50","yearFour":"70","yearFive":"90","yearSix":"110","yearSeven":"130","acs":"150","yearEight":"170"},
{"name":"%  Vietnamese race","urlIdentifier":"county1","yearOne":"11","yearTwo":"31","yearThree":"51","yearFour":"71","yearFive":"91","yearSix":"111","yearSeven":"131","acs":"151","yearEight":"171"},
{"name":" %  Russian/USSR parentage/ancestry","urlIdentifier":"county1","yearOne":"12","yearTwo":"32","yearThree":"52","yearFour":"72","yearFive":"92","yearSix":"112","yearSeven":"132","acs":"152","yearEight":"172"},
{"name":"% Italian parentage/ancestry","urlIdentifier":"county1","yearOne":"13","yearTwo":"33","yearThree":"53","yearFour":"73","yearFive":"93","yearSix":"113","yearSeven":"133","acs":"153","yearEight":"173"},
{"name":"%  German parentage/ancestry","urlIdentifier":"county1","yearOne":"14","yearTwo":"34","yearThree":"54","yearFour":"74","yearFive":"94","yearSix":"114","yearSeven":"134","acs":"154","yearEight":"174"},
{"name":"% Irish parentage/ancestry","urlIdentifier":"county1","yearOne":"15","yearTwo":"35","yearThree":"55","yearFour":"75","yearFive":"95","yearSix":"115","yearSeven":"135","acs":"155","yearEight":"175"},
{"name":"% Scandinavian parentage/ancestry","urlIdentifier":"county1","yearOne":"16","yearTwo":"36","yearThree":"56","yearFour":"76","yearFive":"96","yearSix":"116","yearSeven":"136","acs":"156","yearEight":"176"},
{"name":"% Mexican birth/ethnicity","urlIdentifier":"county1","yearOne":"17","yearTwo":"37","yearThree":"57","yearFour":"77","yearFive":"97","yearSix":"117","yearSeven":"137","acs":"157","yearEight":"177"},
{"name":" % Cuban birth/ethnicity","urlIdentifier":"county1","yearOne":"18","yearTwo":"38","yearThree":"58","yearFour":"78","yearFive":"98","yearSix":"118","yearSeven":"138","acs":"158","yearEight":"178"},
{"name":" % Puerto Rican birth/ethnicity","urlIdentifier":"county1","yearOne":"19","yearTwo":"39","yearThree":"59","yearFour":"79","yearFive":"99","yearSix":"119","yearSeven":"139","acs":"159","yearEight":"179"},
{"name":"% foreign born","urlIdentifier":"county2","yearOne":"0","yearTwo":"12","yearThree":"24","yearFour":"36","yearFive":"48","yearSix":"60","yearSeven":"72","acs":"84","yearEight":"96"},
{"name":"% foreign born and parent foreign born","urlIdentifier":"county2","yearOne":"1","yearTwo":"13","yearThree":"25","yearFour":"37","yearFive":"49","yearSix":"61","yearSeven":"73","acs":"85","yearEight":"97"},
{"name":"% White foreign born","urlIdentifier":"county2","yearOne":"2","yearTwo":"14","yearThree":"26","yearFour":"38","yearFive":"50","yearSix":"62","yearSeven":"74","acs":"86","yearEight":"98"},
{"name":"% Naturalized","urlIdentifier":"county2","yearOne":"3","yearTwo":"15","yearThree":"27","yearFour":"39","yearFive":"51","yearSix":"63","yearSeven":"75","acs":"87","yearEight":"99"},
{"name":"% immigrated in past 10 years","urlIdentifier":"county2","yearOne":"4","yearTwo":"16","yearThree":"28","yearFour":"40","yearFive":"52","yearSix":"64","yearSeven":"76","acs":"88","yearEight":"100"},
{"name":"% speaking other language at home, age 5+","urlIdentifier":"county2","yearOne":"5","yearTwo":"17","yearThree":"29","yearFour":"41","yearFive":"53","yearSix":"65","yearSeven":"77","acs":"89","yearEight":"101"},
{"name":"% speaking English not well, age 5+","urlIdentifier":"county2","yearOne":"6","yearTwo":"18","yearThree":"30","yearFour":"42","yearFive":"54","yearSix":"66","yearSeven":"78","acs":"90","yearEight":"102"},
{"name":" % Russian/USSR birth","urlIdentifier":"county2","yearOne":"7","yearTwo":"19","yearThree":"31","yearFour":"43","yearFive":"55","yearSix":"67","yearSeven":"79","acs":"91","yearEight":"103"},
{"name":"% Italian birth","urlIdentifier":"county2","yearOne":"8","yearTwo":"20","yearThree":"32","yearFour":"44","yearFive":"56","yearSix":"68","yearSeven":"80","acs":"92","yearEight":"104"},
{"name":"% German birth","urlIdentifier":"county2","yearOne":"9","yearTwo":"21","yearThree":"33","yearFour":"45","yearFive":"57","yearSix":"69","yearSeven":"81","acs":"93","yearEight":"105"},
{"name":"% Irish birth","urlIdentifier":"county2","yearOne":"10","yearTwo":"22","yearThree":"34","yearFour":"46","yearFive":"58","yearSix":"70","yearSeven":"82","acs":"94","yearEight":"106"},
{"name":" % Scandinavian birth","urlIdentifier":"county2","yearOne":"11","yearTwo":"23","yearThree":"35","yearFour":"47","yearFive":"59","yearSix":"71","yearSeven":"83","acs":"95","yearEight":"107"},
{"name":"% currently married","urlIdentifier":"county3","yearOne":"0","yearTwo":"5","yearThree":"10","yearFour":"15","yearFive":"20","yearSix":"25","yearSeven":"30","acs":"35","yearEight":"40"},
{"name":"% currently married, not separated","urlIdentifier":"county3","yearOne":"1","yearTwo":"6","yearThree":"11","yearFour":"16","yearFive":"21","yearSix":"26","yearSeven":"31","acs":"36","yearEight":"41"},
{"name":"% widowed, divorced","urlIdentifier":"county3","yearOne":"2","yearTwo":"7","yearThree":"12","yearFour":"17","yearFive":"22","yearSix":"27","yearSeven":"32","acs":"37","yearEight":"42"},
{"name":"% widowed, divorced and separated","urlIdentifier":"county3","yearOne":"3","yearTwo":"8","yearThree":"13","yearFour":"18","yearFive":"23","yearSix":"28","yearSeven":"33","acs":"38","yearEight":"43"},
{"name":"% female-headed families with children","urlIdentifier":"county3","yearOne":"4","yearTwo":"9","yearThree":"14","yearFour":"19","yearFive":"24","yearSix":"29","yearSeven":"34","acs":"39","yearEight":"44"},
{"name":"% with high school degree or less","urlIdentifier":"county4","yearOne":"0","yearTwo":"9","yearThree":"18","yearFour":"27","yearFive":"36","yearSix":"45","yearSeven":"54","acs":"63","yearEight":"72"},
{"name":" % with 4-year college degree or more","urlIdentifier":"county4","yearOne":"1","yearTwo":"10","yearThree":"19","yearFour":"28","yearFive":"37","yearSix":"46","yearSeven":"55","acs":"64","yearEight":"73"},
{"name":"% unemployed","urlIdentifier":"county4","yearOne":"2","yearTwo":"11","yearThree":"20","yearFour":"29","yearFive":"38","yearSix":"47","yearSeven":"56","acs":"65","yearEight":"74"},
{"name":"% female labor force participation","urlIdentifier":"county4","yearOne":"3","yearTwo":"12","yearThree":"21","yearFour":"30","yearFive":"39","yearSix":"48","yearSeven":"57","acs":"66","yearEight":"75"},
{"name":"% professional employees","urlIdentifier":"county4","yearOne":"4","yearTwo":"13","yearThree":"22","yearFour":"31","yearFive":"40","yearSix":"49","yearSeven":"58","acs":"67","yearEight":"76"},
{"name":"% manufacturing employees","urlIdentifier":"county4","yearOne":"5","yearTwo":"14","yearThree":"23","yearFour":"32","yearFive":"41","yearSix":"50","yearSeven":"59","acs":"68","yearEight":"77"},
{"name":"% veteran","urlIdentifier":"county4","yearOne":"6","yearTwo":"15","yearThree":"24","yearFour":"33","yearFive":"42","yearSix":"51","yearSeven":"60","acs":"69","yearEight":"78"},
{"name":"% with disability","urlIdentifier":"county4","yearOne":"7","yearTwo":"16","yearThree":"25","yearFour":"34","yearFive":"43","yearSix":"52","yearSeven":"61","acs":"70","yearEight":"79"},
{"name":"% self-employed","urlIdentifier":"county4","yearOne":"8","yearTwo":"17","yearThree":"26","yearFour":"35","yearFive":"44","yearSix":"53","yearSeven":"62","acs":"71","yearEight":"80"},
{"name":"Median HH income, total","urlIdentifier":"county5","yearOne":"0","yearTwo":"16","yearThree":"32","yearFour":"48","yearFive":"64","yearSix":"80","yearSeven":"96","acs":"112","yearEight":"128"},
{"name":"Median HH income, whites","urlIdentifier":"county5","yearOne":"1","yearTwo":"17","yearThree":"33","yearFour":"49","yearFive":"65","yearSix":"81","yearSeven":"97","acs":"113","yearEight":"129"},
{"name":"Median HH income, blacks","urlIdentifier":"county5","yearOne":"2","yearTwo":"18","yearThree":"34","yearFour":"50","yearFive":"66","yearSix":"82","yearSeven":"98","acs":"114","yearEight":"130"},
{"name":"Median HH income, Hispanics","urlIdentifier":"county5","yearOne":"3","yearTwo":"19","yearThree":"35","yearFour":"51","yearFive":"67","yearSix":"83","yearSeven":"99","acs":"115","yearEight":"131"},
{"name":" Median HH income, Asian/PI","urlIdentifier":"county5","yearOne":"4","yearTwo":"20","yearThree":"36","yearFour":"52","yearFive":"68","yearSix":"84","yearSeven":"100","acs":"116","yearEight":"132"},
{"name":"Median HH income, nonwhites","urlIdentifier":"county5","yearOne":"5","yearTwo":"21","yearThree":"37","yearFour":"53","yearFive":"69","yearSix":"85","yearSeven":"101","acs":"117","yearEight":"133"},
{"name":"Per capita income","urlIdentifier":"county5","yearOne":"6","yearTwo":"22","yearThree":"38","yearFour":"54","yearFive":"70","yearSix":"86","yearSeven":"102","acs":"118","yearEight":"134"},
{"name":"% in poverty, total","urlIdentifier":"county5","yearOne":"7","yearTwo":"23","yearThree":"39","yearFour":"55","yearFive":"71","yearSix":"87","yearSeven":"103","acs":"119","yearEight":"135"},
{"name":"% in poverty, 65+","urlIdentifier":"county5","yearOne":"8","yearTwo":"24","yearThree":"40","yearFour":"56","yearFive":"72","yearSix":"88","yearSeven":"104","acs":"120","yearEight":"136"},
{"name":"% in poverty, families with children","urlIdentifier":"county5","yearOne":"9","yearTwo":"25","yearThree":"41","yearFour":"57","yearFive":"73","yearSix":"89","yearSeven":"105","acs":"121","yearEight":"137"},
{"name":"% in poverty, African Americans","urlIdentifier":"county5","yearOne":"10","yearTwo":"26","yearThree":"42","yearFour":"58","yearFive":"74","yearSix":"90","yearSeven":"106","acs":"122","yearEight":"138"},
{"name":"% in poverty, whites","urlIdentifier":"county5","yearOne":"11","yearTwo":"27","yearThree":"43","yearFour":"59","yearFive":"75","yearSix":"91","yearSeven":"107","acs":"123","yearEight":"139"},
{"name":"% in poverty, Native Americans","urlIdentifier":"county5","yearOne":"12","yearTwo":"28","yearThree":"44","yearFour":"60","yearFive":"76","yearSix":"92","yearSeven":"108","acs":"124","yearEight":"140"},
{"name":"% in poverty, Hispanics","urlIdentifier":"county5","yearOne":"13","yearTwo":"29","yearThree":"45","yearFour":"61","yearFive":"77","yearSix":"93","yearSeven":"109","acs":"125","yearEight":"141"},
{"name":"% in poverty, Asian/PI","urlIdentifier":"county5","yearOne":"14","yearTwo":"30","yearThree":"46","yearFour":"62","yearFive":"78","yearSix":"94","yearSeven":"110","acs":"126","yearEight":"142"},
{"name":"% in poverty, nonwhites","urlIdentifier":"county5","yearOne":"15","yearTwo":"31","yearThree":"47","yearFour":"63","yearFive":"79","yearSix":"95","yearSeven":"111","acs":"127","yearEight":"143"},
{"name":"% owner-occupied units","urlIdentifier":"county6","yearOne":"0","yearTwo":"9","yearThree":"18","yearFour":"27","yearFive":"36","yearSix":"45","yearSeven":"54","acs":"63","yearEight":"72"},
{"name":"% vacant units","urlIdentifier":"county6","yearOne":"1","yearTwo":"10","yearThree":"19","yearFour":"28","yearFive":"37","yearSix":"46","yearSeven":"55","acs":"64","yearEight":"73"},
{"name":"% multi-family units","urlIdentifier":"county6","yearOne":"2","yearTwo":"11","yearThree":"20","yearFour":"29","yearFive":"38","yearSix":"47","yearSeven":"56","acs":"65","yearEight":"74"},
{"name":"Median rent","urlIdentifier":"county6","yearOne":"3","yearTwo":"12","yearThree":"21","yearFour":"30","yearFive":"39","yearSix":"48","yearSeven":"57","acs":"66","yearEight":"75"},
{"name":"Median home value","urlIdentifier":"county6","yearOne":"4","yearTwo":"13","yearThree":"22","yearFour":"31","yearFive":"40","yearSix":"49","yearSeven":"58","acs":"67","yearEight":"76"},
{"name":"% structures more than 20 years old","urlIdentifier":"county6","yearOne":"5","yearTwo":"14","yearThree":"23","yearFour":"32","yearFive":"41","yearSix":"50","yearSeven":"59","acs":"68","yearEight":"77"},
{"name":"% structures more than 30 years old","urlIdentifier":"county6","yearOne":"6","yearTwo":"15","yearThree":"24","yearFour":"33","yearFive":"42","yearSix":"51","yearSeven":"60","acs":"69","yearEight":"78"},
{"name":"% HH in neighborhood 6 years or less","urlIdentifier":"county6","yearOne":"7","yearTwo":"16","yearThree":"25","yearFour":"34","yearFive":"43","yearSix":"52","yearSeven":"61","acs":"70","yearEight":"79"},
{"name":"% HH in neighborhood 10 years or less","urlIdentifier":"county6","yearOne":"8","yearTwo":"17","yearThree":"26","yearFour":"35","yearFive":"44","yearSix":"53","yearSeven":"62","acs":"71","yearEight":"80"},
{"name":"% 15 and under, total","urlIdentifier":"county7","yearOne":"0","yearTwo":"16","yearThree":"32","yearFour":"48","yearFive":"64","yearSix":"80","yearSeven":"96","acs":"112","yearEight":"128"},
{"name":"% 17 and under, total","urlIdentifier":"county7","yearOne":"1","yearTwo":"17","yearThree":"33","yearFour":"49","yearFive":"65","yearSix":"81","yearSeven":"97","acs":"113","yearEight":"129"},
{"name":"% 60 and older, total","urlIdentifier":"county7","yearOne":"2","yearTwo":"18","yearThree":"34","yearFour":"50","yearFive":"66","yearSix":"82","yearSeven":"98","acs":"114","yearEight":"130"},
{"name":"% 75 and older, total","urlIdentifier":"county7","yearOne":"3","yearTwo":"19","yearThree":"35","yearFour":"51","yearFive":"67","yearSix":"83","yearSeven":"99","acs":"115","yearEight":"131"},
{"name":"% 15 and under, white","urlIdentifier":"county7","yearOne":"4","yearTwo":"20","yearThree":"36","yearFour":"52","yearFive":"68","yearSix":"84","yearSeven":"100","acs":"116","yearEight":"132"},
{"name":"% 15 and under, non-Hispanic whites","urlIdentifier":"county7","yearOne":"5","yearTwo":"21","yearThree":"37","yearFour":"53","yearFive":"69","yearSix":"85","yearSeven":"101","acs":"117","yearEight":"133"},
{"name":"% 15 and under, black non-Hispanic","urlIdentifier":"county7","yearOne":"6","yearTwo":"22","yearThree":"38","yearFour":"54","yearFive":"70","yearSix":"86","yearSeven":"102","acs":"118","yearEight":"134"},
{"name":"% 15 and under, Hispanic","urlIdentifier":"county7","yearOne":"7","yearTwo":"23","yearThree":"39","yearFour":"55","yearFive":"71","yearSix":"87","yearSeven":"103","acs":"119","yearEight":"135"},
{"name":"% 15 and under, Asian/PI","urlIdentifier":"county7","yearOne":"8","yearTwo":"24","yearThree":"40","yearFour":"56","yearFive":"72","yearSix":"88","yearSeven":"104","acs":"120","yearEight":"136"},
{"name":"% 15 and under, Native American","urlIdentifier":"county7","yearOne":"9","yearTwo":"25","yearThree":"41","yearFour":"57","yearFive":"73","yearSix":"89","yearSeven":"105","acs":"121","yearEight":"137"},
{"name":"% 60 and older, white non-Hispanic","urlIdentifier":"county7","yearOne":"10","yearTwo":"26","yearThree":"42","yearFour":"58","yearFive":"74","yearSix":"90","yearSeven":"106","acs":"122","yearEight":"138"},
{"name":"% 60 and older, non-white","urlIdentifier":"county7","yearOne":"11","yearTwo":"27","yearThree":"43","yearFour":"59","yearFive":"75","yearSix":"91","yearSeven":"107","acs":"123","yearEight":"139"},
{"name":"% 60 and older, black non-Hispanic","urlIdentifier":"county7","yearOne":"12","yearTwo":"28","yearThree":"44","yearFour":"60","yearFive":"76","yearSix":"92","yearSeven":"108","acs":"124","yearEight":"140"},
{"name":"% 60 and older, Hispanic","urlIdentifier":"county7","yearOne":"13","yearTwo":"29","yearThree":"45","yearFour":"61","yearFive":"77","yearSix":"93","yearSeven":"109","acs":"125","yearEight":"141"},
{"name":"% 60 and older, Asian/PI","urlIdentifier":"county7","yearOne":"14","yearTwo":"30","yearThree":"46","yearFour":"62","yearFive":"78","yearSix":"94","yearSeven":"110","acs":"126","yearEight":"142"},
{"name":"% 60 and older, Native American","urlIdentifier":"county7","yearOne":"15","yearTwo":"31","yearThree":"47","yearFour":"63","yearFive":"79","yearSix":"95","yearSeven":"111","acs":"127","yearEight":"143"}]