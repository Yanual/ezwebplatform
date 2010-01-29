# -*- coding: utf-8 -*-

#...............................licence...........................................
#
#     (C) Copyright 2008 Telefonica Investigacion y Desarrollo
#     S.A.Unipersonal (Telefonica I+D)
#
#     This file is part of Morfeo EzWeb Platform.
#
#     Morfeo EzWeb Platform is free software: you can redistribute it and/or modify
#     it under the terms of the GNU Affero General Public License as published by
#     the Free Software Foundation, either version 3 of the License, or
#     (at your option) any later version.
#
#     Morfeo EzWeb Platform is distributed in the hope that it will be useful,
#     but WITHOUT ANY WARRANTY; without even the implied warranty of
#     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#     GNU Affero General Public License for more details.
#
#     You should have received a copy of the GNU Affero General Public License
#     along with Morfeo EzWeb Platform.  If not, see <http://www.gnu.org/licenses/>.
#
#     Info about members and contributors of the MORFEO project
#     is available at
#
#     http://morfeo-project.org
#
#...............................licence...........................................#


#

import sys
import os
import shutil
import textwrap

from configobj import ConfigObj
from optparse import OptionParser, Option, TitledHelpFormatter

class EzWebAdminToolResources:

  DB_ADMIN_SCRIPTS_PATH      = "/usr/share/ezweb-platform/admintools/database_backends/"
  SERVER_ADMIN_SCRIPTS_PATH  = "/usr/share/ezweb-platform/admintools/server_backends/"
  AUTH_ADMIN_SCRIPTS_PATH    = "/usr/share/ezweb-platform/admintools/auth_backends/"
  CONFIG_BASE_PATH           = "/etc/ezweb-platform/"
  SITE_CONFIG_BASE_PATH      = CONFIG_BASE_PATH + "sites/"
  DATA_PATH                  = "/var/lib/ezweb-platform/"
  DEFAULT_LOG_BASE_PATH      = "/var/log/ezweb-platform/"
  SETTINGS_TEMPLATE_PATH     = CONFIG_BASE_PATH + "settings.py-template"

  def __init__(self):
    self.printPrefix = ""
    self.site_cfgs = {}
    self.dbms_modules = {}
    self.server_modules = {}
    self.auth_modules = {}
    self.taskVerbosity = []

  def incPrintNestingLevel(self):
    self.printPrefix += "  "

  def printMsg(self, msg):
    sys.stderr.write(self.printPrefix + msg)

  def printMsgNP(self, msg):
    sys.stderr.write(msg)

  def printlnMsg(self, msg = ""):
    self.printMsg(msg + "\n")

  def printlnMsgNP(self, msg = ""):
    self.printMsgNP(msg + "\n")

  def decPrintNestingLevel(self):
    self.printPrefix = self.printPrefix[0:-2]

  def startTask(self, msg, verbose):
    self.taskVerbosity.append(verbose)
    if verbose:
      self.printlnMsg("%(msg)s..." % {'msg': msg})
      self.incPrintNestingLevel()
    else:
      self.printMsg("%(msg)s... " % {'msg': msg})

  def endTask(self, error = False):
    verbose = self.taskVerbosity.pop()
    if error:
      msg = "Error"
    else:
      msg = "Done"

    if verbose:
      self.decPrintNestingLevel()
      self.printlnMsg(msg)
    else:
      self.printlnMsgNP(msg)


  def get_config_file(self, conf_name):
    return self.SITE_CONFIG_BASE_PATH + conf_name + "/config"

  def get_django_shared_data_path(self):
    if os.path.isdir('/usr/share/pyshared/django'):
      return '/usr/share/pyshared/django'
    elif os.path.exists('/usr/share/python-support/python-django/django'):
      return '/usr/share/python-support/python-django/django'

  def get_site_config(self, conf_name, create = False, use_cache = True):
    if use_cache and self.site_cfgs.has_key(conf_name):
      return self.site_cfgs[conf_name]

    filename = self.get_config_file(conf_name)
    exists = os.path.exists(filename)
    if exists and not create:
      cfg = ConfigObj(filename, encoding="utf_8")
    elif not exists and create:
      cfg = ConfigObj()
      cfg.filename = filename
      cfg.encoding= "utf_8"
    elif exists:
      raise Exception("File \"" + filename + "\" already exists")
    else:
      raise EzWebInstanceNotFound(conf_name)

    cfg['name'] = conf_name

    if not cfg.has_key("enabled"):
      cfg["enabled"] = "False"

    if not cfg.has_key("server"):
      cfg["server"] = {}

    if not isinstance(cfg['server'], dict):
      raise Exception() # TODO

    if not cfg.has_key("database"):
      cfg["database"] = {}

    if not isinstance(cfg['database'], dict):
      raise Exception() # TODO

    if use_cache:
      self.site_cfgs[conf_name] = cfg

    return cfg

  def get_settings_template(self):
    templatefile = open(self.SETTINGS_TEMPLATE_PATH, "r")
    template = templatefile.read()
    templatefile.close()

    return Template(template)

  def save_django_settings(self, conf_name, template):
    filepath = self.get_settings_path(conf_name)
    #if self.options.backup and os.path.exists(filepath):
    #  self.printMsg("Backing up \"" + filepath + "\"")
    #  shutil.copyfile(filepath, filepath + "~")
    #  self.printlnMsgNP("Done")

    self.printMsg("Updating django settings (" + filepath + ")... ")
    template.save(filepath)
    self.printlnMsgNP("Done")

  def get_settings_path(self, conf_name):
    return os.path.join(self.SITE_CONFIG_BASE_PATH, conf_name, "settings.py")

  def get_default_document_root(self, conf_name):
    return os.path.join(self.DATA_PATH, conf_name, "public_html")

  def get_default_log_path(self, conf_name):
    return os.path.join(self.DEFAULT_LOG_BASE_PATH, conf_name)

  def get_default_admin_email(self, cfg):
    return "webmaster@localhost"

  def get_auth_method(self, auth_method):
    if not self.auth_modules.has_key(auth_method):
      try:
        mod = __import__("admintools.auth_backends.%s" % auth_method, {}, {}, ["AuthMethod"])
      except ImportError, errormsg:
        msg = "Unknown auth method \"%s\". May be you need to install other ezweb-platform packages." % auth_method
        raise EzWebModuleNotFound(msg)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (auth_method, errormsg))
        raise EzWebModuleException(msg)

      self.auth_modules[auth_method] = mod

    else:
      mod = self.auth_modules[auth_method]

    return getattr(mod, "AuthMethod")(self)

  def get_auth_admin_command(self, auth_method, command_name):
    if not self.auth_modules.has_key(auth_method):
      try:
        mod = __import__("admintools.auth_backends.%s" % auth_method, {}, {}, ["AuthMethod"])
      except ImportError, errormsg:
        msg = "Unknown auth method \"%s\". May be you need to install other ezweb-platform packages." % auth_method
        raise EzWebModuleNotFound(msg)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (auth_method, errormsg))
        raise EzWebModuleException(msg)

      self.auth_modules[auth_method] = mod

    else:
      mod = self.auth_modules[auth_method]

    return getattr(mod, command_name + "Command")(self)

  def get_server_admin_command(self, server_type, command_name):
    if not self.server_modules.has_key(server_type):
      try:
        if server_type == '':
          raise ImportError

        mod = __import__("admintools.server_backends.%s" % server_type, {}, {}, ["Command"])
      except ImportError, errormsg:
        msg = "Unknown server type \"%s\". May be you need to install other ezweb-platform packages." % server_type
        raise EzWebModuleNotFound(msg)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (server_type, errormsg))
        raise EzWebModuleException(msg)

      self.server_modules[server_type] = mod

    else:
      mod = self.server_modules[server_type]

    return getattr(mod, command_name + "Command")(self)

  def get_dbms_admin_command(self, database_engine, command_name):
    if not self.dbms_modules.has_key(database_engine):
      try:
        mod = __import__("admintools.database_backends.%s" % database_engine, {}, {}, ["Command"])
      except ImportError, errormsg:
        msg = "Unknown DBMS type \"%s\". May be you need to install other ezweb-platform packages." % database_engine
        raise EzWebModuleNotFound(msg)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (database_engine, errormsg))
        raise EzWebModuleException(msg)

      self.dbms_modules[database_engine] = mod

    else:
      mod = self.dbms_modules[database_engine]

    return getattr(mod, command_name + "Command")(self)

  def save_site_config(self, config, backup = False):
    real_cfg = config.refConfig

    exists = os.path.exists(real_cfg.filename)
    if exists and (not config.changed):
      return

    if backup and os.path.exists(real_cfg.filename):
      self.printMsg("Backing up \"" + real_cfg.filename + "\"... ")
      shutil.copyfile(real_cfg.filename, real_cfg.filename + "~")
      self.printlnMsgNP("Done")

    conf_name = real_cfg['name']
    del real_cfg['name']

    real_cfg.initial_comment  = []
    real_cfg.initial_comment.append("#")
    real_cfg.initial_comment.append("# DO NOT EDIT THIS FILE")
    real_cfg.initial_comment.append("#")
    real_cfg.initial_comment.append("# It is automatically generated by the EzWeb admin tools")
    real_cfg.initial_comment.append("")

    self.printMsg("Saving EzWeb instance settings (" + real_cfg.filename + ")... ")
    real_cfg.write()
    os.chmod(real_cfg.filename, 0600)
    self.printlnMsgNP("Done")

    real_cfg['name'] = conf_name

  def unlink(self, target, linkpath):
    if os.path.lexists(linkpath):
      if not os.path.islink(linkpath):
        self.printlnMsg("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      linkedFile = os.readlink(linkpath)
      if linkedFile != target:
        self.printlnMsg("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      os.unlink(linkpath)
    else:
      None

  def link(self, target, linkpath):
    if os.path.lexists(linkpath):
      if not os.path.islink(linkpath):
        self.printlnMsg("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      linkedFile = os.readlink(linkpath)
      if linkedFile != target:
        self.printlnMsg("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

    else:
      os.symlink(target, linkpath)

  def rmdir(self, path):
    for root, dirs, files in os.walk(path, topdown=False):
      for name in files:
        os.remove(os.path.join(root, name))
      for name in dirs:
        os.rmdir(os.path.join(root, name))

  def makedirs(self, path):
    if not os.path.isdir(path):
      os.makedirs(path)


class Argument:
  def __init__(self, name, desc):
    self.name = name
    self.desc = desc


class ExtendedOption(Option):

    ACTIONS = Option.ACTIONS + ("store_list",)
    STORE_ACTIONS = Option.STORE_ACTIONS + ("store_list",)
    TYPED_ACTIONS = Option.TYPED_ACTIONS + ("store_list",)
    ALWAYS_TYPED_ACTIONS = Option.ALWAYS_TYPED_ACTIONS + ("store_list",)

    def take_action(self, action, dest, opt, value, values, parser):
        if action == "store_list":
            value = value.strip()
            lvalue = value.split(",")
            size = len(lvalue)
            if size > 0 and lvalue[size - 1] == "":
              lvalue.pop()

            values.ensure_value(dest, []).extend(lvalue)
        else:
            Option.take_action(
                self, action, dest, opt, value, values, parser)


"""
An multi command option parser based on LaxOptionParser from django
"""
class MultiCommandOptionParser(OptionParser):

  def __init__(self,
               option_list=None,
               option_class=ExtendedOption,
               version=None,
               conflict_handler="error",
               formatter=None,
               prog=None):

    self.base_options = []

    OptionParser.__init__(self,
                          None,
                          option_list,
                          option_class,
                          version,
                          conflict_handler,
                          None,
                          formatter,
                          False,
                          prog)
    self.subcommand = None
    self.subcommands = {}
    self.parseFinished = False

  def error(self, msg):
    pass

  def format_help(self, formatter=None):
    if formatter is None:
      formatter = self.formatter

    result = []

    if self.subcommand:
      subcommand = self.subcommands[self.subcommand]
    else:
      subcommand = None

    if subcommand:
      if hasattr(subcommand, "args_help"):
        args_help = subcommand.args_help + " "
      elif hasattr(subcommand, "args"):
        args_help = ""
        for arg in subcommand.args:
          args_help += arg.name + " "
      else:
        args_help = ""

      self.usage = sys.argv[0] + " " + self.subcommand + " " + args_help + "[options]"
    else:
      self.usage = sys.argv[0] + " <command> [args...] [options]"

    result.append(self.get_usage() + "\n")
    if self.description:
      result.append(self.format_description(formatter) + "\n")

    if hasattr(subcommand, "args"):
      result.append(formatter.format_heading("Arguments"))

      help_pos = 0
      for arg in subcommand.args:
        help_pos = max(help_pos, len(arg.name))

      help_pos += 3
      width = formatter.width - help_pos
      for arg in subcommand.args:
        result.append("  " + arg.name + "\n")
        help_lines = textwrap.wrap(arg.desc, width)
        result.extend(["%*s%s\n" % (help_pos, "", line)
                       for line in help_lines])

      result.append("\n")

    result.append(self.format_option_help(formatter) + "\n")

    if subcommand == None:
      result.append(formatter.format_heading("Commands"))

      subcommands = self.subcommands.keys()
      subcommands.sort()
      for subcommand in subcommands:
        result.append("  " + subcommand + "\n")
      result.append("\n")

    return "".join(result)

  def get_subcommand(self):
    return self.subcommand

  def exec_command(self, args=None, values=None):
    self.parse_args(True, args, values)

    if self.subcommand == None or not self.subcommands.has_key(self.subcommand):
      self.subcommand = None
      self.print_help()
      return

    subcommand = self.subcommands[self.subcommand]
    if hasattr(subcommand, "final"):
      self.parseFinished = subcommand.final
    else:
      self.parseFinished = False

    self.add_options(subcommand.option_list)

    self.parse_args(not self.parseFinished, args, values)
    ret = subcommand.execute(self, self.current_options, self.current_args)
    if ret == -1:
      self.print_help()
      sys.exit(-1)


  def add_command(self, name, command):
    self.subcommands[name] = command

  def add_options(self, option_list):
    self.base_options = (self.base_options + option_list)
    OptionParser.add_options(self, option_list)

  def parse_args(self, laxed=True, args=None, values=None):
    self.subcommand = None
    if laxed:
      (self.current_options, self.current_args) = OptionParser.parse_args(self, args, values)
    else:
      newparser = OptionParser(option_list = self.base_options)
      (self.current_options, self.current_args) = newparser.parse_args()
      self.subcommand = self.current_args[0]
      del self.current_args[0]

    return (self.current_options, self.current_args)

  def get_current_options(self):
    return self.current_options

  def _process_args(self, largs, rargs, values):
    """
    Overrides OptionParser._process_args to exclusively handle default
    options and ignore args and other options.

    This overrides the behavior of the super class, which stop parsing
    at the first unrecognized option.
    """
    while rargs:
      arg = rargs[0]
      if arg[0:2] == "--" and len(arg) > 2:
        try:
          # process a single long option (possibly with value(s))
          # the superclass code pops the arg off rargs
          self._process_long_opt(rargs, values)
        except:
          pass # ignore it

        break
      elif arg[:1] == "-" and len(arg) > 1:
        try:
          # process a cluster of short options (possibly with
          # value(s) for the last one only)
          # the superclass code pops the arg off rargs
          self._process_short_opts(rargs, values)
        except:
          pass # ignore it

        break
      else:
        del rargs[0]

        if self.subcommand == None:
          self.subcommand = arg
        else:
          largs.append(arg)

    while rargs:
      # We have found a short/long option
      if arg[0:2] == "--" and len(arg) > 2:
        try:
          # process a single long option (possibly with value(s))
          # the superclass code pops the arg off rargs
          self._process_long_opt(rargs, values)
        except:
          pass # ignore it
      elif arg[:1] == "-" and len(arg) > 1:
        try:
          # process a cluster of short options (possibly with
          # value(s) for the last one only)
          # the superclass code pops the arg off rargs
          self._process_short_opts(rargs, values)
        except:
          pass # ignore it
      else:
        del rargs[0]


class Command:

  def __init__(resources):
    self.resources = resources


class AbortException(Exception):
  pass

class AuthException(Exception):
  pass

class AuthMethod:
  pass


class Template:

  def __init__(self, text):
    self.template = text

  def replace(self, key, value):
    self.template = self.template.replace("@" + key + "@", value)

  def replaceEnableOption(self, key, value):
    if value:
      self.template = self.template.replace("#@" + key + "_ENABLED@", "")
      self.template = self.template.replace("#@" + key + "_DISABLED@", "#")
    else:
      self.template = self.template.replace("#@" + key + "_ENABLED@", "#")
      self.template = self.template.replace("#@" + key + "_DISABLED@", "")

  def save(self, filepath):
    file = open(filepath, "w")
    file.write(self.template)
    file.close()

class ConfigCopy:

  def __init__(self, config):
    self.refConfig = config
    self.copyConfig = config.dict()
    self.changed = False

  def setAndUpdate(self, value, root, *entries):
    tmp = self.copyConfig
    tmp2 = self.refConfig

    length = len(entries)
    if length > 0:
      if not tmp.has_key(root):
        tmp[root] = {}

      if not tmp2.has_key(root):
        tmp2[root] = {}

      tmp = tmp[root]
      tmp2 = tmp2[root]
      for argument in entries[:-1]:
        if not tmp.has_key(argument):
          tmp[argument] = {}

        if not tmp2.has_key(argument):
          tmp2[argument] = {}

        tmp = tmp[argument]
        tmp2 = tmp2[argument]

      lastEntry = entries[length - 1]
      tmp[lastEntry] = value
      if not tmp2.has_key(lastEntry) or tmp2[lastEntry] != value:
        self.changed = True
      tmp2[lastEntry] = value
    else:
      tmp[root] = value
      if not tmp2.has_key(root) or tmp2[root] != value:
        self.changed = True
      tmp2[root] = value

  def set(self, value, root, *entries):
    tmp = self.copyConfig

    length = len(entries)
    if length > 0:
      if not tmp.has_key(root):
        tmp[root] = {}

      tmp = tmp[root]
      for argument in entries[:-1]:
        if not tmp.has_key(argument):
          tmp[argument] = {}

        tmp = tmp[argument]

      tmp[entries[length - 1]] = value
    else:
      tmp[root] = value

  def remove(self, root, *entries):
    tmp = self.copyConfig
    tmp2 = self.refConfig

    length = len(entries)
    if length > 0:
      tmp = tmp[root]
      tmp2 = tmp2[root]
      for argument in entries[:-1]:
        tmp = tmp[argument]
        tmp2 = tmp2[argument]

      lastEntry = entries[length - 1]
      del tmp[lastEntry]
      if tmp2.has_key(lastEntry):
        del tmp2[lastEntry]
        self.changed = True
    else:
      del tmp[root]
      if tmp2.has_key(root):
        del tmp2[root]
        self.changed = True


  def get(self, root, *entries):
    tmp = self.copyConfig

    length = len(entries)
    if length > 0:
      tmp = tmp[root]
      for argument in entries[:-1]:
        tmp = tmp[argument]

      return tmp[entries[length - 1]]
    else:
      return tmp[root]

  def getDefault(self, defaultValue, root, *entries):
    try:
      tmp = self.get(root, *entries)
      return tmp
    except KeyError:
      return defaultValue

  def getDefaultAsBool(self, defaultValue, root, *entries):
    value = self.getDefault(defaultValue, root, *entries)

    if type(value).__name__ == 'bool':
      return value

    if value == "True" or value == "true":
      return True
    else:
      return False

  def __getitem__(self, entry):
    return self.copyConfig[entry]

class EzWebModuleException(Exception):
  None

class EzWebModuleNotFound(Exception):
  None

class EzWebInstanceNotFound(Exception):
  None
