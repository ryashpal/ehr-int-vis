import readData from '../services/FHIRUtils.js'
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import DataFrame from 'dataframe-js';

import AMRSummaryPlots from './AMRSummaryPlots.jsx';


function AMRSummary() {

	const [searchParams] = useSearchParams();
	const name = searchParams.get('name');
	const lowerRiskScore = searchParams.get('lowerRiskScore');
	const higherRiskScore = searchParams.get('higherRiskScore');
	const fromDate = searchParams.get('fromDate');
	const toDate = searchParams.get('toDate');

	const [geneData, setGeneData] = useState([{
		'data': [{
			type: 'bar',
			x: [],
			y: [],
			orientation: 'h'
		}],
		'layout': {
			title: { text: 'Genes Count' },
			yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol' },
			xaxis: { title: 'Count' }
		}
	}]);
	const [amrClassData, setAmrClassData] = useState([{
		'data': [{
			type: 'pie',
			values: [],
			labels: [],
		}],
		'layout': {
			title: { text: 'AMR Mechanisms' },
		}
	}]);

	function mergeData(oldX, oldY, groupedDf) {
		if (!oldX || !oldY || (oldX.length == 0) || (oldY.length == 0)) {
			groupedDf = groupedDf.filter(row => row.get('type') !== 'NA');
			return [groupedDf.select('count').toArray().flat(), groupedDf.select('type').toArray().flat()]
		}
		var oldDf = new DataFrame({ 'column1': oldY, 'column2': oldX }, ['type', 'count'])
		var unionDf = groupedDf.union(oldDf).groupBy('type').aggregate(group => group.stat.sum('count')).renameAll(['type', 'count']).sortBy('count', true)
		unionDf = unionDf.filter(row => row.get('type') !== 'NA');
		return [unionDf.select('count').toArray().flat(), unionDf.select('type').toArray().flat()]
	}

	function refreshData() {
		setGeneData([{
			'data': [{
				type: 'bar',
				x: [],
				y: [],
				orientation: 'h'
			}],
			'layout': {
				title: { text: 'Genes Count' },
				yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol' },
				xaxis: { title: 'Count' }
			}
		}])
		setAmrClassData([{
			'data': [{
				type: 'pie',
				values: [],
				labels: [],
			}],
			'layout': {
				title: { text: 'AMR Mechanisms' },
			}
		}])
		DataFrame.fromCSV('https://raw.githubusercontent.com/ryashpal/ehr-int-vis/main/genomic_data/index_saur.csv').then(df => {
			readData(
				'http://10.172.235.4:8080/fhir/Patient?name=' + name
				+ '&_has:RiskAssessment:subject:probability=ge' + lowerRiskScore
				+ '&_has:RiskAssessment:subject:probability=le' + higherRiskScore
				+ ((fromDate == '') ? '' : '&_has:Encounter:subject:date-start=ge' + fromDate)
				+ ((toDate == '') ? '' : '&_has:Encounter:subject:date-start=le' + toDate)
			).then(response => {
				let patientIds = new Set();
				response.map(resourceBundle => {
					if ('entry' in resourceBundle) {
						resourceBundle.entry.map(entry => {
							patientIds.add(entry.resource.id.substring(1,))
						})
					}
				})
				let mappingDf = df.filter(row => patientIds.has(row.get('PATIENT_ID')));
				mappingDf.map((row) => {
					DataFrame.fromTSV(row.get('amr_file')).then(df => {
						let geneGroupedDf = df.groupBy('Gene symbol').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
						let amrClassGroupedDf = df.groupBy('Class').aggregate(group => group.count()).sortBy('aggregation', true).renameAll(['type', 'count'])
						setGeneData(oldData => {
							let [newX, newY] = mergeData(oldData[0].x, oldData[0].y, geneGroupedDf)
							var data = [{
								type: 'bar',
								x: newX,
								y: newY,
								orientation: 'h',
								marker: {
									color: '#cdb4db',
								},
							}];
							var layout = {
								title: { text: 'Genes Count' },
								yaxis: { showticklabels: true, type: 'category', title: 'Gene Symbol', "categoryorder": "array", "categoryarray": newY },
								xaxis: { title: 'Count' }
							}
							return ([{ 'data': data, 'layout': layout }])
						})
						setAmrClassData(oldData => {
							let [newX, newY] = mergeData(oldData[0].values, oldData[0].labels, amrClassGroupedDf)
							var data = [{
								type: 'pie',
								values: newX,
								labels: newY,
								marker: {
									colors: [
										'#FDE4CF',
										'#FFCFD2',
										'#F1C0E8',
										'#CFBAF0',
										'#A3C4F3',
										'#90DBF4',
										'#8EECF5',
										'#98F5E1',
										'#B9FBC0',
										'#FBF8CC',
									]
								},
							}];
							var layout = {
								title: { text: 'AMR Mechanisms' },
							}
							return ([{ 'data': data, 'layout': layout }])
						})
					})
				})
			})
		}
		);
	}

	useEffect(() => {
		refreshData()
	}, []);

	return (
		<>
			<AMRSummaryPlots geneData={geneData[0]} amrClassData={amrClassData[0]}></AMRSummaryPlots>
		</>
	);
}

export default AMRSummary;
