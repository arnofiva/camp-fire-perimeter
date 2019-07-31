require([
  "esri/WebScene",
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/WMSLayer",
  "esri/layers/FeatureLayer",
  "esri/widgets/Search",
  "esri/widgets/TimeSlider"
], function(
  WebScene,
  Map,
  SceneView,
  WMSLayer,
  FeatureLayer,
  Search,
  TimeSlider
) {
  var map = new WebScene({
    type: "feature",
    portalItem: {
      id: "49daf794bc0c4fc8bd62008c919819fb"
    }
  });

  var view = new SceneView({
    container: "viewDiv",
    qualityProfile: "high",
    environment: {
      atmosphere: {
        quality: "high"
      }
    },
    map: map
  });

  const intervalHours = 24;
  const sliderStart = new Date(Date.UTC(2018, 10, 7, 0, 0));
  const sliderEnd = new Date(Date.UTC(2018, 10, 21, 0, 0));
  const timeSlider = new TimeSlider({
    container: "timeSlider",
    mode: "instant",
    fullTimeExtent: {
      start: sliderStart,
      end: sliderEnd,
    },
    values: [sliderStart],
    stops: {
      interval: {
        value: intervalHours,
        unit: "hours"
      }
    }
  });
  view.ui.add(timeSlider, "manual");

  var layerViews = [];

  function updateLayerViews(dateTime) {
    var end = new Date(dateTime);
    end = end.setHours(end.getHours() + intervalHours);

    layerViews.forEach(function(lv) {

      var start = lv.layer.geometryType === "polyline" ? dateTime : sliderStart;

      lv.filter = {
        timeExtent: {
          start,
          end
        }
      };
    });
  }

  map.when().then(function() {

    map.layers.forEach(function(layer) {

      // Increase wall height by 30 meters
      const vv = layer.renderer && layer.renderer.visualVariables;
      if (layer.title === "PerimeterJoin_Merge" && vv && vv.length) {
        vv[1].valueExpression = "$feature.Height / 1.5 + 100";
      }

      view.whenLayerView(layer).then(function(lv) {

        layer.timeInfo = {
          startField: "Date_",
          endField: "Date_",
        };

        layerViews.push(lv);
        updateLayerViews(sliderStart);
      });
    });
  });

  timeSlider.watch("timeExtent", function(value) {
    // update layerview filter to reflect current timeExtent
    updateLayerViews(value.start);
  });

  view.when().then(function() {
    view.popup.defaultPopupTemplateEnabled = true;
    // view.popup.dockEnabled = true;
    // view.popup.dockOptions.position = "bottom-right";

    //view.popup.watch("features", console.log.bind("Popup"));
  });

});