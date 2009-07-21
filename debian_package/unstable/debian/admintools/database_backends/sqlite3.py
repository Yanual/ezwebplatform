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
import grp
import shutil

import string
from random import Random

import gettext
from gettext import gettext as _

import warnings
from admintools.common import Command, EzWebAdminToolResources
from optparse import OptionParser, make_option
from configobj import ConfigObj


class InvalidEzWebInstance(Exception):
  None

class SQLite3Resources:
  DB_BASE_PATH = "/var/lib/ezweb-platform/"

  def get_sqlite3_settings_path(self):
    return self.resources.CONFIG_BASE_PATH + "sqlite3.conf"

  def get_sqlite3_settings(self):
    filename = self.get_sqlite3_settings_path()

    exists = os.path.exists(filename)
    if exists:
      cfg = ConfigObj(filename, encoding="utf_8")
    else:
      cfg = ConfigObj()
      cfg.filename = filename
      cfg.encoding= "utf_8"

    cfg.initial_comment  = []
    cfg.initial_comment.append("#")
    cfg.initial_comment.append("# DO NOT EDIT THIS FILE")
    cfg.initial_comment.append("#")
    cfg.initial_comment.append("# It is automatically generated by the EzWeb admin tools")
    cfg.initial_comment.append("")

    return cfg

  def save_sqlite3_settings(self, cfg, backup):
    if backup and os.path.exists(cfg.filename):
      self.resources.printMsg("Backing up \"%s\"... " % cfg.filename)
      shutil.copyfile(cfg.filename, cfg.filename + "~")
      self.resources.printlnMsgNP("Done")

    self.resources.printMsg("Saving EzWeb SQLite settings (%s)... " % cfg.filename)
    cfg.write()
    os.chmod(cfg.filename, 0600)
    self.resources.printlnMsgNP("Done")


  def fill_config(self, site_cfg, options):

    if site_cfg['database'].has_key('database_type') and site_cfg['database']['database_type'] != "sqlite3":
      raise InvalidEzWebInstance()

    # Not used at this moment
    #
    #if site_cfg['database'].has_key('schema'):
    #  schema = site_cfg['database']['schema']
    #else:
    #  schema = "default"

    #sqlite3_settings = self.get_sqlite3_settings()
    #if sqlite3_settings.has_key(schema):
    #  schema = sqlite3_settings[schema]
    #else:
    #  schema = {}


    return site_cfg

  def update_settings_py(self, template, site_cfg):
    # Fill the template
    template.replace("DATABASE_ENGINE", "sqlite3")
    template.replace("DATABASE_USER", '')
    template.replace("DATABASE_PASS", '')
    template.replace("DATABASE_NAME", site_cfg['database']['path'])
    template.replace("DATABASE_OPTIONS", '')
    template.replace("DATABASE_HOST", '')
    template.replace("DATABASE_PORT", '')

  def __init__(self, resources = None):
    if resources != None:
      self.resources = resources
    else:
      self.resources = EzWebAdminToolResources()

class FillConfigCommand(Command):
  option_list = []

  def __init__(self, resources):
    self.sqlite3Resources = MySQLResources(resources)
    self.resources = resources

  def execute(self, site_cfg):

    conf_name = site_cfg["name"]

    #schema = site_cfg.getDefault('', 'database', 'schema')
    #if schema == '':
    #  site_cfg.set("default", 'database', 'schema')
    #  schema = "default"

    #sqlite3_settings = self.sqlite3Resources.get_sqlite3_settings()
    #if sqlite3_settings.has_key(schema):
    #  schema = sqlite3_settings[schema]
    #else:
    #  schema = {}

    # Database path
    path = site_cfg.getDefault('', 'database', 'path')
    if path == '':
      site_cfg.set(os.path.join(self.DB_BASE_PATH, site_cfg['name'], site_cfg['name'] + ".sqlite3"), 'database', 'path')

class CleanCommand(Command):

  def __init__(self, resources):
    self.resources = resources
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, site_cfg, options):
    cfg = site_cfg['database']

    f = open(cfg['path'], "w")
    f.close()
    os.chown(cfg['path'], -1, grp.getgrnam("www-data").gr_gid)
    os.chmod(cfg['path'], 0660)

class PurgeCommand(Command):

  def __init__(self, resources):
    self.resources = resources
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, site_cfg, options):
    cfg = site_cfg['database']

    if os.path.exists(cfg['path']):
      self.resources.printMsg("Removing database file (" + cfg['path'] + ")... ")
      os.unlink(cfg['path'])
      self.resources.printlnMsgNP("Done")

    self.resources.printlnMsg("Database for \"%s\" purged successfully." % site_cfg['name'])

class GetDefaultsCommand(Command):

  def __init__(self, resources):
    self.resources = resources
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, schema_name, options):
    schema_settings = self.sqlite3Resources.get_sqlite3_settings()

    if schema_settings.has_key(schema_name):
      cfg = schema_settings[schema_name]
    else:
      cfg = {}

    # SQLite 3 does not have defaults
    self.resources.printlnMsg("SQLite3 does not have default settings")

class SetDefaultsCommand(Command):

  option_list = []

  def __init__(self, resources):
    self.resources = resources
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, schema_name, options):
    schema_settings = self.sqlite3Resources.get_sqlite3_settings()

    if schema_settings.has_key(schema_name):
      cfg = schema_settings[schema_name]
    else:
      cfg = {}

    # SQLite 3 does not have defaults
    self.resources.printlnMsg("SQLite3 does not have default settings")

class UpdateCommand(Command):

  option_list = [make_option ("--path", action="store",
                             dest="path", help=_("Path to the sqlite database file."))]

  def __init__(self, resources):
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, site_cfg, options):
    if options.path != None:
      site_cfg.setAndUpdate(options.path, 'database', 'path')

class ProcessCommand(Command):

  option_list = []

  def __init__(self, resources):
    self.sqlite3Resources = SQLite3Resources(resources)

  def execute(self, options, site_cfg, template):
    self.sqlite3Resources.update_settings_py(template, site_cfg)
    cfg = site_cfg['database']

    db_file = cfg['path']
    f = open(db_file, "w")
    f.close()
    os.chown(cfg['path'], -1, grp.getgrnam("www-data").gr_gid)
    os.chmod(cfg['path'], 0660)
