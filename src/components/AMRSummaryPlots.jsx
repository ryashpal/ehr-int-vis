import React from 'react';

import Plot from 'react-plotly.js';


function AMRSummaryPlots(props) {

    return (
        <>
            <div className="flex-col items-center grid-cols-1">
                <h2 className="text-4xl font-extrabold dark:text-white flex items-center justify-center">AMR Summary</h2>
                <div className="flex items-center">
                    <Plot
                        data={props.geneData.data}
                        layout={props.geneData.layout}
                    >
                    </Plot>
                </div>
                <div className="flex items-center">
                    <Plot
                        data={props.amrClassData.data}
                        layout={props.amrClassData.layout}
                    >
                    </Plot>
                </div>
            </div>
        </>
    );
}

export default AMRSummaryPlots;
