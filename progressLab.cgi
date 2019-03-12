#!/usr/local/bin/python3
# -*- coding: utf-8 -*-
import sys, os
import codecs
import json
import cgi, cgitb
import datetime

import progressLab

sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
sys.stderr = sys.stdout

def parse():
    from urllib import parse
    url = os.environ["REQUEST_URI"]
    query = parse.parse_qs(parse.urlparse(url).query)
    return query

def main():
    print("Content-Type: text/html")
    print("")
    query = parse()
    for key in query:
        if key == 'cleanAll':
            print(progressLab.clean_all(query[key][0], query['space'][0]))
            return

#run main loop
main()
