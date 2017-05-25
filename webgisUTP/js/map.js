var layer, serverName, countyLayer, tractLayer, legend, map, visible = [],
    curVisible = [];
var curYear = 1, prevYear = 1;
var identifyPic = 0;
var poplayerName = null;
var serverURL = "https://s4.ad.brown.edu/s4gisserver/rest/services/UTP/";
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
    "esri/dijit/BasemapLayer",
    "esri/dijit/Basemap",
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
    Map, connect, BasemapGallery, BasemapLayer, Basemap, Print, PrintTask, PrintParameters, LegendLayer, PrintTemplate, Search, arcgisUtils, Extent, scaleUtils, Point,
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

    var layer = new BasemapLayer({
    url:"https://maps.who.int/arcgis/rest/services/Basemap/WHO_West_Africa_background_7/MapServer" // a serveri hosted by WHO
  });
    var newbasemap = new Basemap({
    layers:[layer],
    title:"White Backgroud"
    //thumbnailUrl:"images/safetyThumb.png"
  });

    app.map = map = new Map("map", {
        basemap: newbasemap,
        zoom: 5,
        //maxZoom:15,
        minZoom:4,
        sliderPosition: 'bottom-right'
    });
    map.centerAt(new Point(-95, 40));

    map.on("extent-change", function() {
        globalscale = map.getScale();
    });

    var scalebar = new Scalebar({
        map: map,
        scalebarUnit: "dual"
    });


