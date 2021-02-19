---
permalink: "/pages/dhs-survey-data"
---

## Demographic and Health Survey data processing

#### *Reverse-engineering and recovering the relational structure of published survey data to transform the feasible scope of analysis*

### About the work
The <a href="https://www.dhsprogram.com/" target="_blank">Demographic and Health Surveys (DHS) Program</a> is a US-based and funded organisation that conducts large-scale household surveys and makes the data available for research. Surveys are conducted around the developing world, from Afghanistan to Zimbabwe.

The surveys are large undertakings: each consists of several hundred questions that are asked of thousands of respondents. Questions cover everything from how many motorbikes are owned by a household, to the type of treatment a child had for fever. The surveys are a fundamentally important source of data not just to the Malaria Atlas Project but to many other researchers in global public health. 

DHS provide many ways of obtaining the data. They are available (to registered users) in their raw form, and also as standardised summaries called "indicators" which give e.g. country-level aggregated summaries of variables such as malaria prevalence.

For most of the work we do, we need the raw data, tied to its spatial locations (which are published by the DHS as "cluster" points) - this enables the survey results at a location to be compared to covariate values in order to train the geostatistical models.

The challenge we face is processing the raw data from hundreds of surveys in such a way that we can extract common datasets across a wide range of surveys. DHS release the data in pre-assembled tables called "recodes", which are effectively <a href='https://medium.com/@katedoesdev/normalized-vs-denormalized-databases-210e1d67927d' target='_blank'>denormalised</a> copies of the data. These tables have hundreds or thousands of columns and are hard enough to query systematically for a single survey, never mind joining results from multiple surveys. If we wish to extract information that is included in different recodes, it can be very hard to match the different subsets back together.

### What I did
Alongside the "recode" data, which is available in flat-file formats such as Stata and SPSS, a further download format is available which DHS call a "hierarchical format". It turns out that these data are in the native format of the <a href='https://www.census.gov/data/software/cspro.html' target='_blank'>CSPro survey application</a> and they split the data into many logically consistent and more manageable tables. 

I reverse-engineered this format, and wrote Python code which takes these data files and splits them into the individual tables. I further determined that once loaded to a relational database these tables can consistently be joined to one another to enable arbitrary queries to be constructed to extract whatever information is necessary. The code I wrote to obtain and pre-process the data into a relational database can all be found in <a href='https://github.com/harry-gibson/DHS-To-Database/' target='_blank'>this repository</a>.

This work has meant that we in MAP can run extractions from the DHS database across all their surveys with relative ease. This has enabled a lot of new research, which has led to numerous important publications. A few recent examples include:

--- 
### Mapping changes in housing in sub-Saharan Africa from 2000 to 2015

<img src="../images/dhs/africa_housing_crop.jpeg?raw=true"/>

This study, <a href='https://www.nature.com/articles/s41586-019-1050-5' target='_blank'>published in Nature in 2019</a>, models the prevalence of "improved" housing (that is, housing made from durable materials, with clean water and sanitation and sufficient space) across Africa over time. 

The study was enabled by DHS data I extracted from 62 separate surveys across sub-saharan Africa. Based on the relational database I had reconstructed, from each survey I extracted information on household construction, sanitation, and size, and collated this into a single coherent dataset for use in the geostatistical modelling.

This study forms part of a series investigating housing quality, wealth factors, and the relationship they have with childhood health outcomes. The code I wrote for extracting the datasets used in all of these studies, along with further description, can be found <a href="https://github.com/harry-gibson/DHS-Data-Extractions/tree/main/Building_Quality_And_Child_Health" target="_blank">here</a>.

---
### Treatment seeking rates in malaria endemic countries.

This study, <a href='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4709965/' target='_blank'>published in 2016</a>, models the rate of "treatment seeking" for fever. That is, when children have fever, how likely is it that they will receive medical attention, and what type of facility will they be treated at?

<img src="../images/dhs/treatment_seeking.jpg?raw=true"/>

Because of how the information is structured in these surveys, with different questions every time, the SQL needed to extract the information into a standard output is different for every survey. So I wrote this as a two stage algorithm:
- Firstly the exact questions asked in each survey are extracted to a single table. This table is then edited by a researcher, to identify which question phrasings are of interest
- Next this table is used to generate SQL code specific to each survey. An FME workbench was used to read the table and write the SQL.
- The SQL was then executed for each survey in turn, producing consistent outputs for the modellers

The FME workbench which generates and executes the SQL files, and samples of the output it produces, can be found <a href="https://github.com/harry-gibson/DHS-Data-Extractions/tree/main/Fever_Seeking_Treatment" target="_blank">here</a>.

This work has been regularly updated since the 2016 publication and it now forms a key part of the malaria modelling in the <a href="http://www.healthdata.org/gbd" target="_blank">Global Burden of Disease</a> study.

---
### DHS Indicator Data reverse-engineering

The DHS publish a large number of "indicators" which are summaries of their data, aggregated to the national or subnational (regional) level. These are intended to provide a way of comparing information across surveys, as they are available in one place for a large number of the surveys, and can be downloaded through sources such as <a href="https://www.statcompiler.com/en/" target="_blank">STATcompiler</a>.

However as these indicators are aggregations they are not helpful for fine-scale spatial modelling. Although the DHS calculate the aggregated indicators themselves, they did not have the means to do so at a cluster level, and so the DHS asked us to do this on their behalf.

My work on producing a relational database of the raw survey data which can then be queried across surveys enables calculation of the indicators at the cluster (point) level, and so I reverse-engineered and calculated a number of their indicators at the cluster level. The code I produced is available in <a href="https://github.com/harry-gibson/DHS-Data-Extractions/tree/main/DHS_Indicator_Recreation" target="_blank">this folder</a>. 

These point estimates were then used in a geostatistical model to produce pixel-level continuous estimates for those indicators. Those pixel-level maps are now published by the DHS themselves on their <a href="http://spatialdata.dhsprogram.com/modeled-surfaces/" target="_blank">Spatial Data Repository</a>

For example this image shows the percentage of children with stunted growth in Nigeria in 2013, based on the point-level indicator data I created:

<img src="../images/dhs/nigeria_stunting_pct_2013.png?raw=true"/>
