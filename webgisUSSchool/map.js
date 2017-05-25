var layer, serverName, countyLayer, legend, map, visible = [],
    curVisible = [];
var identifySchool = 0;
var curYear = 1;
var poplayerName = null;
var serverURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/USSchool/USSchool1all/MapServer";
var schoolURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/USSchool/USSchool2all/MapServer";
var identifyTask, identifyParams, dd = null,
    layvar = null,
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

function getIdentifyState(state){
    identifySchool = state;
}

function resetCoBo(){       
    dijit.byId("layerName").reset();
}

function changeColor(name){
    console.log(name)
    switch(name){
        case "drawPoly":
            document.getElementById("drawPoly-select").setAttribute( "class", "active" );
            document.getElementById('identifySchool-select').setAttribute("class", "");
            break;
        case "identifySchool":
            document.getElementById("drawPoly-select").setAttribute( "class", "" );
            document.getElementById('identifySchool-select').setAttribute("class", "active");
            break;
        case "reset":
            document.getElementById("drawPoly-select").setAttribute( "class", "" );
            document.getElementById('identifySchool-select').setAttribute("class", "");
            break;
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
    //add additional School layers (for layerlist) to the map as layer1
    var CPLayers = new ArcGISDynamicMapServiceLayer("https://s4.ad.brown.edu/s4gisserver/rest/services/USSchool/USSchool2all/MapServer")
    map.addLayer(CPLayers)
    console.log(CPLayers)
    console.log(map)

    //////////////////////////////////////////////////////////////////////////////
    //initiate legend
    legend = new Legend({
        map: map,
        layerInfos: [ {
            "layer": CPLayers
        }, {
            "layer": countyLayer
        }]
    }, "divLegend");
    legend.refresh();
    legend.startup();

    //////////////////////////////////////////////////////////////////////////////
    //initiate layer list
    var layerListWiget = new LayerList({
        map: map,
        layers: [{
                    layer: CPLayers,
                }],
    }, "layerList");
    layerListWiget.startup();
    layerListWiget.on('toggle', function(){            
    var layers = map.getLayersVisibleAtScale(map.getScale());     
    if (layers.length > 2){        
        legendRefresh(CPLayers, countyLayer);       
    }else{            
        legendRefresh(CPLayers, [])          
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
        maximum: 2,
        discreteValues: 2,
        style: "width:250px;",
        showButtons: false,
        onChange: function(value) {
            curYear = value;
            if (curVisible.length !== 0) {
                if (curYear == 2){
                        curVisible[0] = Number(curVisible[0]) + 41;
                }else{
                        curVisible[0] = Number(curVisible[0]) - 41;
                }

                updateLayerVisibility(serverURL, curVisible);
            }

        }
    }, "slider").startup();

    //////////////////////////////////////////////////////////////////////////////
    //combo box filtering setup
    new dijit.form.FilteringSelect({
        id: "category",
        store: new Memory({
            idProperty: "catID",
            data: category
        }),
        autoComplete: true,
        style: "width: 250px;",
        onChange: function(urlIdentifier) {
            if (this.item != null){
             dijit.byId('layerName').query.catID = this.item.catID || /.*/;
        }
        }
    }, "category").startup();
    /////////////////////////////////////////////////////////////////////////////////////
    //combo box setup
        new dijit.form.ComboBox({
        id: "layerName",
        store: new Memory({
            data: layerName
        }),
        autoComplete: false,
        query: {
            urlIdentifier: /.*/
        },
        style: "width: 250px;",
        required: true,
        searchAttr: "name",
        onChange: function(layerName) {
            dijit.byId('category').set('value', this.item ? this.item.catID : null);
            curVisible = [];
            //if there is a selected layer (if the refresh button is not pressed)
            if (this.item!= null){
                switch (curYear) {
                    case 1:
                        curVisible.push(this.item.yearOne);
                        break;
                    case 2:
                        console.log(this.item.yearOne)
                        curVisible.push(this.item.yearTwo);
                        break;
                }
            updateLayerVisibility(serverURL, curVisible);
            //if the refresh button is pressed
        }else{
                   deleteCurLayer();
        }
        }
    }, "layerNames").startup();

    //////////////////////////
    function deleteCurLayer(){
            map.removeLayer(countyLayer);
            legendRefresh(CPLayers, []); 
            countyURLf = undefined
    }
    //////////////////////////
    //legend refresh function
    function legendRefresh(CPLayer, countyLayer){
         legend.refresh([{
            "layer": CPLayer
        }, {
            "layer": countyLayer
        }]);
    
    }

    ///////////////////////////////////////////////////////////////////////////////////////  
    //update current layer visibility based on selection from the combo box
    function updateLayerVisibility(countyURL, curVisible) {
        widgetPrint.destroy();
        map.graphics.clear();
        dd = curVisible;
        console.log(curVisible)
        countyURLf = countyURL
        $.getJSON(countyURL + "/" + dd + "?f=json",
            function(result) {
                layvar = result.drawingInfo.renderer.field;
                poplayerName = result.name;
            });


        var layers = map.getLayersVisibleAtScale(map.getScale());

        while (layers.length > 2) {
            map.removeLayer(map.getLayer(map.layerIds[2]));
            layers = map.getLayersVisibleAtScale(map.getScale());
        };

        countyLayer = new ArcGISDynamicMapServiceLayer(countyURL);
        countyLayer.setOpacity(0.5);

        map.addLayer(countyLayer);
        countyLayer.setVisibleLayers(curVisible);

        legendRefresh(CPLayers, countyLayer);

        var legendlayer1 = new LegendLayer();
        var legendlayer2 = new LegendLayer();

        legendlayer1.layerId =  countyLayer.id;
        legendlayer2.layerId =  CPLayers.id;

        myLayouts = [{
            "name": "Letter ANSI A Portrait",
            "label": "Portrait (JPG)",
            "format": "jpg",
            "options": {
                "legendLayers": [legendlayer1,legendlayer2], 
                "copyrightText": "Brown Uinversity S4",
                "titleText": "Cape Town"
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

            var queryTask = new QueryTask(countyURLf + "/" + dd);

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
                        var someInfoTemplate = new InfoTemplate("Detail Information",
                            poplayerName + ":</b> " + "${" + layvar + "}")
                   
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
                 if ((identifySchool == 1) && (map.getScale() < 600000)) {
                    identifyTask = new IdentifyTask(schoolURL);
                    identifyParams = new IdentifyParameters();
                    identifyParams.layerIds = CPLayers.visibleLayers;
                }
                else {
                    identifyTask = new IdentifyTask(countyURLf);
                    identifyParams = new IdentifyParameters();
                    identifyParams.layerIds = countyLayer.visibleLayers;
                }
                
                identifyParams.mapExtent = map.extent;
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;

                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                identifyParams.width = map.width;
                identifyParams.height = map.height;

                identifyParams.geometry = event.mapPoint;
                identifyParams.mapExtent = map.extent;
            
                
                var deferred = identifyTask
                    .execute(identifyParams)
                    .addCallback(function(response) {
                        // response is an array of identify result objects
                        // Let's return an array of features.
                        return dojo.map(response, function(result) {
                          
                            var feature = result.feature;
                            var layerName = result.layerName;

                            feature.attributes.layerName = layerName;

                           if (identifySchool == 1){
                                 //$.getJSON(schoolURL + "/0?f=json");
                                  var openURL = '';
                                  if (identifyParams.layerIds == '0') {openURL='https://s4.ad.brown.edu/Projects/USSchools/schools/schooldataquery.asp?XY=';}
                                  if (identifyParams.layerIds == '2') {openURL='https://s4.ad.brown.edu/Projects/USSchools/schools/schooldataquery10.asp?XY=';}
                                 var infoContent = '';
                                 var patt = /XYCOORDS =(.*?)<b/
                                 var someInfoTemplate = new InfoTemplate("${X}");
                                 feature.setInfoTemplate(someInfoTemplate);
                                 infoContent = (feature.getContent()).toString();
                                 try{
                                    XYcoords = patt.exec(infoContent)[1];
                                }
                                 catch(err){
                                    XYcoords = undefined;
                                }
                                 if (XYcoords != undefined) window.open(openURL + XYcoords, XYcoords)
                             
                         }

                             else{

                            $.getJSON(countyURLf + "/" + dd + "?f=json",
                                function(result) {
                                    layvar = result.drawingInfo.renderer.field;

                            });

                                var someInfoTemplate = new InfoTemplate("Detail Information",
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                                feature.setInfoTemplate(someInfoTemplate);
                            return feature;
                            }
                         
                        
                            
                        });
                    });

                if (identifySchool != 1){
                     map.infoWindow.setFeatures([deferred]);
                     map.infoWindow.show(event.mapPoint);}
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
    legendlayer.layerId =  CPLayers.id;
    var myLayouts = [{
        "name": "Letter ANSI A Portrait",
        "label": "Portrait (JPG)",
        "format": "jpg",
        "options": {
            "legendLayers": [legendlayer],
            "copyrightText": "Brown Uinveristy S4",
            //"authorText": "US 2010",
            "titleText": "Cape Town"
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
    name: "Population race",
    catID: "1"
}, {
    name: "Population SES",
    catID: "2"
}, {
    name: "Child Race",
    catID: "3"
}, {
    name: "Child Poverty Immigration",
    carID: "4"
}, {
    name: "Segregation Indices",
    carID: "5"
}, {
    name: "Exposure Indices",
    carID: "6"
}, {
    name: "Student Race",
    carID: "7"
}, {
    name: "Child Size",
    carID: "8"
}, {
    name: "Free Lunch Program",
    carID: "9"
}, ];

var layerName = [  
   {  
      "name":"% non-Hispanic white-full count",
      "catID":"1",
      "yearOne":"0",
      "yearTwo":"41"
   },
   {  
      "name":"% non-Hispanic black-full count",
      "catID":"1",
      "yearOne":"1",
      "yearTwo":"42"
   },
   {  
      "name":"% Hispanic-full count",
      "catID":"1",
      "yearOne":"2",
      "yearTwo":"43"
   },
   {  
      "name":"% Asian-full count",
      "catID":"1",
      "yearOne":"3",
      "yearTwo":"44"
   },
   {  
      "name":"median household income",
      "catID":"2",
      "yearOne":"4",
      "yearTwo":"45"
   },
   {  
      "name":"% below poverty",
      "catID":"2",
      "yearOne":"5",
      "yearTwo":"46"
   },
   {  
      "name":"% vacant housing units",
      "catID":"2",
      "yearOne":"6",
      "yearTwo":"47"
   },
   {  
      "name":"% occupied housing units",
      "catID":"2",
      "yearOne":"7",
      "yearTwo":"48"
   },
   {  
      "name":"% foreign born",
      "catID":"2",
      "yearOne":"8",
      "yearTwo":"49"
   },
   {  
      "name":"% recent immigrants",
      "catID":"2",
      "yearOne":"9",
      "yearTwo":"50"
   },
   {  
      "name":"% speak lang other than English",
      "catID":"2",
      "yearOne":"10",
      "yearTwo":"51"
   },
   {  
      "name":"% kids non-Hispanic white",
      "catID":"3",
      "yearOne":"11",
      "yearTwo":"52"
   },
   {  
      "name":"% kids non-Hispanic black",
      "catID":"3",
      "yearOne":"12",
      "yearTwo":"53"
   },
   {  
      "name":"% kids Hispanic",
      "catID":"3",
      "yearOne":"13",
      "yearTwo":"54"
   },
   {  
      "name":"% kids Asian",
      "catID":"3",
      "yearOne":"14",
      "yearTwo":"55"
   },
   {  
      "name":"% kids living below poverty",
      "catID":"4",
      "yearOne":"15",
      "yearTwo":"56"
   },
   {  
      "name":"% kids foreign born",
      "catID":"4",
      "yearOne":"16",
      "yearTwo":"57"
   },
   {  
      "name":"% kids speak lang other than English",
      "catID":"4",
      "yearOne":"17",
      "yearTwo":"58"
   },
   {  
      "name":"segregation white/black",
      "catID":"5",
      "yearOne":"18",
      "yearTwo":"59"
   },
   {  
      "name":"segregation white/hispanic",
      "catID":"5",
      "yearOne":"19",
      "yearTwo":"60"
   },
   {  
      "name":"segregation white/asian",
      "catID":"5",
      "yearOne":"20",
      "yearTwo":"61"
   },
   {  
      "name":"p* isolation of white student",
      "catID":"6",
      "yearOne":"21",
      "yearTwo":"62"
   },
   {  
      "name":"p* isolation of black student",
      "catID":"6",
      "yearOne":"22",
      "yearTwo":"63"
   },
   {  
      "name":"p* isolation of hispanic student",
      "catID":"6",
      "yearOne":"23",
      "yearTwo":"64"
   },
   {  
      "name":"p* isolation of asian student",
      "catID":"6",
      "yearOne":"24",
      "yearTwo":"65"
   },
   {  
      "name":"% non-Hispanic white",
      "catID":"7",
      "yearOne":"25",
      "yearTwo":"66"
   },
   {  
      "name":"% non-Hispanic black",
      "catID":"7",
      "yearOne":"26",
      "yearTwo":"67"
   },
   {  
      "name":"% Hispanic",
      "catID":"7",
      "yearOne":"27",
      "yearTwo":"68"
   },
   {  
      "name":"% Asian",
      "catID":"7",
      "yearOne":"28",
      "yearTwo":"69"
   },
   {  
      "name":"average non-Hispanic white",
      "catID":"8",
      "yearOne":"29",
      "yearTwo":"70"
   },
   {  
      "name":"average non-Hispanic black",
      "catID":"8",
      "yearOne":"30",
      "yearTwo":"71"
   },
   {  
      "name":"average Hispanic",
      "catID":"8",
      "yearOne":"31",
      "yearTwo":"72"
   },
   {  
      "name":"average Asian",
      "catID":"8",
      "yearOne":"32",
      "yearTwo":"73"
   },
   {  
      "name":"% free lunches",
      "catID":"9",
      "yearOne":"33",
      "yearTwo":"74"
   },
   {  
      "name":"segregation rich from poor students",
      "catID":"9",
      "yearOne":"34",
      "yearTwo":"75"
   },
   {  
      "name":"P* free lunch for rich students",
      "catID":"9",
      "yearOne":"35",
      "yearTwo":"76"
   },
   {  
      "name":"P* free lunch for poor students",
      "catID":"9",
      "yearOne":"36",
      "yearTwo":"77"
   },
   {  
      "name":"P* free lunch for white students",
      "catID":"9",
      "yearOne":"37",
      "yearTwo":"78"
   },
   {  
      "name":"P* free lunch for black students",
      "catID":"9",
      "yearOne":"38",
      "yearTwo":"79"
   },
   {  
      "name":"P* free lunch for hispanic students",
      "catID":"9",
      "yearOne":"39",
      "yearTwo":"80"
   },
   {  
      "name":"P* free lunch for asian students",
      "catID":"9",
      "yearOne":"40",
      "yearTwo":"81"
   }
]