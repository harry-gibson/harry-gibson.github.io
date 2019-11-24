## Accessibility Mapping Tool

#### *Creation of an interactive public tool for generating accessibility maps*

<img src="images/accessibility/Accessibility_World_BLK.png?raw=true"/>

**Accessibility Maps** 

I was a co-author on the paper "A global map of travel time to cities to assess inequalities in accessibility in 2015", <a href="https://www.nature.com/articles/nature25181" target="_blank">published in Nature</a> in 2018 (more information is available <a href="https://map.ox.ac.uk/research-project/accessibility_to_cities/" target="_blank">here</a>).

The published map gives a global summary of the travel time to the nearest of a pre-determined set of cities. To support this work and extend its utility I created a <a href="https://access-mapper.appspot.com/" target="_blank">web application</a> which enables users to create their own accessibility maps, by providing their own locations to which they can determine the accessibility.

The application is written in Python and Javascript and is hosted in <a href="https://cloud.google.com/appengine/" target="_blank">Google App Engine</a>. 

It uses <a href="https://earthengine.google.com/" target="_blank">Google Earth Engine</a> for the spatial data processing to calculate the accessibility map from the user-supplied points, and to export the results to a GeoTIFF file for offline use.

The code behind the tool is in <a href="https://github.com/harry-gibson/ee-access-tool/tree/master" target="_blank">this repository.</a>
