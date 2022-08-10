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

  const search_icon = document.getElementById("call_search_icon");
  const search_box = document.getElementById("call_search") as HTMLInputElement | null;

  var queryString = window.location.search;
  console.log("qs-search:", queryString.search(/^\?[a-zA-Z0-9]{1,7}$/));

  if(queryString.search(/^\?[a-zA-Z0-9]{1,7}$/) == 0){
    var callsign = queryString.toUpperCase().replace("?","")
    console.log("Callsign:",callsign)
    if(search_box){search_box.value = callsign}

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
      if(licenses.length > 0) {
        const street = licenses[0].street
        const city = licenses[0].city
        const state = licenses[0].state
        console.log("Looking for alternates", street,city,state)
        //const possible_licenses = await worker.db.query(`select * from licenses WHERE street = ? AND city = ? AND state = ?`, [street],[city],[state]);
        // Not sure why multiple parameters aren't working
        const possible_licenses = await worker.db.query(`select * from licenses WHERE street = '${street}' AND city = '${city}' AND state = '${state}' AND frn != '${frn}'`);
        console.log(JSON.stringify(possible_licenses, null, 2))

        if(possible_licenses.length > 0){

          const results = document.getElementById("results")
          if(results) {

            var divider = document.createElement('div');
            divider.className = 'divider text-center'
            divider.setAttribute('data-content','POSSIBLE MATCHES');
            results.appendChild(divider);

            possible_licenses.forEach(function(item : any){
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
      }
    } else {
      const results = document.getElementById("results")
      if(results){results.textContent = "No license found.";}
      if(search_box){search_box.classList.add("is-error");}
      console.log("No FRN found")
    }
  }
  if(search_icon){search_icon.classList.remove("loading")}
}

load();
