var layer, serverName, countyLayer, tractLayer, legend, map, visible = [],
    curVisible = [];
var curYear = 1, prevYear = 1;
var identifyPic = 0;
var poplayerName = null;
var serverURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/Katrina/";
var identifyTask, identifyParams, dd = null,
    layvar = null,
    tractURLf = null,
    countyURLf = null,
    scale, drawingstate;
var globalscale;
var flag = false
var app;
var symbol, infoTemplate;
var featureSet;
var SelectedData=[];
var _public = {};

function getdrawingState(state) {
    drawingstate = state;
}

function getIdentifyState(state){
    identifyPic = state;
}

function resetCoBo(){       
    dijit.byId("layerNames").reset();
}

function changeColor(name){
    if (name !== "reset"){
    document.getElementById( name + "-select").setAttribute( "class", "active" );
    }else{
        document.getElementById( name + "-select").setAttribute( "class", "" );
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
    "esri/dijit/LayerList",

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
    "dojo/dom-class",
    "dojo/dom-style", 

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
    LayerList, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol,
    Draw, Graphic, Polygon, FeatureSet, arcgisQuery, QueryTask,
    InfoTemplate, IdentifyTask, IdentifyParameters, Popup,
    ArcGISDynamicMapServiceLayer, FeatureLayer, Legend, LayerList, Scalebar,
    Color, array, Memory, domClass, domStyle,
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
        zoom: 6,
        sliderPosition: 'bottom-right'
    });
    map.centerAt(new Point(-89, 34));

    map.on("extent-change", function() {
        globalscale = map.getScale();
    });

    var scalebar = new Scalebar({
        map: map,
        scalebarUnit: "dual"
    });

    ///////////////////////////////////////////////////////////////////////////////////////////
    //delete unnecessary basemaps from the gallery
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
        basemapGallery.remove('basemap_11');
    });

    basemapGallery.startup();

    ////////////////////////////////////////////////////////////////////////////////////////
    //add additional katrina layers (for layerlist) to the map as layer1
    var katrinaLayers = new ArcGISDynamicMapServiceLayer("https://s4.ad.brown.edu/s4gisserver/rest/services/Katrina/Katrina2/MapServer", {id:"Optional Layers"})
    map.addLayer(katrinaLayers)

    //////////////////////////////////////////////////////////////////////////////
    //initiate legend
    legend = new Legend({
        map: map,
        layerInfos: [ {
            "layer": katrinaLayers
        }, {
            "layer": countyLayer
        }, {
            "layer": tractLayer
        }]
    }, "divLegend");
    legend.refresh();
    legend.startup();

    //////////////////////////////////////////////////////////////////////////////
    //initiate layer list
    var layerListWiget = new LayerList({
        map: map,
        layers: [{
                    layer: katrinaLayers,
                }],
    }, "layerList");
    layerListWiget.startup();
    layerListWiget.on('toggle', function(){            
    var layers = map.getLayersVisibleAtScale(map.getScale());     
    if (layers.length > 2){        
        legendRefresh(katrinaLayers, countyLayer, tractLayer);       
    }else{            
        legendRefresh(katrinaLayers, [], [])          
    }        
    });
    //////////////////////////////////////////////////////////////////////////////
    //expand sublists on start   
       layerListWiget.on('load', function(){  
        openExpandList();  
     }); 

      function openExpandList(){
        dojo.query('.esriLayer').forEach(function(node){  
      domClass.add(node, "esriListExpand");  
        });  
         dojo.query('.esriToggleButton').forEach(function(node){  
        domClass.replace(node, "esri-icon-down", "esri-icon-right");  
        });
        //delete borders and hide main title  
        var titleContainer = dojo.query('.esriTitleContainer');
        var esriContainer = dojo.query('.esriContainer');
        dojo.setStyle(titleContainer[0], "display", "none");
        esriContainer.style('border', 'none');
      }

    /////////////////////////////////////////////////////////////////////////////
    //create time slider
    var slider = new HorizontalSlider({
        name: "slider",
        value: 1,
        minimum: 1,
        maximum: 6,
        discreteValues: 6,
        style: "width:250px;",
        showButtons: false,
        onChange: function(value) {
            try {
               deleteCurLayer();
            }
            catch(err) {
                console.log("not working")
            }
            finally{ 
            preYear = curYear;
            curYear = value;
            if (curVisible.length !== 0) {
                switch (serverName) {
                    case "county1":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 22;
                        break;
                    case "county2":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 18;
                        break;
                    case "county3":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 23;
                        break;
                    case "county4":
                        curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 13;
                        break;
                }
                updateLayerVisibility(countyURL, tractURL, curVisible);
            }
        }

        }
    }, "slider").startup();
    //////////////////////////////////////////////////////////////////////////////
    //combo box filtering setup
    new dijit.form.FilteringSelect({
        id: "category",
        store: new Memory({
            idProperty: "urlIdentifier",
            data: category
        }),
        autoComplete: true,
        style: "width: 250px;",
        onChange: function(urlIdentifier) {
            if (this.item != null){
            dijit.byId('layerNames').query.urlIdentifier = this.item.urlIdentifier || /.*/;
        }
        }
    }, "category").startup();
    /////////////////////////////////////////////////////////////////////////////////////
    //combo box setup
        new dijit.form.ComboBox({
        id: "layerNames",
        store: new Memory({
            data: layerNames
        }),
        autoComplete: false,
        query: {
            urlIdentifier: /.*/
        },
        style: "width: 250px;",
        required: true,
        searchAttr: "name",
        onChange: function(layerNames) {
            try {
            
               deleteCurLayer();
           
            }
            catch(err) {
                console.log("not working")
            } 
            finally {
            dijit.byId('category').set('value', this.item ? this.item.urlIdentifier : null);
            curVisible = [];
            //if there is a selected layer (if the refresh button is not pressed)
            if (this.item!= null){
            serverName = this.item.urlIdentifier;
            serverNum = 0
            if (serverName.includes('county')) {
                serverNum = serverName.substring(6)
            } else {
                serverNum = serverName.substring(5)
            }
            tractURL = serverURL + 'katrinatract' + serverNum + "/MapServer";
            countyURL = serverURL + 'katrinacounty' + serverNum + "/MapServer";
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
                    curVisible.push(this.item.acs);
                    break;
            }
 
                 updateLayerVisibility(countyURL, tractURL, curVisible);
            
          
            //if the refresh button is pressed
        }else{
                   deleteCurLayer();
        }
        }
    }
    }, "layerNames").startup();

    //////////////////////////
    function deleteCurLayer(){
            map.removeLayer(countyLayer);
            map.removeLayer(tractLayer);
            legendRefresh(katrinaLayers, [], []); 
            countyURLf = undefined;
            tractURLf = undefined;
            countyLayer = undefined;
            trackLayer = undefined;
            map.graphics.clear();
    }
    //////////////////////////
    //legend refresh function
    function legendRefresh(katrinaLayer, countyLayer, tractLayer){
         legend.refresh([{
            "layer": katrinaLayer
        }, {
            "layer": countyLayer
        }, {
            "layer": tractLayer
        }]);
    
    }

    ///////////////////////////////////////////////////////////////////////////////////////  
    //update current layer visibility based on selection from the combo box
    function updateLayerVisibility(countyURL, tractURL, curVisible) {
        widgetPrint.destroy();
        map.graphics.clear();
        tractURLf = tractURL;
        countyURLf = countyURL;
        dd = curVisible;
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

        while (layers.length > 2) {
            map.removeLayer(map.getLayer(map.layerIds[2]));
            layers = map.getLayersVisibleAtScale(map.getScale());
        };

        countyLayer = new ArcGISDynamicMapServiceLayer(countyURL, {
            "opacity": 0.5,
            maxScale: 1155581.108577,
            minScale: 591657527.591555
        });

        tractLayer = new ArcGISDynamicMapServiceLayer(tractURL, {
            "opacity": 0.5,
            minScale: 577790.554289,
            maxScale: 70.5310735
        });

        map.addLayer(countyLayer);
        map.addLayer(tractLayer);
        countyLayer.setVisibleLayers(curVisible);
        tractLayer.setVisibleLayers(curVisible);

        legendRefresh(katrinaLayers, countyLayer, tractLayer);

        var legendlayer1 = new LegendLayer();
        var legendlayer2 = new LegendLayer();
        var legendlayer3 = new LegendLayer();

        legendlayer1.layerId =  countyLayer.id;
        legendlayer2.layerId =  tractLayer.id;
        legendlayer3.layerId =  katrinaLayers.id;
    

        myLayouts = [{
            "name": "Letter ANSI A Portrait",
            "label": "Portrait (JPG)",
            "format": "jpg",
            "options": {
                "legendLayers": [legendlayer1,legendlayer2,legendlayer3], 
                "copyrightText": "Brown Uinversity S4",
                "titleText": "Hurricane Katrina"
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
            url: "https://darcgcit.AD.Brown.Edu:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            templates: myTemplates
        }, divPrint);
        widgetPrint.startup();

        widgetPrint.on('print-start',function(){if (globalscale < 587790.554289) tractLayer.minScale=0;});
        widgetPrint.on('print-complete',function(){tractLayer.minScale=577790.554289;});
    }

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

            query = new arcgisQuery();
            _public._kabqueryInside = query;
            query.spatialRelationship = arcgisQuery.SPATIAL_REL_CONTAINS;
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
                            "<b>Track No: </b> ${TRACTID}<br/>" +
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
             var katURL = 'https://s4.ad.brown.edu/s4gisserver/rest/services/Katrina/Katrina2/MapServer'
            if (drawingstate != 'poly') {
                if (identifyPic == 1) {identifyTask = new IdentifyTask(katURL)}
                    else{
                if (globalscale > 577791) identifyTask = new IdentifyTask(countyURLf);
                else identifyTask = new IdentifyTask(tractURLf);
            }


                identifyParams = new IdentifyParameters();
                identifyParams.mapExtent = map.extent;
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;

                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                identifyParams.width = map.width;
                identifyParams.height = map.height;

                identifyParams.geometry = event.mapPoint;
                identifyParams.mapExtent = map.extent;

                if (identifyPic == 1) {identifyParams.layerIds = katrinaLayers.visibleLayers; }
                else{
                    if (globalscale > 577791) identifyParams.layerIds = countyLayer.visibleLayers;
                    else identifyParams.layerIds = tractLayer.visibleLayers;
                }

                var deferred = identifyTask
                    .execute(identifyParams)
                    .addCallback(function(response) {
                        // response is an array of identify result objects
                        // Let's return an array of features.
                        return dojo.map(response, function(result) {

                            var feature = result.feature;
                            var layerName = result.layerName;

                            feature.attributes.layerName = layerName;

                            if (identifyPic == 1){
                                 $.getJSON(katURL + "/0?f=json",
                                    function(result) {
                                        layvar = result.drawingInfo.renderer.field;
                                    });

                                var someInfoTemplate = new InfoTemplate("Picture",
                                    "<b>Photo:</b> </br> <img src=${PicturePath} alt='HTML5 Icon' width='128' height='128'><br/>" +
                                    "</br><a href=${PicturePath} target='_blank'>Original Picture</a>" );

                            }
                            else{
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
                                    "<b>Track No: </b> ${TRACTID}<br/>" +
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                            }
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
        var legendlayer = new LegendLayer();
        legendlayer.layerId =  katrinaLayers.id;

    var myLayouts = [{
        "name": "Letter ANSI A Portrait",
        "label": "Portrait (JPG)",
        "format": "jpg",
        "options": {
            "legendLayers": [legendlayer],
            "copyrightText": "Brown Uinveristy S4",
            //"authorText": "US 2010",
            "titleText": "Hurricane Katrina"
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
        url: "https://darcgcit.AD.Brown.Edu:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
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
    name: "Race, Age by Race",
    urlIdentifier: "county1"
}, {
    name: "Ethnicity Name and Immigration",
    urlIdentifier: "county2"
}, {
    name: "Socioeconomic Status",
    urlIdentifier: "county3"
}, {
    name: "Housing, Age, and Marital Status",
    urlIdentifier: "county4"
}, ];

var layerNames = [{
    "name": "% White, non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "0",
    "yearTwo": "22",
    "yearThree": "44",
    "yearFour": "66",
    "yearFive": "88",
    "acs": "110"
}, {
    "name": "% Black, non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "1",
    "yearTwo": "23",
    "yearThree": "45",
    "yearFour": "67",
    "yearFive": "89",
    "acs": "111"
}, {
    "name": "% Hispanic",
    "urlIdentifier": "county1",
    "yearOne": "2",
    "yearTwo": "24",
    "yearThree": "46",
    "yearFour": "68",
    "yearFive": "90",
    "acs": "112"
}, {
    "name": "% Native American race",
    "urlIdentifier": "county1",
    "yearOne": "3",
    "yearTwo": "25",
    "yearThree": "47",
    "yearFour": "69",
    "yearFive": "91",
    "acs": "113"
}, {
    "name": "% Asian and Pacific Islander race",
    "urlIdentifier": "county1",
    "yearOne": "4",
    "yearTwo": "26",
    "yearThree": "48",
    "yearFour": "70",
    "yearFive": "92",
    "acs": "114"
}, {
    "name": "% Hawaiian race",
    "urlIdentifier": "county1",
    "yearOne": "5",
    "yearTwo": "27",
    "yearThree": "49",
    "yearFour": "71",
    "yearFive": "93",
    "acs": "115"
}, {
    "name": "% Indian birth/race",
    "urlIdentifier": "county1",
    "yearOne": "6",
    "yearTwo": "28",
    "yearThree": "50",
    "yearFour": "72",
    "yearFive": "94",
    "acs": "116"
}, {
    "name": "% Chinese birth/race",
    "urlIdentifier": "county1",
    "yearOne": "7",
    "yearTwo": "29",
    "yearThree": "51",
    "yearFour": "73",
    "yearFive": "95",
    "acs": "117"
}, {
    "name": "% Filipino birth/race",
    "urlIdentifier": "county1",
    "yearOne": "8",
    "yearTwo": "30",
    "yearThree": "52",
    "yearFour": "74",
    "yearFive": "96",
    "acs": "118"
}, {
    "name": "% Japanese birth/race",
    "urlIdentifier": "county1",
    "yearOne": "9",
    "yearTwo": "31",
    "yearThree": "53",
    "yearFour": "75",
    "yearFive": "97",
    "acs": "119"
}, {
    "name": "% Korean birth/race",
    "urlIdentifier": "county1",
    "yearOne": "10",
    "yearTwo": "32",
    "yearThree": "54",
    "yearFour": "76",
    "yearFive": "98",
    "acs": "120"
}, {
    "name": "% Vietnamese race",
    "urlIdentifier": "county1",
    "yearOne": "11",
    "yearTwo": "33",
    "yearThree": "55",
    "yearFour": "77",
    "yearFive": "99",
    "acs": "121"
}, {
    "name": "% 15 and under, white non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "12",
    "yearTwo": "34",
    "yearThree": "56",
    "yearFour": "78",
    "yearFive": "100",
    "acs": "122"
}, {
    "name": "% 60 and older, white non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "13",
    "yearTwo": "35",
    "yearThree": "57",
    "yearFour": "79",
    "yearFive": "101",
    "acs": "123"
}, {
    "name": "% 15 and under, blacks non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "14",
    "yearTwo": "36",
    "yearThree": "58",
    "yearFour": "80",
    "yearFive": "102",
    "acs": "124"
}, {
    "name": "% 60 and older, blacks non-Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "15",
    "yearTwo": "37",
    "yearThree": "59",
    "yearFour": "81",
    "yearFive": "103",
    "acs": "125"
}, {
    "name": "% 15 and under, Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "16",
    "yearTwo": "38",
    "yearThree": "60",
    "yearFour": "82",
    "yearFive": "104",
    "acs": "126"
}, {
    "name": "% 60 and older, Hispanic *",
    "urlIdentifier": "county1",
    "yearOne": "17",
    "yearTwo": "39",
    "yearThree": "61",
    "yearFour": "83",
    "yearFive": "105",
    "acs": "127"
}, {
    "name": "% 15 and under, Native American *",
    "urlIdentifier": "county1",
    "yearOne": "18",
    "yearTwo": "40",
    "yearThree": "62",
    "yearFour": "84",
    "yearFive": "106",
    "acs": "128"
}, {
    "name": "% 60 and older, Native American *",
    "urlIdentifier": "county1",
    "yearOne": "19",
    "yearTwo": "41",
    "yearThree": "63",
    "yearFour": "85",
    "yearFive": "107",
    "acs": "129"
}, {
    "name": "% 15 and under, Asian/PI *",
    "urlIdentifier": "county1",
    "yearOne": "20",
    "yearTwo": "42",
    "yearThree": "64",
    "yearFour": "86",
    "yearFive": "108",
    "acs": "130"
}, {
    "name": "% 60 and older, Asian/PI *",
    "urlIdentifier": "county1",
    "yearOne": "21",
    "yearTwo": "43",
    "yearThree": "65",
    "yearFour": "87",
    "yearFive": "109",
    "acs": "131"
}, {
    "name": "% Mexican birth/ethnicity",
    "urlIdentifier": "county2",
    "yearOne": "0",
    "yearTwo": "18",
    "yearThree": "36",
    "yearFour": "54",
    "yearFive": "72",
    "acs": "90"
}, {
    "name": "% Cuban birth/ethnicity",
    "urlIdentifier": "county2",
    "yearOne": "1",
    "yearTwo": "19",
    "yearThree": "37",
    "yearFour": "55",
    "yearFive": "73",
    "acs": "91"
}, {
    "name": "% Puerto Rican birth/ethnicity",
    "urlIdentifier": "county2",
    "yearOne": "2",
    "yearTwo": "20",
    "yearThree": "38",
    "yearFour": "56",
    "yearFive": "74",
    "acs": "92"
}, {
    "name": "% Russian/USSR parentage/ancestry",
    "urlIdentifier": "county2",
    "yearOne": "3",
    "yearTwo": "21",
    "yearThree": "39",
    "yearFour": "57",
    "yearFive": "75",
    "acs": "93"
}, {
    "name": "% Italian parentage/ancestry",
    "urlIdentifier": "county2",
    "yearOne": "4",
    "yearTwo": "22",
    "yearThree": "40",
    "yearFour": "58",
    "yearFive": "76",
    "acs": "94"
}, {
    "name": "% German parentage/ancestry",
    "urlIdentifier": "county2",
    "yearOne": "5",
    "yearTwo": "23",
    "yearThree": "41",
    "yearFour": "59",
    "yearFive": "77",
    "acs": "95"
}, {
    "name": "% Irish parentage/ancestry",
    "urlIdentifier": "county2",
    "yearOne": "6",
    "yearTwo": "24",
    "yearThree": "42",
    "yearFour": "60",
    "yearFive": "78",
    "acs": "96"
}, {
    "name": "% Scandinavian parentage/ancestry",
    "urlIdentifier": "county2",
    "yearOne": "7",
    "yearTwo": "25",
    "yearThree": "43",
    "yearFour": "61",
    "yearFive": "79",
    "acs": "97"
}, {
    "name": "% foreign born",
    "urlIdentifier": "county2",
    "yearOne": "8",
    "yearTwo": "26",
    "yearThree": "44",
    "yearFour": "62",
    "yearFive": "80",
    "acs": "98"
}, {
    "name": "% Naturalized",
    "urlIdentifier": "county2",
    "yearOne": "9",
    "yearTwo": "27",
    "yearThree": "45",
    "yearFour": "63",
    "yearFive": "81",
    "acs": "99"
}, {
    "name": "% immigrated in past 10 years",
    "urlIdentifier": "county2",
    "yearOne": "10",
    "yearTwo": "28",
    "yearThree": "46",
    "yearFour": "64",
    "yearFive": "82",
    "acs": "100"
}, {
    "name": "% speaking other language at home, age 5+",
    "urlIdentifier": "county2",
    "yearOne": "11",
    "yearTwo": "29",
    "yearThree": "47",
    "yearFour": "65",
    "yearFive": "83",
    "acs": "101"
}, {
    "name": "% speaking English not well, age 5+",
    "urlIdentifier": "county2",
    "yearOne": "12",
    "yearTwo": "30",
    "yearThree": "48",
    "yearFour": "66",
    "yearFive": "84",
    "acs": "102"
}, {
    "name": "% Russian/USSR birth",
    "urlIdentifier": "county2",
    "yearOne": "13",
    "yearTwo": "31",
    "yearThree": "49",
    "yearFour": "67",
    "yearFive": "85",
    "acs": "103"
}, {
    "name": "% Italian birth",
    "urlIdentifier": "county2",
    "yearOne": "14",
    "yearTwo": "32",
    "yearThree": "50",
    "yearFour": "68",
    "yearFive": "86",
    "acs": "104"
}, {
    "name": "% German birth",
    "urlIdentifier": "county2",
    "yearOne": "15",
    "yearTwo": "33",
    "yearThree": "51",
    "yearFour": "69",
    "yearFive": "87",
    "acs": "105"
}, {
    "name": "% Irish birth",
    "urlIdentifier": "county2",
    "yearOne": "16",
    "yearTwo": "34",
    "yearThree": "52",
    "yearFour": "70",
    "yearFive": "88",
    "acs": "106"
}, {
    "name": "% Scandinavian birth",
    "urlIdentifier": "county2",
    "yearOne": "17",
    "yearTwo": "35",
    "yearThree": "53",
    "yearFour": "71",
    "yearFive": "89",
    "acs": "107"
}, {
    "name": "% with high school degree or less",
    "urlIdentifier": "county3",
    "yearOne": "0",
    "yearTwo": "23",
    "yearThree": "46",
    "yearFour": "69",
    "yearFive": "92",
    "acs": "115"
}, {
    "name": "% with 4-year college degree or more",
    "urlIdentifier": "county3",
    "yearOne": "1",
    "yearTwo": "24",
    "yearThree": "47",
    "yearFour": "70",
    "yearFive": "93",
    "acs": "116"
}, {
    "name": "% unemployed",
    "urlIdentifier": "county3",
    "yearOne": "2",
    "yearTwo": "25",
    "yearThree": "48",
    "yearFour": "71",
    "yearFive": "94",
    "acs": "117"
}, {
    "name": "% female labor force participation",
    "urlIdentifier": "county3",
    "yearOne": "3",
    "yearTwo": "26",
    "yearThree": "49",
    "yearFour": "72",
    "yearFive": "95",
    "acs": "118"
}, {
    "name": "% professional employees",
    "urlIdentifier": "county3",
    "yearOne": "4",
    "yearTwo": "27",
    "yearThree": "50",
    "yearFour": "73",
    "yearFive": "96",
    "acs": "119"
}, {
    "name": "% manufacturing employees",
    "urlIdentifier": "county3",
    "yearOne": "5",
    "yearTwo": "28",
    "yearThree": "51",
    "yearFour": "74",
    "yearFive": "97",
    "acs": "120"
}, {
    "name": "% veteran",
    "urlIdentifier": "county3",
    "yearOne": "6",
    "yearTwo": "29",
    "yearThree": "52",
    "yearFour": "75",
    "yearFive": "98",
    "acs": "121"
}, {
    "name": "% with disability",
    "urlIdentifier": "county3",
    "yearOne": "7",
    "yearTwo": "30",
    "yearThree": "53",
    "yearFour": "76",
    "yearFive": "99",
    "acs": "122"
}, {
    "name": "% self-employed",
    "urlIdentifier": "county3",
    "yearOne": "8",
    "yearTwo": "31",
    "yearThree": "54",
    "yearFour": "77",
    "yearFive": "100",
    "acs": "123"
}, {
    "name": "Median HH income, total",
    "urlIdentifier": "county3",
    "yearOne": "9",
    "yearTwo": "32",
    "yearThree": "55",
    "yearFour": "78",
    "yearFive": "101",
    "acs": "124"
}, {
    "name": "Median HH income, whites",
    "urlIdentifier": "county3",
    "yearOne": "10",
    "yearTwo": "33",
    "yearThree": "56",
    "yearFour": "79",
    "yearFive": "102",
    "acs": "125"
}, {
    "name": "Median HH income, blacks",
    "urlIdentifier": "county3",
    "yearOne": "11",
    "yearTwo": "34",
    "yearThree": "57",
    "yearFour": "80",
    "yearFive": "103",
    "acs": "126"
}, {
    "name": "Median HH income, Hispanics",
    "urlIdentifier": "county3",
    "yearOne": "12",
    "yearTwo": "35",
    "yearThree": "58",
    "yearFour": "81",
    "yearFive": "104",
    "acs": "127"
}, {
    "name": "Median HH income, Asian/PI",
    "urlIdentifier": "county3",
    "yearOne": "13",
    "yearTwo": "36",
    "yearThree": "59",
    "yearFour": "82",
    "yearFive": "105",
    "acs": "128"
}, {
    "name": "Per capita income",
    "urlIdentifier": "county3",
    "yearOne": "14",
    "yearTwo": "37",
    "yearThree": "60",
    "yearFour": "83",
    "yearFive": "106",
    "acs": "129"
}, {
    "name": "% in poverty, total",
    "urlIdentifier": "county3",
    "yearOne": "15",
    "yearTwo": "38",
    "yearThree": "61",
    "yearFour": "84",
    "yearFive": "107",
    "acs": "130"
}, {
    "name": "% in poverty, 65+",
    "urlIdentifier": "county3",
    "yearOne": "16",
    "yearTwo": "39",
    "yearThree": "62",
    "yearFour": "85",
    "yearFive": "108",
    "acs": "131"
}, {
    "name": "% in poverty, families with children",
    "urlIdentifier": "county3",
    "yearOne": "17",
    "yearTwo": "40",
    "yearThree": "63",
    "yearFour": "86",
    "yearFive": "109",
    "acs": "132"
}, {
    "name": "% in poverty, African Americans",
    "urlIdentifier": "county3",
    "yearOne": "18",
    "yearTwo": "41",
    "yearThree": "64",
    "yearFour": "87",
    "yearFive": "110",
    "acs": "133"
}, {
    "name": "% in poverty, whites",
    "urlIdentifier": "county3",
    "yearOne": "19",
    "yearTwo": "42",
    "yearThree": "65",
    "yearFour": "88",
    "yearFive": "111",
    "acs": "134"
}, {
    "name": "% in poverty, Native Americans",
    "urlIdentifier": "county3",
    "yearOne": "20",
    "yearTwo": "43",
    "yearThree": "66",
    "yearFour": "89",
    "yearFive": "112",
    "acs": "135"
}, {
    "name": "% in poverty, Hispanics",
    "urlIdentifier": "county3",
    "yearOne": "21",
    "yearTwo": "44",
    "yearThree": "67",
    "yearFour": "90",
    "yearFive": "113",
    "acs": "136"
}, {
    "name": "% in poverty, Asian/PI ",
    "urlIdentifier": "county3",
    "yearOne": "22",
    "yearTwo": "45",
    "yearThree": "68",
    "yearFour": "91",
    "yearFive": "114",
    "acs": "137"
}, {
    "name": "% owner-occupied units",
    "urlIdentifier": "county4",
    "yearOne": "0",
    "yearTwo": "13",
    "yearThree": "26",
    "yearFour": "39",
    "yearFive": "52",
    "acs": "65"
}, {
    "name": "% vacant units",
    "urlIdentifier": "county4",
    "yearOne": "1",
    "yearTwo": "14",
    "yearThree": "27",
    "yearFour": "40",
    "yearFive": "53",
    "acs": "66"
}, {
    "name": "% multi-family units",
    "urlIdentifier": "county4",
    "yearOne": "2",
    "yearTwo": "15",
    "yearThree": "28",
    "yearFour": "41",
    "yearFive": "54",
    "acs": "67"
}, {
    "name": "Median rent",
    "urlIdentifier": "county4",
    "yearOne": "3",
    "yearTwo": "16",
    "yearThree": "29",
    "yearFour": "42",
    "yearFive": "55",
    "acs": "68"
}, {
    "name": "Median home value",
    "urlIdentifier": "county4",
    "yearOne": "4",
    "yearTwo": "17",
    "yearThree": "30",
    "yearFour": "43",
    "yearFive": "56",
    "acs": "69"
}, {
    "name": "% structures more than 30 years old",
    "urlIdentifier": "county4",
    "yearOne": "5",
    "yearTwo": "18",
    "yearThree": "31",
    "yearFour": "44",
    "yearFive": "57",
    "acs": "70"
}, {
    "name": "% HH in neighborhood 10 years or less",
    "urlIdentifier": "county4",
    "yearOne": "6",
    "yearTwo": "19",
    "yearThree": "32",
    "yearFour": "45",
    "yearFive": "58",
    "acs": "71"
}, {
    "name": "% 17 and under, total",
    "urlIdentifier": "county4",
    "yearOne": "7",
    "yearTwo": "20",
    "yearThree": "33",
    "yearFour": "46",
    "yearFive": "59",
    "acs": "72"
}, {
    "name": "% 60 and older, total",
    "urlIdentifier": "county4",
    "yearOne": "8",
    "yearTwo": "21",
    "yearThree": "34",
    "yearFour": "47",
    "yearFive": "60",
    "acs": "73"
}, {
    "name": "% 75 and older, total",
    "urlIdentifier": "county4",
    "yearOne": "9",
    "yearTwo": "22",
    "yearThree": "35",
    "yearFour": "48",
    "yearFive": "61",
    "acs": "74"
}, {
    "name": "% currently married, not separated",
    "urlIdentifier": "county4",
    "yearOne": "10",
    "yearTwo": "23",
    "yearThree": "36",
    "yearFour": "49",
    "yearFive": "62",
    "acs": "75"
}, {
    "name": "% widowed, divorced and separated",
    "urlIdentifier": "county4",
    "yearOne": "11",
    "yearTwo": "24",
    "yearThree": "37",
    "yearFour": "50",
    "yearFive": "63",
    "acs": "76"
}, {
    "name": "% female-headed families with children ",
    "urlIdentifier": "county4",
    "yearOne": "12",
    "yearTwo": "25",
    "yearThree": "38",
    "yearFour": "51",
    "yearFive": "64",
    "acs": "77"
}, {
    "name": ""
}]