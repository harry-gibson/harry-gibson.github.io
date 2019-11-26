/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var nationalBoundaries = ee.FeatureCollection("USDOS/LSIB/2013"),
    chirps_D = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY"),
    chirps_P = ee.ImageCollection("UCSB-CHG/CHIRPS/PENTAD");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/* Identify the extent to which precipitation can be said to have a single annual wet season,
   according to the method of Liebmann et al. https://journals.ametsoc.org/doi/10.1175/JCLI-D-11-00157.1
   
   Similar to Fourier decomposition, we fit an annual harmonic trend and a twice-annual harmonic trend to the data 
   at each location. The relative magnitude of the coefficients for the twice-annual and annual trends indicates which 
   better represents the seasonal pattern of the precipitation; if they are similar than it is likely that there is not a 
   cyclical seasonal pattern. We render this ratio using a colour scheme taken from the above-referenced paper (figure 6) 
   to allow easy comparison.
   
   For areas with an annual pattern, we can look at the phase coefficient (i.e. the relative contribtion of the sine and cosine
   terms) of the fitted model to determine when in the year the wet season is.  We use a hue wheel palette to render the data to 
   reflect its cyclical annual nature i.e. the min and max values are adjacent in colour
   
   Tips for parts of this implementation were drawn from the earth engine "Landsat8 Harmonic Modeling" sample.
*/
// Filter the collection to the period of interest
var chirps = chirps_P.filterDate("2000-01-01", "2018-01-01");
// Set the region of interest for charting / totals into variable roi as an ee.Geometry (could be point or polygon).
//var roi = ee.Geometry.Point([-121.14, 37.98]);
var ISO3 = "BWA";
var geoms = nationalBoundaries.filterMetadata("iso_alpha3", "equals", ISO3);
var bufferedboxes = geoms.map(
  function(f){
    return f.bounds().buffer(10000).bounds();
  });
var roi = bufferedboxes.union(ee.ErrorMargin(10));
// The dependent variable we are modeling i.e. the name of the data band in CHIRPS
var dependent = 'precipitation';
// The number of cycles per year to model (up to)
var harmonics = 2;
// Make a list of harmonic frequencies to model.
// These also serve as band name suffixes.
var harmonicFrequencies = ee.List.sequence(1, harmonics);
// Function to get a sequence of band names for harmonic terms.
var constructBandNames = function(base, list) {
  return ee.List(list).map(function(i) {
    return ee.String(base).cat(ee.Number(i).int());
  });
};
// Construct lists of names for the harmonic terms.
var cosNames = constructBandNames('cos_', harmonicFrequencies);
var sinNames = constructBandNames('sin_', harmonicFrequencies);
// Independent variables.
var independents = ee.List(['constant', 't'])
  .cat(cosNames).cat(sinNames);
// Function to add a time band, in terms of fractional years represented in radians
var addDependents = function(image) {
  // Compute time in fractional years since the epoch.
  var years = image.date().difference('2000-01-01', 'year');
  var timeRadians = ee.Image(years.multiply(2 * Math.PI)).rename('t');
  var constant = ee.Image(1);
  return image.addBands(constant).addBands(timeRadians.float());
};
// Function to compute the specified number of harmonics
// and add them as bands.  Assumes the time band is present.
var addHarmonics = function(freqs) {
  return function(image) {
    // Make an image of frequencies (one band for each item in the list freqs)
    var frequencies = ee.Image.constant(freqs);
    // This band should represent time in radians.
    var time = ee.Image(image).select('t');
    // Get the cosine terms.
    var cosines = time.multiply(frequencies).cos().rename(cosNames);
    // Get the sin terms.
    var sines = time.multiply(frequencies).sin().rename(sinNames);
    return image.addBands(cosines).addBands(sines);
  };
};
// Filter to the area of interest, add variables.
var harmonicChirps = chirps
  .filterBounds(roi)
  .map(addDependents)
  .map(addHarmonics(harmonicFrequencies));
  
// The output of the regression reduction is a 4x1 array image.
var harmonicTrend = harmonicChirps
  .select(independents.add(dependent))
  .reduce(ee.Reducer.linearRegression(independents.length(), 1));
