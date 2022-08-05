# Downloads all split DB files from production to current directory (handy for development)

# Set path to split DB config file here:
json_url = "https://gmrs.app/config.json"


import urllib.request
import json
import math

print("Fetching ", json_url)
urllib.request.urlretrieve(json_url, json_url.split('/')[-1])

print("Reading ", json_url.split('/')[-1])
config_file = open (json_url.split('/')[-1], "r")
config = json.loads(config_file.read())
config_file.close()

num_files = math.ceil((config['databaseLengthBytes'] / config['serverChunkSize']))
prefix = config['urlPrefix']
suffix_len = config['suffixLength']

for i in range(num_files):
    url = json_url.replace(json_url.split('/')[-1],"") + prefix + '{0:0{1}}'.format(i,suffix_len)
    print(url)
    urllib.request.urlretrieve(url, url.split('/')[-1])

print("Done")
