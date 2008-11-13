import sys
import os
import shutil

from configobj import ConfigObj
from optparse import OptionParser, Option

class EzWebAdminToolResources:

  DB_ADMIN_SCRIPTS_PATH      = "/usr/share/ezweb-platform/admintools/database_backends/"
  SERVER_ADMIN_SCRIPTS_PATH  = "/usr/share/ezweb-platform/admintools/server_backends/"
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

  def get_config_file(self, conf_name):
    return self.SITE_CONFIG_BASE_PATH + conf_name + "/config"

  def get_site_config(self, conf_name, create = False):
    if self.site_cfgs.has_key(conf_name):
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

  def get_server_admin_command(self, server_type, command_name):
    if not self.server_modules.has_key(server_type):
      try:
        mod = __import__("admintools.server_backends.%s" % server_type, {}, {}, ["Command"])
      except ImportError, errormsg:
        msg = "Unknown server type \"%s\". May be you need to install other ezweb-platform packages." % server_type
        self.printlnMsg(msg)
        sys.exit(-1)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (server_type, errormsg))
        sys.exit(-1)

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
        self.printlnMsg(msg)
        sys.exit(-1)
      except Exception, errormsg:
        self.printlnMsg("Error loading \"%s\" module: %s" % (database_engine, errormsg))
        sys.exit(-1)

      self.dbms_modules[database_engine] = mod

    else:
      mod = self.dbms_modules[database_engine]

    return getattr(mod, command_name + "Command")(self)

  def save_site_config(self, cfg, backup = False):
    if backup and os.path.exists(cfg.filename):
      self.printMsg("Backing up \"" + cfg.filename + "\"... ")
      shutil.copyfile(cfg.filename, cfg.filename + "~")
      self.printlnMsgNP("Done")

    conf_name = cfg['name']
    del cfg['name']

    cfg.initial_comment  = []
    cfg.initial_comment.append("#")
    cfg.initial_comment.append("# DO NOT EDIT THIS FILE")
    cfg.initial_comment.append("#")
    cfg.initial_comment.append("# It is automatically generated by the EzWeb admin tools")
    cfg.initial_comment.append("")

    self.printMsg("Saving EzWeb instance settings (" + cfg.filename + ")... ")
    cfg.write()
    os.chmod(cfg.filename, 0600)
    self.printlnMsgNP("Done")

    cfg['name'] = conf_name

  def unlink(self, target, linkpath):
    if os.path.lexists(linkpath):
      if not os.path.islink(linkpath):
        self.resources.printlnMsg()
        self.resources.println("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      linkedFile = os.readlink(linkpath)
      if linkedFile != target:
        self.resources.printlnMsg()
        self.resources.println("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      os.unlink(linkpath)
    else:
      None

  def link(self, target, linkpath):
    if os.path.lexists(linkpath):
      if not os.path.islink(linkpath):
        self.resources.printlnMsg()
        self.resources.println("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

      linkedFile = os.readlink(linkpath)
      if linkedFile != target:
        self.resources.printlnMsg()
        self.resources.println("Warning: " + linkpath + " exists, but was not created by the EzWeb admin scripts.")

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


"""
An multi command option parser based on LaxOptionParser from django
"""
class MultiCommandOptionParser(OptionParser):

  def __init__(self,
               usage=None,
               option_list=None,
               option_class=Option,
               version=None,
               conflict_handler="error",
               description=None,
               formatter=None,
               add_help_option=False,
               prog=None):

    if usage == None:
      usage = sys.argv[0] + " command [args...] [options]"

    self.base_options = []

    OptionParser.__init__(self,
                          usage,
                          option_list,
                          option_class,
                          version,
                          conflict_handler,
                          description,
                          formatter,
                          add_help_option,
                          prog)
    self.subcommand = None
    self.subcommands = {}

  def error(self, msg):
    pass

  def print_help(self):
    OptionParser.print_help(self)

  def get_subcommand(self):
    return self.subcommand

  def exec_command(self, args=None, values=None):
    self.parse_args(True, args, values)

    if self.subcommand == None or not self.subcommands.has_key(self.subcommand):
      self.print_help()
      return

    subcommand = self.subcommands[self.subcommand]
    self.add_options(subcommand.option_list)

    self.parse_args(True, args, values)
    ret = subcommand.execute(self, self.current_options, self.current_args)
    if ret == -1:
      self.print_help();
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


class Template:

  def __init__(self, text):
    self.template = text

  def replace(self, key, value):
    self.template = self.template.replace("@" + key + "@", value)

  def save(self, filepath):
    file = open(filepath, "w")
    file.write(self.template)
    file.close()

class ConfigCopy:

  def __init__(self, config):
    self.refConfig = config
    self.copyConfig = config.dict()

  def setAndUpdate(self, value, root, *entries):
    tmp = self.copyConfig
    tmp2 = self.refConfig

    length = len(entries)
    if length > 0:
      tmp = tmp[root]
      tmp2 = tmp2[root]
      for argument in entries[:-1]:
        tmp = tmp[argument]
        tmp2 = tmp2[argument]

      tmp[entries[length - 1]] = value
      tmp2[entries[length - 1]] = value
    else:
      tmp[root] = value
      tmp2[root] = value

  def set(self, value, root, *entries):
    tmp = self.copyConfig

    length = len(entries)
    if length > 0:
      tmp = tmp[root]
      for argument in entries[:-1]:
        tmp = tmp[argument]

      tmp[entries[length - 1]] = value
    else:
      tmp[root] = value

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
    except KeyError:
      return defaultValue

  def __getitem__(self, entry):
    return self.copyConfig[entry]

class EzWebInstanceNotFound(Exception):
  None