// Turn the array image into a multi-band image of coefficients.
var harmonicTrendCoefficients = harmonicTrend.select('coefficients')
  .arrayProject([0])
  .arrayFlatten([independents]);
// Compute fitted values.
var fittedHarmonic = harmonicChirps.map(function(image) {
  return image.addBands(
    image.select(independents)
      .multiply(harmonicTrendCoefficients)
      .reduce('sum')
      .rename('fitted'));
});
// Plot the fitted model and the original data at the ROI.
print(ui.Chart.image.series(fittedHarmonic.select(['fitted','precipitation']), roi, ee.Reducer.mean(), 10000)
    .setOptions({
      title: 'Harmonic model: original and fitted values',
      lineWidth: 1,
      pointSize: 3,
}));
// Pull out the bands we're going to visualize.
var sin1 = harmonicTrendCoefficients.select('sin_1');
var cos1 = harmonicTrendCoefficients.select('cos_1');
var sin2 = harmonicTrendCoefficients.select('sin_2');
var cos2 = harmonicTrendCoefficients.select('cos_2');
// Do some math to turn the first-order (i.e. one cycle per year) Fourier model into
// hue, saturation, and value in the range[0,1].
var magnitude1 = cos1.hypot(sin1).multiply(5);
var phase1 = sin1.atan2(cos1).unitScale(-Math.PI, Math.PI);
var val = harmonicChirps.select('precipitation').reduce('mean');
// Turn the HSV data into an RGB image and add it to the map.
// Dark areas mean there's less precipitation. The next phase would be to mask 
// this image to only include areas where the ratio analysis suggests that an annual 
// cycle is reasonable.
var seasonality1 = ee.Image.cat(phase1, magnitude1, val).hsvToRgb();
Map.centerObject(roi, 9);
Map.addLayer(seasonality1, {}, 'Seasonal nature of annual-fit model');
Map.addLayer(roi, {}, 'ROI');
var magnitude2 = cos2.hypot(sin2).multiply(5);
print(magnitude1.reduceRegion({reducer:ee.Reducer.mean(), scale:10000, geometry:roi}));
print(magnitude2.reduceRegion({reducer:ee.Reducer.mean(), scale:10000, geometry:roi}));
// calculate the ratio between the magnitude of the twice-annual and annual fits. 
// Ratio >>1 means it's two wet seasons. <<1 means one wet season. ~1 means interderminate.
var ratio = magnitude2.divide(magnitude1);
var ratioStyle = '<RasterSymbolizer><Opacity>1.0</Opacity><ColorMap><ColorMapEntry color="#653896" quantity="0.25" label="0.25" opacity="1"/><ColorMapEntry color="#45439B" quantity="0.29" label="0.29" opacity="1"/><ColorMapEntry color="#3B54A4" quantity="0.33" label="0.33" opacity="1"/><ColorMapEntry color="#3559A7" quantity="0.4" label="0.4" opacity="1"/><ColorMapEntry color="#105990" quantity="0.5" label="0.5" opacity="1"/><ColorMapEntry color="#22A756" quantity="0.67" label="0.67" opacity="1"/><ColorMapEntry color="#4EB956" quantity="1" label="1" opacity="1"/><ColorMapEntry color="#9DCC4C" quantity="1.5" label="1.5" opacity="1"/><ColorMapEntry color="#F0EB32" quantity="2" label="2" opacity="1"/><ColorMapEntry color="#FCD924" quantity="2.5" label="2.5" opacity="1"/><ColorMapEntry color="#FCB22D" quantity="3" label="3" opacity="1"/><ColorMapEntry color="#F48030" quantity="3.5" label="3.5" opacity="1"/><ColorMapEntry color="#F0542E" quantity="4" label="4" opacity="1"/><ColorMapEntry color="#EE2B30" quantity="10" label=">4" opacity="1"/></ColorMap></RasterSymbolizer>';
var ratioStyled = ratio.sldStyle(ratioStyle);
Map.addLayer(ratioStyled, {}, 'Ratio of second to first harmonic')
var global_roi = ee.Geometry.Rectangle([-180,-50,180,50]); 
Export.image.toAsset(seasonality1, "chirps_phase1_mag1_val1", "CHIRPS_SEAS_1", {".default":"mean"}, "7200x2000"); 
//, global_roi, scale, crs, crsTransform, maxPixels)