#!/usr/local/bin/python3

def add_ident(lines, space_num):
    out = []
    for line in lines:
        out.append(" " * space_num + line)
    return out

def strip_empty(lines):
    out = []
    for line in lines:
        if line == "":
            continue
        if -1 != line.find("BP:/mmHg"):
            continue
        if -1 != line.find("TPR:℃/bmp/min"):
            continue
        if -1 != line.find("SPO2:%"):
            continue
        if line.startswith("CVP: , "):
            line = line[7:]
        line = line.replace("/bmp", "")
        line = line.replace("/min", "")
        out.append(line.lstrip())
    return out

def clean_all(line, space):
    return "\n".join(add_ident(strip_empty(line.splitlines()), int(space)))

if __name__ == '__main__':
    line = '''

TPR:37.2℃/73bmp/20min  1071113-1414
BP:134/81mmHg 1071113-1414 
CVP: , SPO2:95% 1071113-1414

TPR:36℃/58bmp/20min    1071113-0844
BP:126/70mmHg 1071113-0844 
CVP: , SPO2:% 1071113-0844

TPR:℃/bmp/min          1071112-2300
BP:115/59mmHg 1071112-2300 
CVP: , SPO2:% 1071112-2300


TPR:℃/bmp/min          1071114-0930
BP:137/83mmHg 1071114-0930 
CVP: , SPO2:% 1071114-0930

TPR:37℃/70bmp/18min    1071114-0845
BP:153/70mmHg 1071114-0845 
CVP: , SPO2:97% 1071114-0845
'''
    print(clean_all(line, 2))
