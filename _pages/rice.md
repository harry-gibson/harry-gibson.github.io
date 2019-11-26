---
permalink: "/pages/rice"
---

## Paddy Rice Mapping

#### *Implementation of complex algorithms in Google Earth Engine for analysis of MODIS data*

In the <a href="https://map.ox.ac.uk/" target="_blank">Malaria Atlas Project</a>, my researcher colleagues wished to get a better understanding of the locations of paddy / irrigated rice growing in the malaria-endemic world. 

This form of agriculture is characterised by flooded fields and standing water, conditions which may also encourage malaria-carrying mosquitoes. It has been suggested that increases in malaria transmission in some countries may be connected to more widespread growing of irrigated rice, and so we wished to see if maps of irrigated rice were a useful covariate for our malaria models.

<img src="../images/rice/rice_squareish.png?raw=true"/>

Such data are not often available at the fine spatial scales needed and so after a literature review I implemented <a href="https://www.sciencedirect.com/science/article/abs/pii/S0034425705003433" target="_blank">a model</a> (NB: paywall) which attempts to identify irrigated rice from remotely-sensed data. It's based on tracking changes over time in the perceived flooded/not flooded state of pixels, and of the "greenness" of those pixels. The basic thinking behind the model is that rice paddies are flooded before transplanting the small rice plants, which then grow rapidly, increasing the leaf cover.

Due to the very large amount of data that would need to be processed to run this model for each year of the MODIS period of record, this was an excellent candidate for <a href="https://earthengine.google.com/" target="_blank">Google Earth Engine</a>. Expressing the algorithm in the functional style used by Earth Engine took quite a lot of thought!

<a href="https://code.earthengine.google.com/dd88e851bfb3ff554654544b917b37b3" target="_blank">View the code</a> and run the model in the Earth Engine code editor (requires an Earth Engine account; if you don't have access then you can view a snapshot of the code [here](../code/rice_snapshot.js)).