/*    var layer = new BasemapLayer({
    url:"https://gis.cityoflacrosse.org/arcgis/rest/services/Maps/Blank_Basemap/MapServer"
  });
    var newbasemap = new Basemap({
    layers:[layer],
    title:"blank"
    //thumbnailUrl:"images/safetyThumb.png"
  });*/

    /////////////////////////////////////////////////////////////////////////////////////////
    //delete unnecessary basemaps from the gallery
    var basemapGallery = new BasemapGallery({
        showArcGISBasemaps: true,
        map: map
    // });
    }, "basemapGallery");
    basemapGallery.on('load', function() {
        basemapGallery.remove('basemap_0');
        basemapGallery.remove('basemap_1');
        basemapGallery.remove('basemap_2');
        basemapGallery.remove('basemap_3');
        basemapGallery.remove('basemap_4');
        basemapGallery.remove('basemap_5');
        basemapGallery.remove('basemap_6');
        basemapGallery.remove('basemap_7');
        basemapGallery.remove('basemap_8');
        basemapGallery.remove('basemap_9');
        basemapGallery.remove('basemap_10');
        basemapGallery.add(newbasemap);
   });
    basemapGallery.startup();

    ////////////////////////////////////////////////////////////////////////////////////////
    //add additional katrina layers (for layerlist) to the map as layer1
    var katrinaLayers = new ArcGISDynamicMapServiceLayer("https://s4.ad.brown.edu/s4gisserver/rest/services/UTP/City1880/MapServer", {id:"Optional Layers"})
    map.addLayer(katrinaLayers);



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
                    layer: katrinaLayers
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
        //uncheckCheckBox();
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


      function uncheckCheckBox (){
 
        dojo.query('.esriCheckbox').forEach(function(node){
            node.checked = false;
        });
}

    /////////////////////////////////////////////////////////////////////////////
    //create time slider
    // var slider = new HorizontalSlider({
    //     name: "slider",
    //     value: 1,
    //     minimum: 1,
    //     maximum: 6,
    //     discreteValues: 6,
    //     style: "width:250px;",
    //     showButtons: false,
    //     onChange: function(value) {
    //         try {
    //            deleteCurLayer();
    //         }
    //         catch(err) {
    //             console.log("not working")
    //         }
    //         finally{ 
    //         preYear = curYear;
    //         curYear = value;
    //         if (curVisible.length !== 0) {
    //             switch (serverName) {
    //                 case "county1":
    //                     curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 22;
    //                     break;
    //                 case "county2":
    //                     curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 18;
    //                     break;
    //                 case "county3":
    //                     curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 23;
    //                     break;
    //                 case "county4":
    //                     curVisible[0] = Number(curVisible[0]) + (curYear - preYear) * 13;
    //                     break;
    //             }
    //             updateLayerVisibility(countyURL, tractURL, curVisible);
    //         }
    //     }

    //     }
    // }, "slider").startup();
    //////////////////////////////////////////////////////////////////////////////
    //combo box filtering setup
    // new dijit.form.FilteringSelect({
    //     id: "category",
    //     store: new Memory({
    //         idProperty: "urlIdentifier",
    //         data: category
    //     }),
    //     autoComplete: true,
    //     style: "width: 250px;",
    //     onChange: function(urlIdentifier) {
    //         if (this.item != null){
    //         dijit.byId('layerNames').query.urlIdentifier = this.item.urlIdentifier || /.*/;
    //     }
    //     }
    // }, "category").startup();
    /////////////////////////////////////////////////////////////////////////////////////
    //combo box setup
        new dijit.form.ComboBox({
        id: "layerNames",
        store: new Memory({
            data: layerNames
        }),
        autoComplete: false,
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
            //.byId('category').set('value', this.item ? this.item.urlIdentifier : null);
            curVisible = [];
            //if there is a selected layer (if the refresh button is not pressed)
            console.log(this.item);
            if (this.item!= null){
            //serverName = this.item.urlIdentifier;
            //serverNum = 0
            // if (serverName.includes('county')) {
            //     serverNum = serverName.substring(6)
            // } else {
            //     serverNum = serverName.substring(5)
            // }
            countyURL = serverURL + 'CNTY1880' + "/MapServer";
            tractURL = serverURL + 'EDmap1880' +  "/MapServer";
            curVisible.push(this.item.yearOne);
            // switch (curYear) {
            //     case 1:
            //         curVisible.push(this.item.yearOne);
            //         break;
            //     case 2:
            //         curVisible.push(this.item.yearTwo);
            //         break;
            //     case 3:
            //         curVisible.push(this.item.yearThree);
            //         break;
            //     case 4:
            //         curVisible.push(this.item.yearFour);
            //         break;
            //     case 5:
            //         curVisible.push(this.item.yearFive);
            //         break;
            //     case 6:
            //         curVisible.push(this.item.acs);
            //         break;
            // }
 
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
                "titleText": "Urban Transition Project"
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
            query.spatialRelationship = arcgisQuery.SPATIAL_REL_INTERSECTS;
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
                            "<b>State: </b> ${STATENAM}<br/>" +
                            "<b>County: </b> ${NHGISNAM}<br/>" + "<b>" + poplayerName + ":</b> " + "${" + layvar + "}")
                    } else {
                        var someInfoTemplate = new InfoTemplate("Detail Information",
                            "<b>State: </b> ${StateName}<br/>" +
                            "<b>City: </b> ${CityName}<br/>" +
                            "<b>Enumeration District: </b> ${ENUMDIST}<br/>" +
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
                                    "<b>State: </b> ${STATENAM}<br/>" +
                                    "<b>County: </b> ${NHGISNAM}<br/>" +
                                    "<b>${layerName}: </b>" +
                                    "${" + layvar + ":NumberFormat}");
                            } else {
                                $.getJSON(tractURLf + "/" + dd + "?f=json",
                                    function(result) {
                                        layvar = result.drawingInfo.renderer.field;
                                    });
                                var someInfoTemplate = new InfoTemplate("Detail Information",
                                    "<b>State: </b> ${StateName}<br/>" +
                                    "<b>City: </b> ${CityName}<br/>" +
                                    "<b>Enumeration District: </b> ${ENUMDIST}<br/>" +
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
            "titleText": "Urban Transition Project"
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
            dojo.query(".calcite-dropdown-toggle").addClass("open");
            dojo.query(".dropdown-menu").style("left", "0px");
            dojo.query(".dropdown-menu").style("width", " 300px");
 
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

var layerNames = [{"name":"%Women with SEI among age 15-64","yearOne":"0"},
{"name":"%Men with SEI among age 15-64","yearOne":"1"},
{"name":"%Men and women with SEI among age 15-64","yearOne":"2"},
{"name":"%Married among age18+","yearOne":"3"},
{"name":"Sex ratio age 18-44","yearOne":"4"},
{"name":"%Age 60 and older","yearOne":"5"},
{"name":"%Age 16 and younger","yearOne":"6"},
{"name":"%Foreign-born","yearOne":"7"},
{"name":"%American Indian","yearOne":"8"},
{"name":"%Mulatto","yearOne":"9"},
{"name":"%Black","yearOne":"10"},
{"name":"%Chinese","yearOne":"11"},
{"name":"%French","yearOne":"12"},
{"name":"%Danish","yearOne":"13"},
{"name":"%Norwegian","yearOne":"14"},
{"name":"%Swedish","yearOne":"15"},
{"name":"%German","yearOne":"16"},
{"name":"%Irish","yearOne":"17"},
{"name":"%British","yearOne":"18"},
{"name":"%Canadian","yearOne":"19"},
{"name":"%Yankee","yearOne":"20"},
{"name":"%Household of married couples with child","yearOne":"21"},
{"name":"Mean SEI","yearOne":"22"}]