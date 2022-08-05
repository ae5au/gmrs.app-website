import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

async function load() {
  const worker = await createDbWorker(
    [
      {
        from : "jsonconfig",
        configUrl : "/config.json"
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

  var queryString = window.location.search;
  console.log("qs-search:", queryString.search(/^\?[a-zA-Z0-9]{1,7}$/))
  if(queryString.search(/^\?[a-zA-Z0-9]{1,7}$/) == 0){
    var callsign = queryString.toUpperCase().replace("?","")
    console.log("Callsign:",callsign)
    const frnlookup : any  = await worker.db.query(`select frn from licenses WHERE callsign = ?`, [callsign]);
    if(frnlookup.length > 0){
        const frn = frnlookup[0]['frn']
        console.log("FRN: ", frn)
        const licenses : any = await worker.db.query(`select * from licenses WHERE frn = ?`, [frn]);
        console.log(JSON.stringify(licenses, null, 2))
        if(licenses.length > 0){
            const results = document.getElementById("results")
            if(results) {
                licenses.forEach(function(item : any){
                    var resultDiv = document.createElement('div');
                    resultDiv.className = 'hero-sm bg-gray'
                    results.appendChild(resultDiv);
                    
                    var divider = document.createElement('div')
                    divider.className = "divider text-center"
                    resultDiv.appendChild(divider)

                    var callSpan = document.createElement('span');
                    callSpan.className = 'h2'
                    callSpan.id = 'callsign'
                    callSpan.textContent = item.callsign
                    resultDiv.appendChild(callSpan);

                    var nameDiv = document.createElement('div');
                    nameDiv.className = 'name'
                    nameDiv.textContent = item.name
                    resultDiv.appendChild(nameDiv);

                    var cityDiv = document.createElement('div');
                    cityDiv.className = 'address'
                    cityDiv.textContent += item.city + ', ' + item.state + ' ' + item.zip
                    resultDiv.appendChild(cityDiv);

                    var serviceDiv = document.createElement('div');
                    serviceDiv.className = 'service'
                    serviceDiv.textContent += item.service
                    if(item.class){serviceDiv.textContent += ' ' + item.class}
                    if(item.prevcall){serviceDiv.textContent += ' ' + item.prevcall}
                    resultDiv.appendChild(serviceDiv);

                })
            }
        }
    } else {
        const results = document.getElementById("results")
        if(results){results.textContent = "No license found.";}
        console.log("No FRN found")
    }
  }
}

load();
