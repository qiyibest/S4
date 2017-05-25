var layer, serverName, countyLayer, legend, map, visible = [],
    curVisible = [];
var poplayerName = null;
var serverURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/SouthAfrica/capetownall/MapServer";
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


function resetCoBo(){       
    dijit.byId("layerName").reset();
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
        zoom: 10,
        sliderPosition: 'bottom-right'
    });
    map.centerAt(new Point(19, -34.2));

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
    var CPLayers = new ArcGISDynamicMapServiceLayer("https://s4.ad.brown.edu/s4gisserver/rest/services/SouthAfrica/CapeTown/MapServer")
    map.addLayer(CPLayers)

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
            curVisible.push(this.item.layerID)
            updateLayerVisibility(serverURL, curVisible);
            //if the refresh button is pressed
        }else{
                   deleteCurLayer();
        }
        }
    }, "layerName").startup();

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
                identifyTask = new IdentifyTask(countyURLf);
                identifyParams = new IdentifyParameters();
                identifyParams.mapExtent = map.extent;
                identifyParams.tolerance = 3;
                identifyParams.returnGeometry = true;

                identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
                identifyParams.width = map.width;
                identifyParams.height = map.height;

                identifyParams.geometry = event.mapPoint;
                identifyParams.mapExtent = map.extent;
                identifyParams.layerIds = countyLayer.visibleLayers;
                
                var deferred = identifyTask
                    .execute(identifyParams)
                    .addCallback(function(response) {
                        // response is an array of identify result objects
                        // Let's return an array of features.
                        return dojo.map(response, function(result) {

                            var feature = result.feature;
                            var layerName = result.layerName;

                            feature.attributes.layerName = layerName;

                            $.getJSON(countyURLf + "/" + dd + "?f=json",
                                function(result) {
                                    layvar = result.drawingInfo.renderer.field;
                            });

                                var someInfoTemplate = new InfoTemplate("Detail Information",
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                         
                        
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
            dojo.query(".dropdown-menu").style("left", "-310px");
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
    name: "Service",
    catID: "1"
}, {
    name: "Income",
    catID: "2"
}, {
    name: "Employment",
    catID: "3"
}, {
    name: "Population",
    carID: "4"
}, ];

var layerName = [  
   {  
      "name":"% With Electricity for Lighting in 1996",
      "catID":"1",
      "layerID":"0"
   },
   {  
      "name":"% With Electricity for Lighting in 2001",
      "catID":"1",
      "layerID":"1"
   },
   {  
      "name":"% With Chemical or Flush Toilet in 1996",
      "catID":"1",
      "layerID":"2"
   },
   {  
      "name":"% With Chemical or Flush Toilet in 2001",
      "catID":"1",
      "layerID":"3"
   },
   {  
      "name":"% With Trash Collection at Least Once a Week 1996",
      "catID":"1",
      "layerID":"4"
   },
   {  
      "name":"% With Trash Collection at Least Once a Week 2001",
      "catID":"1",
      "layerID":"5"
   },
   {  
      "name":"% With Phone in Home 1996",
      "catID":"1",
      "layerID":"6"
   },
   {  
      "name":"% With Phone in Home 2001",
      "catID":"1",
      "layerID":"7"
   },
   {  
      "name":"% Below Median Income 1996",
      "catID":"2",
      "layerID":"8"
   },
   {  
      "name":"% Below Median Income in 2001 ",
      "catID":"2",
      "layerID":"9"
   },
   {  
      "name":"Unemployment Rate 1996",
      "catID":"3",
      "layerID":"10"
   },
   {  
      "name":"Unemployment Rate 2001",
      "catID":"3",
      "layerID":"11"
   },
   {  
      "name":"% Employed in Elementary Occupations 1996",
      "catID":"3",
      "layerID":"12"
   },
   {  
      "name":"% Employed in Elementary Occupations 2001",
      "catID":"3",
      "layerID":"13"
   },
   {  
      "name":"% Employed as Plant and Machine Operators and Assemblers 1996",
      "catID":"3",
      "layerID":"14"
   },
   {  
      "name":"% Employed as Plant and Machine Operators and Assemblers 2001",
      "catID":"3",
      "layerID":"15"
   },
   {  
      "name":"% Employed in Craft and Trade Occupations 1996",
      "catID":"3",
      "layerID":"16"
   },
   {  
      "name":"% Employed in Craft and Trade Occupations 2001",
      "catID":"3",
      "layerID":"17"
   },
   {  
      "name":"% Employed in Agriculture and Fisheries 1996",
      "catID":"3",
      "layerID":"18"
   },
   {  
      "name":"% Employed in Agriculture and Fisheries 2001",
      "catID":"3",
      "layerID":"19"
   },
   {  
      "name":"% Service and Sales Occupations 1996",
      "catID":"3",
      "layerID":"20"
   },
   {  
      "name":"% Service and Sales Occupations 2001",
      "catID":"3",
      "layerID":"21"
   },
   {  
      "name":"% Employed as Clerks 1996",
      "catID":"3",
      "layerID":"22"
   },
   {  
      "name":"% Employed as Clerks 2001",
      "catID":"3",
      "layerID":"23"
   },
   {  
      "name":"% Employed as Technicians and Associate Professionals 1996",
      "catID":"3",
      "layerID":"24"
   },
   {  
      "name":"% Employed as Technicians and Associate Professionals 2001",
      "catID":"3",
      "layerID":"25"
   },
   {  
      "name":"% Employed as Professionals 1996",
      "catID":"3",
      "layerID":"26"
   },
   {  
      "name":"% Employed as Professionals 2001",
      "catID":"3",
      "layerID":"27"
   },
   {  
      "name":"% Employed as Legislators, Senior Officials, and Managers 1996",
      "catID":"3",
      "layerID":"28"
   },
   {  
      "name":"% Employed as Legislators, Senior Officials, and Managers 2001",
      "catID":"3",
      "layerID":"29"
   },
   {  
      "name":"Population Density 1996",
      "catID":"4",
      "layerID":"30"
   },
   {  
      "name":"Population Density 2001",
      "catID":"4",
      "layerID":"31"
   },
   {  
      "name":"% coloured 1996",
      "catID":"4",
      "layerID":"32"
   },
   {  
      "name":"% coloured 2001",
      "catID":"4",
      "layerID":"33"
   },
   {  
      "name":"% Indian 1996",
      "catID":"4",
      "layerID":"34"
   },
   {  
      "name":"% Indian 2001",
      "catID":"4",
      "layerID":"35"
   },
   {  
      "name":"% white 1996",
      "catID":"4",
      "layerID":"36"
   },
   {  
      "name":"% white 2001",
      "catID":"4",
      "layerID":"37"
   },
   {  
      "name":"% African 1996",
      "catID":"4",
      "layerID":"38"
   },
   {  
      "name":"% African 2001",
      "catID":"4",
      "layerID":"39"
   }
]