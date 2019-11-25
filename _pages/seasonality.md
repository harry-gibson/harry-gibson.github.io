---
permalink: "/pages/seasonality"
---

## Seasonality of precipitation

#### *Using Google Earth Engine to classify precipitation regimes for modelling malaria seasonality*

Historically, continent-wide and global maps of malaria burden have been produced on an annual basis. The data that we have on malaria occurrence are often either only available annually, or are so sparse that we need to aggregate them to annual periods in order to have a usefully large body of evidence to create models from. 

As more and better data become available there's increasing interest in predicting malaria at finer time-steps, such as monthly, and thus getting a better understanding of the "seasonality" of malaria transmission. For example are there one, two, or more annual "peaks" in transmission? When do these occur?

This modelling in turn will need covariate datasets to support it. I performed an analysis of how the seasonal patterns of rainfall vary, using Google Earth Engine. The image below shows in purple and blue the areas most characterised by one wet season, vs. (in yellow and red) the areas characterised by two or more distinct wet seasons.

<img src="../images/seasonality/bimodal_regions_africa.png?raw=true"/> 

The basic method is taken from <a href="https://journals.ametsoc.org/doi/10.1175/JCLI-D-11-00157.1" target="_blank">Liebmann et al (2012)</a> and consists of creating annual and twice-annual harmonic variables. We then fit a regression model between the rainfall data and each of these harmonic variables, and compare the extent to which they each fit: e.g. areas with one distinct wet season will have a better fit to the annual harmonic variable. Areas without a good fit to either variable are likely not to have distinct wet seasons.

<img src="../images/seasonality/ee-chart.png?raw=true"/> 

One advantage of Google Earth Engine is that a range of different precipitation datasets are readily available. The example shown here uses the <a href="https://www.chc.ucsb.edu/data/chirps" target="_blank">CHIRPS dataset</a>, which is valuable as it has a long period of record. The results can be explored in this Earth Engine App, or the code can be viewed here (requires login).

This helps in identifying areas likely to have one distinct wet season, vs. having two or more wet seasons or having rainfall more-or-less evenly distributed through the year. This in turn can be compared to patterns observed in the seasonality of malaria incidence data.