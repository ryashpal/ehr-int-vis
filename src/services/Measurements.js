const data = () => {
    let result = [];
    for (let i = 0; i < 11; i++) {
        let obj = {
        region: "Temperature",
        date: new Date(2021, i, 1).toDateString().slice(4),
        vitals: Math.floor(Math.random() * 500) + 500,
        };
        result.push(obj);
    }
    for (let i = 0; i < 11; i++) {
        let obj = {
        region: "Systolic BP",
        date: new Date(2021, i, 1).toDateString().slice(4),
        vitals: Math.floor(Math.random() * 500) + 500,
        };
        result.push(obj);
    }
    for (let i = 0; i < 11; i++) {
        let obj = {
        region: "Diastolic BP",
        date: new Date(2021, i, 1).toDateString().slice(4),
        vitals: Math.floor(Math.random() * 500) + 500,
        };
        result.push(obj);
    }
    for (let i = 0; i < 11; i++) {
        let obj = {
        region: "Pulse rate",
        date: new Date(2021, i, 1).toDateString().slice(4),
        vitals: Math.floor(Math.random() * 500) + 500,
        };
        result.push(obj);
    }
    for (let i = 0; i < 11; i++) {
        let obj = {
        region: "Respiration rate",
        date: new Date(2021, i, 1).toDateString().slice(4),
        vitals: Math.floor(Math.random() * 500) + 500,
        };
        result.push(obj);
    }

    return result;
};

export default data;
