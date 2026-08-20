import zlib, struct, sys
def load(path):
    d = open(path,'rb').read()
    i = 8; idat = b''
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]
        typ = d[i+4:i+8]; data = d[i+8:i+8+ln]
        if typ == b'IHDR': w,h,bd,ct = struct.unpack('>IIBB', data[:10])
        elif typ == b'IDAT': idat += data
        i += 12 + ln
    raw = zlib.decompress(idat)
    ch = {0:1,2:3,4:2,6:4}[ct]
