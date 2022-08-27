# Downloads all split DB files from production to _site directory

# Set path to split DB config file here:
json_url = "https://db.gmrs.app/config.json"
json_file = "./_site/" + json_url.split('/')[-1]

import urllib.request
import json
import math

print("Copying", json_url, "to", json_file)
urllib.request.urlretrieve(json_url, json_file)

print("Reading ", json_url.split('/')[-1])
config_file = open (json_file, "r")
config = json.loads(config_file.read())
config_file.close()

num_files = math.ceil((config['databaseLengthBytes'] / config['serverChunkSize']))
prefix = config['urlPrefix']
suffix_len = config['suffixLength']

for i in range(num_files):
    url = json_url.replace(json_url.split('/')[-1],"") + prefix + '{0:0{1}}'.format(i,suffix_len)
    file = "./_site/" + url.split('/')[-1]
    print("Copying", url, "to", file)
    urllib.request.urlretrieve(url, file)

print("Done")
