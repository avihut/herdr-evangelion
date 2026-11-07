import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SPEC=importlib.util.spec_from_file_location('installer',Path(__file__).resolve().parents[1]/'scripts/install.py')
installer=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(installer)

class InstallTest(unittest.TestCase):
    def test_safe_install_and_explicit_update(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);(target/'settings.json').write_text('{"sentinel":true}')
            installer.install(target)
            layout=json.loads((target/'layouts/evangelion.json').read_text())
            self.assertEqual(layout['id'],'root')
            self.assertEqual(json.loads((target/'mods/evangelion/mod.json').read_text())['place'],'none')
            self.assertEqual((target/'settings.json').read_text(),'{"sentinel":true}')
            old=target/'mods/evangelion/main.js';old.write_text('local modification')
            with self.assertRaises(ValueError):installer.install(target)
            self.assertEqual(old.read_text(),'local modification')
            result=installer.install(target,update=True)
            self.assertEqual((Path(result['backup'])/'mods/evangelion/main.js').read_text(),'local modification')
            self.assertEqual(old.read_bytes(),(installer.ROOT/'mods/evangelion/main.js').read_bytes())
            self.assertEqual((target/'settings.json').read_text(),'{"sentinel":true}')

    def test_dry_run_writes_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)/'new';installer.install(target,dry_run=True)
            self.assertFalse(target.exists())

    def test_symlink_destination_refused(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)/'home';other=Path(tmp)/'other';other.mkdir();target.mkdir()
            (target/'mods').symlink_to(other,target_is_directory=True)
            with self.assertRaises(ValueError):installer.install(target)
            self.assertEqual(list(other.iterdir()),[])

    def test_backup_symlink_refused_before_update(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp)/'home';other=Path(tmp)/'other';other.mkdir()
            installer.install(target)
            old=target/'mods/evangelion/main.js';old.write_text('local modification')
            (target/'.backups').symlink_to(other,target_is_directory=True)
            with self.assertRaises(ValueError):installer.install(target,update=True)
            self.assertEqual(old.read_text(),'local modification')
            self.assertEqual(list(other.iterdir()),[])

if __name__=='__main__':unittest.main()
