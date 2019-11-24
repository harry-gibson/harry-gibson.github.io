---
permalink: "/pages/gapfilling"
---

## Gapfilling MODIS data

#### *Using high-performance Python libraries to enable raster processing algorithms to be run at scale*

The geostatistical models of malaria developed in the Malaria Atlas Project require a wide range of covariate datasets in the form of raster data (images), to link to the locations for which we have malaria data and then use to make predictions elsewhere.

<img src="../images/gapfilling/modis_globe_evi_AF_white.png?raw=true"/>

In order to create continuous surfaces of predicted malaria burden (i.e. without gaps), we need covariate datasets that are also without gaps. Unfortunately remotely sensed data often have a *lot* of gaps, primarily caused when the satellite cannot "see" the ground due to cloud cover.

So a major task for us is to fill these gaps in the data with reasonable estimates for what the true values might have been. (Of course, these can only be estimates, not the truth!) 

With many thousands of gigapixel-scale images to process, this gapfilling is a substantial undertaking. I use <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4308023/" target="_blank">algorithms</a> that were developed by a colleague, and take advantage of the whole period the satellites have been operational for to fill gaps by looking at what value the data had for the same time in other years, as well as the data in areas surrounding the gap.

The problem was that the existing implementation of these methods had been applied to Africa, but it simply was not fast enough to feasibly be run for the whole world. I reimplemented the code (previously written in <a href="https://www.harrisgeospatial.com/Software-Technology/IDL" target="_blank">IDL</a>) in Python, using various techniques for creating high-performance Python code, in particular the Cython extension. This enables the most intensive parts of the processing to be translated to optimised C code, as well as allowing the algorithms to take advantage of multiple processing cores.

The code I wrote, and use to create the gapfilled covariates used in MAP, can be found in <a href="https://github.com/harry-gibson/modis-gapfilling" target="_blank"> this repository.
