import importlib.util
import json
import re
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC=importlib.util.spec_from_file_location('installer',Path(__file__).resolve().parents[1]/'scripts/install.py')
installer=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(installer)

class InstallTest(unittest.TestCase):
    def test_installed_local_imports_are_complete(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);installer.install(target)
            pending=[target/'mods/evangelion/main.js'];seen=set()
            while pending:
                module=pending.pop()
                if module in seen:continue
                seen.add(module)
                self.assertTrue(module.is_file(), f'Installed import is missing: {module.name}')
                for name in re.findall(r'from\s+[\"\x27](\.[^\"\x27]+)[\"\x27]',module.read_text()):
                    pending.append((module.parent/name).resolve())

    def test_safe_install_and_explicit_update(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);(target/'settings.json').write_text('{"sentinel":true}')
            installer.install(target)
            layout=json.loads((target/'layouts/evangelion.json').read_text())
            self.assertEqual(layout['id'],'root')
            self.assertEqual(json.loads((target/'mods/evangelion/mod.json').read_text())['place'],'none')
            self.assertEqual((target/'settings.json').read_text(),'{"sentinel":true}')
            old=target/'mods/evangelion/main.js';old.write_text('local modification')
            local=target/'mods/evangelion/local-qa.txt';local.write_text('preserve local evidence')
            with self.assertRaises(ValueError):installer.install(target)
            self.assertEqual(old.read_text(),'local modification')
            result=installer.install(target,update=True)
            self.assertEqual((Path(result['backup'])/'mods/evangelion/main.js').read_text(),'local modification')
            self.assertEqual(old.read_bytes(),(installer.ROOT/'mods/evangelion/main.js').read_bytes())
            self.assertEqual((target/'settings.json').read_text(),'{"sentinel":true}')
            self.assertEqual(local.read_text(),'preserve local evidence')

    def test_failed_folder_swap_restores_previous_mod(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);installer.install(target)
            old=target/'mods/evangelion/main.js';old.write_text('local modification')
            replace=installer.os.replace
            def fail_new_mod(src,dst):
                if Path(src).name=='mod':raise OSError('simulated rename failure')
                return replace(src,dst)
            with patch.object(installer.os,'replace',side_effect=fail_new_mod):
                with self.assertRaises(OSError):installer.install(target,update=True)
            self.assertEqual(old.read_text(),'local modification')

    def test_failed_layout_write_restores_mod_and_themes(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);installer.install(target)
            old=target/'mods/evangelion/main.js';old.write_text('local modification')
            theme=target/'themes/evangelion-dark.json';theme.write_text('{"sentinel":true}')
            replace=installer.os.replace
            def fail_layout(src,dst):
                if Path(dst).resolve()==(target/'layouts/evangelion.json').resolve():raise OSError('simulated layout failure')
                return replace(src,dst)
            with patch.object(installer.os,'replace',side_effect=fail_layout):
                with self.assertRaises(OSError):installer.install(target,update=True)
            self.assertEqual(old.read_text(),'local modification')
            self.assertEqual(theme.read_text(),'{"sentinel":true}')

    def test_failed_rollback_retains_recovery_folder(self):
        with tempfile.TemporaryDirectory() as tmp:
            target=Path(tmp);installer.install(target)
            old=target/'mods/evangelion/local-qa.txt';old.write_text('preserve local evidence')
            replace=installer.os.replace
            def fail_both_swaps(src,dst):
                if Path(src).name in ['mod','previous-mod']:raise OSError('simulated persistent failure')
                return replace(src,dst)
            with patch.object(installer.os,'replace',side_effect=fail_both_swaps):
                with self.assertRaises(OSError):installer.install(target,update=True)
            recovery=list(target.glob('.herdr-evangelion-stage-*'))
            self.assertEqual(len(recovery),1)
            self.assertEqual((recovery[0]/'previous-mod/local-qa.txt').read_text(),'preserve local evidence')

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
