#!/usr/bin/env python
from django.utils.translation import string_concat, gettext_lazy as _
from django.core.management import ManagementUtility, LaxOptionParser, setup_environ
from django.core.management.base import BaseCommand, CommandError, handle_default_options
import os
import django
import sys

class EzwebManagementUtility(ManagementUtility):

    def execute(self):
        """
        Given the command-line arguments, this figures out which subcommand is
        being run, creates a parser appropriate to that command, and runs it.
        """
        # Preprocess options to extract --settings and --pythonpath.
        # These options could affect the commands that are available, so they
        # must be processed early.
        parser = LaxOptionParser(usage="%prog subcommand [options] [args]",
                                 version=django.get_version(),
                                 option_list=BaseCommand.option_list)
        try:
            options, args = parser.parse_args(self.argv)
            handle_default_options(options)
        except:
            pass # Ignore any option errors at this point.

        try:
            subcommand = self.argv[1]
        except IndexError:
            sys.stderr.write("Type '%s help' for usage.\n" % self.prog_name)
            sys.exit(1)

        if subcommand == 'help':
            if len(args) > 2:
                self.fetch_command(args[2]).print_help(self.prog_name, args[2])
            else:
                parser.print_lax_help()
                sys.stderr.write(self.main_help_text() + '\n')
                sys.exit(1)
        # Special-cases: We want 'manage.py --version' and
        # 'manage.py --help' to work, for backwards compatibility.
        elif self.argv[1:] == ['--version']:
            # LaxOptionParser already takes care of printing the version.
            pass
        elif self.argv[1:] == ['--help']:
            parser.print_lax_help()
            sys.stderr.write(self.main_help_text() + '\n')
        else:
            mysql_workaround = subcommand == "syncdb" and settings.DATABASE_ENGINE == "mysql"
            if mysql_workaround:
                from django.db import connection
                cursor = connection.cursor()
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0");

            self.fetch_command(subcommand).run_from_argv(self.argv)

            if mysql_workaround:
                cursor = connection.cursor()
                cursor.execute("SET FOREIGN_KEY_CHECKS = 1");

try:
    import settings # Assumed to be in the same directory.
except ImportError:
    import sys
    message1 = _("Error: cannot find the file 'settings.py' in the directory containing %(file)r.\n") % {'file': __file__} 
    message1 = string_concat (message1, _("It seems you have customized things.\n"))
    message1 = string_concat (message1, _("You will have to run django-admin.py, passing it your settings module.\n"))
    message1 = string_concat (message1, _("(If the file settings.py does indeed exist, it is causing an ImportError somehow.)\n"))
    sys.stderr.write(message1) 
    sys.exit(1)

if __name__ == "__main__":
    setup_environ(settings)
    utility = EzwebManagementUtility()
    utility.execute()
