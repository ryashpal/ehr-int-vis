import downloadCSV from '../utils/FileExport';
import readData from './FHIRUtils';


const exportEHR = (name, lowerRiskScore, higherRiskScore, fromDate, toDate) => {

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
        var data = [['observation_id', 'patient_id', 'encounter_id', 'observation_type_id', 'observation_type', 'value', 'effectiveDateTime']]
        for (var patientId of patientIds) {
            let responses = await readData('http://10.172.235.4:8080/fhir/Observation?subject=' + patientId + '&_sort=date&_offset=0&_count=20')
            for (let response of responses) {
                if ('entry' in response) {
                    for (let entry of response.entry) {
                        let row = [
                            entry.resource.id.substring(1),
                            entry.resource.subject.reference.substring(9),
                            entry.resource.encounter.reference.substring(11),
                            entry.resource.code.coding[0].code,
                            entry.resource.code.coding[0].display,
                            entry.resource.valueQuantity.value,
                            entry.resource.effectiveDateTime.substring(0, 10)
                        ];
                        data.push(row)
                    }
                }
            }
        }
        downloadCSV('observations_' + name + '_' + lowerRiskScore + '_' + higherRiskScore + '_' + fromDate + '_' + toDate, data)
    })
}


export default exportEHR;
