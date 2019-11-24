## Accessibility Mapping Tool

#### *Creation of an interactive public tool for generating accessibility maps*

<img src="images/accessibility/Accessibility_World_BLK.png?raw=true"/>

**Accessibility Maps** 

I was a co-author on the paper "A global map of travel time to cities to assess inequalities in accessibility in 2015", [published](https://www.nature.com/articles/nature25181){:target="_blank"}  in Nature in 2018 (more information is available [here](https://map.ox.ac.uk/research-project/accessibility_to_cities/).){:target="_blank"} 

The published map gives a global summary of the travel time to the nearest of a pre-determined set of cities. To support this work and extend its utility I created a [web application](https://access-mapper.appspot.com/) which enables users to create their own accessibility maps, by providing their own locations to which they can determine the accessibility.

The application is written in Python and Javascript and is hosted in [Google App Engine](https://cloud.google.com/appengine/). It uses [Google Earth Engine](https://earthengine.google.com/) for the spatial data processing to calculate the accessibility map from the user-supplied points, and to export the results to a GeoTIFF file for offline use.


