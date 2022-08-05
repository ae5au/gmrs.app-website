# gmrs.app-website
Lookup for amateur and GMRS radio licensees.  Cross-referencing for those that hold both licenses.

## Premise
Many GMRS radio operators are also licensed amateur radio operators. If you know an operator's call sign for one service, this app helps find the record for the other service. Even if the operator isn't licensed on the other service, you can lookup their details.

Note that the match is based on the FRN (FCC registration number). A few things to remember:
* GMRS licenses can be shared by a whole family. The app will match to the holder of the GMRS license, but that might not be the person legitimately using the call sign.
* Some people have different FRNs for each license. The app doesn't try to match on name, address, or anything other than FRN.
  * This isn't how the FCC indends things to be, but it happens. I don't know how much.

A scheduled workflow downloads the data weekly when the [FCC publishes new full files](https://www.fcc.gov/uls/transactions/daily-weekly). Currently that is scheduled for 0700 UTC on Monday morning.

## Tech bits
The site runs totally in the browser with no server processing other than serving the static files. How do we query a database with over a million total records from the browser without using a lot of data transfer? Magic! Well, not exactly...

[sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs/) from [phiresky](https://github.com/phiresky) is a virtual file system wrapper around a WebAssembly client for SQLite. It allows a browser to query a database hosted on a static file hoster without fully downloading the database. It depends on a good/simple database and index structure which is a great fit for this application. It also depends on the hoster supporting HTTP range requests and responding with only the specific part of the file requested.

The site is currently hosted on GitHub Pages which works well. I might move to Cloudflare Pages if they implement range requests (they are supposed to be working on it).

There is a Python script that downloads the files from the FCC, parses the needed tables into a SQLite in-memory DB, and then joins only the needed data into a SQLite file. That file is then indexed, optimized, and split into chunks.

The site is written in Node.js and packaged with webpack. This was my first experience with Node. I'm sure there are plenty of things to improve. PRs are welcome!

## Development
* Prerequisite: node and npm installed and working. I'm using v16. It might work with older versions :man_shrugging:
* Clone the repo.
* Inside the repo directory: ```npm install```
* Build and start local http server: ```npx webpack --mode=development && npx http-server```
* Build the data one of two ways:
  * Run ```python3 dev_data.py``` in the site directory. (Easiest and quickest! Pulls DB files from gmrs.app)
  * Create a 'data' directory and run parse_data.py
    * May require tweaking and moving the files around after it runs, but gives more control over the DB build process.
    * Pulls a single file that is more convenient if you want to manually query it with a SQLite client.
    * create_db.sh can be used to break the DB file into chunks and create the JSON config file needed for sql.js-httpvfs to reference the DB.
* [Spectre.css](https://github.com/picturepan2/spectre) framework used for UI. [Docs](https://picturepan2.github.io/spectre/getting-started.html)
