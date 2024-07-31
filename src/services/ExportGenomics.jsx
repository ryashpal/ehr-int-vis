import DataFrame from 'dataframe-js';

import downloadCSV from '../utils/FileExport';
import readData from './FHIRUtils';


const exportGenomics = (name, lowerRiskScore, higherRiskScore, fromDate, toDate) => {

    readData(
        'http://10.172.235.4:8080/fhir/Patient?name=' + name
        + '&_has:RiskAssessment:subject:probability=ge' + lowerRiskScore
        + '&_has:RiskAssessment:subject:probability=le' + higherRiskScore
        + ((fromDate == '') ? '' : '&_has:Encounter:subject:date-start=ge' + fromDate)
        + ((toDate == '') ? '' : '&_has:Encounter:subject:date-start=le' + toDate)
    ).then(async response => {
        let patientIds = new Set();
        response.map(resourceBundle => {
            if ('entry' in resourceBundle) {
                resourceBundle.entry.map(entry => {
                    patientIds.add(entry.resource.id)
                })
            }
        })
        var data = [['patient_id', 'tube_id', 'idx', 'token_type_id', 'token']]
        var dfs = null
        for (var patientId of patientIds) {
            let responses = await readData('http://10.172.235.4:8080/fhir/MolecularSequence?subject=' + patientId)
            for (let response of responses) {
                if ('entry' in response) {
                    for (let entry of response.entry) {
                        for (let formatted of entry.resource.formatted) {
                            if (formatted.title == 'Remap info file') {
                                console.log('formatted.url: ', formatted.url)
                                var df = await DataFrame.fromCSV(formatted.url)
                                df = df.withColumn('tube_id', () => entry.resource.id)
                                df = df.withColumn('patient_id', () => patientId)
                                if (dfs == null) {
                                    dfs = df.select('patient_id', 'tube_id', 'idx', 'token_type_id', 'token')
                                } else {
                                    dfs = dfs.union(df.select('patient_id', 'tube_id', 'idx', 'token_type_id', 'token'))
                                }
                            }
                        }
                    }
                }
            }
        }
        downloadCSV('tokens_' + name + '_' + lowerRiskScore + '_' + higherRiskScore + '_' + fromDate + '_' + toDate, data.concat(dfs.toArray()))
    })
}


export default exportGenomics;
