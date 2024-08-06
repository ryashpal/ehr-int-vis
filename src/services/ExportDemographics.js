import downloadCSV from '../utils/FileExport';
import readData from './FHIRUtils';


const exportDemographics = (name, lowerRiskScore, higherRiskScore, fromDate, toDate) => {

    readData(
        'http://10.172.235.4:8080/fhir/Patient?name=' + name
        + '&_has:RiskAssessment:subject:probability=ge' + lowerRiskScore
        + '&_has:RiskAssessment:subject:probability=le' + higherRiskScore
        + ((fromDate == '') ? '' : '&_has:Encounter:subject:date-start=ge' + fromDate)
        + ((toDate == '') ? '' : '&_has:Encounter:subject:date-start=le' + toDate)
    ).then(async response => {
        var patientData = []
        response.map(resourceBundle => {
            if ('entry' in resourceBundle) {
                resourceBundle.entry.map(entry => {
                    let row = {
                        'patient_id': entry.resource.id,
                        'gender': entry.resource.gender,
                        'birth_date': entry.resource.birthDate,
                    };
                    patientData.push(row)
                })
            }
        })
        var data = [['patient_id', 'encounter_id', 'gender', 'birth_date']]
        for (var row of patientData) {
            let responses = await readData('http://10.172.235.4:8080/fhir/Encounter?subject=' + row['patient_id'] + '&_sort=date&_offset=0&_count=20')
            for (let response of responses) {
                if ('entry' in response) {
                    for (let entry of response.entry) {
                        let dataRow = [
                            row['patient_id'].substring(1),
                            entry.resource.id.substring(1),
                            row['gender'],
                            row['birth_date']
                        ];
                        data.push(dataRow)
                    }
                }
            }
        }
        downloadCSV('demographics_' + name + '_' + lowerRiskScore + '_' + higherRiskScore + '_' + fromDate + '_' + toDate, data)
    })
}


export default exportDemographics;
