#!/usr/bin/env python3
"""Install only this layout's files. No server, settings, or current-layout changes."""
import argparse
import json
import os
from pathlib import Path
import shutil
import tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
MOD = Path('mods/evangelion')

def files():
    ordered = [MOD/'mod.json']
    for directory in ['assets', 'fonts']:
        ordered.extend(sorted((ROOT/MOD/directory).rglob('*')))
    ordered = [p.relative_to(ROOT) if p.is_absolute() else p for p in ordered if (p if p.is_absolute() else ROOT/p).is_file()]
    ordered.extend(MOD/name for name in ['kit.js','model.js','simulation.js','README.md','RECIPE.md','VALIDATION.md','main.js'])
    ordered.extend([Path('themes/evangelion-dark.json'),Path('themes/evangelion-light.json'),Path('layouts/evangelion.json')])
    return ordered

def install(home, update=False, dry_run=False):
    home = Path(home).expanduser().resolve()
    entries = files()
    for rel in entries:
        src = ROOT/rel
        if src.is_symlink(): raise ValueError(f'Refusing source symlink: {rel}')
        if not src.is_file(): raise ValueError(f'Missing source file: {rel}')
        target = home/rel
        if target.is_symlink() or any(p.is_symlink() for p in target.parents if p != home and home in p.parents):
            raise ValueError(f'Refusing destination symlink: {rel}')
        if target.exists() and not target.is_file(): raise ValueError(f'Destination is not a file: {rel}')
        if src.suffix == '.json': json.loads(src.read_text())
    assert json.loads((ROOT/MOD/'mod.json').read_text())['place'] == 'none'
    collisions = [rel for rel in entries if (home/rel).exists()]
    if collisions and not update:
        raise ValueError('Existing Evangelion files found. Use --update to back up and replace only this layout.')
    if collisions and ((home/'.backups').is_symlink() or ((home/'.backups').exists() and not (home/'.backups').is_dir())):
        raise ValueError('Refusing unsafe backup directory')
    if dry_run:
        return {'home': str(home), 'files': len(entries), 'existing': len(collisions), 'dry_run': True}
    backup = None
    if collisions:
        stamp=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
        backup=home/'.backups'/f'herdr-evangelion-{stamp}'
        for rel in collisions:
            target=backup/rel;target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(home/rel,target)
    # Manifest first; main.js after its modules; layout last. Each file is atomic.
    for rel in entries:
        target=home/rel;target.parent.mkdir(parents=True,exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=target.parent,delete=False) as out:
            temporary=Path(out.name);out.write((ROOT/rel).read_bytes())
        try: os.replace(temporary,target)
        finally: temporary.unlink(missing_ok=True)
    return {'home':str(home),'files':len(entries),'backup':str(backup) if backup else None}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--home',default=os.environ.get('HERDR_APP_HOME',str(Path.home()/'.config/herdr-app')))
    p.add_argument('--update',action='store_true',help='Back up and replace existing files owned by this layout')
    p.add_argument('--dry-run',action='store_true')
    a=p.parse_args()
    try: print(json.dumps(install(a.home,a.update,a.dry_run),indent=2))
    except (ValueError,OSError) as error:p.exit(1,f'{error}\n')

if __name__=='__main__':main()
