This is a snapshot of some code from the Google Earth Engine code editor. It's much better viewed there. 

<a href="javascript:history.back()">Go Back</a> or <a href="seasonality_wet_season_snapshot_raw.js">view raw</a>

```js
/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var chirpsD = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/* Identify the onset of "wet season" according to the method of Liebmann et al. 
   https://journals.ametsoc.org/doi/pdf/10.1175/2007JCLI1762.1
   At each location we calculate the A, average daily precipitation i.e. annual sum / days per year
   Next we identify B, the average precipitation for each day (i.e. average on january 1st, etc)
   Next we calculate the daily anomaly C, - i.e. the difference between B and A
   Next we calculate D, the daily cumulative sum of C, the cumulative anomaly to date (from 1st Jan).
   At the point when D reaches a minimum, we say the wet season has begun as the "actual" rain is catching up with 
   expectation.
   
   We use a hue wheel palette to render the data to reflect its cyclical annual nature 
   i.e. the min and max values are adjacent in colour
*/
var legendTools = require('users/harrygibson/share:ui_common/CreateLegend.js');
var palettes = require('users/harrygibson/share:ui_common/Palettes.js')
var makeLegend = legendTools.makeLegend;
var yrFrom = 1982;
var yrTo = 2017;
var dateFrom = ee.Date.fromYMD(yrFrom, 1, 1);
var dateTo = ee.Date.fromYMD(yrTo + 1, 1, 1);
var yrs = ee.List.sequence(yrFrom, yrTo, 1);
var chirpsAnnualMeans = ee.ImageCollection(yrs.map(function(yr){
  var num = ee.Number(yr);
  var start = ee.Date.fromYMD(num, 1, 1);
  var end = ee.Date.fromYMD(num.add(1), 1, 1);
  var chirpsForYr = chirpsD.filterDate(start, end);
  var yrMean = chirpsForYr.mean();
  return ee.Image(yrMean).set("system:time_start", start).set("system:time_end", end);
}));
// var chirpsSynopticDailyMeanFull = chirpsD.filter(ee.Filter.date(dateFrom, dateTo)).mean();
// this is ok and probably more efficient so long as there are the same number of vals for each year
// which there should be as CHIRPS doesn't really have gaps (and neglecting leap years).. it seems to be the same 
// to the 4th d.p. or so
var chirpsSynopticDailyMean = chirpsAnnualMeans.mean(); 
var julianDays = ee.List.sequence(1, 365, 1);
var chirpsJulianMeans = ee.ImageCollection(julianDays.map(function(doy){
  var num = ee.Number(doy);
  var doyFilter = ee.Filter.calendarRange(num);
  var chirpsForDoy = chirpsD.filter(doyFilter);
  var doyMean = chirpsForDoy.mean();
  return ee.Image(doyMean).set("doy", num);
}));
Map.addLayer(chirpsSynopticDailyMean,{ min:0, max: 12, palette: palettes.STEEL_BLUE}, "synoptic avg rain mm", false);
// for the synoptic julian days, create a collection mapping how that day's (average) rain compares to the overall 
// daily average
var synopticDailyAnomalies = chirpsJulianMeans.map(function(img){
  var dailyAnom = ee.Image(img)
    .subtract(chirpsSynopticDailyMean)
    .set("doy", img.get("doy"));
  return dailyAnom;  
});
// now for the synoptic julian days, starting with 1 jan, create a cumulative total of those anomalies for the year-to-date
// This gives a a curve that looks like -n.sin(doy), for a location with one wet season with onset mid-year, or phase-shifted 
// for onset at some other time. The minimum point of this curve will give us the onset of the wet season.
var first = ee.List([ee.Image(0).set("doy", 0)]);
var accumulate = function(img, list){
  var prev = ee.Image(ee.List(list).get(-1));
  var added = img.add(prev).set("doy", img.get("doy"));
  return ee.List(list).add(added);
};
var synopticCumulativeDailyAnomalies = ee.ImageCollection(ee.List(synopticDailyAnomalies.iterate(accumulate, first)).splice(0,1));
// now find the doy on which the cumulative anomaly reaches its minimum, i.e. the curve will likely look like a graph of -sin(doy), 
// find the doy of the lowest point; also of the highest point
// this array-munging method is taken from https://gis.stackexchange.com/a/277085/10742, thanks St Genadii
// first add the doy property as a band to the image, this will allow the doy and the actual value to 
// travel hand-in-hand through the pixel-based shuffling of the array processing. 
// unsure why the cast seemed to be necessary but the map render got upset without it and claimed 
// it was getting an inhomogenous collection despite this not appearing to be the case when 
// inspecting the collection
var cumulAnomWithDoy = ee.ImageCollection(synopticCumulativeDailyAnomalies.map(function(img){
  return img.addBands(ee.Image.constant(img.get("doy")).rename("doy"));
})).cast({"precipitation":"float", "doy":"int"},["precipitation", "doy"]);
print(cumulAnomWithDoy, "cumulative anomalies with doy band");
// convert the collection to a single image with 2D array pixels, where the arrays have the bands across one 
// dimension and the values of those bands across the original images across the other dimension
var imageOfArrays = cumulAnomWithDoy.toArray();
// for reference of how the toarray function has built the array
var arrayAxes = {image:0, band:1};
var dataBandIndex = 0; 
// at each location, sort the array by the first band, keeping other bands - do this by first
// getting an array that's just the original data band values, not the doy values, and use this as the keys
// to sort in the natural (ascending) order
var sortKeys = imageOfArrays.arraySlice(arrayAxes.band, 0, 1);
// sort the main array by the values of that
var sortedPixelsImage = imageOfArrays.arraySort(sortKeys);
// now at each location, the max value and its associated doy are at the last array postion
var arrLength = sortedPixelsImage.arrayLength(arrayAxes.image);
var maxAnomValues = sortedPixelsImage.arraySlice(arrayAxes.image, arrLength.subtract(1), arrLength);
var minAnomValues = sortedPixelsImage.arraySlice(arrayAxes.image, 0, 1);
print("max arr", maxAnomValues);
print("min arr", minAnomValues);
var maxImage = maxAnomValues.arrayProject([arrayAxes.band]).arrayFlatten([['precipitation', 'doy']]);
var minImage = minAnomValues.arrayProject([arrayAxes.band]).arrayFlatten([['precipitation', 'doy']]);
var maxDoyImage = maxImage.select(1);//.cast({"doy":"int"});
var minDoyImage = minImage.select(1);
print("max image", maxDoyImage);
print("min image", minDoyImage);
Map.addLayer(maxDoyImage, {min:0,max:365, palette:palettes.HUE_WHEEL}, "DoY End of Wet Season");
Map.addLayer(minDoyImage, {min:0,max:365, palette:palettes.HUE_WHEEL}, "DoY Start of Wet Season");
var somewhereWet = ee.Geometry.Point([8,8]);
Map.centerObject(somewhereWet, 6);
Map.addLayer(somewhereWet, {palette:'0000ff'}, 'somewhere wet');
var chart = Chart.image.series(synopticCumulativeDailyAnomalies, somewhereWet, ee.Reducer.mean(), 10, "doy");
print(chart);
//print(chirpsAnnualMeans);
//print(chirpsJulianMeans);
var legendPanel = makeLegend([
  [palettes.HUE_WHEEL, 
   ["Jan 1", "Jul 1", "Dec 31"], 
   "Wet Season", 
   "DoY (Day of year) of start/end of wet season", 
   "Based on CHIRPS daily 1981-2017"]]);
Map.add(legendPanel);
```