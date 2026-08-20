import pathlib
p=pathlib.Path('styles/globals.css');t=p.read_text()
old="  -webkit-mask-repeat: no-repeat;\n  mask-repeat: no-repeat;\n  -webkit-mask-size: 100% 100%;\n  mask-size: 100% 100%;"
new="  -webkit-mask-repeat: no-repeat, no-repeat, no-repeat;\n  mask-repeat: no-repeat, no-repeat, no-repeat;\n  -webkit-mask-size: 12px 100%, 12px 100%, calc(100% - 16px) 100%;\n  mask-size: 12px 100%, 12px 100%, calc(100% - 16px) 100%;\n  -webkit-mask-position: left top, right top, 8px top;\n  mask-position: left top, right top, 8px top;"
assert old in t;t=t.replace(old,new)
def rule(k):
 u="url(/images/marker/cap-left.svg), url(/images/marker/cap-right.svg), url(/images/marker/mid-%s.svg)"%k
 return ".marker-stroke-%s {\n  -webkit-mask-image: %s;\n  mask-image: %s;\n}\n"%(k,u,u)
i=t.index(".marker-stroke-a {")
t=t[:i]+rule("a")+"\n"+rule("b")+"\n"+rule("c")
p.write_text(t);print("ok")
