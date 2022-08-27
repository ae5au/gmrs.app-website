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
  var queryStringCheck = queryString.search(/^\?[a-zA-Z0-9]{1,7}(\&.*)?$/);
  console.log("qs-search:", queryStringCheck);

  if(queryStringCheck == 0){
    var callsign = queryString.toUpperCase().replace(/^\?([a-zA-Z0-9]{1,7})(\&.*)?$/g,"$1");
    console.log("Callsign:",callsign)
    if(search_box){search_box.value = callsign}

    const frnlookup : any  = await worker.db.query(`select frn from licenses WHERE callsign = ? OR prevcall = ? LIMIT 1`, [callsign,callsign]);
    if(frnlookup.length > 0){
      const frn = frnlookup[0]['frn']
      console.log("FRN: ", frn)
      const licenses : any = await worker.db.query(`select * from licenses WHERE frn = ?`, [frn]);
      console.log(JSON.stringify(licenses, null, 2))
      if(licenses.length > 0){
        const results = document.getElementById("results")
        if(results) {

          const columns = document.createElement('div')
          columns.className = 'columns';
          results.appendChild(columns);
          
          licenses.forEach(function(item : any){
            var column = document.createElement('div');
            column.className = 'column col-6 col-sm-12';
            columns.appendChild(column);
            
            var card = document.createElement('div');
            card.className = 'card card-shadow';
            column.appendChild(card);

            var cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            card.appendChild(cardHeader);
            
            var cardTitle = document.createElement('div');
            cardTitle.className = 'card-title h2';
            cardTitle.textContent = item.callsign;
            cardHeader.appendChild(cardTitle);

            var cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            cardBody.innerText = item.name + '\n' + item.city + ', ' + item.state + ' ' + item.zip;
            card.appendChild(cardBody);
            
            var cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';
            cardFooter.textContent += item.service
            if(item.class){cardFooter.textContent += ' ' + item.class}
            if(item.prevcall){cardFooter.textContent += ' ' + item.prevcall}
            card.appendChild(cardFooter);
          })
        }
      }
      if(licenses.length > 0) {
        const street = licenses[0].street
        const city = licenses[0].city
        const state = licenses[0].state
        console.log("Looking for alternates", street,city,state)
        const possible_licenses = await worker.db.query(`select * from licenses WHERE street = ? AND city = ? AND state = ? AND frn != ?`, [street,city,state,frn]);
        console.log(JSON.stringify(possible_licenses, null, 2))

        if(possible_licenses.length > 0){

          const results = document.getElementById("results")
          if(results) {

            var divider = document.createElement('div');
            divider.className = 'divider text-center'
            divider.setAttribute('data-content','POSSIBLE MATCHES');
            results.appendChild(divider);

            const columns = document.createElement('div')
            columns.className = 'columns';
            results.appendChild(columns);
            
            possible_licenses.forEach(function(item : any){
              var column = document.createElement('div');
              column.className = 'column col-6 col-sm-12';
              columns.appendChild(column);
              
              var card = document.createElement('div');
              card.className = 'card card-shadow';
              column.appendChild(card);
  
              var cardHeader = document.createElement('div');
              cardHeader.className = 'card-header';
              card.appendChild(cardHeader);
              
              var cardTitle = document.createElement('div');
              cardTitle.className = 'card-title h2';
              cardTitle.textContent = item.callsign;
              cardHeader.appendChild(cardTitle);
  
              var cardBody = document.createElement('div');
              cardBody.className = 'card-body';
              cardBody.innerText = item.name + '\n' + item.city + ', ' + item.state + ' ' + item.zip;
              card.appendChild(cardBody);
              
              var cardFooter = document.createElement('div');
              cardFooter.className = 'card-footer';
              cardFooter.textContent += item.service
              if(item.class){cardFooter.textContent += ' ' + item.class}
              if(item.prevcall){cardFooter.textContent += ' ' + item.prevcall}
              card.appendChild(cardFooter);
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
